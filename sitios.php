<?php
// sitios.php
ob_start(); // Inicia el buffer para capturar cualquier eco accidental
require_once 'includes/auth.php';
require_once 'config/db.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? '';
$conn = getConnection();

if ($action === 'agregar') {
    $categoria = trim($_POST['categoria'] ?? 'personal');
    $nombre = trim($_POST['nombre'] ?? '');
    $url    = trim($_POST['url'] ?? '');
    $icono  = trim($_POST['icono'] ?? '🌐');

    if (empty($nombre) || empty($url)) {
        ob_clean(); // Limpia cualquier basura antes de enviar JSON
        echo json_encode(['ok' => false, 'msg' => 'Nombre y URL son obligatorios.']);
        exit;
    }

    if (!preg_match('/^https?:\/\//', $url)) {
        $url = 'https://' . $url;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO sitios (nombre, url, icono, categoria) VALUES (:nombre, :url, :icono, :cat)");
        $stmt->execute([':nombre' => $nombre, ':url' => $url, ':icono' => $icono, ':cat' => $categoria]);
        
        ob_clean();
        echo json_encode(['ok' => true]);
    } catch (PDOException $e) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Error en BD: ' . $e->getMessage()]);
    }
    exit;
}

if ($action === 'eliminar') {
    $id = (int)($_POST['id'] ?? 0);
    $stmt = $conn->prepare("DELETE FROM sitios WHERE id = :id");
    $stmt->execute([':id' => $id]);
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

ob_clean();
echo json_encode(['ok' => false, 'msg' => 'Acción no reconocida.']);