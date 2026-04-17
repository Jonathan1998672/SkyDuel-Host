const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/')));

io.on('connection', (socket) => {
    console.log('Un piloto se ha conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Piloto desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor Sky Duel corriendo en puerto ${PORT}`);
});

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'u649554040_Pilot',
    password: 'DszUQcpjYKitDs9?',
    database: 'u649554040_SkyDuel'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Servidor Node.js conectado a la base de datos MySQL');
});