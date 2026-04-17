export async function handleLogin() {
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;

    if (!user || !pass) {
        alert("Por favor, ingresa tus credenciales de piloto.");
        return;
    }

    try {
        const response = await fetch('/api/login', { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, pass }) 
        });

        const data = await response.json();

        if (data.status === "success") {
            document.getElementById("currentUserName").innerText = data.user.toUpperCase();
            document.getElementById("currentUserPhoto").src = data.img;

            document.getElementById("cardUser").innerText = data.user.toUpperCase();
            document.getElementById("cardEmail").innerText = data.email;
            document.getElementById("cardPhoto").src = data.img;
            document.getElementById("cardRankRace").innerText = data.rank_race;
            document.getElementById("cardRankCombat").innerText = data.rank_combat;
            document.getElementById("cardDate").innerText = data.date;

            document.getElementById("userDisplay").classList.remove("hidden");
            window.showScreen('mainMenu');
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error("Error en la conexión con el servicio web:", error);
        alert("No se pudo conectar con el servidor de Sky Duel.");
    }
}

export async function handleRegister() {
    const user = document.getElementById("regUser").value;
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;
    const passConfirm = document.getElementById("regPassConfirm").value;
    const avatarFile = document.getElementById('avatarInput').files[0];

    if (!user || !email || !pass || !passConfirm) {
        alert("¡Error! Todos los campos son obligatorios.");
        return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(pass)) {
        alert("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.");
        return;
    }

    if (pass !== passConfirm) {
        alert("¡Las contraseñas no coinciden!");
        return;
    }

    const formData = new FormData();
    formData.append('user', user);
    formData.append('email', email);
    formData.append('pass', pass);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
        const response = await fetch('/api/register', { 
            method: 'POST', 
            body: formData 
        });
        
        const data = await response.json();

        if (data.status === "success") {
            alert("¡Piloto " + user + " registrado con éxito en la base de datos!");
            resetRegisterForm();
            window.showScreen('authMenu');
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error("Error al registrar piloto:", error);
    }
}

export function logout() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión, Piloto?")) {
        document.getElementById("userDisplay").classList.add("hidden");
        document.getElementById("loginUser").value = "";
        document.getElementById("loginPass").value = "";
        document.getElementById("currentUserPhoto").src = "assets-pilotos/default.png";
        window.showScreen('authMenu');
    }
}

window.previewImage = function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('registerAvatarPreview');
            if (preview) preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

function resetRegisterForm() {
    document.getElementById("regUser").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPass").value = "";
    document.getElementById("regPassConfirm").value = "";
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) avatarInput.value = "";
    const preview = document.getElementById('registerAvatarPreview');
    if (preview) preview.src = "assets-pilotos/default.png";
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.resetRegisterForm = resetRegisterForm;