import { NgOptimizedImage } from '@angular/common';
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

interface ShowcaseItem {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
}

@Component({
  selector: 'app-root',
  imports: [BrandMotionComponent, NgOptimizedImage],
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

  protected readonly digitalShowcase = signal<readonly ShowcaseItem[]>([
    {
      src: '/brand/mockups/macbook-site-1600.webp',
      alt: 'MacBook Pro exibindo a landing page da Cafeína Dev.',
      caption: 'Web',
      description: 'A própria landing rodando: tipografia firme, contraste alto, leitura em qualquer monitor.',
      width: 1600,
      height: 1069,
    },
    {
      src: '/brand/mockups/iphone-showcase-1600.webp',
      alt: 'Marca Cafeína Dev aplicada em mockup de iPhone exibindo a landing page.',
      caption: 'Mobile',
      description: 'Layout responsivo: a mesma narrativa, calibrada para a leitura na palma da mão.',
      width: 1600,
      height: 1074,
    },
    {
      src: '/brand/mockups/ios-app-1600.webp',
      alt: 'Ícone da Cafeína Dev em uma tela inicial de aplicativo iOS.',
      caption: 'App',
      description: 'Identidade que se sustenta como ícone: traço amarelo, fundo grafite, leitura imediata.',
      width: 1600,
      height: 1600,
    },
    {
      src: '/brand/mockups/subway-led-1600.webp',
      alt: 'Painel LED de metrô exibindo a marca Cafeína Dev em ambiente urbano.',
      caption: 'Outdoor',
      description: 'Da plataforma ao painel LED: a mesma assinatura visual em qualquer escala.',
      width: 1600,
      height: 1200,
    },
  ]);

  protected readonly physicalShowcase = signal<readonly ShowcaseItem[]>([
    {
      src: '/brand/mockups/paper-card-1600.webp',
      alt: 'Cartões de visita Cafeína Dev sobre superfície clara, com marca em amarelo e grafite.',
      caption: 'Cartão',
      description: 'Tipografia firme, hierarquia limpa: o primeiro contato profissional cabe na mão.',
      width: 1600,
      height: 1067,
    },
    {
      src: '/brand/mockups/notebooks-1600.webp',
      alt: 'Cadernos com capa estampada pela identidade da Cafeína Dev.',
      caption: 'Caderno',
      description: 'A marca como objeto de trabalho — capa que acompanha a rotina de quem cria.',
      width: 1600,
      height: 1200,
    },
    {
      src: '/brand/mockups/caneca-1600.webp',
      alt: 'Caneca preta com a marca Cafeína Dev estampada em amarelo.',
      caption: 'Caneca',
      description: 'Cafeína literal: o ritual da xícara carregando o mesmo traço da assinatura.',
      width: 1600,
      height: 1200,
    },
    {
      src: '/brand/mockups/camisa-1600.webp',
      alt: 'Camiseta preta com a marca Cafeína Dev estampada no peito.',
      caption: 'Vestuário',
      description: 'A identidade vestida — coerência do digital ao tecido, sem perder o tom.',
      width: 1600,
      height: 1417,
    },
  ]);
}
