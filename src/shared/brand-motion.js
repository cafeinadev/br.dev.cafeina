import { gsap } from 'gsap';

/**
 * Anima a entrada do hero: o raio branco pula na tela, some, e então o
 * símbolo amarelo surge com a órbita de raios. Respeita prefers-reduced-motion.
 * Os raios da órbita giram continuamente via CSS — aqui só revelamos os elementos.
 * @param {HTMLElement | null} root contêiner do visual do hero
 */
export function initHeroMotion(root) {
  if (!root) return;

  const glow = root.querySelector('[data-hero-glow]');
  const spark = root.querySelector('[data-hero-spark]');
  const hex = root.querySelector('[data-hero-hex]');
  const hexImg = hex?.querySelector('img');
  const orbitLine = root.querySelector('[data-hero-orbit-line]');
  const orbit = root.querySelector('[data-hero-orbit]');
  if (!hex) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    gsap.set(spark, { opacity: 0 });
    gsap.set([glow, hex, orbitLine, orbit], { opacity: 1 });
    return;
  }

  const tl = gsap.timeline();

  tl.set(spark, { opacity: 0, scale: 0, rotate: -20, transformOrigin: '50% 50%' })
    .set(hex, { opacity: 0 })
    .set(hexImg, { scale: 0.8, transformOrigin: '50% 50%' })
    .set(glow, { opacity: 0, scale: 0.6 })
    .set([orbitLine, orbit], { opacity: 0 })
    // 1. o raio branco pula na tela
    .to(spark, { opacity: 1, scale: 1.15, rotate: 0, duration: 0.85, ease: 'elastic.out(1, 0.45)' }, 0)
    .to(glow, { opacity: 0.55, scale: 1, duration: 0.5, ease: 'power2.out' }, 0)
    // 2. assenta
    .to(spark, { scale: 0.95, duration: 0.25, ease: 'power1.inOut' })
    // 3. segura e 4. some
    .to(spark, { opacity: 0, scale: 0.4, rotate: 14, duration: 0.4, ease: 'back.in(1.6)' }, '+=0.25')
    // 5. o símbolo amarelo surge
    .to(hex, { opacity: 1, duration: 0.55, ease: 'power2.out' }, '-=0.15')
    .to(hexImg, { scale: 1, duration: 0.75, ease: 'back.out(1.6)' }, '<')
    // 6. a órbita aparece
    .to(orbitLine, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to(orbit, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.45');
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
