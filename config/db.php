<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'db_central');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// URL base del proyecto (ajusta según tu dominio en InfinityFree)
define('BASE_URL', '/');

function getConnection() {
    static $conn = null;
    
    if ($conn === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        try {
            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {  // ← corregido: era PDO\Exception
            error_log("Error de conexión: " . $e->getMessage());
            die("Error de conexión. Por favor, contacte al administrador.");
        }
    }
    
    return $conn;
}