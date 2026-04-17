const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
    console.log('Servidor conectado a MySQL');
});

let pilotosConectados = {};

app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    const sql = "SELECT * FROM usuarios WHERE nombre_usuario = ?";
    
    db.query(sql, [user], (err, results) => {
        if (err) {
            console.error(err); 
            return res.status(500).json({ status: "error", msg: "Error en base de datos" });
        }
        
        if (results.length > 0) {
            const usuario = results[0];
            if (usuario.contrasena === pass) {
                res.json({
                    status: "success",
                    user: usuario.nombre_usuario,
                    email: usuario.correo,
                    img: usuario.ruta_imagen,
                    rank_race: usuario.rango_carrera,
                    rank_combat: usuario.rango_combate,
                    date: usuario.fecha_registro
                });
            } else {
                res.json({ status: "error", msg: "Contraseña incorrecta" });
            }
        } else {
            res.json({ status: "error", msg: "Piloto no encontrado" });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { user, email, pass } = req.body;
    const img_default = 'assets-pilotos/default.png';
    const sql = "INSERT INTO usuarios (nombre_usuario, correo, contrasena, ruta_imagen) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [user, email, pass, img_default], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ status: "error", msg: "El piloto o correo ya existe" });
            }
            return res.status(500).json({ status: "error", msg: "Error al registrar" });
        }
        res.json({ status: "success", msg: "¡Piloto registrado con éxito!" });
    });
});


// WebSocket: Registro de conexión
io.on('connection', (socket) => {
    socket.on('registrar-piloto', (datosPiloto) => {
        pilotosConectados[socket.id] = {
            nombre: datosPiloto.user,
            id: socket.id
        };
        
        // Notificar a todos los clientes
        io.emit('actualizar-pilotos', {
            msg: `¡Piloto ${datosPiloto.user} en línea!`,
            lista: Object.values(pilotosConectados)
        });
    });

    socket.on('disconnect', () => {
        if (pilotosConectados[socket.id]) {
            const nombre = pilotosConectados[socket.id].nombre;
            delete pilotosConectados[socket.id];
            io.emit('actualizar-pilotos', {
                msg: `El piloto ${nombre} se ha desconectado.`,
                lista: Object.values(pilotosConectados)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sky Duel running on port ${PORT}`));