const db = require('../config/db');

exports.createOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { customerName, customerEmail, shippingAddress, paymentMethod, items, userId } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'All order fields are required' });
    }

    await conn.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];

    for (const itm of items) {
      const [rows] = await conn.query('SELECT id, title, price, stock FROM products WHERE id = ? FOR UPDATE', [itm.id]);
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: `Product ${itm.id} not found` });
      }

      const prod = rows[0];
      const itemTotal = parseFloat(prod.price) * itm.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        qty: itm.quantity,
        total: itemTotal,
        color: itm.color || 'Default',
        size: itm.size || 'Standard'
      });

      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [itm.quantity, prod.id]);
    }

    const orderNumber = 'DKX-' + Date.now().toString(36).toUpperCase();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_email, shipping_address, payment_method, subtotal, total_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, userId || null, customerName, customerEmail, shippingAddress, paymentMethod || 'Online', subtotal, subtotal]
    );

    const orderId = orderResult.insertId;

    for (const v of validatedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_title, unit_price, quantity, total_price, selected_color, selected_size) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, v.id, v.title, v.price, v.qty, v.total, v.color, v.size]
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Order created',
      data: { orderNumber, total: subtotal }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Order checkout error' });
  } finally {
    conn.release();
  }
};