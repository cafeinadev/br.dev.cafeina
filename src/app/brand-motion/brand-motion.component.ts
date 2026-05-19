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

      tl.set(root, { opacity: 1 })
        .set(bolt, {
          transformOrigin: '50% 50%',
          scale: 0,
          opacity: 0,
          rotate: -8,
        })
        .set(logo, {
          '--bm-clip': '100%',
          opacity: 0,
          scale: 0.96,
        })
        .to(bolt, {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.5 / speed,
          ease: 'back.out(2.2)',
        })
        .to(
          bolt,
          {
            scale: 0.35,
            opacity: 0.15,
            duration: 0.6 / speed,
            ease: 'power2.inOut',
          },
          '+=0.1',
        )
        .to(
          logo,
          {
            '--bm-clip': '0%',
            opacity: 1,
            scale: 1,
            duration: 0.8 / speed,
            ease: 'power3.out',
          },
          '-=0.45',
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
