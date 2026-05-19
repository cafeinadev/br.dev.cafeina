import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BrandMotionComponent } from './brand-motion/brand-motion.component';

interface ExternalLink {
  readonly label: string;
  readonly href: string;
  readonly ariaLabel: string;
}

interface FeatureItem {
  readonly title: string;
  readonly copy: string;
}

interface ChannelLink extends ExternalLink {
  readonly eyebrow: string;
  readonly description: string;
  readonly cta: string;
}

@Component({
  selector: 'app-root',
  imports: [BrandMotionComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly heroEyebrow = signal('Engenharia de software B2B');
  protected readonly heroDescription = signal(
    'A Cafeína Dev remove o ruído entre produto, engenharia e operação. Sobra clareza, cadência e capacidade — onde antes havia retrabalho.',
  );

  protected readonly primaryCta = signal<ExternalLink>({
    label: 'Chama no direct',
    href: 'https://www.instagram.com/direct/t/17843543157605800/',
    ariaLabel: 'Chamar a Cafeína Dev no Instagram Direct',
  });

  protected readonly secondaryCta = signal<ExternalLink>({
    label: 'Ver no GitHub',
    href: 'https://github.com/cafeinadesign',
    ariaLabel: 'Abrir organização Cafeína no GitHub',
  });

  protected readonly pillars = signal<readonly FeatureItem[]>([
    {
      title: 'Sem fábrica de feature',
      copy: 'Backlog vira-lata vira dívida. A gente entrega sistema que respira.',
    },
    {
      title: 'Sem teatro de processo',
      copy: 'Cerimônia que não decide é desperdício. Cadência sim, ritual não.',
    },
    {
      title: 'Sem dívida invisível',
      copy: 'A arquitetura grita o que o roadmap esconde. A gente escuta antes.',
    },
  ]);

  protected readonly capabilities = signal<readonly FeatureItem[]>([
    {
      title: 'Arquitetura evolutiva',
      copy: 'Sistemas que crescem sem te prender em decisões antigas.',
    },
    {
      title: 'Extreme Programming',
      copy: 'Práticas que protegem a qualidade a cada commit, não a cada release.',
    },
    {
      title: 'OKRs aplicáveis',
      copy: 'Objetivos que viram decisão técnica, não slide morto na próxima reunião.',
    },
    {
      title: 'Integração ponta a ponta',
      copy: 'Produto, engenharia e operação falando a mesma língua.',
    },
  ]);

  protected readonly audiences = signal<readonly FeatureItem[]>([
    {
      title: 'CTOs e VPs de Engenharia',
      copy: 'Escalando time sem perder consistência técnica.',
    },
    {
      title: 'Heads de Produto',
      copy: 'Que querem ciclos curtos com qualidade previsível.',
    },
    {
      title: 'Founders técnicos',
      copy: 'Com gargalo de entrega trancando o crescimento.',
    },
  ]);

  protected readonly channels = signal<readonly ChannelLink[]>([
    {
      eyebrow: 'Comunidade',
      label: 'Instagram',
      href: 'https://www.instagram.com/cafeina_dev/',
      description: 'Bastidores, leituras curtas e provocações sobre engenharia.',
      ariaLabel: 'Abrir Instagram da Cafeína Dev',
      cta: 'Seguir →',
    },
    {
      eyebrow: 'Engenharia aberta',
      label: 'GitHub',
      href: 'https://github.com/cafeinadesign',
      description: 'Código, padrões e referências que usamos no dia a dia.',
      ariaLabel: 'Abrir organização Cafeína no GitHub',
      cta: 'Explorar →',
    },
    {
      eyebrow: 'Ensaios',
      label: 'Medium',
      href: 'https://thiagoprazeres.medium.com/',
      description: 'Textos longos sobre arquitetura, liderança técnica e fluxo.',
      ariaLabel: 'Abrir Medium de Thiago Prazeres',
      cta: 'Ler →',
    },
    {
      eyebrow: 'Vídeo',
      label: 'YouTube',
      href: 'https://www.youtube.com/@cafeina_dev',
      description: 'Conversas e demos para aprofundar prática.',
      ariaLabel: 'Abrir YouTube da Cafeína Dev',
      cta: 'Assistir →',
    },
    {
      eyebrow: 'Rede',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/thbezerra/',
      description: 'Contato profissional, parcerias e propostas.',
      ariaLabel: 'Conectar com Thiago Bezerra no LinkedIn',
      cta: 'Conectar →',
    },
  ]);

  protected readonly tags = signal<readonly string[]>([
    '#ExtremeProgramming',
    '#OKR',
    '#ArquiteturaEvolutiva',
  ]);
}
