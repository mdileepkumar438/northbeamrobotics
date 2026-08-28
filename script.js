const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
menu?.addEventListener('click', () => {
  const open = nav.dataset.open === 'true';
  nav.dataset.open = String(!open);
  nav.style.display = open ? '' : 'flex';
  nav.style.position = 'absolute'; nav.style.top = '72px'; nav.style.right = '20px';
  nav.style.background = 'var(--cream)'; nav.style.padding = '20px'; nav.style.flexDirection = 'column'; nav.style.alignItems = 'flex-start'; nav.style.border = '1px solid var(--line)';
});
