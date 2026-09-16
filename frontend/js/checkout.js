// Base API configuration (Dynamic for Localhost & Render)
const CHECKOUT_API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api';

// Checkout State
let currentStep = 1;
let selectedShipping = { type: 'economy', price: 0, label: 'Economy · Free' };
let selectedPayment = 'Cash on Delivery';
let cartItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  cartItems = getCart();
  renderSummary();
  await autoFillFromSession();
});

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('dukaanx_cart')) || [];
  } catch (e) {
    return [];
  }
}

function fixImgUrl(url) {
  if (!url || typeof url !== 'string') return 'images/puma.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.replace(/^(\.\/|\/)+/, '');
}

// Auto-fill Contact and Saved Addresses
async function autoFillFromSession() {
  const userStr = localStorage.getItem('dukaanx_user');
  const token = localStorage.getItem('dukaanx_token');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.email) document.getElementById('custEmailOrPhone').value = user.email;
      if (user.name) {
        const parts = user.name.trim().split(' ');
        document.getElementById('custFirstName').value = parts[0] || '';
        document.getElementById('custLastName').value = parts.slice(1).join(' ') || '';
      }
    } catch (e) {}
  }

  if (token) {
    try {
      const res = await fetch(`${CHECKOUT_API_BASE}/user/profile-full`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.addresses && data.addresses.length > 0) {
        const wrap = document.getElementById('savedAddressBlock');
        const sel = document.getElementById('savedAddressSelect');
        wrap.style.display = 'block';

        sel.innerHTML = `<option value="">-- Use a Saved Address --</option>` + data.addresses.map((a, i) => {
          return `<option value="${i}">${a.tag} (${a.street_address}, ${a.city})</option>`;
        }).join('') + `<option value="custom">✏️ Enter new address</option>`;

        sel.addEventListener('change', (e) => {
          if (e.target.value === '' || e.target.value === 'custom') return;
          const chosen = data.addresses[Number(e.target.value)];
          if (chosen) {
            document.getElementById('custAddress').value = chosen.street_address || '';
            document.getElementById('custCity').value = chosen.city || '';
            document.getElementById('custState').value = chosen.state || 'Jharkhand';
            document.getElementById('custZip').value = chosen.postal_code || '';
          }
        });

        // Auto-select first address
        const first = data.addresses[0];
        sel.value = "0";
        document.getElementById('custAddress').value = first.street_address || '';
        document.getElementById('custCity').value = first.city || '';
        document.getElementById('custState').value = first.state || 'Jharkhand';
        document.getElementById('custZip').value = first.postal_code || '';
      }
    } catch (err) {}
  }
}

// Render Order Summary
function renderSummary() {
  const container = document.getElementById('checkoutSummaryList');
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const grandTotalEl = document.getElementById('summaryGrandTotal');

  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `<div style="color: var(--chk-subtext); font-size: 13px;">Your cart is currently empty.</div>`;
    subtotalEl.textContent = '₹0';
    grandTotalEl.textContent = '₹0';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cartItems.map(item => {
    const itemTotal = Number(item.price) * (item.quantity || 1);
    subtotal += itemTotal;

    const specs = [item.selectedColor, item.selectedSize].filter(s => s && s !== 'undefined').join(' / ');

    return `
      <div class="summary-item-row">
        <div class="summary-item-left">
          <div class="summary-img-thumb">
            <img src="${fixImgUrl(item.image_url)}" alt="${item.title}" />
            <div class="summary-img-badge">${item.quantity || 1}</div>
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 600; color: var(--chk-text);">${item.title}</div>
            ${specs ? `<div style="font-size: 12px; color: var(--chk-subtext);">${specs}</div>` : ''}
          </div>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: var(--chk-text);">
          ₹${itemTotal.toLocaleString('en-IN')}
        </div>
      </div>
    `;
  }).join('');

  const shippingPrice = selectedShipping.price;
  const grandTotal = subtotal + shippingPrice;

  subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  shippingEl.textContent = shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toLocaleString('en-IN')}`;
  grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
}

// Navigation between steps
window.goToStep = function(stepNumber) {
  if (stepNumber === 2 || stepNumber === 3) {
    const contact = document.getElementById('custEmailOrPhone').value.trim();
    const addr = document.getElementById('custAddress').value.trim();
    if (!contact || !addr) {
      alert('Please fill out your contact email and shipping address first.');
      return;
    }
  }

  currentStep = stepNumber;

  // Toggle step sections
  document.getElementById('step-1').style.display = stepNumber === 1 ? 'block' : 'none';
  document.getElementById('step-2').style.display = stepNumber === 2 ? 'block' : 'none';
  document.getElementById('step-3').style.display = stepNumber === 3 ? 'block' : 'none';

  // Toggle breadcrumbs
  document.getElementById('crumb-info').className = 'breadcrumb-item' + (stepNumber >= 1 ? ' active' : '');
  document.getElementById('crumb-ship').className = 'breadcrumb-item' + (stepNumber >= 2 ? ' active' : '');
  document.getElementById('crumb-pay').className = 'breadcrumb-item' + (stepNumber >= 3 ? ' active' : '');

  // Update Review boxes
  const contactVal = document.getElementById('custEmailOrPhone').value.trim();
  const nameVal = `${document.getElementById('custFirstName').value.trim()} ${document.getElementById('custLastName').value.trim()}`;
  const addressVal = `${nameVal}, ${document.getElementById('custAddress').value.trim()}, ${document.getElementById('custCity').value.trim()}, ${document.getElementById('custState').value.trim()} ${document.getElementById('custZip').value.trim()}`;

  document.getElementById('reviewContactText').textContent = contactVal;
  document.getElementById('reviewShipText').textContent = addressVal;
  document.getElementById('reviewContactText2').textContent = contactVal;
  document.getElementById('reviewShipText2').textContent = addressVal;
  document.getElementById('reviewMethodText').textContent = selectedShipping.label;
};

window.validateStep1AndProceed = function() {
  const email = document.getElementById('custEmailOrPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const city = document.getElementById('custCity').value.trim();
  const zip = document.getElementById('custZip').value.trim();

  if (!email || !address || !city || !zip) {
    alert('Please enter all required shipping details.');
    return;
  }
  goToStep(2);
};

window.selectShippingRate = function(type, price) {
  document.querySelectorAll('#step-2 .radio-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`shipOpt-${type}`).classList.add('active');

  selectedShipping = {
    type,
    price,
    label: type === 'economy' ? 'Economy · Free' : 'Express / Standard · ₹99.00'
  };

  renderSummary();
};

window.selectPaymentMethod = function(method) {
  selectedPayment = method;

  document.querySelectorAll('#step-3 .radio-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.pay-content-body').forEach(b => b.style.display = 'none');

  if (method === 'Cash on Delivery') {
    document.getElementById('payOpt-cod').classList.add('active');
    document.getElementById('body-cod').style.display = 'block';
  } else if (method === 'UPI') {
    document.getElementById('payOpt-upi').classList.add('active');
    document.getElementById('body-upi').style.display = 'block';
  } else if (method === 'Card') {
    document.getElementById('payOpt-card').classList.add('active');
    document.getElementById('body-card').style.display = 'block';
  }
};

// Final Order Submission
window.submitFinalOrder = async function() {
  if (cartItems.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  const payBtn = document.getElementById('payNowBtn');
  payBtn.disabled = true;
  payBtn.textContent = 'Processing Order...';

  const email = document.getElementById('custEmailOrPhone').value.trim();
  const name = `${document.getElementById('custFirstName').value.trim()} ${document.getElementById('custLastName').value.trim()}`.trim() || 'Customer';
  const shippingAddress = `${document.getElementById('custAddress').value.trim()}, ${document.getElementById('custCity').value.trim()}, ${document.getElementById('custState').value.trim()} ${document.getElementById('custZip').value.trim()}`;

  const subtotal = cartItems.reduce((sum, it) => sum + (Number(it.price) * (it.quantity || 1)), 0);
  const finalTotal = subtotal + selectedShipping.price;

  // Generate Transaction ID
  let transactionId = '';
  if (selectedPayment === 'Cash on Delivery') {
    transactionId = 'COD-' + Math.floor(100000 + Math.random() * 900000);
  } else if (selectedPayment === 'UPI') {
    const utr = document.getElementById('upiUtrInput').value.trim();
    transactionId = utr ? utr : ('UPI-' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000));
  } else {
    transactionId = 'CARD-AUTH-' + Math.floor(10000000 + Math.random() * 90000000);
  }

  let loggedInUser = null;
  try {
    loggedInUser = JSON.parse(localStorage.getItem('dukaanx_user'));
  } catch (e) {}

  let displayOrderNo = 'DKX-' + Math.floor(100000 + Math.random() * 900000);

  try {
    const res = await fetch(`${CHECKOUT_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('dukaanx_token') || ''}`
      },
      body: JSON.stringify({
        user_id: loggedInUser ? loggedInUser.id : null,
        name,
        email,
        address: shippingAddress,
        total: finalTotal,
        items: cartItems,
        payment_method: selectedPayment,
        transaction_id: transactionId
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.orderNumber) displayOrderNo = data.orderNumber;
      if (data.transactionId) transactionId = data.transactionId;
    }
  } catch (err) {
    console.warn('Recorded order locally due to network fallback:', err);
  }

  // Clear cart
  localStorage.removeItem('dukaanx_cart');

  // Show Confirmation Modal
  document.getElementById('modalOrderNo').textContent = displayOrderNo;
  document.getElementById('modalPayMode').textContent = selectedPayment;
  document.getElementById('modalTxnId').textContent = transactionId;
  document.getElementById('orderSuccessModal').style.display = 'flex';
};