let selectedPaymentMethod = 'UPI';

document.addEventListener('DOMContentLoaded', async () => {
  renderCheckoutSummary();
  await autoFillUserInfoAndAddress();
  setupCheckoutForm();
});

function selectPayTab(type) {
  document.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.pay-pane').forEach(p => p.classList.remove('active'));

  if (type === 'upi') {
    selectedPaymentMethod = 'UPI';
    document.querySelector('[data-method="UPI"]').classList.add('active');
    document.getElementById('pay-pane-upi').classList.add('active');
  } else if (type === 'card') {
    selectedPaymentMethod = 'Card';
    document.querySelector('[data-method="Card"]').classList.add('active');
    document.getElementById('pay-pane-card').classList.add('active');
  } else if (type === 'cod') {
    selectedPaymentMethod = 'Cash on Delivery';
    document.querySelector('[data-method="Cash on Delivery"]').classList.add('active');
    document.getElementById('pay-pane-cod').classList.add('active');
  }
}
window.selectPayTab = selectPayTab;

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

async function autoFillUserInfoAndAddress() {
  const nameInput = document.getElementById('orderName');
  const emailInput = document.getElementById('orderEmail');
  const addressInput = document.getElementById('orderAddress');
  const savedAddressWrapper = document.getElementById('savedAddressWrapper');
  const savedAddressDropdown = document.getElementById('savedAddressDropdown');

  const userStr = localStorage.getItem('dukaanx_user');
  const token = localStorage.getItem('dukaanx_token');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (nameInput && !nameInput.value) nameInput.value = user.name || '';
      if (emailInput && !emailInput.value) emailInput.value = user.email || '';
    } catch (e) {}
  }

  if (token) {
    try {
      const res = await fetch('http://localhost:5000/api/user/profile-full', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.addresses && data.addresses.length > 0) {
        if (savedAddressWrapper) savedAddressWrapper.style.display = 'block';

        if (savedAddressDropdown) {
          savedAddressDropdown.innerHTML = data.addresses.map(a => {
            const fullAddr = `${a.street_address}, ${a.city}${a.state ? ', ' + a.state : ''} - ${a.postal_code}`;
            return `<option value="${encodeURIComponent(fullAddr)}">${a.tag} (${a.city})</option>`;
          }).join('') + `<option value="custom">✏️ Enter a new address</option>`;

          const firstAddr = data.addresses[0];
          const defaultFullAddr = `${firstAddr.street_address}, ${firstAddr.city}${firstAddr.state ? ', ' + firstAddr.state : ''} - ${firstAddr.postal_code}`;
          if (addressInput) addressInput.value = defaultFullAddr;

          savedAddressDropdown.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
              if (addressInput) {
                addressInput.value = '';
                addressInput.focus();
              }
            } else {
              if (addressInput) addressInput.value = decodeURIComponent(e.target.value);
            }
          });
        }
      }
    } catch (err) {
      console.warn('Could not auto-fetch addresses:', err);
    }
  }
}

function renderCheckoutSummary() {
  const checkoutList = document.getElementById('checkoutList');
  const checkoutTotal = document.getElementById('checkoutTotal');
  const cart = getCart();

  if (!checkoutList || !checkoutTotal) return;

  if (cart.length === 0) {
    checkoutList.innerHTML = `<div style="color: #86868b; font-size: 13px; padding: 12px 0;">Your cart is empty.</div>`;
    checkoutTotal.textContent = '₹0 INR';
    const btn = document.getElementById('submitOrderBtn');
    if (btn) btn.disabled = true;
    return;
  }

  let total = 0;
  checkoutList.innerHTML = cart.map(item => {
    const itemTotal = Number(item.price) * (item.quantity || 1);
    total += itemTotal;

    const cleanImg = fixImgUrl(item.image_url);
    const color = item.selectedColor && item.selectedColor !== 'undefined' ? item.selectedColor : '';
    const size = item.selectedSize && item.selectedSize !== 'undefined' ? item.selectedSize : '';
    const specs = [color, size].filter(Boolean).join(' • ');

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #f2f2f4;">
        <div style="display: flex; align-items: center; gap: 12px; max-width: 70%;">
          <div style="position: relative; width: 50px; height: 50px; flex-shrink: 0; background: #fff; border: 1px solid #e5e5e7; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${cleanImg}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 2px; right: 2px; background: rgba(0, 0, 0, 0.75); color: #fff; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 9999px;">
              ${item.quantity || 1}
            </span>
          </div>

          <div>
            <div style="font-size: 13px; font-weight: 600; color: #1d1d1f; line-height: 1.2;">${item.title}</div>
            ${specs ? `<div style="font-size: 11px; color: #6e6e73; margin-top: 2px;">${specs}</div>` : ''}
          </div>
        </div>

        <div style="font-weight: 600; font-size: 13px; color: #1d1d1f; white-space: nowrap;">
          ₹${itemTotal.toLocaleString('en-IN')}
        </div>
      </div>
    `;
  }).join('');

  checkoutTotal.textContent = `₹${total.toLocaleString('en-IN')} INR`;
}

function setupCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  const submitBtn = document.getElementById('submitOrderBtn');
  const overlay = document.getElementById('successOverlay');
  const modalOrderNumber = document.getElementById('modalOrderNumber');
  const modalPaymentMode = document.getElementById('modalPaymentMode');
  const modalTxnId = document.getElementById('modalTxnId');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    // Generate or validate real transaction ID based on chosen mode
    let realTxnId = '';
    if (selectedPaymentMethod === 'UPI') {
      const manualUtr = document.getElementById('upiRefInput').value.trim();
      realTxnId = manualUtr ? manualUtr : ('UPI-' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000));
    } else if (selectedPaymentMethod === 'Card') {
      const cardNum = document.getElementById('cardNumberInput').value.trim();
      if (!cardNum || cardNum.length < 12) {
        alert('Please enter a valid Card Number.');
        return;
      }
      realTxnId = 'CARD-AUTH-' + Math.floor(10000000 + Math.random() * 90000000);
    } else {
      realTxnId = 'COD-PENDING-' + Math.floor(100000 + Math.random() * 900000);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Payment...';

    const name = document.getElementById('orderName').value.trim();
    const email = document.getElementById('orderEmail').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const total = cart.reduce((sum, i) => sum + (Number(i.price) * (i.quantity || 1)), 0);

    let loggedInUser = null;
    try {
      loggedInUser = JSON.parse(localStorage.getItem('dukaanx_user'));
    } catch (err) {}

    let orderDisplayId = 'DKX-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dukaanx_token') || ''}`
        },
        body: JSON.stringify({
          user_id: loggedInUser ? loggedInUser.id : null,
          name,
          email,
          address,
          total,
          items: cart,
          payment_method: selectedPaymentMethod,
          transaction_id: realTxnId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.orderNumber) orderDisplayId = data.orderNumber;
        if (data.transactionId) realTxnId = data.transactionId;
      }
    } catch (networkErr) {
      console.warn('Backend order recording fallback:', networkErr);
    }

    localStorage.removeItem('dukaanx_cart');

    if (modalOrderNumber) modalOrderNumber.textContent = orderDisplayId;
    if (modalPaymentMode) modalPaymentMode.textContent = selectedPaymentMethod;
    if (modalTxnId) modalTxnId.textContent = realTxnId;

    if (overlay) {
      overlay.style.display = 'flex';
    } else {
      alert(`Order Confirmed! Order: ${orderDisplayId} | Txn: ${realTxnId}`);
      window.location.href = 'index.html';
    }
  });
}