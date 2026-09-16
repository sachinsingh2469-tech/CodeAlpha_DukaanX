// Application State
let allProducts = [];
let allCategories = [];
let activeCollection = 'all';
let currentSort = 'relevance';

// Explicit mapping so each category in the ribbon gets its own distinct image
const CATEGORY_SAMPLE_IMAGES = {
  'shirts': 'images/tshirt2.jpg',
  'bags': 'images/purse.jpg',
  'drinkware': 'images/tumbler.jpg',
  'electronics': 'images/earphone.jpg',
  'footwear': 'images/puma.jpg',
  'headwear': 'images/cowboy-hat-black-1.jpg',
  'hoodies': 'images/hoodie2.jpg',
  'jackets': 'images/jacket1.jpg',
  'kids': 'images/teddy.jpg',
  'pets': 'images/petfood.jpg',
  'stickers': 'images/anime.jpg'
};

// Universal Path Resolver (preserves Unsplash/HTTP URLs and fixes local relative paths)
function fixImgUrl(url, categorySlug = '') {
  if (categorySlug && CATEGORY_SAMPLE_IMAGES[categorySlug.toLowerCase()]) {
    return CATEGORY_SAMPLE_IMAGES[categorySlug.toLowerCase()];
  }
  if (!url || typeof url !== 'string') return 'images/tshirt2.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.replace(/^(\.\/|\/)+/, '');
}

document.addEventListener('DOMContentLoaded', async () => {
  initCartUI();
  setupCarouselNav();
  setupSortHandlers();
  setupSearch();

  const params = new URLSearchParams(window.location.search);
  const collectionParam = params.get('collection');
  if (collectionParam) {
    activeCollection = collectionParam.toLowerCase();
  }

  await loadCategories();
  await loadProducts();
});

// Category Ribbon Carousel Smooth Scrolling
function setupCarouselNav() {
  const ribbon = document.getElementById('categoryRibbon');
  const scrollLeftBtn = document.getElementById('scrollLeftBtn');
  const scrollRightBtn = document.getElementById('scrollRightBtn');

  if (!ribbon || !scrollLeftBtn || !scrollRightBtn) return;

  scrollLeftBtn.addEventListener('click', () => {
    ribbon.scrollBy({ left: -260, behavior: 'smooth' });
  });

  scrollRightBtn.addEventListener('click', () => {
    ribbon.scrollBy({ left: 260, behavior: 'smooth' });
  });
}

// Fetch Categories & Populate Ribbon + Sidebar
async function loadCategories() {
  try {
    const res = await fetch('http://localhost:5000/api/categories');
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    allCategories = Array.isArray(data) && data.length > 0 ? data : [];
  } catch (err) {
    allCategories = [
      { id: 11, name: 'Shirts', slug: 'shirts', sample_image: 'images/tshirt2.jpg' },
      { id: 2, name: 'Bags', slug: 'bags', sample_image: 'images/purse.jpg' },
      { id: 3, name: 'Drinkware', slug: 'drinkware', sample_image: 'images/tumbler.jpg' },
      { id: 4, name: 'Electronics', slug: 'electronics', sample_image: 'images/earphone.jpg' },
      { id: 5, name: 'Footwear', slug: 'footwear', sample_image: 'images/puma.jpg' },
      { id: 6, name: 'Headwear', slug: 'headwear', sample_image: 'images/cowboy-hat-black-1.jpg' },
      { id: 7, name: 'Hoodies', slug: 'hoodies', sample_image: 'images/hoodie2.jpg' },
      { id: 8, name: 'Jackets', slug: 'jackets', sample_image: 'images/jacket1.jpg' },
      { id: 9, name: 'Kids', slug: 'kids', sample_image: 'images/teddy.jpg' },
      { id: 10, name: 'Pets', slug: 'pets', sample_image: 'images/petfood.jpg' },
      { id: 12, name: 'Stickers', slug: 'stickers', sample_image: 'images/anime.jpg' }
    ];
  }

  renderCategoryRibbon(allCategories);
  renderSidebarCategories(allCategories);
}

// Render Apple Store Ribbon
function renderCategoryRibbon(categories) {
  const ribbon = document.getElementById('categoryRibbon');
  if (!ribbon) return;

  // Filter out any 'all' category from the ribbon
  const cleanCategories = categories.filter(cat => 
    cat.slug?.toLowerCase() !== 'all' && cat.name?.toLowerCase() !== 'all'
  );

  ribbon.innerHTML = cleanCategories.map(cat => {
    const isActive = activeCollection === cat.slug ? 'active' : '';
    const imgPath = fixImgUrl(cat.sample_image, cat.slug);

    return `
      <div class="category-item-card ${isActive}" data-slug="${cat.slug}">
        <div class="category-item-img-wrapper">
          <img src="${imgPath}" alt="${cat.name}" loading="lazy" />
        </div>
        <span class="category-item-title">${cat.name}</span>
      </div>
    `;
  }).join('');

  ribbon.querySelectorAll('.category-item-card').forEach(card => {
    card.addEventListener('click', () => {
      selectCategory(card.getAttribute('data-slug'));
    });
  });
}

// Render Sidebar Category Links (Ensures only one single 'All' button)
function renderSidebarCategories(categories) {
  const sidebar = document.getElementById('collectionList');
  if (!sidebar) return;

  const allActive = activeCollection === 'all' ? 'active' : '';
  let html = `<li><a class="${allActive}" data-slug="all">All</a></li>`;

  // Remove any database category whose slug or name is 'all'
  const cleanCategories = categories.filter(cat => 
    cat.slug?.toLowerCase() !== 'all' && cat.name?.toLowerCase() !== 'all'
  );

  cleanCategories.forEach(cat => {
    const isActive = activeCollection === cat.slug ? 'active' : '';
    html += `<li><a class="${isActive}" data-slug="${cat.slug}">${cat.name}</a></li>`;
  });

  sidebar.innerHTML = html;

  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      selectCategory(link.getAttribute('data-slug'));
    });
  });
}

function selectCategory(slug) {
  activeCollection = slug;

  const url = new URL(window.location);
  url.searchParams.set('collection', slug);
  window.history.pushState({}, '', url);

  document.querySelectorAll('.category-item-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-slug') === slug);
  });

  document.querySelectorAll('.sidebar-list a[data-slug]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-slug') === slug);
  });

  renderProducts();
}

// Catalog with Custom Order: #1 Circles T-Shirt, #2 iPhone 17, #3 Puma Nitro Sneakers
async function loadProducts() {
  allProducts = [
    // 1st Item
    { id: 1, category_id: 11, category_slug: 'shirts', title: 'Dukaanx Circles T-Shirt', price: 1650.00, image_url: 'images/t-shirt-spiral-1.jpg' },
    
    // 2nd Item: iPhone 17
    { id: 18, category_id: 4, category_slug: 'electronics', title: 'Dukaanx iPhone 17', price: 89900.00, image_url: 'images/iphone17.jpeg' },
    
    // 3rd Item: Puma Nitro Sneakers
    { id: 19, category_id: 5, category_slug: 'footwear', title: 'Dukaanx Puma Nitro Sneakers', price: 6499.00, image_url: 'images/puma.jpg' },
    
    // Remaining Items
    { id: 2, category_id: 2, category_slug: 'bags', title: 'Dukaanx Drawstring Bag', price: 990.00, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
    { id: 3, category_id: 3, category_slug: 'drinkware', title: 'Dukaanx Cup', price: 1250.00, image_url: 'images/cup-2.avif' },
    { id: 4, category_id: 4, category_slug: 'electronics', title: 'Dukaanx Keyboard', price: 12400.00, image_url: 'images/keyboard.jpeg' },
    { id: 5, category_id: 11, category_slug: 'shirts', title: 'Dukaanx T-Shirt', price: 1650.00, image_url: 'images/tshirt2.jpg' },
    { id: 6, category_id: 7, category_slug: 'hoodies', title: 'Dukaanx Hoodie', price: 4150.00, image_url: 'images/hoodie-1.avif' },
    { id: 7, category_id: 6, category_slug: 'headwear', title: 'Dukaanx Cowboy Hat', price: 13200.00, image_url: 'images/cowboy-hat-black-1.jpg' },
    { id: 8, category_id: 6, category_slug: 'headwear', title: 'Dukaanx Cap', price: 1650.00, image_url: 'images/hat-1.avif' },
    { id: 9, category_id: 6, category_slug: 'headwear', title: 'Dukaanx Baby Cap', price: 850.00, image_url: 'images/baby-cap.avif' },
    { id: 10, category_id: 11, category_slug: 'shirts', title: 'Dukaanx Prism T-Shirt', price: 2050.00, image_url: 'images/tshirt3.avif' },
    { id: 11, category_id: 3, category_slug: 'drinkware', title: 'Dukaanx Matte Mug', price: 1100.00, image_url: 'images/matte-mug.jpg' },
    { id: 12, category_id: 9, category_slug: 'kids', title: 'Dukaanx Baby Onesie', price: 1400.00, image_url: 'images/onesie.jpg' },
    { id: 13, category_id: 12, category_slug: 'stickers', title: 'Dukaanx Sticker Pack', price: 450.00, image_url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80' },
    { id: 14, category_id: 5, category_slug: 'footwear', title: 'Dukaanx Minimalist Runners', price: 5200.00, image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80' },
    { id: 15, category_id: 8, category_slug: 'jackets', title: 'Dukaanx Windbreaker Jacket', price: 4800.00, image_url: 'images/jacket1.jpg' },
    { id: 16, category_id: 10, category_slug: 'pets', title: 'Dukaanx Pet Collar & Leash', price: 1200.00, image_url: 'images/collar-leash.jpg' },
    { id: 17, category_id: 10, category_slug: 'pets', title: 'Dukaanx Dog Sweater', price: 1150.00, image_url: 'images/dog-sweater-1.jpg' },
    { id: 20, category_id: 5, category_slug: 'footwear', title: 'Dukaanx Classic Clogs', price: 2995.00, image_url: 'images/crocs.jpg' },
    { id: 23, category_id: 2, category_slug: 'bags', title: 'Dukaanx Leather Handbag', price: 3850.00, image_url: 'images/purse.jpg' },
    { id: 24, category_id: 2, category_slug: 'bags', title: 'Dukaanx Hard-Shell Trolley Bag', price: 7499.00, image_url: 'images/trolley.jpg' },
    { id: 25, category_id: 7, category_slug: 'hoodies', title: 'Dukaanx Oversized Pullover Hoodie', price: 3899.00, image_url: 'images/hoodie2.jpg' },
    { id: 26, category_id: 7, category_slug: 'hoodies', title: 'Dukaanx Minimalist Zip Hoodie', price: 4499.00, image_url: 'images/hoodie3.jpg' },
    { id: 27, category_id: 8, category_slug: 'jackets', title: 'Dukaanx Puffer Bomber Jacket', price: 5999.00, image_url: 'images/jacket2.jpg' },
    { id: 28, category_id: 8, category_slug: 'jackets', title: 'Dukaanx Utility Fleece Jacket', price: 4799.00, image_url: 'images/jacket3.jpg' },
    { id: 29, category_id: 9, category_slug: 'kids', title: 'Dukaanx Classic Plush Teddy Bear', price: 1299.00, image_url: 'images/teddy.jpg' },
    { id: 30, category_id: 9, category_slug: 'kids', title: 'Dukaanx Montessori Wooden Toy Set', price: 1899.00, image_url: 'images/toys.jpg' },
    { id: 31, category_id: 4, category_slug: 'electronics', title: 'Dukaanx True Wireless Earphones', price: 3499.00, image_url: 'images/earphone.jpg' },
    { id: 32, category_id: 3, category_slug: 'drinkware', title: 'Dukaanx Insulated Travel Tumbler', price: 1850.00, image_url: 'images/tumbler.jpg' },
    { id: 33, category_id: 10, category_slug: 'pets', title: 'Dukaanx Premium Organic Pet Food', price: 1650.00, image_url: 'images/petfood.jpg' },
    { id: 34, category_id: 12, category_slug: 'stickers', title: 'Dukaanx Anime Vinyl Sticker Pack', price: 350.00, image_url: 'images/anime.jpg' },
    { id: 35, category_id: 12, category_slug: 'stickers', title: 'Dukaanx Marvel Heroes Sticker Pack', price: 399.00, image_url: 'images/marvel.jpg' }
  ];

  renderProducts();
}

// Render Products into Grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = [...allProducts];

  if (activeCollection !== 'all') {
    filtered = filtered.filter(p => {
      const categorySlug = p.category_slug || (p.category_name ? p.category_name.toLowerCase() : '');
      return categorySlug === activeCollection || p.category_id === getCategoryIdBySlug(activeCollection);
    });
  }

  const searchInput = document.getElementById('mainSearchInput');
  if (searchInput && searchInput.value.trim() !== '') {
    const query = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'latest') {
    filtered.sort((a, b) => b.id - a.id);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 60px 0; text-align: center; color: var(--text-muted); font-size: 15px;">No products found in this category.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const cleanImg = fixImgUrl(p.image_url);
    return `
      <a href="product.html?id=${p.id}" class="product-tile">
        <img src="${cleanImg}" alt="${p.title}" loading="lazy" />
        <div class="pill-badge">
          <span class="pill-title">${p.title}</span>
          <span class="pill-price">₹${Number(p.price).toLocaleString('en-IN')} INR</span>
        </div>
      </a>
    `;
  }).join('');
}

function getCategoryIdBySlug(slug) {
  const found = allCategories.find(c => c.slug === slug);
  return found ? found.id : null;
}

function setupSortHandlers() {
  document.querySelectorAll('[data-sort]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-sort]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentSort = link.getAttribute('data-sort');
      renderProducts();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('mainSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    renderProducts();
  });
}

// Side Cart Drawer Logic
function initCartUI() {
  const openCartBtn = document.getElementById('openCartBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('cartDrawer');

  if (!openCartBtn || !drawer || !backdrop) return;

  const openCart = () => {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    renderDrawerItems();
  };

  const closeCart = () => {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
  };

  openCartBtn.addEventListener('click', openCart);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);

  updateCartBadge();
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('dukaanx_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('dukaanx_cart', JSON.stringify(cart));
  updateCartBadge();
  renderDrawerItems();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  badge.textContent = totalCount;
}

function renderDrawerItems() {
  const drawerItems = document.getElementById('drawerItems');
  const totalAmountEl = document.getElementById('drawerTotalAmount');
  if (!drawerItems || !totalAmountEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    drawerItems.innerHTML = `<div style="text-align: center; padding: 40px 0; color: #6e6e73; font-size: 14px;">Your cart is empty.</div>`;
    totalAmountEl.textContent = '₹0 INR';
    return;
  }

  let total = 0;
  drawerItems.innerHTML = cart.map((item, index) => {
    const itemTotal = Number(item.price) * (item.quantity || 1);
    total += itemTotal;

    return `
      <div class="drawer-item">
        <img src="${fixImgUrl(item.image_url)}" alt="${item.title}" />
        <div class="drawer-item-details">
          <div class="drawer-item-title">${item.title}</div>
          <div class="drawer-item-specs">${item.selectedColor || ''} ${item.selectedSize ? `/ ${item.selectedSize}` : ''}</div>
          <div class="drawer-item-pricing">
            <span style="font-weight: 600; font-size: 13px;">₹${itemTotal.toLocaleString('en-IN')} INR</span>
            <div class="qty-counter">
              <button onclick="modifyCartQty(${index}, -1)">−</button>
              <span>${item.quantity || 1}</span>
              <button onclick="modifyCartQty(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  totalAmountEl.textContent = `₹${total.toLocaleString('en-IN')} INR`;
}

window.modifyCartQty = function(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
};