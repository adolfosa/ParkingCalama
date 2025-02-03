<?php
include("../conf.php");
include('../auth.php');

// Verificar JWT
$user = verifyJWT();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Token no válido o expirado"));
    exit();
}

// API para insertar un privilegio (modificado para la tabla buses)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] == 'insertar') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->patente) && isset($data->tiempo_extra)) {
        $patente = $data->patente;
        $tiempo_extra = $data->tiempo_extra;
        
        // Insertar en la tabla buses
        $query = "INSERT INTO buses (patente, tiempo_extra) VALUES (:patente, :tiempo_extra)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':patente', $patente);
        $stmt->bindParam(':tiempo_extra', $tiempo_extra);

        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Bus con privilegio registrado exitosamente"));
        } else {
            echo json_encode(array("success" => false, "message" => "Error al registrar bus con privilegio"));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Faltan datos"));
    }
}

// API para actualizar el privilegio (modificado para la tabla buses)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] == 'actualizar') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->patente) && isset($data->tiempo_extra)) {
        $patente = $data->patente;
        $tiempo_extra = $data->tiempo_extra;
        
        // Actualizar en la tabla buses
        $query = "UPDATE buses SET tiempo_extra = :tiempo_extra WHERE patente = :patente";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':patente', $patente);
        $stmt->bindParam(':tiempo_extra', $tiempo_extra);

        if ($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Privilegio actualizado exitosamente"));
        } else {
            echo json_encode(array("success" => false, "message" => "Error al actualizar privilegio"));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Faltan datos"));
    }
}

// API para obtener los buses con el tipo "Anden"
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] == 'obtener') {
    // Filtrar buses solo de tipo "Anden"
    $query = "SELECT * FROM buses WHERE tipo = 'Anden'";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $buses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array("buses" => $buses));
}
?>
