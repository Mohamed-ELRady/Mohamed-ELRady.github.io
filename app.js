'use strict';
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileBreakpoint = window.matchMedia('(max-width: 980px)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.side-header');
const backdrop = document.querySelector('.nav-backdrop');
const navigationLinks = [...document.querySelectorAll('.nav-link')];
const menuLinks = [...navigation.querySelectorAll('a')];
const menuBackground = [...document.querySelectorAll('.hero, main, footer, .back-to-top, .skip-link')];
function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  backdrop.hidden = !open;
  navigation.inert = mobileBreakpoint.matches && !open;
  menuBackground.forEach(element => { element.inert = mobileBreakpoint.matches && open; });
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
backdrop.addEventListener('click', () => setMenu(false));
document.querySelector('.brand').addEventListener('click', () => setMenu(false));
menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { setMenu(false); menuButton.focus(); }
  if (event.key === 'Tab') {
    const lastLink = menuLinks[menuLinks.length - 1];
    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault(); lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault(); menuButton.focus();
    }
  }
});
mobileBreakpoint.addEventListener('change', () => setMenu(false));
setMenu(false);
const backToTop = document.querySelector('.back-to-top');
const trackedSections = [document.querySelector('#home'), ...navigationLinks.map(link => document.querySelector(link.hash))].sort((a,b) => a.offsetTop-b.offsetTop);
let scrollQueued = false;
function updateScroll() {
  const position = window.scrollY + 140;
  let current = trackedSections[0];
  for (const section of trackedSections) if (section.offsetTop <= position) current = section;
  for (const link of navigationLinks) {
    const active = link.hash === `#${current.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  }
  document.body.classList.toggle('at-home', current.id === 'home');
  document.querySelector('.site-header').classList.toggle('is-scrolled', window.scrollY > 20);
  backToTop.classList.toggle('visible', window.scrollY > 350);
  scrollQueued = false;
}
window.addEventListener('scroll', () => { if (!scrollQueued) {scrollQueued = true; requestAnimationFrame(updateScroll);} }, {passive:true});
window.addEventListener('resize', updateScroll);
updateScroll();
const typedRole = document.querySelector('#typed-role');
const roles = ['AI/ML Engineer', 'Computer Vision', 'Gen AI'];
let roleTimer;
let roleIndex = 0;
let characterIndex = roles[0].length;
let erasingRole = true;
function typeRole() {
  if (motionPreference.matches || document.hidden) return;
  const text = roles[roleIndex];
  characterIndex += erasingRole ? -1 : 1;
  typedRole.textContent = text.slice(0, characterIndex);
  let delay = erasingRole ? 45 : 85;
  if (characterIndex === 0) {
    erasingRole = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 300;
  } else if (characterIndex === text.length && !erasingRole) {
    erasingRole = true;
    delay = 2400;
  }
  roleTimer = window.setTimeout(typeRole, delay);
}
function resetRoleTyping() {
  window.clearTimeout(roleTimer);
  roleIndex = 0;
  characterIndex = roles[0].length;
  erasingRole = true;
  typedRole.textContent = roles[0];
  if (!motionPreference.matches && !document.hidden) roleTimer = window.setTimeout(typeRole, 2800);
}
motionPreference.addEventListener('change', resetRoleTyping);
document.addEventListener('visibilitychange', resetRoleTyping);
resetRoleTyping();
document.querySelector('#year').textContent = new Date().getFullYear();

function setupContactDialog(dialog, triggers) {
  let opener;
  triggers.forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    opener = trigger;
    const status = dialog.querySelector('[role="status"]');
    if (status) status.textContent = '';
    dialog.showModal();
    document.body.classList.add('contact-open');
  }));
  dialog.querySelector('.contact-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('contact-open');
    opener?.focus({ preventScroll: true });
  });
}
setupContactDialog(document.querySelector('#contact-dialog'), [document.querySelector('#contact-trigger')]);
setupContactDialog(document.querySelector('#email-dialog'), document.querySelectorAll('[data-email-trigger]'));
const emailAddress = document.querySelector('#email-address');
const emailStatus = document.querySelector('#email-status');
document.querySelector('#copy-email').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(emailAddress.value);
    emailStatus.textContent = 'Email address copied.';
  } catch {
    emailAddress.focus();
    emailAddress.select();
    emailStatus.textContent = 'Address selected. Copy it using your device’s Copy command.';
  }
});

// Reveal once, and never hide content for reduced-motion visitors or hash navigation.
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  document.querySelectorAll('.project-card, .build-card, .skill-group, .timeline-entry, .certificate').forEach(element => {
    element.classList.add('reveal-ready');
    observer.observe(element);
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-revealed'));
      observer.disconnect();
    }
  });
}
window.addEventListener('load', updateScroll);
