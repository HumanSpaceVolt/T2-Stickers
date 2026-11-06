/* ================================================================
   T²-STICKERS · V16 — Motor de Pedidos y Ticket a WhatsApp
   ================================================================ */
const T2_CART_KEY = 't2_stickers_cart_v16';
const T2_WHATSAPP_NUMBER = '5216860000000'; // Puedes ajustar aquí tu número oficial

let cartState = [];

function loadCart() {
  try {
    const saved = localStorage.getItem(T2_CART_KEY);
    cartState = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cartState = [];
  }
  renderCartUI();
}

function saveCart() {
  localStorage.setItem(T2_CART_KEY, JSON.stringify(cartState));
  renderCartUI();
}

function getPrice(size, finish) {
  if (size === '10 cm') {
    return finish === 'Holográfico' ? 35 : 30;
  }
  return finish === 'Holográfico' ? 25 : 20;
}

function addToCart(product) {
  const size = product.size || '10 cm';
  const finish = product.finish || 'Normal';
  const price = getPrice(size, finish);
  const uid = `${product.id}-${size}-${finish}`;
  
  const existingIndex = cartState.findIndex(item => item.uid === uid);
  if (existingIndex > -1) {
    cartState[existingIndex].qty += (product.qty || 1);
  } else {
    // Normalizar ruta de imagen si se añade desde subcarpeta
    let imgPath = product.image || '';
    if (imgPath.startsWith('../')) {
      imgPath = imgPath.replace('../', '');
    }
    cartState.push({
      uid: uid,
      id: product.id,
      name: product.name,
      category: product.category || 'T²',
      size: size,
      finish: finish,
      price: price,
      image: imgPath,
      qty: product.qty || 1
    });
  }
  saveCart();
  animateCartFeedback();
}


/* V17.5: La compra se confirma sin interrumpir la exploración. */
let cartFeedbackTimer;
const cartButtonTimers = new WeakMap();

function animateCartFeedback() {
  const trigger = document.querySelector('#cart-toggle-btn');
  if (trigger) {
    // Reiniciar la animación incluso si se añaden dos stickers seguidos.
    trigger.classList.remove('cart-just-added');
    void trigger.offsetWidth;
    trigger.classList.add('cart-just-added');
    clearTimeout(cartButtonTimers.get(trigger));
    cartButtonTimers.set(trigger, setTimeout(() => trigger.classList.remove('cart-just-added'), 750));
  }

  // Un aviso de confirmación discreto, no interactivo y accesible.
  let feedback = document.querySelector('#cart-add-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'cart-add-feedback';
    feedback.className = 'cart-add-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-atomic', 'true');
    document.body.appendChild(feedback);
  }
  feedback.textContent = '✓ Agregado a Mi Pedido';
  feedback.classList.add('is-visible');
  clearTimeout(cartFeedbackTimer);
  cartFeedbackTimer = setTimeout(() => feedback.classList.remove('is-visible'), 1900);
}

function confirmAddButton(button) {
  if (!button) return;
  if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent.trim();
  button.textContent = '✓ Agregado';
  button.classList.add('is-added');
  clearTimeout(cartButtonTimers.get(button));
  cartButtonTimers.set(button, setTimeout(() => {
    button.textContent = button.dataset.originalLabel;
    button.classList.remove('is-added');
  }, 1150));
}

function updateItemQty(uid, delta) {
  const item = cartState.find(p => p.uid === uid);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cartState = cartState.filter(p => p.uid !== uid);
  }
  saveCart();
}

function calculateTotal() {
  return cartState.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function countTotalUnits() {
  return cartState.reduce((sum, item) => sum + item.qty, 0);
}

function renderCartUI() {
  const badge = document.querySelector('#cart-badge');
  const itemsContainer = document.querySelector('#cart-items-container');
  const subtotalEl = document.querySelector('#cart-subtotal-val');
  const checkoutBtn = document.querySelector('#cart-checkout-btn');
  const rootPrefix = document.body.dataset.page === 'collection' ? '../' : '';

  const totalUnits = countTotalUnits();
  if (badge) {
    badge.textContent = totalUnits;
    badge.hidden = totalUnits === 0;
  }
  document.querySelector('#cart-toggle-btn')?.classList.toggle('has-items', totalUnits > 0);

  if (!itemsContainer) return;

  if (cartState.length === 0) {
    itemsContainer.innerHTML = '<p class="cart-empty-msg">Tu pedido está vacío.<br>Agrega stickers para armar tu solicitud.</p>';
    if (subtotalEl) subtotalEl.textContent = '$0 MXN';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  itemsContainer.innerHTML = cartState.map(item => `
    <div class="cart-item">
      <img src="${rootPrefix + item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-meta">${item.finish} · ${item.size}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" type="button" onclick="updateItemQty('${item.uid}', -1)">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="qty-btn" type="button" onclick="updateItemQty('${item.uid}', 1)">+</button>
        </div>
      </div>
      <div class="cart-item-price">$${item.price * item.qty} MXN</div>
    </div>
  `).join('');

  if (subtotalEl) {
    subtotalEl.textContent = `$${calculateTotal()} MXN`;
  }
}

function openCartDrawer() {
  if (typeof closeSearch === 'function') closeSearch();
  if (typeof closeMenu === 'function') closeMenu();
  document.querySelector('#cart-backdrop')?.classList.add('is-open');
}

function closeCartDrawer() {
  document.querySelector('#cart-backdrop')?.classList.remove('is-open');
}

function generateFolio() {
  return 'T2-' + Math.floor(1000 + Math.random() * 9000);
}

function showTicketModal() {
  const modal = document.querySelector('#ticket-modal');
  if (!modal || cartState.length === 0) return;

  const folio = generateFolio();
  const total = calculateTotal();

  modal.querySelector('#ticket-folio-val').textContent = folio;
  modal.querySelector('#ticket-items-list').innerHTML = cartState.map(item => `
    <div class="ticket-row">
      <span>${item.qty}x ${item.name} (${item.finish}, ${item.size})</span>
      <strong>$${item.price * item.qty} MXN</strong>
    </div>
  `).join('');

  modal.querySelector('#ticket-total-val').textContent = `$${total} MXN`;

  const waBtn = modal.querySelector('#ticket-send-wa');
  if (waBtn) {
    const waText = encodeURIComponent(
      `¡Hola T²-Stickers! 🪐\nQuiero coordinar el siguiente pedido:\n\n` +
      `📋 *Folio:* ${folio}\n` +
      cartState.map(i => `• ${i.qty}x ${i.name} [${i.finish} - ${i.size}] = $${i.price * i.qty} MXN`).join('\n') +
      `\n\n💰 *Total estimado:* $${total} MXN\n\n` +
      `Quedo en espera de confirmar disponibilidad y entrega contra pago. #StickToYourTruth`
    );
    waBtn.href = `https://wa.me/${T2_WHATSAPP_NUMBER}?text=${waText}`;
  }

  modal.hidden = false;
}

function closeTicketModal() {
  const modal = document.querySelector('#ticket-modal');
  if (modal) modal.hidden = true;
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();

  document.querySelector('#cart-toggle-btn')?.addEventListener('click', openCartDrawer);
  document.querySelector('#cart-close-btn')?.addEventListener('click', closeCartDrawer);
  document.querySelector('#cart-keep-exploring-btn')?.addEventListener('click', closeCartDrawer);
  document.querySelector('#cart-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'cart-backdrop') closeCartDrawer();
  });
  document.querySelector('#cart-checkout-btn')?.addEventListener('click', () => {
    closeCartDrawer();
    showTicketModal();
  });
  document.querySelector('#ticket-close-btn')?.addEventListener('click', closeTicketModal);

  // Escuchar botones "Agregar al pedido" en el catálogo
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card, .gallery-product');
      if (!card) return;
      const id = card.id || card.querySelector('h3')?.textContent.toLowerCase().replace(/\s+/g, '-');
      const name = card.querySelector('h3')?.textContent || 'Sticker T²';
      const category = card.querySelector('.gallery-kicker, span')?.textContent || 'T²';
      const image = card.querySelector('img')?.getAttribute('src') || '';
      const size = card.querySelector('.select-size')?.value || '10 cm';
      const finish = card.querySelector('.select-finish')?.value || 'Normal';

      addToCart({ id, name, category, image, size, finish });
      confirmAddButton(btn);
    });
  });
});
