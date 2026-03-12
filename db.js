const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
  'postgres', // Имя базы данных, которое мы видели в pgAdmin
  'postgres', // Ваш логин в pgAdmin (по умолчанию postgres)
  '', // Вставьте сюда пароль, который вы вводили при установке PostgreSQL
  {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432
  }
);