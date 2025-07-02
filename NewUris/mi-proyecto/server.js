require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000; // Usar el puerto desde .env o el 3000 por defecto

// Conectar a MongoDB usando la URI desde .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('No se pudo conectar a MongoDB', err));

// Middleware
app.use(express.json());
app.use('/api', apiRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
