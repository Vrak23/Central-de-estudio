<?php
require_once 'includes/auth.php';
require_once 'config/db.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$conn   = getConnection();

switch ($action) {

    case 'listar':
        $stmt = $conn->query("SELECT * FROM notas ORDER BY categoria ASC, updated_at DESC");
        $notas = $stmt->fetchAll();
        echo json_encode(['ok' => true, 'notas' => $notas]);
        break;

    case 'agregar':
        $categoria = trim($_POST['categoria'] ?? '');
        $titulo    = trim($_POST['titulo'] ?? '');
        $contenido = trim($_POST['contenido'] ?? '');

        if (empty($categoria) || empty($titulo)) {
            echo json_encode(['ok' => false, 'msg' => 'Categoría y título son obligatorios.']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO notas (categoria, titulo, contenido) VALUES (:cat, :tit, :con)");
        $stmt->execute([':cat' => $categoria, ':tit' => $titulo, ':con' => $contenido]);
        $id = $conn->lastInsertId();

        echo json_encode(['ok' => true, 'id' => $id, 'categoria' => $categoria, 'titulo' => $titulo, 'contenido' => $contenido]);
        break;

    case 'editar':
        $id        = (int)($_POST['id'] ?? 0);
        $contenido = trim($_POST['contenido'] ?? '');

        if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => 'ID inválido.']); exit; }

        $stmt = $conn->prepare("UPDATE notas SET contenido = :con WHERE id = :id");
        $stmt->execute([':con' => $contenido, ':id' => $id]);
        echo json_encode(['ok' => true]);
        break;

    case 'eliminar':
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => 'ID inválido.']); exit; }

        $stmt = $conn->prepare("DELETE FROM notas WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['ok' => true]);
        break;

    default:
        echo json_encode(['ok' => false, 'msg' => 'Acción no reconocida.']);
}