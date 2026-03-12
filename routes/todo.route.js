const { Router } = require('express');
const router = Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || userId === 'null') return res.json([]);
        const result = await pool.query(
            `SELECT i.*, c.name as category_name,
             (SELECT COUNT(*) FROM likes WHERE inventory_id = i.id) as likes_count,
             EXISTS(SELECT 1 FROM likes WHERE inventory_id = i.id AND user_id = $1) as is_liked
             FROM inventories i 
             LEFT JOIN categories c ON i.category_id = c.id 
             WHERE i.owner_id = $1 
             ORDER BY i.id DESC`,
            [parseInt(userId)]
        );
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.post('/add', async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, category_id, owner_id, is_public, customFields } = req.body;
        await client.query('BEGIN');
        const invResult = await client.query(
            `INSERT INTO inventories (title, description, category_id, owner_id, is_public) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, category_id, owner_id, is_public]
        );
        const newInventory = invResult.rows[0];
        if (customFields && customFields.length > 0) {
            for (const field of customFields) {
                await client.query(
                    `INSERT INTO custom_fields (inventory_id, label, type) VALUES ($1, $2, $3)`,
                    [newInventory.id, field.label, field.type]
                );
            }
        }
        await client.query('COMMIT');
        res.status(201).json(newInventory);
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Ошибка' });
    } finally {
        client.release();
    }
});

router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const invId = req.params.id;
        const existing = await pool.query(
            'SELECT * FROM likes WHERE user_id = $1 AND inventory_id = $2',
            [userId, invId]
        );
        if (existing.rows.length > 0) {
            await pool.query('DELETE FROM likes WHERE user_id = $1 AND inventory_id = $2', [userId, invId]);
            res.json({ liked: false });
        } else {
            await pool.query('INSERT INTO likes (user_id, inventory_id) VALUES ($1, $2)', [userId, invId]);
            res.json({ liked: true });
        }
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, c.name as category_name,
             (SELECT COUNT(*) FROM likes WHERE inventory_id = i.id) as likes_count
             FROM inventories i 
             LEFT JOIN categories c ON i.category_id = c.id 
             WHERE i.id = $1`,
            [req.params.id]
        );
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.get('/:id/fields', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM custom_fields WHERE inventory_id = $1', [req.params.id]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.get('/:id/items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items WHERE inventory_id = $1 ORDER BY id DESC', [req.params.id]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.post('/:id/items/add-full', async (req, res) => {
    try {
        const { name, customValues } = req.body;
        const result = await pool.query(
            'INSERT INTO items (inventory_id, name, custom_data) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, name, JSON.stringify(customValues)]
        );
        res.status(201).json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM inventories WHERE id = $1', [req.params.id]);
        res.json({ message: 'Удалено' });
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

router.delete('/item/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
        res.json({ message: 'Удалено' });
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

module.exports = router;