const { Router } = require('express');
const router = Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const searchTerm = `%${q.toLowerCase()}%`;

        const result = await pool.query(
            `
            SELECT 
                id, 
                title AS name, 
                'inventory' AS type, 
                description AS detail,
                id AS link_id
            FROM inventories 
            WHERE (LOWER(title) LIKE $1 OR LOWER(description) LIKE $1) AND is_public = true

            UNION ALL

            SELECT 
                i.id, 
                i.name AS name, 
                'item' AS type, 
                inv.title AS detail,
                inv.id AS link_id
            FROM items i
            JOIN inventories inv ON i.inventory_id = inv.id
            WHERE LOWER(i.name) LIKE $1 AND inv.is_public = true
            `,
            [searchTerm]
        );

        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ message: 'Ошибка' });
    }
});

module.exports = router;