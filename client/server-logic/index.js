import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json({ extended: true }));

const PORT = 5001;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "", 
  port: 5432,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        is_blocked BOOLEAN DEFAULT false
      )
    `);

    // Твоя проверка на наличие колонок
    const checkCol = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='is_admin'
    `);
    if (checkCol.rowCount === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false');
      await pool.query('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false');
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Новые таблицы для ТЕГОВ
    await pool.query(`CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL)`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_tags (
        inventory_id INTEGER REFERENCES inventories(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (inventory_id, tag_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        inventory_id INTEGER REFERENCES inventories(id) ON DELETE CASCADE,
        UNIQUE(user_id, inventory_id)
      )
    `);

    await pool.query(`CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, inventory_id INTEGER REFERENCES inventories(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS custom_fields (id SERIAL PRIMARY KEY, inventory_id INTEGER REFERENCES inventories(id) ON DELETE CASCADE, label VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS item_custom_values (id SERIAL PRIMARY KEY, item_id INTEGER REFERENCES items(id) ON DELETE CASCADE, field_id INTEGER REFERENCES custom_fields(id) ON DELETE CASCADE, value TEXT)`);

    await pool.query(`INSERT INTO categories (name) VALUES ('Equipment'), ('Books'), ('Furniture'), ('Other') ON CONFLICT DO NOTHING`);
  } catch (err) { console.error(err.message); }
};
initDB();

// --- AUTH ---
app.post('/api/auth/registration', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, is_admin', [email, password]);
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (user.rows.length === 0 || user.rows[0].password !== password) return res.status(400).json({ message: 'Error' });
    if (user.rows[0].is_blocked) return res.status(403).json({ message: 'Blocked' });
    res.json({ token: "test-token-12345", userId: user.rows[0].id, isAdmin: user.rows[0].is_admin });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const user = await pool.query('SELECT email, is_admin FROM users WHERE id = $1', [req.params.id]);
    const count = await pool.query('SELECT COUNT(*) FROM inventories WHERE owner_id = $1', [req.params.id]);
    res.json({ email: user.rows[0].email, isAdmin: user.rows[0].is_admin, count: parseInt(count.rows[0].count) });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// --- INVENTORY ---
app.get('/api/inventory', async (req, res) => {
  try {
    const { userId } = req.query;
    const uid = (userId && userId !== 'undefined' && userId !== 'null') ? parseInt(userId) : 0;
    const result = await pool.query(`
      SELECT i.*, c.name as category_name,
      (SELECT json_agg(t.name) FROM tags t JOIN inventory_tags it ON t.id = it.tag_id WHERE it.inventory_id = i.id) as tags,
      (SELECT COUNT(*) FROM likes WHERE inventory_id = i.id) as likes_count,
      EXISTS(SELECT 1 FROM likes WHERE inventory_id = i.id AND user_id = $1) as is_liked
      FROM inventories i 
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.owner_id = $1 OR i.is_public = true
      ORDER BY i.created_at DESC
    `, [uid]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/inventory/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const uid = userId ? parseInt(userId) : 0;
    const result = await pool.query(`
      SELECT i.*, c.name as category_name,
      (SELECT json_agg(t.name) FROM tags t JOIN inventory_tags it ON t.id = it.tag_id WHERE it.inventory_id = i.id) as tags,
      (SELECT COUNT(*) FROM likes WHERE inventory_id = i.id) as likes_count,
      EXISTS(SELECT 1 FROM likes WHERE inventory_id = i.id AND user_id = $2) as is_liked
      FROM inventories i 
      LEFT JOIN categories c ON i.category_id = c.id 
      WHERE i.id = $1
    `, [req.params.id, uid]);
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.post('/api/inventory/add', async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, description, category_id, owner_id, is_public, customFields, tags } = req.body;
    await client.query('BEGIN');
    const invRes = await client.query(
      'INSERT INTO inventories (title, description, category_id, owner_id, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, description || '', parseInt(category_id), parseInt(owner_id), is_public || false]
    );
    const invId = invRes.rows[0].id;

    if (tags && Array.isArray(tags)) {
      for (let tName of tags) {
        const cleaned = tName.toLowerCase().trim();
        if (!cleaned) continue;
        const tagRes = await client.query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id', [cleaned]);
        await client.query('INSERT INTO inventory_tags (inventory_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [invId, tagRes.rows[0].id]);
      }
    }

    if (customFields && customFields.length > 0) {
      for (const field of customFields) {
        await client.query('INSERT INTO custom_fields (inventory_id, label, type) VALUES ($1, $2, $3)', [invId, field.label, field.type]);
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ id: invId });
  } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ message: 'Error' }); } finally { client.release(); }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { title, description, category_id, is_public } = req.body;
    await pool.query(
      'UPDATE inventories SET title = $1, description = $2, category_id = $3, is_public = $4 WHERE id = $5',
      [title, description, category_id, is_public, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.delete('/api/inventory/delete/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// --- LIKES ---
app.post('/api/inventory/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const invId = req.params.id;
    const existing = await pool.query('SELECT * FROM likes WHERE user_id=$1 AND inventory_id=$2', [userId, invId]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE user_id=$1 AND inventory_id=$2', [userId, invId]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO likes (user_id, inventory_id) VALUES ($1, $2)', [userId, invId]);
      res.json({ liked: true });
    }
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// --- ITEMS & FIELDS ---
app.get('/api/inventory/:id/fields', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM custom_fields WHERE inventory_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/inventory/:id/items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT it.*, json_object_agg(f.label, v.value) FILTER (WHERE f.label IS NOT NULL) as custom_data
      FROM items it
      LEFT JOIN item_custom_values v ON it.id = v.item_id
      LEFT JOIN custom_fields f ON v.field_id = f.id
      WHERE it.inventory_id = $1
      GROUP BY it.id ORDER BY it.created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.post('/api/inventory/:id/items/add-full', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, customValues } = req.body;
    await client.query('BEGIN');
    const itemRes = await client.query('INSERT INTO items (inventory_id, name) VALUES ($1, $2) RETURNING id', [req.params.id, name]);
    const itemId = itemRes.rows[0].id;
    for (const [fieldId, value] of Object.entries(customValues)) {
      await client.query('INSERT INTO item_custom_values (item_id, field_id, value) VALUES ($1, $2, $3)', [itemId, parseInt(fieldId), value.toString()]);
    }
    await client.query('COMMIT');
    res.status(201).json({ id: itemId });
  } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ message: 'Error' }); } finally { client.release(); }
});

app.delete('/api/inventory/item/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// --- ADMIN ---
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, email, is_admin, is_blocked FROM users ORDER BY id ASC');
    res.json(users.rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.post('/api/admin/user-action', async (req, res) => {
  try {
    const { userIds, action } = req.body;
    let q = '';
    if (action === 'block') q = 'UPDATE users SET is_blocked = true WHERE id = ANY($1)';
    else if (action === 'unblock') q = 'UPDATE users SET is_blocked = false WHERE id = ANY($1)';
    else if (action === 'make_admin') q = 'UPDATE users SET is_admin = true WHERE id = ANY($1)';
    else if (action === 'remove_admin') q = 'UPDATE users SET is_admin = false WHERE id = ANY($1)';
    else if (action === 'delete') q = 'DELETE FROM users WHERE id = ANY($1)';
    await pool.query(q, [userIds]);
    res.json({ message: 'OK' });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// --- SEARCH ---
app.get('/api/search', async (req, res) => {
  try {
    const term = `%${req.query.q}%`;
    const result = await pool.query(`
      SELECT 'inventory' as type, id as link_id, title as name, description as detail FROM inventories WHERE title ILIKE $1 AND is_public = true
      UNION 
      SELECT 'item' as type, inventory_id as link_id, name, (SELECT title FROM inventories WHERE id = inventory_id) as detail FROM items WHERE name ILIKE $1
    `, [term]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));