import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { BrandMotionComponent } from '../brand-motion/brand-motion.component';

interface NavItem {
  readonly id: string;
  readonly label: string;
}

interface ColorToken {
  readonly name: string;
  readonly token: string;
  readonly hex: string;
  readonly rgb: string;
  readonly cmyk: string;
  readonly darkText: boolean;
}

interface SurfaceToken {
  readonly name: string;
  readonly token: string;
  readonly value: string;
  readonly darkText: boolean;
}

interface TypeSpec {
  readonly role: string;
  readonly weight: string;
  readonly size: string;
  readonly lineHeight: string;
  readonly usage: string;
  readonly previewClass: string;
}

interface LogoVariant {
  readonly name: string;
  readonly note: string;
  readonly file: string;
  readonly background: 'light' | 'dark' | 'yellow';
}

interface SpacingToken {
  readonly token: string;
  readonly rem: string;
  readonly px: number;
}

interface GuidelineItem {
  readonly title: string;
  readonly copy: string;
}

@Component({
  selector: 'app-design-system',
  imports: [BrandMotionComponent],
  templateUrl: './design-system.html',
  styleUrl: './design-system.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystem {
  private readonly destroyRef = inject(DestroyRef);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  protected readonly copied = signal<string | null>(null);
  protected readonly activeSection = signal<string>('overview');

  protected readonly nav: readonly NavItem[] = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'cores', label: 'Cores' },
    { id: 'tipografia', label: 'Tipografia' },
    { id: 'logotipo', label: 'Logotipo' },
    { id: 'simbolo', label: 'Símbolo' },
    { id: 'grid', label: 'Grid & espaçamento' },
    { id: 'movimento', label: 'Movimento' },
    { id: 'componentes', label: 'Componentes' },
  ];

  protected readonly principles: readonly GuidelineItem[] = [
    {
      title: 'Impulso',
      copy: 'Formas angulares e contraste alto traduzem energia e capacidade de execução.',
    },
    {
      title: 'Clareza',
      copy: 'Hierarquia objetiva, espaço negativo generoso e tipografia direta.',
    },
    {
      title: 'Conexão',
      copy: 'O símbolo nasce da ideia de fluxo — peças que se encaixam sem ruído.',
    },
  ];

  protected readonly brandColors: readonly ColorToken[] = [
    {
      name: 'Amarelo Energia',
      token: '--cd-color-brand-energy',
      hex: '#fdda0d',
      rgb: 'rgb(253, 218, 7)',
      cmyk: 'C0 M13 Y94 K70',
      darkText: true,
    },
    {
      name: 'Grafite',
      token: '--cd-color-brand-graphite',
      hex: '#333530',
      rgb: 'rgb(51, 53, 48)',
      cmyk: 'C3 M0 Y9 K79',
      darkText: false,
    },
    {
      name: 'Branco',
      token: '--cd-color-neutral-white',
      hex: '#ffffff',
      rgb: 'rgb(255, 255, 255)',
      cmyk: 'C0 M0 Y0 K0',
      darkText: true,
    },
    {
      name: 'Preto',
      token: '--cd-color-neutral-black',
      hex: '#000000',
      rgb: 'rgb(0, 0, 0)',
      cmyk: 'C0 M0 Y0 K100',
      darkText: false,
    },
  ];

  protected readonly surfaceColors: readonly SurfaceToken[] = [
    {
      name: 'Superfície suave',
      token: '--cd-color-surface-muted',
      value: '#f7f7f2',
      darkText: true,
    },
    {
      name: 'Superfície elevada',
      token: '--cd-color-surface-elevated-dark',
      value: '#1f211d',
      darkText: false,
    },
    {
      name: 'Superfície elevada · hover',
      token: '--cd-color-surface-elevated-dark-hover',
      value: '#272a25',
      darkText: false,
    },
    {
      name: 'Borda padrão',
      token: '--cd-color-border-default',
      value: '#d8d9d2',
      darkText: true,
    },
    {
      name: 'Primário · hover',
      token: '--cd-color-button-primary-hover',
      value: '#ebc900',
      darkText: true,
    },
  ];

  protected readonly typeScale: readonly TypeSpec[] = [
    {
      role: 'Display',
      weight: 'UltraBold 800',
      size: 'clamp(2.5rem, 6vw, 4rem)',
      lineHeight: '1.05',
      usage: 'Aberturas de hero e títulos de impacto.',
      previewClass: 'sample sample--display',
    },
    {
      role: 'Título 1',
      weight: 'UltraBold 800',
      size: '2.5rem',
      lineHeight: '1.1',
      usage: 'Título principal de página.',
      previewClass: 'sample sample--h1',
    },
    {
      role: 'Título 2',
      weight: 'UltraBold 800',
      size: '1.75rem',
      lineHeight: '1.2',
      usage: 'Cabeçalho de seção.',
      previewClass: 'sample sample--h2',
    },
    {
      role: 'Título 3',
      weight: 'SemiBold 600',
      size: '1.25rem',
      lineHeight: '1.3',
      usage: 'Subtítulos e títulos de card.',
      previewClass: 'sample sample--h3',
    },
    {
      role: 'Corpo grande',
      weight: 'Regular 400',
      size: '1.125rem',
      lineHeight: '1.6',
      usage: 'Introduções e parágrafos de destaque.',
      previewClass: 'sample sample--lead',
    },
    {
      role: 'Corpo',
      weight: 'Regular 400',
      size: '1rem',
      lineHeight: '1.62',
      usage: 'Texto corrido padrão.',
      previewClass: 'sample sample--body',
    },
    {
      role: 'Legenda',
      weight: 'SemiBold 600',
      size: '0.8125rem',
      lineHeight: '1.45',
      usage: 'Eyebrows e metadados, em caixa alta.',
      previewClass: 'sample sample--caption',
    },
  ];

  protected readonly horizontalLogos: readonly LogoVariant[] = [
    {
      name: 'Principal',
      note: 'Aplicação preferencial, sobre fundos claros.',
      file: 'horizontal-principal',
      background: 'light',
    },
    {
      name: 'Branco',
      note: 'Fundos escuros, grafite ou preto.',
      file: 'horizontal-branco',
      background: 'dark',
    },
    {
      name: 'Amarelo',
      note: 'Monocromática de destaque sobre fundo escuro.',
      file: 'horizontal-amarelo',
      background: 'dark',
    },
    {
      name: 'Preto',
      note: 'Monocromática para fundos claros e impressão P&B.',
      file: 'horizontal-preto',
      background: 'light',
    },
  ];

  protected readonly verticalLogos: readonly LogoVariant[] = [
    {
      name: 'Principal',
      note: 'Formatos quadrados e composições centralizadas.',
      file: 'vertical-principal',
      background: 'light',
    },
    {
      name: 'Branco',
      note: 'Fundos escuros, grafite ou preto.',
      file: 'vertical-branco',
      background: 'dark',
    },
    {
      name: 'Amarelo',
      note: 'Monocromática de destaque sobre fundo escuro.',
      file: 'vertical-amarelo',
      background: 'dark',
    },
    {
      name: 'Preto',
      note: 'Monocromática para fundos claros.',
      file: 'vertical-preto',
      background: 'light',
    },
  ];

  protected readonly symbolLogos: readonly LogoVariant[] = [
    {
      name: 'Símbolo amarelo',
      note: 'Favicon, avatares e selos sobre fundo escuro.',
      file: 'simbolo-amarelo',
      background: 'dark',
    },
    {
      name: 'Símbolo branco',
      note: 'Fundos escuros de alto contraste.',
      file: 'simbolo-branco',
      background: 'dark',
    },
    {
      name: 'Símbolo preto',
      note: 'Fundos claros e impressão P&B.',
      file: 'simbolo-preto',
      background: 'light',
    },
  ];

  protected readonly logoDonts: readonly GuidelineItem[] = [
    {
      title: 'Não aplique sobre fundos coloridos',
      copy: 'Fundos saturados reduzem o contraste. Use a versão negativa.',
    },
    {
      title: 'Não recomponha os elementos',
      copy: 'Símbolo e logotipo não devem ser redimensionados ou reposicionados isoladamente.',
    },
    {
      title: 'Não reduza abaixo do mínimo',
      copy: 'A marca não deve ter menos de 20 mm de altura em materiais gráficos.',
    },
    {
      title: 'Respeite a área de proteção',
      copy: 'Nenhum elemento deve invadir a margem de 2x ao redor da marca.',
    },
  ];

  protected readonly spacingScale: readonly SpacingToken[] = [
    { token: '--cd-space-4', rem: '0.25rem', px: 4 },
    { token: '--cd-space-8', rem: '0.5rem', px: 8 },
    { token: '--cd-space-12', rem: '0.75rem', px: 12 },
    { token: '--cd-space-16', rem: '1rem', px: 16 },
    { token: '--cd-space-24', rem: '1.5rem', px: 24 },
    { token: '--cd-space-32', rem: '2rem', px: 32 },
    { token: '--cd-space-48', rem: '3rem', px: 48 },
    { token: '--cd-space-64', rem: '4rem', px: 64 },
    { token: '--cd-space-96', rem: '6rem', px: 96 },
  ];

  protected readonly radiusScale: readonly SpacingToken[] = [
    { token: '--cd-radius-sm', rem: '0.25rem', px: 4 },
    { token: '--cd-radius-md', rem: '0.5rem', px: 8 },
    { token: '--cd-radius-pill', rem: '999px', px: 999 },
  ];

  constructor() {
    afterNextRender(() => {
      const root = this.content().nativeElement;
      const sections = Array.from(root.querySelectorAll<HTMLElement>('section[id]'));

      if (sections.length === 0 || typeof IntersectionObserver !== 'function') {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.activeSection.set(entry.target.id);
            }
          }
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
      );

      for (const section of sections) {
        observer.observe(section);
      }

      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected async copyValue(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(value);
      window.setTimeout(() => {
        if (this.copied() === value) {
          this.copied.set(null);
        }
      }, 1600);
    } catch {
      this.copied.set(null);
    }
  }
}
