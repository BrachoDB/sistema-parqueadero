const app = require('../backend/src/app');
const sequelize = require('../backend/src/config/db');

// Conexión lazy: solo autentica una vez por cold start
let isConnected = false;

async function ensureConnection() {
    if (!isConnected) {
        try {
            await sequelize.authenticate();
            console.log('DB connection established.');
            isConnected = true;
        } catch (error) {
            console.error('DB connection error:', error.message);
            // No lanzamos error, dejamos que las rutas manejen el error individualmente
        }
    }
}

// Wrapper para Vercel: conecta DB antes de manejar la request
module.exports = async (req, res) => {
    await ensureConnection();
    return app(req, res);
};
