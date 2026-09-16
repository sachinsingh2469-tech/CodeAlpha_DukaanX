const db = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const { collection, search, sort } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (collection && collection !== 'all') {
      query += ' AND c.slug = ?';
      params.push(collection);
    }

    if (search && search.trim() !== '') {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (sort === 'price-asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY p.price DESC';
    } else if (sort === 'latest') {
      query += ' ORDER BY p.id DESC';
    } else {
      query += ' ORDER BY p.featured DESC, p.id ASC';
    }

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ success: false, message: 'Database query failed' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Single product error:', err);
    res.status(500).json({ success: false, message: 'Database query failed' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};