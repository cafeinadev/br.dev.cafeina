import { gsap } from 'gsap';

/**
 * Anima a entrada do visual do hero (hexágono + raio + glow).
 * Idempotente e respeita prefers-reduced-motion.
 * @param {HTMLElement | null} root contêiner do visual do hero
 */
export function initHeroMotion(root) {
  if (!root) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glow = root.querySelector('[data-hero-glow]');
  const hex = root.querySelector('[data-hero-hex]');
  const raio = root.querySelector('[data-hero-raio]');

  if (reduce || !hex) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from(glow, { opacity: 0, scale: 0.55, duration: 1.2 })
    .from(
      hex,
      { opacity: 0, scale: 0.82, yPercent: 8, duration: 0.9, ease: 'back.out(1.5)' },
      '-=0.8',
    )
    .from(
      raio,
      { opacity: 0, scale: 0, rotate: -25, duration: 0.55, ease: 'back.out(2.6)' },
      '-=0.3',
    );
}
