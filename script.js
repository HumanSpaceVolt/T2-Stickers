/* T²-Stickers V16.2 — Mega-menú de colecciones, buscador con animación fluida y sincronización con Mi Pedido. */
const header = document.querySelector('#site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const searchToggle = document.querySelector('.search-toggle');
const searchPanel = document.querySelector('#search-panel');
const searchClose = document.querySelector('.search-close');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#site-search');
const searchStatus = document.querySelector('#search-status');
const collectionsDropdown = document.querySelector('#collections-dropdown');
const collectionsTrigger = collectionsDropdown?.querySelector('.nav-dropdown-trigger');
const mobile = window.matchMedia('(max-width:760px)');
const rootPrefix = document.body.dataset.page === 'collection' ? '../' : '';

let searchResults = document.querySelector('.search-results');
if (searchForm && !searchResults) {
  searchResults = document.createElement('div');
  searchResults.className = 'search-results';
  searchResults.setAttribute('aria-label', 'Resultados de búsqueda');
  searchForm.append(searchResults);
}

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 22);
  if (searchPanel) {
    searchPanel.style.top = `${header.getBoundingClientRect().height}px`;
  }
}

function closeMenu() {
  nav?.classList.remove('is-open');
  collectionsDropdown?.classList.remove('is-open');
  collectionsTrigger?.setAttribute('aria-expanded', 'false');
  header?.classList.remove('menu-is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Abrir menú de navegación');
}

function openMenu() {
  closeSearch();
  if (typeof closeCartDrawer === 'function') closeCartDrawer();
  if (mobile.matches) {
    nav?.classList.add('is-open');
    header?.classList.add('menu-is-open');
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.setAttribute('aria-label', 'Cerrar menú de navegación');
  }
}

function closeSearch() {
  if (searchPanel) {
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden', 'true');
  }
  searchToggle?.setAttribute('aria-expanded', 'false');
}

function openSearch() {
  closeMenu();
  if (typeof closeCartDrawer === 'function') closeCartDrawer();
  if (searchPanel) {
    updateHeader();
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden', 'false');
  }
  searchToggle?.setAttribute('aria-expanded', 'true');
  setTimeout(() => searchInput?.focus(), 60);
}

function normalize(value) {
  return String(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchesFor(value) {
  const query = normalize(value.trim());
  if (!query) return [];
  return (window.T2_PRODUCTS || []).filter(p => normalize(p.name + ' ' + p.category).includes(query));
}

function runSearch(value) {
  const q = value.trim(), matches = matchesFor(q);
  if (searchStatus) {
    searchStatus.textContent = q
      ? `${matches.length} diseño${matches.length === 1 ? '' : 's'} encontrado${matches.length === 1 ? '' : 's'} en nuestro universo.`
      : '';
  }
  if (searchResults) {
    searchResults.replaceChildren();
    matches.forEach(p => {
      const a = document.createElement('a');
      a.className = 'search-result';
      a.href = rootPrefix + p.url;
      const image = document.createElement('img');
      image.src = rootPrefix + p.image;
      image.alt = '';
      const block = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = p.name;
      const small = document.createElement('small');
      small.textContent = p.category;
      block.append(strong, small);
      a.append(image, block);
      searchResults.append(a);
    });
  }
  return matches;
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader, { passive: true });

toggle?.addEventListener('click', () => nav?.classList.contains('is-open') ? closeMenu() : openMenu());

/* En escritorio, híbrido Hover + Clic inteligente para Colecciones (Opción B) */
collectionsDropdown?.addEventListener('mouseenter', () => {
  if (!mobile.matches) {
    collectionsDropdown.classList.remove('is-force-closed');
  }
});

collectionsDropdown?.addEventListener('mouseleave', () => {
  if (!mobile.matches) {
    collectionsDropdown.classList.remove('is-force-closed');
    collectionsDropdown.classList.remove('is-open');
    collectionsTrigger?.setAttribute('aria-expanded', 'false');
  }
});

collectionsTrigger?.addEventListener('click', (e) => {
  if (!mobile.matches) {
    e.preventDefault();
    const megaMenu = collectionsDropdown.querySelector('.mega-menu');
    const isVisible = megaMenu && window.getComputedStyle(megaMenu).visibility === 'visible' && window.getComputedStyle(megaMenu).opacity !== '0';

    if (isVisible) {
      collectionsDropdown.classList.remove('is-open');
      collectionsDropdown.classList.add('is-force-closed');
      collectionsTrigger.setAttribute('aria-expanded', 'false');
      collectionsTrigger.blur();
    } else {
      collectionsDropdown.classList.remove('is-force-closed');
      collectionsDropdown.classList.add('is-open');
      collectionsTrigger.setAttribute('aria-expanded', 'true');
    }
  }
});

nav?.querySelectorAll('a:not(.nav-dropdown-trigger)').forEach(a => a.addEventListener('click', closeMenu));

searchToggle?.addEventListener('click', () => {
  const isOpen = searchPanel?.classList.contains('is-open');
  isOpen ? closeSearch() : openSearch();
});

searchClose?.addEventListener('click', () => {
  closeSearch();
  searchToggle?.focus();
});

searchInput?.addEventListener('input', () => runSearch(searchInput.value));

searchForm?.addEventListener('submit', e => {
  e.preventDefault();
  const found = runSearch(searchInput.value);
  if (found.length === 1) location.href = rootPrefix + found[0].url;
  else if (found.length === 0 && searchStatus) {
    searchStatus.textContent = 'No encontramos un diseño con ese nombre. Prueba con otra palabra clave o colección.';
  }
});

document.addEventListener('click', e => {
  if (mobile.matches && nav?.classList.contains('is-open') && !header?.contains(e.target)) closeMenu();
  if (!mobile.matches && collectionsDropdown?.classList.contains('is-open') && !collectionsDropdown.contains(e.target)) {
    collectionsDropdown.classList.remove('is-open');
    collectionsTrigger?.setAttribute('aria-expanded', 'false');
  }
  if (searchPanel?.classList.contains('is-open') && !searchPanel.contains(e.target) && !searchToggle?.contains(e.target)) {
    closeSearch();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const cartBackdrop = document.querySelector('#cart-backdrop');
    const cartWasOpen = cartBackdrop?.classList.contains('is-open');
    const wasOpen = nav?.classList.contains('is-open') || searchPanel?.classList.contains('is-open');
    closeMenu();
    closeSearch();
    if (typeof closeCartDrawer === 'function') closeCartDrawer();
    if (typeof closeTicketModal === 'function') closeTicketModal();

    // Si Escape cierra el carrito, quitar el foco que quedó en la bolsa
    // (o en un control del panel) para que no permanezca resaltado.
    if (cartWasOpen) {
      const focusedElement = document.activeElement;
      if (focusedElement && typeof focusedElement.blur === 'function') {
        focusedElement.blur();
      }
    } else if (wasOpen) {
      toggle?.focus();
    }
  }
});

mobile.addEventListener('change', closeMenu);
