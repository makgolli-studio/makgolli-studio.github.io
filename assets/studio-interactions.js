(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const animations = new Set();
  const mascots = document.querySelectorAll('.mascot-frame');
  let observer;

  function enter(element) {
    if (reducedMotion.matches || typeof element.animate !== 'function') return;
    const animation = element.animate([
      { opacity: .55, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
    animations.add(animation);
    animation.onfinish = animation.oncancel = () => animations.delete(animation);
  }

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        enter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('main > section > .wrap').forEach(element => {
      // Skip blocks already on screen: returning to an anchor stays immediate.
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) return;
      observer.observe(element);
    });
  }

  document.querySelectorAll('.work-card, .feature').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const x = event.clientX, y = event.clientY;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--accent-x', `${x - box.left}px`);
        card.style.setProperty('--accent-y', `${y - box.top}px`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.style.removeProperty('--accent-x');
      card.style.removeProperty('--accent-y');
    });
  });

  mascots.forEach(mascot => {
    mascot.addEventListener('pointermove', event => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const box = mascot.getBoundingClientRect();
      const lean = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
      mascot.style.setProperty('--mascot-lean', `${lean * 2}deg`);
    });
    mascot.addEventListener('pointerleave', () => mascot.style.removeProperty('--mascot-lean'));
  });

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    mascots.forEach(mascot => mascot.style.removeProperty('--mascot-lean'));
  });
})();
