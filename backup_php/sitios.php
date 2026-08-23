<?php
// sitios.php

ob_start();

require_once 'includes/auth.php';
require_once 'config/db.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_POST['action'] ?? '';
$conn = getConnection();

/*
|--------------------------------------------------------------------------
| AGREGAR SITIO
|--------------------------------------------------------------------------
*/
if ($action === 'agregar') {

    /*
    |--------------------------------------------------------------------------
    | CATEGORÍA
    |--------------------------------------------------------------------------
    | Se captura directamente desde POST sin valores por defecto
    | para no sobreescribir la selección del usuario.
    |--------------------------------------------------------------------------
    */
    $categoria = trim($_POST['categoria'] ?? '');

    $categoriasValidas = ['personal', 'fijo'];

    if (!in_array($categoria, $categoriasValidas, true)) {

        http_response_code(400);

        ob_clean();

        echo json_encode([
            'ok'  => false,
            'msg' => 'Categoría inválida.'
        ]);

        exit;
    }

    $nombre = trim($_POST['nombre'] ?? '');
    $url    = trim($_POST['url'] ?? '');
    $icono  = trim($_POST['icono'] ?? '🌐');

    /*
    |--------------------------------------------------------------------------
    | VALIDACIONES
    |--------------------------------------------------------------------------
    */
    if ($nombre === '' || $url === '') {

        http_response_code(400);

        ob_clean();

        echo json_encode([
            'ok'  => false,
            'msg' => 'Nombre y URL son obligatorios.'
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZAR URL
    |--------------------------------------------------------------------------
    */
    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'https://' . $url;
    }

    /*
    |--------------------------------------------------------------------------
    | INSERTAR EN BASE DE DATOS
    |--------------------------------------------------------------------------
    */
    try {

        $categoria = $_POST['categoria'];

        $stmt = $conn->prepare("
            INSERT INTO sitios (
                nombre,
                url,
                icono,
                categoria
            ) VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([
            $nombre,
            $url,
            $icono,
            $categoria
        ]);

        $id = (int)$conn->lastInsertId();

        ob_clean();

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA DIFERENCIADA SEGÚN CATEGORÍA
        |--------------------------------------------------------------------------
        | fijo:
        |   El frontend debe redirigir a index.php
        |
        | personal:
        |   El frontend inserta la tarjeta dinámicamente
        |--------------------------------------------------------------------------
        */
        if ($categoria === 'fijo') {

            echo json_encode([
                'ok'       => true,
                'redirect' => true,
                'location' => 'index.php',
                'msg'      => 'Sitio fijo agregado correctamente.'
            ]);

        } else {

            echo json_encode([
                'ok'       => true,
                'redirect' => false,
                'msg'      => 'Sitio personal agregado correctamente.',
                'data'     => [
                    'id'        => $id,
                    'nombre'    => $nombre,
                    'url'       => $url,
                    'icono'     => $icono,
                    'categoria' => $categoria
                ]
            ]);
        }

    } catch (PDOException $e) {

        http_response_code(500);

        ob_clean();

        echo json_encode([
            'ok'    => false,
            'msg'   => 'Error al guardar el sitio.',
            'error' => $e->getMessage()
        ]);
    }

    exit;
}

/*
|--------------------------------------------------------------------------
| ELIMINAR SITIO
|--------------------------------------------------------------------------
*/
if ($action === 'eliminar') {

    $id = (int)($_POST['id'] ?? 0);

    if ($id <= 0) {

        http_response_code(400);

        ob_clean();

        echo json_encode([
            'ok'  => false,
            'msg' => 'ID inválido.'
        ]);

        exit;
    }

    try {

        $stmt = $conn->prepare("
            DELETE FROM sitios
            WHERE id = :id
        ");

        $stmt->execute([
            ':id' => $id
        ]);

        ob_clean();

        echo json_encode([
            'ok'  => true,
            'msg' => 'Sitio eliminado correctamente.',
            'id'  => $id
        ]);

    } catch (PDOException $e) {

        http_response_code(500);

        ob_clean();

        echo json_encode([
            'ok'    => false,
            'msg'   => 'Error al eliminar el sitio.',
            'error' => $e->getMessage()
        ]);
    }

    exit;
}

/*
|--------------------------------------------------------------------------
| ACCIÓN INVÁLIDA
|--------------------------------------------------------------------------
*/
http_response_code(400);

ob_clean();

echo json_encode([
    'ok'  => false,
    'msg' => 'Acción no reconocida.'
]);