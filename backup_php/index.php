<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/config/db.php';

$pdo = getConnection();

try {
    $stmt = $pdo->query("SELECT * FROM sitios ORDER BY orden ASC, created_at ASC");
    $sitios = $stmt->fetchAll();
} catch (PDOException $e) {
    $sitios = [];
}

include __DIR__ . '/templates/header.php';
include __DIR__ . '/templates/selection.php';
include __DIR__ . '/templates/footer.php';
?>