# Deploy Penpot — penpot.cafeina.dev.br

Arquitetura distribuída em **free tier** de várias plataformas. Veja a nota de
custos no fim — esta configuração serve para teste/aprendizado; uso real exige
upgrades.

```
                ┌────────────────────────┐
                │ penpot.cafeina.dev.br  │
                │  (Cloudflare DNS)      │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │   Cloudflare Pages     │   ← SPA estática + middleware
                │   (frontend)           │
                └─────┬──────────────┬───┘
                      │              │
       /api/* /assets │              │ /api/export*
       /ws/* /readyz  │              │
                      ▼              ▼
        ┌─────────────────┐   ┌─────────────────┐
        │ Render Web      │   │ Render Web      │
        │ penpot-backend  │   │ penpot-exporter │
        │ (free, JVM)     │   │ (free, Node)    │
        └─┬─────────┬─────┘   └─────┬───────────┘
          │         │               │
   Postgres│         │Redis          │Redis
          ▼         ▼               ▼
    ┌─────────┐ ┌─────────┐
    │Supabase │ │ Upstash │
    └─────────┘ └─────────┘

       Storage S3-compatível: Cloudflare R2 (acessado por backend e exporter)
```

## Limites conhecidos do free tier

- **Backend Render Free**: 512 MB RAM, hiberna após 15 min, cold start 30–60 s.
  JVM apertada em `-Xmx256m`. Sob qualquer uso real → OOM ou 502 Bad Gateway.
- **Exporter Render Free**: idem. Playwright + Chromium consome ~300 MB só pra
  abrir; exports grandes vão crashar.
- **Supabase Free**: 500 MB de Postgres, pausa após 7 dias inativos.
- **Upstash Free**: 10k comandos/dia.
- **Cloudflare R2 Free**: 10 GB armazenamento, ilimitado de egress.
- **Cloudflare Pages Free**: 500 builds/mês, banda ilimitada.

Para produção real: subir backend pra Starter ($7), exporter pra Starter ($7) ou
Standard ($25), e usar Supabase Pro ($25). Total ~$39–60/mês.

---

## 1. Provisionar serviços externos

### 1.1 Supabase (Postgres)

1. Criar projeto em https://supabase.com — região South America (São Paulo).
2. Anotar do painel `Project Settings > Database`:
   - **Host**: `db.<ref>.supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (definido na criação)
3. URI completa: `postgresql://postgres:<senha>@db.<ref>.supabase.co:5432/postgres?sslmode=require`

### 1.2 Upstash (Redis/Valkey)

1. Criar database em https://upstash.com → Redis.
2. Região: `sa-east-1` (São Paulo).
3. Anotar o **TLS endpoint**: `rediss://default:<password>@<host>.upstash.io:6379`

### 1.3 Cloudflare R2 (Storage)

1. No dashboard Cloudflare → R2 → Create bucket → `penpot-assets`.
2. Manage R2 API Tokens → Create API token:
   - Permission: **Object Read & Write**
   - Bucket: `penpot-assets`
3. Anotar:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint**: `https://<account-id>.r2.cloudflarestorage.com`

---

## 2. Deploy do Backend e Exporter no Render

### 2.1 Limpar tentativa anterior

No painel Render, deletar os serviços `penpot-frontend-fixed`, `penpot-backend-fixed`
e `penpot-redis` (Key Value).

### 2.2 Conectar Blueprint

1. New + → Blueprint → conectar `cafeinadev/br.dev.cafeina`, branch `main`.
2. Render lê `render.yaml` e cria 2 serviços: `penpot-backend` e `penpot-exporter`.
3. No primeiro deploy, vai falhar pedindo as variáveis `sync: false`.

### 2.3 Preencher variáveis no painel

Para **`penpot-backend`** → Environment:

| Variável | Valor |
| --- | --- |
| `PENPOT_DATABASE_URI` | `postgresql://db.<ref>.supabase.co:5432/postgres?sslmode=require` |
| `PENPOT_DATABASE_USERNAME` | `postgres` |
| `PENPOT_DATABASE_PASSWORD` | (senha Supabase) |
| `PENPOT_REDIS_URI` | `rediss://default:<password>@<host>.upstash.io:6379` |
| `PENPOT_OBJECTS_STORAGE_S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `PENPOT_OBJECTS_STORAGE_S3_BUCKET` | `penpot-assets` |
| `AWS_ACCESS_KEY_ID` | (do token R2) |
| `AWS_SECRET_ACCESS_KEY` | (do token R2) |

Para **`penpot-exporter`** → Environment:

| Variável | Valor |
| --- | --- |
| `PENPOT_REDIS_URI` | (mesma string do backend) |
| `PENPOT_SECRET_KEY` | (copiar de `penpot-backend` → Environment) |

Após preencher, fazer **Manual Deploy** dos dois serviços.

### 2.4 Anotar URLs públicas

Após deploy, anotar:
- `https://penpot-backend.onrender.com`
- `https://penpot-exporter.onrender.com`

(Render mostra a URL no topo da página de cada serviço.)

---

## 3. Deploy do Frontend no Cloudflare Pages

### 3.1 Criar projeto Pages

1. Cloudflare → Workers & Pages → Create application → Pages.
2. **Direct Upload** (não conectar Git ainda).
3. Nome: `penpot`.
4. Pode pular o upload inicial — vamos usar GitHub Actions.

### 3.2 Configurar variáveis no Pages

Settings → Environment variables (Production):

| Variável | Valor |
| --- | --- |
| `PENPOT_BACKEND_URL` | `https://penpot-backend.onrender.com` |
| `PENPOT_EXPORTER_URL` | `https://penpot-exporter.onrender.com` |

### 3.3 Configurar GitHub Action

Adicionar nos **GitHub Secrets** do repo `cafeinadev/br.dev.cafeina`:

| Secret | Como obter |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers" → ajustar para incluir Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard Cloudflare → barra lateral direita, "Account ID" |

Disparar o deploy:
- Manual: Actions → Deploy Penpot Frontend (Cloudflare Pages) → Run workflow
- Auto: qualquer push em `pages/penpot/**`

### 3.4 Domínio customizado

Pages project `penpot` → Custom domains → Set up a custom domain →
`penpot.cafeina.dev.br`.

Cloudflare cria o CNAME automaticamente se o domínio estiver na mesma conta.
Se a zona `cafeina.dev.br` está em outra conta, copiar o CNAME manualmente.

---

## 4. Validação

1. Abrir `https://penpot.cafeina.dev.br/readyz` → deve retornar `{:status :ready}`.
   (Se 502, o backend está hibernando — esperar ~60s e refrescar.)
2. Abrir `https://penpot.cafeina.dev.br/` → SPA carrega.
3. Como `disable-registration` está ativo, criar o primeiro usuário manualmente:
   ```
   # Em Logs do penpot-backend no Render → Shell → executar:
   ./run.sh manage.py create-profile --email admin@cafeina.dev.br --password '...' --fullname Admin
   ```
4. Login → criar projeto → criar arquivo → exportar PNG (testa o exporter).
5. Conferir no R2 dashboard que apareceram arquivos no bucket `penpot-assets`.

---

## 5. Build local (opcional)

Para testar a SPA com proxy local antes de deploy:

```sh
cd pages/penpot
./build.sh
npx wrangler pages dev dist --compatibility-date=2024-09-01
```

## 6. Troubleshooting

- **502 Bad Gateway**: backend Render hibernando. Aguardar warm-up (proxy.js
  retorna 503 "warming" durante esse período). Se persistir > 2 min: ver logs
  Render → provavelmente OOM da JVM → subir plano.
- **404 em /api/...**: env var `PENPOT_BACKEND_URL` no Pages está errada ou não
  foi setada. Verificar em Pages → Settings → Environment.
- **Exports falham silenciosamente**: exporter free não aguenta Chromium.
  Logs Render do exporter vão mostrar SIGKILL ou similar. Solução: upgrade
  para Starter.
- **WebSocket não conecta**: navegador → DevTools → Network → ver requisição
  para `/ws/notifications`. Se 502, backend OOM. Se 1006/CORS, problema no
  middleware Function.
