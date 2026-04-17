<?php
$host = "localhost";
$user = "u649554040_Pilot";
$pass = "DszUQcpjYKitDs9?";
$db = "u649554040_SkyDuel";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

?>

