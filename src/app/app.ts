import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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
}

@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly brandStatement = signal('Cafeína Dev: engenharia de software avançada');
  protected readonly heroTitle = signal('Cafeína Dev');
  protected readonly heroDescription = signal(
    'Do diagnóstico à integração, transformo ecossistemas digitais em fluxo, clareza e capacidade ☕️⚡️👨‍💻',
  );

  protected readonly primaryCta = signal<ExternalLink>({
    label: 'Falar no Instagram',
    href: 'https://www.instagram.com/cafeina_dev/',
    ariaLabel: 'Falar com a Cafeína Dev no Instagram',
  });

  protected readonly secondaryCta = signal<ExternalLink>({
    label: 'Conectar no LinkedIn',
    href: 'https://www.linkedin.com/in/thbezerra/',
    ariaLabel: 'Conectar com Thiago Bezerra no LinkedIn',
  });

  protected readonly proofPoints = signal<readonly FeatureItem[]>([
    {
      title: 'Diagnóstico',
      copy: 'Mapeio gargalos reais antes de propor qualquer mudança.',
    },
    {
      title: 'Fluxo',
      copy: 'Organizo decisões, cadência e feedback para reduzir atrito.',
    },
    {
      title: 'Integração',
      copy: 'Conecto produto, engenharia e operação com clareza técnica.',
    },
  ]);

  protected readonly capabilities = signal<readonly FeatureItem[]>([
    {
      title: 'Arquitetura evolutiva',
      copy: 'Estruturas que deixam o sistema legível, testável e pronto para crescer.',
    },
    {
      title: 'Extreme Programming',
      copy: 'Práticas de engenharia que encurtam ciclos e protegem a qualidade.',
    },
    {
      title: 'OKRs aplicáveis',
      copy: 'Objetivos traduzidos em decisões técnicas, métricas e aprendizado.',
    },
    {
      title: 'Integração ponta a ponta',
      copy: 'Do diagnóstico à entrega, com menos ruído entre estratégia e execução.',
    },
  ]);

  protected readonly channels = signal<readonly ChannelLink[]>([
    {
      eyebrow: 'Comunidade',
      label: 'Instagram',
      href: 'https://www.instagram.com/cafeina_dev/',
      description: 'Bastidores, ideias curtas e conversas sobre engenharia.',
      ariaLabel: 'Abrir Instagram da Cafeína Dev',
    },
    {
      eyebrow: 'Ensaios',
      label: 'Medium',
      href: 'https://thiagoprazeres.medium.com/',
      description: 'Textos sobre software, liderança técnica e fluxo.',
      ariaLabel: 'Abrir Medium de Thiago Prazeres',
    },
    {
      eyebrow: 'Vídeo',
      label: 'YouTube',
      href: 'https://www.youtube.com/@cafeina_dev',
      description: 'Conteúdo em vídeo para aprofundar práticas e decisões.',
      ariaLabel: 'Abrir YouTube da Cafeína Dev',
    },
    {
      eyebrow: 'Rede',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/thbezerra/',
      description: 'Contato profissional, projetos e conversas de parceria.',
      ariaLabel: 'Abrir LinkedIn de Thiago Bezerra',
    },
  ]);

  protected readonly tags = signal<readonly string[]>(['#extremeprogramming', '#okr']);
}
