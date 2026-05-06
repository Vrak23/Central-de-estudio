<?php
require_once 'includes/auth.php';
require_once 'config/db.php';

$pdo = getConnection();

// Bases de datos locales
try {
    $stmt = $pdo->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $exclude = ['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'test'];
    $my_projects = array_diff($databases, $exclude);
} catch (PDOException $e) {
    $my_projects = [];
}

// Sitios personalizados
try {
    $stmt = $pdo->query("SELECT * FROM sitios ORDER BY orden ASC, created_at ASC");
    $sitios = $stmt->fetchAll();
} catch (PDOException $e) {
    $sitios = [];
}

include 'templates/header.php';
include 'templates/selection.php';
include 'templates/footer.php';
?>