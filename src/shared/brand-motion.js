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

/**
 * Toca a animação de marca da seção "Movimento": o raio entra como
 * faísca, assenta, some, e então a marca surge. Retorna a timeline.
 * @param {HTMLElement | null} root contêiner com [data-bm-glow|raio|logo]
 */
export function playBrandMotion(root) {
  if (!root) return null;

  const glow = root.querySelector('[data-bm-glow]');
  const raio = root.querySelector('[data-bm-raio]');
  const logo = root.querySelector('[data-bm-logo]');
  if (!raio || !logo) return null;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    gsap.set(raio, { opacity: 0 });
    gsap.set(logo, { opacity: 1 });
    gsap.set(glow, { opacity: 0.55 });
    return null;
  }

  const tl = gsap.timeline();
  tl.set(raio, { opacity: 0, scale: 0, rotate: -16, transformOrigin: '50% 50%' })
    .set(logo, { opacity: 0, y: 10 })
    .set(glow, { opacity: 0, scale: 0.6 })
    // Faísca
    .to(glow, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, 0)
    .to(raio, { opacity: 1, scale: 1.25, rotate: 0, duration: 0.45, ease: 'back.out(2.4)' }, 0)
    // Assenta
    .to(raio, { scale: 1, duration: 0.3, ease: 'power2.out' })
    .to(glow, { opacity: 0.6, duration: 0.3, ease: 'power2.out' }, '<')
    // Some
    .to(raio, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power2.in' }, '+=0.3')
    // Marca
    .to(logo, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.1');
  return tl;
}
