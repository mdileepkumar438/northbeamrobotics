const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
const setMenu = (open) => {
  nav.dataset.open = String(open);
  menu.setAttribute('aria-expanded', String(open));
  nav.style.display = open ? 'flex' : '';
  nav.style.position = open ? 'absolute' : '';
  nav.style.top = open ? '81px' : '';
  nav.style.right = open ? '0' : '';
  nav.style.zIndex = open ? '10' : '';
  nav.style.background = open ? 'var(--cream)' : '';
  nav.style.padding = open ? '22px' : '';
  nav.style.flexDirection = open ? 'column' : '';
  nav.style.alignItems = open ? 'flex-start' : '';
  nav.style.border = open ? '1px solid var(--line)' : '';
  nav.style.boxShadow = open ? '10px 10px 0 #d9edf8' : '';
};
menu?.addEventListener('click', () => setMenu(nav.dataset.open !== 'true'));
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
