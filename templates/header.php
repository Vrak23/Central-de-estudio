<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CENTRAL HUB</title>
    <link rel="stylesheet" href="style/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body>

<!-- PANEL LATERAL DE NOTAS -->
<div id="notas-overlay" onclick="cerrarNotas()" style="display:none;"></div>
<div id="notas-panel">
    <div id="notas-header">
        <span>📝 Notas</span>
        <button onclick="cerrarNotas()" id="notas-close">✕</button>
    </div>

    <!-- FORMULARIO NUEVA NOTA -->
    <div id="notas-form">
        <input type="text" id="nota-categoria" placeholder="Curso / Categoría (ej: PHP, BD, General)">
        <input type="text" id="nota-titulo" placeholder="Título">
        <textarea id="nota-contenido" placeholder="Contenido de la nota..." rows="3"></textarea>
        <div style="display:flex; gap:0.5rem;">
            <button onclick="agregarNota()" class="nota-btn-guardar">Guardar</button>
            <button onclick="limpiarFormNota()" class="nota-btn-limpiar">Limpiar</button>
        </div>
        <p id="nota-error" style="color:#ef4444; font-size:0.8rem; display:none;"></p>
    </div>

    <!-- LISTA DE NOTAS -->
    <div id="notas-lista">
        <p style="color:var(--text-dim); font-size:0.85rem; text-align:center; padding:1rem;">Cargando notas...</p>
    </div>
</div>

<header>
    <div style="display:flex; align-items:center; justify-content:space-between;">
        <div>
            <?php
                $hora = (int) date('H');
                if ($hora >= 5 && $hora < 12)       $saludo = 'Buenos días';
                elseif ($hora >= 12 && $hora < 19)  $saludo = 'Buenas tardes';
                else                                 $saludo = 'Buenas noches';
                $nombre       = isset($_SESSION['usuario_nombre']) ? htmlspecialchars($_SESSION['usuario_nombre']) : 'Usuario';
                $primer_nombre = explode(' ', $nombre)[0];
            ?>
            <div class="welcome-msg"><?php echo $saludo . ', ' . $primer_nombre; ?></div>
            <h1>CENTRAL HUB</h1>
            <div class="date-time"><?php echo date('l, d F Y | H:i'); ?> • Lima, PE</div>
        </div>
        <div style="display:flex; align-items:center; gap:1rem;">
            <button onclick="abrirNotas()" id="btn-notas" title="Notas">📝</button>
            <a href="logout.php" class="logout-btn">Cerrar Sesión</a>
        </div>
    </div>
</header>