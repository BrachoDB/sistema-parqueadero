const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 1. ELIMINA el middleware manual que pusimos antes y deja SOLO este cors configurado así:
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// 2. IMPORTANTE: Helmet puede estar bloqueando los headers de CORS. 
// Desactívalo temporalmente o úsalo así para probar:
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false
}));

app.use(express.json());
app.use(morgan('dev'));

// 3. Responde a OPTIONS antes de las rutas
app.options('*', cors());
// ... resto de tus rutas

const authRoutes = require('./routes/authRoutes');
const tariffRoutes = require('./routes/tariffRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const userRoutes = require('./routes/userRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const roleRoutes = require('./routes/roleRoutes');
const vehicleTypeRoutes = require('./routes/vehicleTypeRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Parking Lot API' });
});

module.exports = app;
