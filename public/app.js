const socket = io();

async function register() {
    const user = document.getElementById('rUser').value;
    const pass = document.getElementById('rPass').value;

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
    });

    const data = await res.json();
    alert(JSON.stringify(data));
}

async function login() {
    const user = document.getElementById('lUser').value;
    const pass = document.getElementById('lPass').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
    });

    const data = await res.json();

    if (data.status === "ok") {
        socket.emit('login', user);
    } else {
        alert(data.msg);
    }
}

socket.on('usuarios', (lista) => {
    const ul = document.getElementById('lista');
    ul.innerHTML = '';

    lista.forEach(u => {
        const li = document.createElement('li');
        li.innerText = u;
        ul.appendChild(li);
    });
});