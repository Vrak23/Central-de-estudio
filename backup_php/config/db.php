<?php
$env = getenv();

define('DB_HOST', isset($env['DB_HOST']) ? $env['DB_HOST'] : 'localhost');
define('DB_PORT', isset($env['DB_PORT']) ? $env['DB_PORT'] : '3306');
define('DB_NAME', isset($env['DB_NAME']) ? $env['DB_NAME'] : 'db_central');
define('DB_USER', isset($env['DB_USER']) ? $env['DB_USER'] : 'root');
define('DB_PASS', isset($env['DB_PASS']) ? $env['DB_PASS'] : '');
define('DB_CHARSET', isset($env['DB_CHARSET']) ? $env['DB_CHARSET'] : 'utf8mb4');

define('BASE_URL', rtrim(isset($env['BASE_URL']) ? $env['BASE_URL'] : '/', '/') . '/');

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
        } catch (PDOException $e) {
            error_log("Error de conexión: " . $e->getMessage());
            die("Error de conexión. Por favor, contacte al administrador.");
        }
    }

    return $conn;
}