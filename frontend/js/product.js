// Catalog products matching your database
const CATALOG = [
  { id: 1, category_id: 11, title: 'Dukaanx Circles T-Shirt', price: 1650.00, color_options: 'Black,White,Blue', size_options: 'XS,S,M,L,XL,XXL,XXXL', image_url: 'images/t-shirt-spiral-1.jpg', description: '60% combed ringspun cotton / 40% polyester jersey tee with radial geometric silkscreen print.' },
  { 
    id: 18, 
    category_id: 4, 
    title: 'Dukaanx iPhone 17', 
    price: 89900.00, 
    color_options: 'Space Black,Silver,Titanium,Deep Blue', 
    size_options: '128GB,256GB,512GB,1TB', 
    // Tiered storage pricing
    storage_pricing: {
      '128GB': 89900.00,
      '256GB': 99900.00,
      '512GB': 119900.00,
      '1TB': 139900.00
    },
    // Dynamic color image mappings
    color_images: {
      'Silver': 'images/iphone_silver.webp',
      'Titanium': 'images/iphone_titanium.jpeg',
      'Deep Blue': 'images/iphone_titanium.jpeg',
      'Space Black': 'images/iphone17.jpeg'
    },
    image_url: 'images/iphone17.jpeg', 
    description: 'Next-generation flagship smartphone featuring titanium enclosure, dynamic island, and pro camera system.' 
  },
  { id: 19, category_id: 5, title: 'Dukaanx Puma Nitro Sneakers', price: 6499.00, color_options: 'Black/White,All Black,Navy Blue', size_options: 'UK 7,UK 8,UK 9,UK 10,UK 11', image_url: 'images/puma.jpg', description: 'Performance running shoes featuring responsive foam cushioning and breathable mesh upper.' },
  { id: 2, category_id: 2, title: 'Dukaanx Drawstring Bag', price: 990.00, color_options: 'Black', size_options: 'One Size', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', description: 'Lightweight, durable ripstop nylon drawstring carry bag with minimalist reflective print.' },
  { id: 3, category_id: 3, title: 'Dukaanx Cup', price: 1250.00, color_options: 'Black,White', size_options: '350ml', image_url: 'images/cup-2.avif', description: 'Matte finish ceramic tumbler with heat silicone sleeve and reusable silicone sipper lid.' },
  { id: 4, category_id: 4, title: 'Dukaanx Keyboard', price: 12400.00, color_options: 'White,Silver', size_options: 'TKL', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', description: 'Anodized aluminum wireless mechanical keyboard featuring low-latency custom switches.' },
  { id: 5, category_id: 11, title: 'Dukaanx T-Shirt', price: 1650.00, color_options: 'Black,White', size_options: 'XS,S,M,L,XL,XXL', image_url: 'images/tshirt2.jpg', description: 'Everyday classic relaxed-fit crewneck t-shirt featuring minimal crest embroidery.' },
  { id: 6, category_id: 7, title: 'Dukaanx Hoodie', price: 4150.00, color_options: 'Black,Charcoal', size_options: 'S,M,L,XL,XXL', image_url: 'images/hoodie-1.avif', description: 'Heavyweight 450 GSM French terry cotton full-zip hoodie with white braided drawstrings.' },
  { id: 7, category_id: 6, title: 'Dukaanx Cowboy Hat', price: 13200.00, color_options: 'Black', size_options: 'M,L', image_url: 'images/cowboy-hat-black-1.jpg', description: 'Structured felt brim western silhouette finished with high-contrast crest detail.' },
  { id: 8, category_id: 6, title: 'Dukaanx Cap', price: 1650.00, color_options: 'Black,Navy', size_options: 'Adjustable', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', description: 'Unstructured 6-panel athletic baseball cap with curved bill and metal buckle strap.' },
  { id: 9, category_id: 6, title: 'Dukaanx Baby Cap', price: 850.00, color_options: 'Black,Grey', size_options: 'Infant', image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80', description: 'Ribbed knit cuff beanie formulated with ultra-soft hypoallergenic organic cotton.' },
  { id: 10, category_id: 11, title: 'Dukaanx Prism T-Shirt', price: 2050.00, color_options: 'Black', size_options: 'S,M,XL', image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', description: 'Graphic tee highlighted with spectrum ray refraction illustration across premium cotton base.' },
  { id: 11, category_id: 3, title: 'Dukaanx Matte Mug', price: 1100.00, color_options: 'Black', size_options: '400ml', image_url: 'images/matte-mug.jpg', description: 'Industrial aesthetic stoneware mug with ergonomic handle and smooth insulated glaze.' },
  { id: 12, category_id: 9, title: 'Dukaanx Baby Onesie', price: 1400.00, color_options: 'Beige,White', size_options: '0-3M,3-6M,6-12M', image_url: 'images/onesie.jpg', description: 'Snug organic cotton short-sleeve bodysuit tailored with envelope shoulders.' },
  { id: 13, category_id: 12, title: 'Dukaanx Sticker Pack', price: 450.00, color_options: 'Monochrome', size_options: 'Pack of 5', image_url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80', description: 'Weatherproof matte vinyl die-cut stickers suitable for laptops and bottles.' },
  { id: 14, category_id: 5, title: 'Dukaanx Minimalist Runners', price: 5200.00, color_options: 'Black,White', size_options: 'UK 7,UK 8,UK 9,UK 10', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', description: 'Low-profile vulcanized street sneakers equipped with shock-absorbing foam soles.' },
  { id: 15, category_id: 8, title: 'Dukaanx Windbreaker Jacket', price: 4800.00, color_options: 'Black', size_options: 'S,M,L,XL', image_url: 'images/jacket1.jpg', description: 'Water-resistant technical jacket featuring taped seams and adjustable bungee waist.' },
  { id: 16, category_id: 10, title: 'Dukaanx Pet Collar & Leash', price: 1200.00, color_options: 'Black', size_options: 'S,M,L', image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80', description: 'Heavy-duty webbing dog collar and leash combo with quick-release metal hardware.' },
  { id: 17, category_id: 10, title: 'Dukaanx Dog Sweater', price: 1150.00, color_options: 'Black,Grey,Red', size_options: 'XS,S,M,L', image_url: 'images/dog-sweater-1.jpg', description: 'Cozy knit acrylic pet sweater designed for warmth and comfort with elastic rib trims.' },
  { id: 20, category_id: 5, title: 'Dukaanx Classic Clogs', price: 2995.00, color_options: 'Black,White,Slate Grey,Olive', size_options: 'UK 6,UK 7,UK 8,UK 9,UK 10', image_url: 'images/crocs.jpg', description: 'Lightweight water-friendly clogs with ventilation ports and pivoting heel strap.' },
  { id: 23, category_id: 2, title: 'Dukaanx Leather Handbag', price: 3850.00, color_options: 'Black,Tan,Off-White', size_options: 'Standard', image_url: 'images/purse.jpg', description: 'Structured pebbled leather purse with dual top handles and detachable crossbody strap.' },
  { id: 24, category_id: 2, title: 'Dukaanx Hard-Shell Trolley Bag', price: 7499.00, color_options: 'Matte Black,Silver,Deep Navy', size_options: 'Cabin (20 Inch),Medium (24 Inch),Check-in (28 Inch)', image_url: 'images/trolley.jpg', description: 'Durable polycarbonate cabin trolley luggage featuring 360-degree silent spinner wheels and TSA lock.' },
  { id: 25, category_id: 7, title: 'Dukaanx Oversized Pullover Hoodie', price: 3899.00, color_options: 'Oatmeal,Charcoal Grey,Washed Olive', size_options: 'S,M,L,XL,XXL', image_url: 'images/hoodie2.jpg', description: 'Relaxed drop-shoulder silhouette crafted from 400 GSM heavyweight brushed fleece.' },
  { id: 26, category_id: 7, title: 'Dukaanx Minimalist Zip Hoodie', price: 4499.00, color_options: 'Jet Black,Slate Blue,Off-White', size_options: 'S,M,L', image_url: 'images/hoodie3.jpg', description: 'Clean-cut full-zip everyday hoodie made with premium organic combed cotton.' },
  { id: 27, category_id: 8, title: 'Dukaanx Puffer Bomber Jacket', price: 5999.00, color_options: 'Matte Black,Olive Green,Navy Blue', size_options: 'S,M,L', image_url: 'images/jacket2.jpg', description: 'Insulated thermal puffer jacket with quilted baffle design and fleece-lined pockets.' },
  { id: 28, category_id: 8, title: 'Dukaanx Utility Fleece Jacket', price: 4799.00, color_options: 'Cream/Navy,Charcoal,Sand Dune', size_options: 'S,M,L,XL,XXL', image_url: 'images/jacket3.jpg', description: 'Full-zip plush sherpa fleece jacket engineered with contrast nylon chest utility pocket.' },
  { id: 29, category_id: 9, title: 'Dukaanx Classic Plush Teddy Bear', price: 1299.00, color_options: 'Honey Brown,Cream White,Warm Grey', size_options: 'Standard (30cm),Large (45cm)', image_url: 'images/teddy.jpg', description: 'Ultra-soft hypoallergenic plush teddy bear made with child-safe embroidered detailing.' },
  { id: 30, category_id: 9, title: 'Dukaanx Montessori Wooden Toy Set', price: 1899.00, color_options: 'Pastel Multi,Natural Wood', size_options: 'One Size', image_url: 'images/toys.jpg', description: 'Handcrafted natural beechwood educational toy playset featuring smooth splinter-free shapes.' },
  { id: 31, category_id: 4, title: 'Dukaanx True Wireless Earphones', price: 3499.00, color_options: 'Matte Black,Glacier White,Midnight Blue', size_options: 'Standard', image_url: 'images/earphone.jpg', description: 'High-fidelity wireless earbuds with active noise cancellation and transparency mode.' },
  { id: 32, category_id: 3, title: 'Dukaanx Insulated Travel Tumbler', price: 1850.00, color_options: 'Matte Black,Stainless Steel,Forest Green,Stone Grey', size_options: '500ml,750ml', image_url: 'images/tumbler.jpg', description: 'Double-wall vacuum-insulated stainless steel tumbler with splash-resistant slide lid.' },
  { id: 33, category_id: 10, title: 'Dukaanx Premium Organic Pet Food', price: 1650.00, color_options: 'Chicken & Rice,Salmon & Sweet Potato', size_options: '1.5kg,3kg,5kg', image_url: 'images/petfood.jpg', description: 'Nutrient-rich all-natural dry pet food formulated with real meat and essential vitamins.' },
  { id: 34, category_id: 12, title: 'Dukaanx Anime Vinyl Sticker Pack', price: 350.00, color_options: 'Multi-color', size_options: 'Pack of 5,Pack of 10', image_url: 'images/anime.jpg', description: 'Waterproof, weather-resistant die-cut vinyl sticker pack with matte UV protection finish.' },
  { id: 35, category_id: 12, title: 'Dukaanx Marvel Heroes Sticker Pack', price: 399.00, color_options: 'Multi-color', size_options: 'Pack of 5,Pack of 10', image_url: 'images/marvel.jpg', description: 'Premium durable vinyl decals featuring iconic superhero emblems with residue-free adhesive backing.' }
];

let selectedColor = '';
let selectedSize = '';
let currentPrice = 0;
let currentImageUrl = '';
let currentProduct = null;

function fixImg(url) {
  if (!url) return 'images/tshirt2.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.replace(/^(\.\/|\/)+/, '');
}

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  loadCurrentProduct();
});

function loadCurrentProduct() {
  const params = new URLSearchParams(window.location.search);
  const rawId = parseInt(params.get('id'), 10) || 18;

  currentProduct = CATALOG.find(p => p.id === rawId) || CATALOG[0];
  currentPrice = Number(currentProduct.price);
  currentImageUrl = currentProduct.image_url;

  renderProductDetails(currentProduct);
  renderRelatedCategoryProducts(currentProduct);
}

function updatePriceBadge(amount) {
  const priceEl = document.getElementById('productPrice');
  if (priceEl) {
    priceEl.textContent = `₹${Number(amount).toLocaleString('en-IN')} INR`;
  }
}

function updateShowcaseImage(url) {
  const imgEl = document.getElementById('productImage');
  if (imgEl && url) {
    imgEl.src = fixImg(url);
  }
}

function renderProductDetails(prod) {
  document.getElementById('productTitle').textContent = prod.title;
  document.getElementById('productDesc').textContent = prod.description || '';

  // Set initial showcase image
  updateShowcaseImage(prod.image_url);

  // Label SIZE as STORAGE if iPhone 17
  const sizeLabel = document.querySelectorAll('.option-label')[1];
  if (sizeLabel) {
    sizeLabel.textContent = (prod.id === 18) ? 'STORAGE' : 'SIZE';
  }

  // Render Color Options with dynamic image swapping
  renderVariantButtons('colorOptions', prod.color_options, (val) => { 
    selectedColor = val; 
    
    // Check if a specific image exists for this color variant
    if (prod.color_images && prod.color_images[val]) {
      currentImageUrl = prod.color_images[val];
    } else {
      currentImageUrl = prod.image_url;
    }
    updateShowcaseImage(currentImageUrl);
  });

  // Render Storage Options with dynamic price calculation
  renderVariantButtons('sizeOptions', prod.size_options, (val) => { 
    selectedSize = val; 
    
    if (prod.storage_pricing && prod.storage_pricing[val]) {
      currentPrice = prod.storage_pricing[val];
    } else {
      currentPrice = Number(prod.price);
    }
    updatePriceBadge(currentPrice);
  });

  updatePriceBadge(currentPrice);

  // Add to Cart
  const addBtn = document.getElementById('addToCartBtn');
  if (!addBtn) return;

  addBtn.onclick = () => {
    let cart = getCart();
    const matchIdx = cart.findIndex(item => 
      item.id === prod.id && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
    );

    if (matchIdx > -1) {
      cart[matchIdx].quantity = (cart[matchIdx].quantity || 1) + 1;
    } else {
      cart.push({
        id: prod.id,
        title: prod.title,
        price: currentPrice,
        image_url: currentImageUrl, // Saves the active color image
        selectedColor: selectedColor || 'Standard',
        selectedSize: selectedSize || 'Standard',
        quantity: 1
      });
    }

    saveCart(cart);

    addBtn.textContent = '✓ Added!';
    addBtn.style.backgroundColor = '#16a34a';
    setTimeout(() => {
      addBtn.textContent = '+ Add To Cart';
      addBtn.style.backgroundColor = '#0071e3';
    }, 1200);
  };
}

function renderVariantButtons(containerId, optionsStr, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const items = optionsStr ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : ['Standard'];
  onSelect(items[0]);

  items.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `variant-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = item;

    btn.onclick = () => {
      container.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onSelect(item);
    };

    container.appendChild(btn);
  });
}

function renderRelatedCategoryProducts(current) {
  const carousel = document.getElementById('relatedProductsGrid');
  if (!carousel) return;

  let related = CATALOG.filter(p => p.category_id === current.category_id && p.id !== current.id);
  if (related.length === 0) {
    related = CATALOG.filter(p => p.id !== current.id).slice(0, 5);
  }

  carousel.innerHTML = related.map(item => `
    <a href="product.html?id=${item.id}" class="related-card">
      <div class="related-img-box">
        <img src="${fixImg(item.image_url)}" alt="${item.title}" loading="lazy" />
      </div>
      <div class="related-card-title">${item.title}</div>
      <span class="related-card-price">₹${Number(item.price).toLocaleString('en-IN')} INR</span>
    </a>
  `).join('');
}

// Cart Drawer Helpers
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
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  badge.textContent = total;
}

function initCartDrawer() {
  const openCartBtn = document.getElementById('openCartBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('cartDrawer');

  if (!openCartBtn || !drawer || !backdrop) return;

  openCartBtn.onclick = () => {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    renderDrawerItems();
  };

  const close = () => {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
  };

  if (closeDrawerBtn) closeDrawerBtn.onclick = close;
  backdrop.onclick = close;

  updateCartBadge();
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
        <img src="${fixImg(item.image_url)}" alt="${item.title}" />
        <div class="drawer-item-details">
          <div class="drawer-item-title">${item.title}</div>
          <div class="drawer-item-specs">${item.selectedColor || ''} / ${item.selectedSize || ''}</div>
          <div class="drawer-item-pricing">
            <span style="font-weight: 600; font-size: 13px;">₹${itemTotal.toLocaleString('en-IN')} INR</span>
            <div class="qty-counter">
              <button onclick="modifyQty(${index}, -1)">−</button>
              <span>${item.quantity || 1}</span>
              <button onclick="modifyQty(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  totalAmountEl.textContent = `₹${total.toLocaleString('en-IN')} INR`;
}

window.modifyQty = function(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart(cart);
};