import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

export type BrandMotionVariant = 'hero' | 'header';

@Component({
  selector: 'app-brand-motion',
  imports: [NgOptimizedImage],
  templateUrl: './brand-motion.component.html',
  styleUrl: './brand-motion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.brand-motion--hero]': 'variant() === "hero"',
    '[class.brand-motion--header]': 'variant() === "header"',
    '[attr.aria-label]': 'ariaLabel()',
    role: 'img',
  },
})
export class BrandMotionComponent {
  readonly variant = input<BrandMotionVariant>('hero');
  readonly ariaLabel = input<string>('Logotipo animado da Cafeína Dev');

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(async () => {
      const reduce =
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;
      const collapseOnMobile =
        this.variant() === 'header' &&
        typeof matchMedia === 'function' &&
        matchMedia('(max-width: 640px)').matches;

      if (reduce || collapseOnMobile) {
        return;
      }

      const { gsap } = await import('gsap');
      const root = this.host().nativeElement;
      const bolt = root.querySelector('.bm-bolt') as HTMLElement | null;
      const logo = root.querySelector('.bm-logo') as HTMLElement | null;

      if (!bolt || !logo) {
        return;
      }

      const v = this.variant();
      const pause = v === 'hero' ? 3 : 8;
      const speed = v === 'hero' ? 1 : 1.4;
      const fadeOut = v === 'hero' ? 0.7 : 0.5;

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });

      /*
       * Raio sobreposto: ele entra primeiro, com over-shoot e glow forte,
       * e fica fixo no espaço negativo do símbolo. O logo então faz wipe
       * por cima/em torno, "envolvendo" o raio. Pausa no estado final.
       */
      tl.set(root, { opacity: 1 })
        .set(bolt, {
          transformOrigin: '50% 50%',
          scale: 0,
          opacity: 0,
          rotate: -10,
          filter: 'drop-shadow(0 0 28px rgba(253, 218, 13, 0.9))',
        })
        .set(logo, {
          '--bm-clip': '100%',
          opacity: 0,
        })
        .to(bolt, {
          scale: 1.25,
          opacity: 1,
          rotate: 0,
          duration: 0.45 / speed,
          ease: 'back.out(2.4)',
        })
        .to(
          bolt,
          {
            scale: 1,
            filter: 'drop-shadow(0 0 14px rgba(253, 218, 13, 0.55))',
            duration: 0.4 / speed,
            ease: 'power2.out',
          },
          '+=0.05',
        )
        .to(
          logo,
          {
            '--bm-clip': '0%',
            opacity: 1,
            duration: 0.75 / speed,
            ease: 'power3.out',
          },
          '-=0.3',
        )
        .to({}, { duration: pause })
        .to([logo, bolt], {
          opacity: 0,
          duration: fadeOut,
          ease: 'power2.inOut',
        });

      this.destroyRef.onDestroy(() => tl.kill());
    });
  }
}
