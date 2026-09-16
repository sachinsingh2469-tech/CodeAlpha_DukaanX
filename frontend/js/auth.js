const AUTH_API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api';

const auth = {
  getToken() {
    return localStorage.getItem('dukaanx_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('dukaanx_user'));
    } catch (e) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('dukaanx_token', token);
    localStorage.setItem('dukaanx_user', JSON.stringify(user));
    this.renderAuthUI();
  },

  logout() {
    localStorage.removeItem('dukaanx_token');
    localStorage.removeItem('dukaanx_user');
    window.location.href = 'index.html';
  },

  async register(name, email, password) {
    const res = await fetch(`${AUTH_API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    this.setSession(data.token, data.user);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${AUTH_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    this.setSession(data.token, data.user);
    return data;
  },

  renderAuthUI() {
    const authBox = document.getElementById('userAuthBox');
    if (!authBox) return;

    const user = this.getUser();
    if (user && user.name) {
      const initial = user.name.charAt(0).toUpperCase();

      authBox.innerHTML = `
        <div style="position: relative;">
          <div class="user-avatar-btn" id="avatarBtn">${initial}</div>
          <div class="profile-dropdown-menu" id="profileDropdown">
            <div class="dropdown-user-header">
              <div class="dropdown-name">${user.name}</div>
              <div class="dropdown-email">${user.email}</div>
            </div>
            <div class="dropdown-link-item" onclick="openAccountModal('profile')">👤 Profile & Account</div>
            <div class="dropdown-link-item" onclick="openAccountModal('addresses')">📍 Saved Addresses</div>
            <div class="dropdown-link-item" onclick="openAccountModal('orders')">📦 Past Orders</div>
            <div style="height: 1px; background: #f0f0f2; margin: 4px 0;"></div>
            <div class="dropdown-link-item" style="color: #e11d48;" onclick="auth.logout()">🚪 Sign out</div>
          </div>
        </div>
      `;

      const avatarBtn = document.getElementById('avatarBtn');
      const dropdown = document.getElementById('profileDropdown');

      if (avatarBtn && dropdown) {
        avatarBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
          dropdown.classList.remove('active');
        });
      }
    } else {
      authBox.innerHTML = `
        <a href="login.html" style="text-decoration: none; font-size: 13px; color: #1d1d1f; font-weight: 500;">Sign In</a>
      `;
    }
  }
};

// Global Account Modal
window.openAccountModal = async function(tab = 'profile') {
  const modal = document.getElementById('accountModal');
  const backdrop = document.getElementById('accountModalBackdrop');
  if (!modal || !backdrop) return;

  modal.classList.add('active');
  backdrop.classList.add('active');
  switchAccountTab(tab);

  await loadAndRenderFullProfile();
};

async function loadAndRenderFullProfile() {
  const token = auth.getToken();
  if (!token) return;

  try {
    const res = await fetch(`${AUTH_API_BASE}/user/profile-full`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();

    // Populate Tab 1: Profile Details & Form Inputs
    const nameInput = document.getElementById('profNameInput');
    const emailInput = document.getElementById('profEmailInput');
    const phoneInput = document.getElementById('profPhoneInput');
    const avatar = document.getElementById('profileLargeInitial');
    const displayName = document.getElementById('profDisplayName');

    if (nameInput) nameInput.value = data.user.name || '';
    if (emailInput) emailInput.value = data.user.email || '';
    if (phoneInput) phoneInput.value = data.user.phone || '+91 9876543210';
    if (avatar) avatar.textContent = (data.user.name || 'U').charAt(0).toUpperCase();
    if (displayName) displayName.textContent = data.user.name || 'User Profile';

    // Populate Tab 2 & Tab 3
    renderAddressList(data.addresses);
    renderOrdersList(data.orders);
  } catch (e) {
    console.error('Failed to load profile details:', e);
  }
}

window.switchAccountTab = function(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.toLowerCase().includes(tabName));
  if (activeBtn) activeBtn.classList.add('active');

  const activePane = document.getElementById(`tab-${tabName}`);
  if (activePane) activePane.classList.add('active');
};

function renderAddressList(addresses) {
  const container = document.getElementById('addressListContainer');
  if (!container) return;

  if (!addresses || addresses.length === 0) {
    container.innerHTML = `<div style="color: #86868b; font-size: 13px; margin-bottom: 12px;">No saved addresses found. Add one below:</div>`;
    return;
  }

  container.innerHTML = addresses.map(a => `
    <div class="addr-card" style="margin-bottom: 8px;">
      <strong style="color: #0071e3; display: block; margin-bottom: 2px;">${a.tag}</strong>
      <div>${a.street_address}</div>
      <div style="color: #6e6e73; font-size: 12px;">${a.city}${a.state ? ', ' + a.state : ''} - ${a.postal_code}</div>
    </div>
  `).join('');
}

function renderOrdersList(orders) {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = `<div style="color: #86868b; font-size: 13px; text-align: center; padding: 24px 0;">No past orders found.</div>`;
    return;
  }

  container.innerHTML = orders.map(o => {
    let items = [];
    try {
      items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : (o.items_json || []);
    } catch (e) {
      items = [];
    }

    const itemsSummary = items.map(it => 
      `${it.title || 'Product'} × ${it.quantity || 1}`
    ).join(', ');

    return `
      <div class="addr-card" style="margin-bottom: 12px; border: 1px solid #e5e5e7; border-radius: 10px; padding: 14px; background: #fff;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 6px;">
          <span>Order ${o.order_number ? o.order_number : '#' + o.id}</span>
          <span style="color: #0071e3;">₹${Number(o.total_amount || 0).toLocaleString('en-IN')} INR</span>
        </div>
        ${itemsSummary ? `<div style="font-size: 13px; color: #1d1d1f; margin-bottom: 4px;"><strong>Items:</strong> ${itemsSummary}</div>` : ''}
        <div style="color: #6e6e73; font-size: 12px; margin-bottom: 4px;"><strong>Shipping:</strong> ${o.shipping_address}</div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e5e7; font-size: 12px;">
          <span><strong>Payment:</strong> ${o.payment_method || 'UPI'}</span>
          <span><strong>Txn ID:</strong> <code style="background:#f3f4f6; padding:2px 5px; border-radius:4px; font-weight:600;">${o.transaction_id || 'N/A'}</code></span>
        </div>

        <div style="color: #10b981; font-size: 12px; font-weight: 600; margin-top: 6px;">Status: ${o.order_status || 'Confirmed'} ✓</div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  auth.renderAuthUI();

  // Modal close handlers
  const closeBtn = document.getElementById('closeAccountModalBtn');
  const backdrop = document.getElementById('accountModalBackdrop');
  const modal = document.getElementById('accountModal');

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  if (backdrop) backdrop.onclick = closeModal;

  // 1. Profile Update Form (Name, Email, Mobile)
  const profileForm = document.getElementById('editProfileForm');
  if (profileForm) {
    profileForm.onsubmit = async (e) => {
      e.preventDefault();
      const token = auth.getToken();
      if (!token) return;

      const saveBtn = document.getElementById('saveProfileBtn');
      const msgBox = document.getElementById('profileMsg');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const updatedPayload = {
        name: document.getElementById('profNameInput').value.trim(),
        email: document.getElementById('profEmailInput').value.trim(),
        phone: document.getElementById('profPhoneInput').value.trim()
      };

      try {
        const res = await fetch(`${AUTH_API_BASE}/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedPayload)
        });

        const data = await res.json();

        if (res.ok) {
          auth.setSession(data.token, data.user);

          if (msgBox) {
            msgBox.style.display = 'block';
            msgBox.style.background = '#e6f4ea';
            msgBox.style.color = '#137333';
            msgBox.textContent = 'Profile updated successfully!';
            setTimeout(() => { msgBox.style.display = 'none'; }, 3000);
          }

          await loadAndRenderFullProfile();
        } else {
          if (msgBox) {
            msgBox.style.display = 'block';
            msgBox.style.background = '#fce8e6';
            msgBox.style.color = '#c5221f';
            msgBox.textContent = data.message || 'Failed to update profile.';
          }
        }
      } catch (err) {
        console.error('Profile update error:', err);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Changes';
        }
      }
    };
  }

  // 2. New Address Submission Form
  const addrForm = document.getElementById('newAddressForm');
  if (addrForm) {
    addrForm.onsubmit = async (e) => {
      e.preventDefault();
      const token = auth.getToken();
      if (!token) {
        alert('Please sign in to save an address.');
        return;
      }

      const saveBtn = addrForm.querySelector('button[type="submit"]');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const body = {
        tag: document.getElementById('addrTag').value.trim() || 'Home',
        street_address: document.getElementById('addrStreet').value.trim(),
        city: document.getElementById('addrCity').value.trim(),
        state: 'Jharkhand',
        postal_code: document.getElementById('addrZip').value.trim()
      };

      try {
        const res = await fetch(`${AUTH_API_BASE}/user/address`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          addrForm.reset();
          await loadAndRenderFullProfile();
          switchAccountTab('addresses');
        } else {
          const errData = await res.json();
          alert(errData.message || 'Failed to save address.');
        }
      } catch (err) {
        console.error('Failed to save address:', err);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Address';
        }
      }
    };
  }
});