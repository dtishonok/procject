const { Router } = require('express');
const router = Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const jwtToken = require('jsonwebtoken');

router.post('/registration',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Некорректный пароль').isLength({ min: 4 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                });
            }

            const { email, password } = req.body;

            const userCheck = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (userCheck.rows.length > 0) {
                return res.status(409).json({ message: 'Email уже используется' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await pool.query(
                'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
                [email, hashedPassword]
            );

            res.status(201).json({ message: 'Пользователь создан', user: newUser.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

router.post('/Login',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при входе'
                });
            }

            const { email, password } = req.body;

            const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = userRes.rows[0];

            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const jwtSecret = 'qwertyuiasdsfgfds';

            const token = jwtToken.sign(
                { userId: user.id },
                jwtSecret,
                { expiresIn: '1h' }
            );

            res.json({ 
                token, 
                userId: user.id,
                isAdmin: user.is_admin || false 
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

module.exports = router;