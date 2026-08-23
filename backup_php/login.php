<?php
session_start();

if (isset($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/config/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Por favor, complete todos los campos.';
    } else {
        try {
            $conn = getConnection();
            $sql  = "SELECT id, nombres, apellidos, password, estado FROM usuarios WHERE email = :email LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':email' => $email]);
            $usuario = $stmt->fetch();

            if ($usuario && password_verify($password, $usuario['password'])) {
                if ($usuario['estado'] == 1) {
                    $_SESSION['usuario_id']     = $usuario['id'];
                    $_SESSION['usuario_nombre'] = $usuario['nombres'] . ' ' . $usuario['apellidos'];
                    $_SESSION['usuario_email']  = $email;
                    session_write_close();
                    header('Location: index.php');
                    exit;
                } else {
                    $error = 'Su cuenta está desactivada. Contacte al administrador.';
                }
            } else {
                $error = 'Email o contraseña incorrectos.';
            }
        } catch (PDOException $e) {
            error_log("Error en login: " . $e->getMessage());
            $error = 'Ocurrió un error. Por favor, intente nuevamente.';
        }
    }
}
?>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.login-form');
    const btn = document.getElementById('btn-login');
    const btnText = btn ? btn.querySelector('.btn-text') : null;

    if (!form || !btn) return;

    form.addEventListener('submit', function () {
        btn.classList.add('loading');
        btn.disabled = true;
        if (btnText) {
            btnText.textContent = 'Ingresando...';
        }
    });
});
</script>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Central Hub</title>
    <link rel="stylesheet" href="style/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body class="login-page">
    <div class="login-wrapper">
        <div class="login-container">
            <h2 class="login-title">CENTRAL HUB</h2>
            <p class="login-subtitle">Inicia sesión para continuar</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-error">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="login.php" class="login-form">
                
                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email"
                        value="<?php echo htmlspecialchars($email ?? ''); ?>"
                        placeholder="ejemplo@correo.com"
                        required autofocus>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password"
                        placeholder="••••••••"
                        required>
                </div>

                <button type="submit" class="btn-primary" id="btn-login">
                    <span class="spinner"></span>
                    <span class="btn-text">Ingresar</span>
                </button>

            </form>
        </div>
    </div>
</body>
</html>