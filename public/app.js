const socket = io();

const panels = {
    login: document.getElementById('login-panel'),
    register: document.getElementById('register-panel'),
    menu: document.getElementById('menu-panel')
};

const inputs = {
    rUser: document.getElementById('rUser'),
    rPass: document.getElementById('rPass'),
    lUser: document.getElementById('lUser'),
    lPass: document.getElementById('lPass')
};

const userNameDisplay = document.getElementById('connected-user-name');

/**
 * Función para cambiar visibilidad entre paneles 
 * @param {string} panelName - 'login', 'register', o 'menu'
 */

function showPanel(panelName) {
    Object.values(panels).forEach(panel => panel.classList.add('hidden'));

    if (panels[panelName]) {
        panels[panelName].classList.remove('hidden');
    }
}

function clearRegisterInputs() {
    inputs.rUser.value = '';
    inputs.rPass.value = '';
}

async function register() {
    const user = document.getElementById('rUser').value;
    const pass = document.getElementById('rPass').value;

    if (!user || !pass) {
        alert("Por favor rellena todos los campos de registro.");
        return;
    }
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await res.json();

        if (data.status === "ok") {
            alert("Cuenta creada exitosamente.");
            clearRegisterInputs();
            showPanel('login');
        } else {
            alert("Error: " + data.msg);
        }
    } catch (error) {
        console.error("Register Error:", error);
        alert("Error de conexión con el servidor.");
    }
}

async function login() {
    const user = inputs.lUser.value;
    const pass = inputs.lPass.value;

    if (!user || !pass) {
        alert("Por favor rellena todos los campos de login.");
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await res.json();

        if (data.status === "ok") {
            socket.emit('login', data.user);

            userNameDisplay.innerText = data.user;
            showPanel('menu');

            inputs.lUser.value = '';
            inputs.lPass.value = '';
        } else {
            alert("❌ Acceso denegado: " + data.msg);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Error de conexión con el servidor.");
    }
}

function showSubMenu(type) {
    const mainBtns = document.getElementById('main-buttons');
    const playBtns = document.getElementById('play-submenu');

    if (type === 'play') {
        mainBtns.classList.add('hidden');
        playBtns.classList.remove('hidden');
    } else {
        mainBtns.classList.remove('hidden');
        playBtns.classList.add('hidden');
    }
}

socket.on('forcedLogout', (msg) => {
    alert(msg);
    location.reload(); 
});

socket.on('usuarios', (lista) => {
    const ul = document.getElementById('lista-usuarios');
    if (!ul) return; 
    
    ul.innerHTML = '';
    lista.forEach(u => {
        const li = document.createElement('li');
        li.innerText = `• ${u}`;
        ul.appendChild(li);
    });
});