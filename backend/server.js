const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dukaanx_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Path to frontend assets
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.use('/images', express.static(path.join(frontendPath, 'images')));

// TiDB Cloud Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || 'aXgNNF9mmi2V62o.root',
  password: process.env.DB_PASSWORD || '74SpqOKIcHYKcVzN',
  database: process.env.DB_NAME || 'dukaanxdb',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-create/verify users, address, and orders tables
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT '+91 9876543210',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tag VARCHAR(50) DEFAULT 'Home',
        street_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL DEFAULT '',
        postal_code VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(64) NOT NULL UNIQUE,
        user_id INT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(100) NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        order_status VARCHAR(50) DEFAULT 'Confirmed',
        items_json JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('TiDB Cloud Users, Addresses, and Orders tables verified successfully.');
  } catch (err) {
    console.error('Failed to initialize DB tables:', err.message);
  }
})();

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ================= AUTHENTICATION & USER ROUTES =================

// 1. SIGN UP (REGISTER)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const user = { id: result.insertId, name, email, phone: '+91 9876543210' };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error details:', err);
    res.status(500).json({ message: err.sqlMessage || err.message || 'Registration failed' });
  }
});

// 2. SIGN IN (LOGIN)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '+91 9876543210' }
    });
  } catch (err) {
    console.error('Login error details:', err);
    res.status(500).json({ message: err.sqlMessage || err.message || 'Login failed' });
  }
});

// 3. GET FULL PROFILE, ADDRESSES & PAST ORDERS (Matches by user_id OR email)
app.get('/api/user/profile-full', authenticateToken, async (req, res) => {
  try {
    const [userRows] = await db.query('SELECT id, name, email, phone FROM users WHERE id = ?', [req.user.id]);
    if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = userRows[0];
    const [addresses] = await db.query('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY id DESC', [user.id]);

    let orders = [];
    try {
      const [orderRows] = await db.query(
        'SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY id DESC',
        [user.id, user.email]
      );
      orders = orderRows;
    } catch (e) {
      console.warn('Orders query warning:', e.message);
      orders = [];
    }

    res.json({
      user,
      addresses,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: err.sqlMessage || err.message });
  }
});

// 4. UPDATE USER PROFILE (EMAIL, PHONE & NAME)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email cannot be empty.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This email is already registered to another account.' });
    }

    await db.query(
      'UPDATE users SET name = COALESCE(?, name), email = ?, phone = ? WHERE id = ?',
      [name, email, phone || '', req.user.id]
    );

    const [updatedRows] = await db.query(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    const updatedUser = updatedRows[0];

    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
      token: newToken
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.sqlMessage || err.message });
  }
});

// 5. ADD NEW ADDRESS
app.post('/api/user/address', authenticateToken, async (req, res) => {
  try {
    const { tag, street_address, city, state, postal_code } = req.body;
    if (!street_address || !city || !postal_code) {
      return res.status(400).json({ message: 'Address, city, and postal code are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO user_addresses (user_id, tag, street_address, city, state, postal_code) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, tag || 'Home', street_address, city, state || '', postal_code]
    );

    res.status(201).json({
      success: true,
      addressId: result.insertId,
      message: 'Address saved successfully'
    });
  } catch (err) {
    console.error('Address creation error:', err);
    res.status(500).json({ message: err.sqlMessage || err.message });
  }
});

// ================= ORDERS ROUTE =================

// 6. CREATE NEW ORDER (CHECKOUT WITH PAYMENT METHOD & REAL TRANSACTION ID)
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, address, total, items, user_id, payment_method, transaction_id } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required.' });
    }

    let resolvedUserId = user_id || null;
    if (!resolvedUserId && email) {
      try {
        const [userMatch] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (userMatch.length > 0) {
          resolvedUserId = userMatch[0].id;
        }
      } catch (err) {
        console.warn('Could not auto-resolve user ID:', err.message);
      }
    }

    const orderNumber = 'DKX-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
    const calculatedSubtotal = Number(total) || 0;
    const paymentMethod = payment_method || 'UPI';
    const txnId = transaction_id || ('TXN' + Date.now());

    const [result] = await db.query(
      `INSERT INTO orders (
        order_number, 
        user_id, 
        customer_name, 
        customer_email, 
        shipping_address, 
        payment_method, 
        transaction_id,
        subtotal, 
        total_amount, 
        order_status,
        items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)`,
      [
        orderNumber,
        resolvedUserId,
        name,
        email,
        address,
        paymentMethod,
        txnId,
        calculatedSubtotal,
        calculatedSubtotal,
        JSON.stringify(items || [])
      ]
    );

    console.log(`>>> Order recorded in TiDB: ${orderNumber} | Txn: ${txnId} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      orderId: result.insertId,
      orderNumber,
      transactionId: txnId,
      message: 'Order placed successfully!'
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: err.sqlMessage || err.message });
  }
});

// ================= PRODUCT & CATEGORY ROUTES =================

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, 
        (SELECT p.image_url FROM products p WHERE p.category_id = c.id LIMIT 1) AS sample_image
      FROM categories c
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.sqlMessage || 'Error fetching categories' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.sqlMessage || 'Error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.sqlMessage || 'Error fetching product' });
  }
});

app.listen(PORT, () => {
  console.log(`DukaanX Server started at http://localhost:${PORT}`);
});