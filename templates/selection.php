<div class="container">
    <!-- PANTALLA DE SELECCIÓN INICIAL -->
    <div class="selection-screen" id="main-selection">
        <h2 style="text-align: center; color: var(--text-dim); margin-bottom: 2rem; border: none;">
            ¿A dónde vamos hoy, <?php echo isset($_SESSION['usuario_nombre']) ? htmlspecialchars(explode(' ', $_SESSION['usuario_nombre'])[0]) : 'Usuario'; ?>?
        </h2>
        <div class="grid-selection">
            <div class="selection-card" onclick="showSection('senati-section')">
                <div class="icon">🎓</div>
                <h3>Portales SENATI</h3>
                <p>Blackboard, GitHub, Drive y tus sitios.</p>
            </div>
            <div class="selection-card" onclick="showSection('local-section')">
                <div class="icon">💻</div>
                <h3>Laboratorio Local</h3>
                <p>Gestión de Bases de Datos y Proyectos PHP.</p>
            </div>
        </div>
    </div>

    <!-- SECCIÓN DE PORTALES -->
    <div id="senati-section" class="content-section" style="display:none;">
        <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
            <button onclick="hideSections()" class="back-btn">← Volver al Menú</button>
            <button onclick="abrirModal()" class="add-btn">+ Agregar sitio</button>
        </div>

        <h2>PORTALES FIJOS</h2>
        <div class="grid">
            <a href="https://senati.blackboard.com/" target="_blank" class="card">
                <div class="card-logo"><img src="img/blackboard_logo.png" alt="Blackboard"></div>
                <div class="card-title">Blackboard</div>
                <p>Entregables y clases de SENATI.</p>
            </a>
            <a href="https://github.com" target="_blank" class="card">
                <div class="card-logo"><img src="img/github_logo.png" alt="GitHub"></div>
                <div class="card-title">GitHub</div>
                <p>Repositorios de código.</p>
            </a>
            <a href="https://drive.google.com" target="_blank" class="card">
                <div class="card-logo"><img src="img/drive_logo.png" alt="Google Drive"></div>
                <div class="card-title">Google Drive</div>
                <p>Documentación y archivos.</p>
            </a>
            <a href="https://outlook.cloud.microsoft/mail/" target="_blank" class="card">
                <div class="card-logo">
                    <img src="img/outlook_logo.png" alt="Outlook"
                         onerror="this.src='https://cdn-icons-png.flaticon.com/512/732/732200.png'">
                </div>
                <div class="card-title">Outlook</div>
                <p>Correo institucional.</p>
            </a>
        </div>

        <h2 style="margin-top:2rem;">MIS SITIOS</h2>
        <div class="grid" id="grid-sitios">
            <?php if (!empty($sitios)): ?>
                <?php foreach ($sitios as $sitio): ?>
                    <div class="card card-custom" id="sitio-<?php echo $sitio['id']; ?>">
                        <button class="btn-eliminar" onclick="eliminarSitio(<?php echo $sitio['id']; ?>)" title="Eliminar">✕</button>
                        <a href="<?php echo htmlspecialchars($sitio['url']); ?>" target="_blank" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; align-items:center; flex:1; justify-content:center;">
                            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;"><?php echo htmlspecialchars($sitio['icono']); ?></div>
                            <div class="card-title"><?php echo htmlspecialchars($sitio['nombre']); ?></div>
                            <p style="font-size:0.78rem; color:var(--text-dim); word-break:break-all;"><?php echo htmlspecialchars($sitio['url']); ?></p>
                        </a>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p id="sin-sitios" style="color: var(--text-dim);">Aún no tienes sitios guardados. Agrega uno con el botón de arriba.</p>
            <?php endif; ?>
        </div>
    </div>

    <!-- SECCIÓN LOCAL -->
    <div id="local-section" class="content-section" style="display:none;">
        <div style="margin-bottom: 1.5rem;">
            <button onclick="hideSections()" class="back-btn">← Volver al Menú</button>
        </div>
        <h2>LABORATORIO LOCAL</h2>
        <div class="grid">
            <?php if (!empty($my_projects)): ?>
                <?php foreach ($my_projects as $db): ?>
                    <div class="card">
                        <div class="card-type">Base de Datos</div>
                        <div class="card-title"><?php echo htmlspecialchars($db); ?></div>
                        <span class="db-badge">MySQL</span>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p style="color: var(--text-dim);">No se encontraron proyectos locales.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- MODAL AGREGAR SITIO -->
<div id="modal-overlay" style="display:none;">
    <div id="modal-box">
        <h3>Agregar nuevo sitio</h3>

        <div class="modal-field">
            <label>Ícono (emoji)</label>
            <input type="text" id="input-icono" placeholder="🌐" maxlength="4">
        </div>
        <div class="modal-field">
    <label>Categoría</label>
    <select id="input-categoria" style="width: 100%; background: #0f1115; border: 1px solid #2d3748; color: var(--text-main); padding: 10px; border-radius: 8px;">
        <option value="personal">Mis Sitios</option>
        <option value="fijo">Portales Fijos</option>
    </select>
</div>
        <div class="modal-field">
            <label>Nombre</label>
            <input type="text" id="input-nombre" placeholder="Ej: Moodle">
        </div>
        <div class="modal-field">
            <label>URL</label>
            <input type="text" id="input-url" placeholder="Ej: https://moodle.senati.edu.pe">
        </div>

        <p id="form-error" style="color:#ef4444; font-size:0.85rem; margin-top:0.5rem; display:none;"></p>

        <div class="modal-actions">
            <button onclick="agregarSitio()" class="btn-guardar">Guardar</button>
            <button onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
        </div>
    </div>
</div>

<style>
/* MODAL */
#modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
}

#modal-box {
    background: var(--card-bg);
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    animation: slideUp 0.25s ease;
}

#modal-box h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    color: var(--text-main);
    border-left: 4px solid var(--accent-color);
    padding-left: 10px;
}

.modal-field {
    margin-bottom: 1rem;
}

.modal-field label {
    display: block;
    font-size: 0.82rem;
    color: var(--text-dim);
    margin-bottom: 5px;
}

.modal-field input {
    width: 100%;
    box-sizing: border-box;
    background: #0f1115;
    border: 1px solid #2d3748;
    color: var(--text-main);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
}

.modal-field input:focus {
    border-color: var(--accent-color);
}

#input-icono {
    width: 70px !important;
    font-size: 1.3rem;
    text-align: center;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.btn-guardar {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: background 0.2s;
}
.btn-guardar:hover { background: #2563eb; }

.btn-cancelar {
    background: transparent;
    color: var(--text-dim);
    border: 1px solid #2d3748;
    padding: 10px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
}
.btn-cancelar:hover { color: var(--text-main); border-color: #4a5568; }

/* BOTONES GENERALES */
.add-btn {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}
.add-btn:hover { background: #2563eb; }

.card-custom { position: relative; }

.btn-eliminar {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    color: #4a5568;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
    z-index: 1;
}
.btn-eliminar:hover {
    color: #ef4444;
    background: rgba(239,68,68,0.1);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
}
</style>

<script>
function abrirModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
    setTimeout(() => document.getElementById('input-nombre').focus(), 100);
}

function cerrarModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-url').value = '';
    document.getElementById('input-icono').value = '';
    document.getElementById('form-error').style.display = 'none';
}

// Cerrar al hacer clic fuera del modal
document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
});

// Cerrar con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarModal();
});

function agregarSitio() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const url    = document.getElementById('input-url').value.trim();
    const icono  = document.getElementById('input-icono').value.trim() || '🌐';
    const error  = document.getElementById('form-error');

    if (!nombre || !url) {
        error.textContent = 'Nombre y URL son obligatorios.';
        error.style.display = 'block';
        return;
    }
    error.style.display = 'none';

    const fd = new FormData();
    fd.append('action', 'agregar');
    fd.append('nombre', nombre);
    fd.append('url', url);
    fd.append('icono', icono);

    fetch('sitios.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                const sinSitios = document.getElementById('sin-sitios');
                if (sinSitios) sinSitios.remove();

                const grid = document.getElementById('grid-sitios');
                const div = document.createElement('div');
                div.className = 'card card-custom';
                div.id = 'sitio-' + data.id;
                div.innerHTML = `
                    <button class="btn-eliminar" onclick="eliminarSitio(${data.id})" title="Eliminar">✕</button>
                    <a href="${data.url}" target="_blank" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; align-items:center; flex:1; justify-content:center;">
                        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">${data.icono}</div>
                        <div class="card-title">${data.nombre}</div>
                        <p style="font-size:0.78rem; color:var(--text-dim); word-break:break-all;">${data.url}</p>
                    </a>`;
                grid.appendChild(div);
                cerrarModal();
            } else {
                error.textContent = data.msg;
                error.style.display = 'block';
            }
        });
}

function eliminarSitio(id) {
    if (!confirm('¿Eliminar este sitio?')) return;

    const fd = new FormData();
    fd.append('action', 'eliminar');
    fd.append('id', id);

    fetch('sitios.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                document.getElementById('sitio-' + id).remove();
                const grid = document.getElementById('grid-sitios');
                if (grid.children.length === 0) {
                    grid.innerHTML = '<p id="sin-sitios" style="color: var(--text-dim);">Aún no tienes sitios guardados.</p>';
                }
            }
        });
}
</script>