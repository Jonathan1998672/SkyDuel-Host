const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔥 IMPORTANTE (Hostinger)
const PORT = process.env.PORT || 3000;

// CONFIG
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'u649554040_Piloto',
    password: 'DszUQcpjYKitDs9?',
    database: 'u649554040_SkyDuel_DB'
});

db.connect(err => {
    if (err) {
        console.error("MYSQL ERROR:", err);
    } else {
        console.log("✅ MySQL conectado");
    }
});

// REGISTER
app.post('/api/register', (req, res) => {
    const { user, pass } = req.body;

    const sql = "INSERT INTO usuarios (nombre_usuario, contrasena) VALUES (?, ?)";

    db.query(sql, [user, pass], (err) => {
        if (err) {
            console.error(err);
            return res.json({ status: "error", msg: "Error o usuario existente" });
        }

        res.json({ status: "ok" });
    });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;

    const sql = "SELECT * FROM usuarios WHERE nombre_usuario = ?";

    db.query(sql, [user], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: "error" });
        }

        if (results.length === 0) {
            return res.json({ status: "error", msg: "No existe" });
        }

        if (results[0].contrasena !== pass) {
            return res.json({ status: "error", msg: "Contraseña incorrecta" });
        }

        res.json({ status: "ok", user });
    });
});

// SOCKET
let usuariosConectados = {};

io.on('connection', (socket) => {
    console.log("🟢 Conectado:", socket.id);

    socket.on('login', (user) => {
        if (usuariosConectados[user]) {
            const oldSocketId = usuariosConectados[user];
            io.to(oldSocketId).emit('forcedLogout', 'Se ha iniciado sesión en otro dispositivo.');
            console.log(`⚠️ Desconectando sesión previa de: ${user}`);
        }

        socket.username = user; 
        usuariosConectados[user] = socket.id;
        
        io.emit('usuarios', Object.keys(usuariosConectados));
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete usuariosConectados[socket.username];
            io.emit('usuarios', Object.keys(usuariosConectados));
            console.log(`🔴 ${socket.username} salió.`);
        }
    });
});