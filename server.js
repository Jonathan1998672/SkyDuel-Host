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