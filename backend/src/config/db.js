const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Buscar .env en varias ubicaciones posibles
const envPaths = [
  path.resolve(__dirname, '../../.env'),           // backend/.env
  path.resolve(__dirname, '../../../.env'),         // raíz del proyecto/.env
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 20000
    },
    pool: {
      max: 3,
      min: 0,
      acquire: 20000,
      idle: 5000
    }
  }
);

module.exports = sequelize;
