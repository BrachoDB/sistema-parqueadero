const app = require('../backend/src/app');
const sequelize = require("../backend/src/config/db");

(async () => {
    try{
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch(error) {
        console.error('Unable to connect to the database:', error);
    }
})();
// Note: In a real serverless env, you might need to handle DB connection re-use explicitly or use a connection fool.
// For Vercel, this exports the Express app as a serverless function.
module.exports = app;
