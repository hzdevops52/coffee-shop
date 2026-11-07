const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 800px)').matches;

// Procedural 3D cup: lathed ceramic body, torus handle, coffee surface and animated steam.
async function initCoffeeCup() {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
  const canvas = document.querySelector('#coffee-canvas');
  if (!canvas || reduceMotion) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.7 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.28, 10.2);
  camera.lookAt(0, 0.12, 0);

  const cupGroup = new THREE.Group();
  scene.add(cupGroup);

  const ceramic = new THREE.MeshPhysicalMaterial({
    color: 0x382319, roughness: 0.25, metalness: 0.06,
    clearcoat: 0.8, clearcoatRoughness: 0.12
  });
  const cupProfile = [
    new THREE.Vector2(0.00, -1.28), new THREE.Vector2(0.63, -1.28),
    new THREE.Vector2(0.78, -1.16), new THREE.Vector2(0.92, -0.65),
    new THREE.Vector2(1.02, 0.15), new THREE.Vector2(1.04, 0.78),
    new THREE.Vector2(0.99, 0.88), new THREE.Vector2(0.91, 0.88),
    new THREE.Vector2(0.88, 0.76), new THREE.Vector2(0.85, 0.12),
    new THREE.Vector2(0.74, -0.92), new THREE.Vector2(0.62, -1.05),
    new THREE.Vector2(0.00, -1.05)
  ];
  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 96), ceramic);
  cup.castShadow = true;
  cup.receiveShadow = true;
  cupGroup.add(cup);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.105, 24, 80, Math.PI * 1.8), ceramic);
  handle.position.set(1.03, -0.05, 0);
  handle.rotation.z = Math.PI * 0.1;
  cupGroup.add(handle);

  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.885, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x241008, roughness: 0.12, metalness: 0.08, clearcoat: 1 })
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(0, 0.72, 0);
  // Circle lies in X/Y by default; orient its normal upward.
  coffee.rotation.x = -Math.PI / 2;
  cupGroup.add(coffee);

  const crema = new THREE.Mesh(
    new THREE.RingGeometry(0.56, 0.82, 96),
    new THREE.MeshBasicMaterial({ color: 0x9a5b2f, transparent: true, opacity: 0.48, side: THREE.DoubleSide })
  );
  crema.rotation.x = -Math.PI / 2;
  crema.position.y = 0.726;
  cupGroup.add(crema);

  const saucer = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.42, 0.09, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x38251c, roughness: 0.22, metalness: 0.12, clearcoat: 0.9 })
  );
  saucer.position.y = -1.34;
  saucer.scale.z = 0.76;
  cupGroup.add(saucer);

  const goldLine = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.018, 8, 100),
    new THREE.MeshStandardMaterial({ color: 0xc89a64, metalness: 0.8, roughness: 0.25 })
  );
  goldLine.rotation.x = Math.PI / 2;
  goldLine.position.y = -1.29;
  cupGroup.add(goldLine);

  // Brew & Barrel signature branding.
  const brandCanvas = document.createElement('canvas');
  brandCanvas.width = 1024;
  brandCanvas.height = 512;
  const brandCtx = brandCanvas.getContext('2d');

  brandCtx.strokeStyle = '#d6a46b';
  brandCtx.lineWidth = 5;
  brandCtx.beginPath();
  brandCtx.arc(512, 175, 92, 0, Math.PI * 2);
  brandCtx.stroke();

  brandCtx.fillStyle = '#e5bd8d';
  brandCtx.textAlign = 'center';
  brandCtx.font = 'bold 105px Georgia';
  brandCtx.fillText('B&B', 512, 211);

  brandCtx.font = 'bold 47px Georgia';
  brandCtx.letterSpacing = '12px';
  brandCtx.fillText('BREW & BARREL', 512, 350);

  brandCtx.font = '25px Arial';
  brandCtx.letterSpacing = '8px';
  brandCtx.fillText('COFFEE  •  CRAFT  •  COMPANY', 512, 410);

  const brandTexture = new THREE.CanvasTexture(brandCanvas);
  brandTexture.colorSpace = THREE.SRGBColorSpace;

  const brand = new THREE.Mesh(
    new THREE.PlaneGeometry(0.91, 0.46),
    new THREE.MeshBasicMaterial({
      map: brandTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  brand.position.set(0, -0.13, 1.015);
  cupGroup.add(brand);

  // Espresso and crema appear during the introduction.
  coffee.scale.setScalar(0.001);
  crema.scale.setScalar(0.001);

  // Three coffee beans enter the scene as the cup is revealed.
  const beanMaterial = new THREE.MeshStandardMaterial({
    color: 0x32170d,
    roughness: 0.3,
    metalness: 0.04
  });

  const beans = [];
  const beanStarts = [
    [-1.7, 1.7, 0.3],
    [1.6, 2.0, 0.1],
    [0.2, 2.3, 0.5]
  ];

  beanStarts.forEach((position, i) => {
    const bean = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 16),
      beanMaterial.clone()
    );

    bean.scale.set(1.35, 0.65, 0.48);
    bean.position.set(...position);
    bean.rotation.z = i * 0.8;

    bean.userData.start = bean.position.clone();
    bean.userData.end = new THREE.Vector3(
      (i - 1) * 0.2,
      0.92,
      0.15
    );

    cupGroup.add(bean);
    beans.push(bean);
  });

  // Fine steam ribbons are real 3D tube geometries with animated opacity and gentle drift.
  const steamMaterial = new THREE.MeshBasicMaterial({ color: 0xe8d8c5, transparent: true, opacity: 0.23 });
  const steamRibbons = [];
  for (let i = 0; i < 3; i++) {
    const points = [];
    for (let j = 0; j <= 28; j++) {
      const t = j / 28;
      points.push(new THREE.Vector3(
        Math.sin(t * 5 + i * 1.7) * (0.10 + t * 0.12) + (i - 1) * 0.23,
        0.83 + t * (1.0 + i * 0.08),
        Math.cos(t * 4 + i) * 0.035
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.018, 6, false), steamMaterial.clone());
    cupGroup.add(mesh);
    steamRibbons.push(mesh);
  }

  const ambient = new THREE.AmbientLight(0xffdfc0, 1.45);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffd4a5, 3.8);
  key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.PointLight(0xc9874f, 42, 12);
  rim.position.set(4, 1.5, -2); scene.add(rim);
  const fill = new THREE.PointLight(0xfff1df, 18, 10);
  fill.position.set(-4, 0, 3); scene.add(fill);

  cupGroup.position.y = -0.02;
  cupGroup.rotation.y = -0.36;
  const pointer = { x: 0, y: 0 };
  let width = 0, height = 0;
  let finalScale = isMobile ? 0.98 : 1.02;
  const clock = new THREE.Clock();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    finalScale = isMobile ? 0.98 : 1.02;
    if (clock.elapsedTime > 4.2) cupGroup.scale.setScalar(finalScale);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 0.22;
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 0.12;
  }, { passive: true });

  let frame = 0;
  function animate() {
    frame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // The cup arrives, settles, and becomes the hero object.
    const arrival = Math.min(1, t / 3.8);
    const ease = 1 - Math.pow(1 - arrival, 3);

    cupGroup.scale.setScalar(finalScale * (0.82 + 0.18 * ease));
    cupGroup.position.y = -0.48 + ease * 0.46
      + Math.sin(t * 0.85) * 0.035;

    // Espresso fills the cup, followed by its golden crema.
    const coffeeProgress = Math.max(0, Math.min(1, (t - 1.25) / 1.7));
    const cremaProgress = Math.max(0, Math.min(1, (t - 2.1) / 1.1));

    coffee.scale.setScalar(Math.max(0.001, coffeeProgress));
    crema.scale.setScalar(Math.max(0.001, cremaProgress));

    // Coffee beans descend into the scene and disappear naturally.
    beans.forEach((bean, i) => {
      const progress = Math.max(0, Math.min(1, (t - 0.35 - i * 0.3) / 1.7));
      const eased = progress * progress * (3 - 2 * progress);

      bean.position.lerpVectors(
        bean.userData.start,
        bean.userData.end,
        eased
      );

      const visibility = 1 - eased;
      bean.scale.set(
        1.35 * visibility,
        0.65 * visibility,
        0.48 * visibility
      );
      bean.material.transparent = true;
      bean.material.opacity = visibility;
    })
    cupGroup.rotation.y += (pointer.x + Math.sin(t * 0.22) * 0.035 - cupGroup.rotation.y + 0.36) * 0.012;
    cupGroup.rotation.x += (pointer.y - cupGroup.rotation.x) * 0.012;
    steamRibbons.forEach((ribbon, i) => {
      ribbon.position.y = Math.sin(t * 0.8 + i) * 0.035;
      ribbon.rotation.z = Math.sin(t * 0.65 + i * 2) * 0.06;
      ribbon.material.opacity = (0.13 + (Math.sin(t * 1.3 + i * 2) + 1) * 0.07) * Math.max(0, Math.min(1, (t - 2.0) / 1.5));
    });
    renderer.render(scene, camera);
  }
  animate();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else { clock.start(); animate(); }
  });
}
initCoffeeCup().catch(error => {
  console.error('COFFEE CUP INITIALIZATION FAILED:', error);
  document.documentElement.classList.add('no-webgl');
});

// Navigation state and mobile drawer.
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMobileNav() {
  toggle?.classList.remove('active');
  toggle?.setAttribute('aria-expanded', 'false');
  mobileNav?.classList.remove('open');
  mobileNav?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}
toggle?.addEventListener('click', () => {
  const open = !mobileNav.classList.contains('open');
  toggle.classList.toggle('active', open);
  toggle.setAttribute('aria-expanded', String(open));
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMobileNav(); closeLightbox(); } });

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const progress = document.querySelector('.scroll-progress span');
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 30);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  let current = 'home';
  sections.forEach(section => { if (y >= section.offsetTop - 180) current = section.id; });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Menu filters.
const tabs = document.querySelectorAll('.menu-tab');
const menuItems = document.querySelectorAll('.menu-item');
tabs.forEach(tab => tab.addEventListener('click', () => {
  const filter = tab.dataset.filter;
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
  });
  menuItems.forEach(item => {
    const show = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('hidden', !show);
  });
}));

// Lightweight frontend basket. Prices remain unlisted until the business confirms them.
const WHATSAPP_NUMBER = ''; // Add the business number in international format, digits only (example: 923001234567).
const menuList = document.querySelector('#menu-list');
const cart = new Map();
const cartMarkup = `
  <button class="cart-trigger" type="button" aria-label="Open order basket">
    <span class="cart-trigger-icon">＋</span><span class="cart-trigger-label">YOUR ORDER</span><span class="cart-count">0</span>
  </button>
  <div class="cart-overlay" aria-hidden="true">
    <aside class="cart-drawer" role="dialog" aria-modal="true" aria-label="Your order basket">
      <div class="cart-head"><div><p class="eyebrow">A LITTLE SOMETHING FOR YOU</p><h2>Your order</h2></div><button class="cart-close" type="button" aria-label="Close basket">×</button></div>
      <div class="cart-items"><p class="cart-empty">Your basket is waiting for a favourite.</p></div>
      <div class="cart-foot"><p class="cart-note">Prices are currently being confirmed by the business. Your order request will be sent by WhatsApp for confirmation.</p><button class="button button-gold cart-checkout" type="button" disabled>CONFIRM ORDER VIA WHATSAPP <span>↗</span></button></div>
    </aside>
  </div>
  <div class="cart-toast" role="status" aria-live="polite"></div>`;
document.body.insertAdjacentHTML('beforeend', cartMarkup);
const cartTrigger = document.querySelector('.cart-trigger');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const checkoutButton = document.querySelector('.cart-checkout');
const toast = document.querySelector('.cart-toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function openCart() {
  cartOverlay.classList.add('open');
  cartOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}
function closeCart() {
  cartOverlay.classList.remove('open');
  cartOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}
function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((sum, [, item]) => sum + item.quantity, 0);
  cartCount.textContent = count;
  checkoutButton.disabled = count === 0;
  if (!entries.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your basket is waiting for a favourite.</p>';
    return;
  }
  cartItems.innerHTML = entries.map(([name, item]) => `
    <div class="cart-line" data-name="${name.replaceAll('&','&amp;').replaceAll('"','&quot;')}">
      <div><h3>${item.name}</h3><small>${item.category.toUpperCase()} · PRICE TO BE CONFIRMED</small><button class="cart-remove" type="button" data-action="remove">Remove</button></div>
      <div class="cart-quantity"><button type="button" data-action="decrease" aria-label="Decrease ${item.name}">−</button><span>${item.quantity}</span><button type="button" data-action="increase" aria-label="Increase ${item.name}">+</button></div>
    </div>`).join('');
}
menuList?.querySelectorAll('.menu-item').forEach(item => {
  const name = item.querySelector('h3')?.textContent.trim();
  const category = item.dataset.category || 'menu';
  if (!name) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'menu-item-action';
  button.textContent = '＋ ADD';
  button.setAttribute('aria-label', `Add ${name} to order`);
  button.addEventListener('click', () => {
    const current = cart.get(name) || { name, category, quantity: 0 };
    current.quantity += 1;
    cart.set(name, current);
    renderCart();
    button.classList.add('added');
    button.textContent = '✓ ADDED';
    showToast(`${name} added to your order`);
    window.setTimeout(() => { button.classList.remove('added'); button.textContent = '＋ ADD'; }, 1000);
  });
  item.append(button);
});
cartTrigger.addEventListener('click', openCart);
document.querySelector('.cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', event => { if (event.target === cartOverlay) closeCart(); });
cartItems.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const row = event.target.closest('.cart-line');
  if (!action || !row) return;
  const name = row.dataset.name;
  const item = cart.get(name);
  if (!item) return;
  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;
  if (action === 'remove' || item.quantity <= 0) cart.delete(name);
  else cart.set(name, item);
  renderCart();
});
checkoutButton.addEventListener('click', () => {
  const entries = [...cart.values()];
  if (!entries.length) return;
  const lines = entries.map(item => `• ${item.name} x ${item.quantity}`).join('\n');
  const message = `Hello BREW & BARREL! I would like to place an order:\n\n${lines}\n\nPlease confirm availability and prices. Thank you!`;
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    showToast('Add the verified WhatsApp number in script.js to enable order chat.');
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });
renderCart();

// Gallery lightbox.
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
function closeLightbox() {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
  if (lightboxImage) lightboxImage.src = '';
}
document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = item.querySelector('img')?.alt || 'Gallery photograph';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}));
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

// Entrance reveals use IntersectionObserver; GSAP adds restrained section choreography when available.
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => revealObserver.observe(item));
} else revealItems.forEach(item => item.classList.add('visible'));

if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-kicker', { y: 18, opacity: 0, duration: 0.9, delay: 0.25, ease: 'power3.out' });
  gsap.from('.hero h1', { y: 38, opacity: 0, duration: 1.15, delay: 0.35, ease: 'power3.out' });
  gsap.from('.hero-description, .hero-actions', { y: 20, opacity: 0, duration: 0.9, delay: 0.65, stagger: 0.12, ease: 'power2.out' });
  gsap.to('.intro-visual img', {
    yPercent: -7, ease: 'none',
    scrollTrigger: { trigger: '.intro-visual', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
  });
  gsap.to('.experience-image', {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.experience', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });
  gsap.from('.signature-card', {
    y: 45, opacity: 0, stagger: 0.16, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.signature-grid', start: 'top 78%' }
  });
}

// Magnetic movement on desktop only.
if (!isMobile && !reduceMotion) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.08;
      const y = (e.clientY - r.top - r.height / 2) * 0.12;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('.placeholder-link').forEach(a => a.addEventListener('click', e => e.preventDefault()));
document.querySelector('[data-placeholder-email]')?.addEventListener('click', e => {
  e.preventDefault();
  alert('Add the verified BREW & BARREL email address in index.html before enabling this contact link.');
});

// Hide preloader after the page is ready; never block the page if a CDN is unavailable.
window.addEventListener('load', () => {
  setTimeout(() => document.querySelector('.preloader')?.classList.add('done'), 450);
});
setTimeout(() => document.querySelector('.preloader')?.classList.add('done'), 2200);
