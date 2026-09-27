'use strict';

// Keep the actual pointer native: this layer is decorative and never captures input.
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('span');
  ring.className = 'cursor-ring';
  trail.append(ring);
  document.body.append(trail);

  let frame = null;
  let previousTime = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  const enabled = () => finePointer.matches && !reducedMotion.matches && !document.hidden;

  function hide() {
    trail.classList.remove('is-visible', 'is-interactive', 'is-pressed');
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = 0;
  }

  function paint() {
    trail.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function follow(time) {
    if (!enabled()) { hide(); return; }
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    const ease = 1 - Math.exp(-elapsed / 48);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    previousTime = time;
    if (Math.hypot(targetX - x, targetY - y) < .15) {
      x = targetX;
      y = targetY;
      frame = null;
      previousTime = 0;
    } else {
      frame = requestAnimationFrame(follow);
    }
    paint();
  }

  function updateTarget(target) {
    const control = target instanceof Element && target.closest('a, button, [role="button"], summary, label');
    trail.classList.toggle('is-interactive', !!control && !control.matches(':disabled, [aria-disabled="true"]'));
  }

  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !enabled()) { hide(); return; }
    targetX = event.clientX;
    targetY = event.clientY;
    if (!trail.classList.contains('is-visible')) {
      x = targetX;
      y = targetY;
      paint();
      trail.classList.add('is-visible');
    }
    updateTarget(event.target);
    if (frame === null) frame = requestAnimationFrame(follow);
  }, { passive: true });

  document.addEventListener('pointerover', event => updateTarget(event.target), { passive: true });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && enabled()) trail.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointerup', () => trail.classList.remove('is-pressed'), { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); }, { passive: true });
  document.addEventListener('pointercancel', hide, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') hide(); });
  document.addEventListener('visibilitychange', hide);
  window.addEventListener('blur', hide);
  finePointer.addEventListener('change', hide);
  reducedMotion.addEventListener('change', hide);
})();
