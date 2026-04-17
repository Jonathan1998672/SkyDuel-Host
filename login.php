<?php
include 'db.php';

$user = $_POST['user'];
$pass = $_POST['pass'];
$stmt = $conn->prepare("SELECT contrasena, nombre_usuario, correo, ruta_imagen, rango_carrera, rango_combate, fecha_registro FROM usuarios WHERE nombre_usuario = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($pass, $row['contrasena'])) {
        echo json_encode([
            "status" => "success",
            "user" => $row['nombre_usuario'],
            "email" => $row['correo'],
            "img" => $row['ruta_imagen'],
            "rank_race" => $row['rango_carrera'],
            "rank_combat" => $row['rango_combate'],
            "date" => date("d/m/Y", strtotime($row['fecha_registro']))
        ]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Contraseña incorrecta"]);
    }
} else {
    echo json_encode(["status" => "error", "msg" => "Usuario no encontrado"]);
}
?>