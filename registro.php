<?php
error_reporting(0); 
header('Content-Type: application/json');

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['user'] ?? '';
    $email = $_POST['email'] ?? '';
    $raw_pass = $_POST['pass'] ?? '';
    $img_path = 'assets-pilotos/default.png'; 

    if (empty($user) || empty($email) || empty($raw_pass)) {
        echo json_encode(["status" => "error", "msg" => "Campos obligatorios vacíos"]);
        exit;
    }

    if (!preg_match('/[A-Z]/', $raw_pass) || !preg_match('/[a-z]/', $raw_pass) || !preg_match('/[0-9]/', $raw_pass) || strlen($raw_pass) < 8) {
        echo json_encode(["status" => "error", "msg" => "La contraseña no cumple los requisitos"]);
        exit;
    }

    $checkUser = $conn->prepare("SELECT id_usuario FROM usuarios WHERE nombre_usuario = ? OR correo = ?");
    $checkUser->bind_param("ss", $user, $email);
    $checkUser->execute();
    if ($checkUser->get_result()->num_rows > 0) {
        echo json_encode(["status" => "error", "msg" => "El nombre de usuario o correo ya está registrado"]);
        exit;
    }

    $pass = password_hash($raw_pass, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre_usuario, correo, contrasena, ruta_imagen) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $user, $email, $pass, $img_path);

    if ($stmt->execute()) {
        $id_usuario = $conn->insert_id;

        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === 0) {
            $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $random_id = rand(1000, 9999);
            $new_name = $random_id . "_" . $user . "." . $ext;
            $target_path = "assets-pilotos/" . $new_name;

            $info = getimagesize($_FILES['avatar']['tmp_name']);
            if ($info) {
                $mime = $info['mime'];
                switch ($mime) {
                    case 'image/jpeg': $src_img = imagecreatefromjpeg($_FILES['avatar']['tmp_name']); break;
                    case 'image/png':  $src_img = imagecreatefrompng($_FILES['avatar']['tmp_name']); break;
                    default: $src_img = null;
                }

                if ($src_img) {
                    $width = imagesx($src_img);
                    $height = imagesy($src_img);
                    $size = min($width, $height);
                    $canvas = imagecreatetruecolor(500, 500);
                    
                    imagecopyresampled($canvas, $src_img, 0, 0, ($width-$size)/2, ($height-$size)/2, 500, 500, $size, $size);
                    
                    if (imagepng($canvas, $target_path)) {
                        $updateImg = $conn->prepare("UPDATE usuarios SET ruta_imagen = ? WHERE id_usuario = ?");
                        $updateImg->bind_param("si", $target_path, $id_usuario);
                        $updateImg->execute();
                    }
                    imagedestroy($canvas);
                    imagedestroy($src_img);
                }
            }
        }
        echo json_encode(["status" => "success", "msg" => "Piloto registrado con éxito"]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Error al registrar en la base de datos"]);
    }
}
?>