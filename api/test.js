module.exports = (req, res) => {
    res.status(200).json({ 
        status: 'Servidor Vivo',
        message: 'Si ves esto, el backend está funcionando en Vercel',
        db_config: {
            host: process.env.DB_HOST ? 'Configurado ✅' : 'Faltante ❌',
            name: process.env.DB_NAME ? 'Configurado ✅' : 'Faltante ❌'
        }
    });
};
