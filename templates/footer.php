<footer>
    <p>CENTRAL HUB &copy; <?php echo date('Y'); ?> • Rodrigo</p>
</footer>

<!-- Carga de Scripts -->
<script src="js/navigation.js"></script> <!-- Tu script de notas -->
<script src="js/sitios.js"></script>    <!-- El nuevo script de sitios -->

<style>
/* BOTÓN NOTAS EN HEADER */
#btn-notas {
    background: transparent;
    border: 1px solid #2d3748;
    color: var(--text-main);
    font-size: 1.2rem;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}
#btn-notas:hover {
    border-color: var(--accent-color);
    background: rgba(59,130,246,0.1);
}

/* OVERLAY */
#notas-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(2px);
    z-index: 900;
}

/* PANEL LATERAL */
#notas-panel {
    position: fixed;
    top: 0;
    right: -420px;
    width: 400px;
    height: 100vh;
    background: var(--card-bg);
    border-left: 1px solid #2d3748;
    z-index: 901;
    display: flex;
    flex-direction: column;
    transition: right 0.3s ease;
    overflow: hidden;
}
#notas-panel.abierto { right: 0; }

#notas-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid #2d3748;
    font-weight: 600;
    font-size: 1rem;
}

#notas-close {
    background: transparent;
    border: none;
    color: var(--text-dim);
    font-size: 1rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.2s;
}
#notas-close:hover { color: #ef4444; }

/* FORMULARIO */
#notas-form {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #2d3748;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

#notas-form input,
#notas-form textarea {
    background: #0f1115;
    border: 1px solid #2d3748;
    color: var(--text-main);
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;
}
#notas-form input:focus,
#notas-form textarea:focus { border-color: var(--accent-color); }

.nota-btn-guardar {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 7px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.2s;
}
.nota-btn-guardar:hover { background: #2563eb; }

.nota-btn-limpiar {
    background: transparent;
    color: var(--text-dim);
    border: 1px solid #2d3748;
    padding: 7px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}
.nota-btn-limpiar:hover { color: var(--text-main); border-color: #4a5568; }

/* LISTA */
#notas-lista {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem;
}

.nota-categoria-titulo {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--accent-color);
    margin: 1rem 0 0.5rem 0;
    font-weight: 600;
}

.nota-item {
    background: #0f1115;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    position: relative;
}

.nota-item-titulo {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    padding-right: 1.5rem;
}

.nota-item-contenido {
    font-size: 0.82rem;
    color: var(--text-dim);
    line-height: 1.4;
    white-space: pre-wrap;
    outline: none;
}

.nota-item-contenido:focus {
    color: var(--text-main);
    border-bottom: 1px dashed var(--accent-color);
}

.nota-item-fecha {
    font-size: 0.72rem;
    color: #4a5568;
    margin-top: 0.4rem;
}

.nota-eliminar {
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    color: #4a5568;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 3px;
    transition: color 0.2s;
}
.nota-eliminar:hover { color: #ef4444; }
</style>

<script>
// ── PANEL DE NOTAS ──────────────────────────────────────────

function abrirNotas() {
    document.getElementById('notas-overlay').style.display = 'block';
    document.getElementById('notas-panel').classList.add('abierto');
    cargarNotas();
}

function cerrarNotas() {
    document.getElementById('notas-overlay').style.display = 'none';
    document.getElementById('notas-panel').classList.remove('abierto');
}

function limpiarFormNota() {
    document.getElementById('nota-categoria').value = '';
    document.getElementById('nota-titulo').value = '';
    document.getElementById('nota-contenido').value = '';
    document.getElementById('nota-error').style.display = 'none';
}

function cargarNotas() {
    fetch('notas.php?action=listar')
        .then(r => r.json())
        .then(data => {
            const lista = document.getElementById('notas-lista');
            if (!data.ok || data.notas.length === 0) {
                lista.innerHTML = '<p style="color:var(--text-dim); font-size:0.85rem; text-align:center; padding:1rem;">No hay notas aún.</p>';
                return;
            }

            // Agrupar por categoría
            const grupos = {};
            data.notas.forEach(n => {
                if (!grupos[n.categoria]) grupos[n.categoria] = [];
                grupos[n.categoria].push(n);
            });

            let html = '';
            for (const cat in grupos) {
                html += `<div class="nota-categoria-titulo">📁 ${cat}</div>`;
                grupos[cat].forEach(n => {
                    html += `
                    <div class="nota-item" id="nota-${n.id}">
                        <button class="nota-eliminar" onclick="eliminarNota(${n.id})" title="Eliminar">✕</button>
                        <div class="nota-item-titulo">${n.titulo}</div>
                        <div class="nota-item-contenido" 
                             contenteditable="true"
                             onblur="guardarEdicion(${n.id}, this)"
                             data-original="${n.contenido.replace(/"/g, '&quot;')}"
                        >${n.contenido || '<span style="color:#4a5568">Sin contenido</span>'}</div>
                        <div class="nota-item-fecha">${n.updated_at}</div>
                    </div>`;
                });
            }
            lista.innerHTML = html;
        });
}

function agregarNota() {
    const categoria = document.getElementById('nota-categoria').value.trim();
    const titulo    = document.getElementById('nota-titulo').value.trim();
    const contenido = document.getElementById('nota-contenido').value.trim();
    const error     = document.getElementById('nota-error');

    if (!categoria || !titulo) {
        error.textContent = 'Categoría y título son obligatorios.';
        error.style.display = 'block';
        return;
    }
    error.style.display = 'none';

    const fd = new FormData();
    fd.append('action', 'agregar');
    fd.append('categoria', categoria);
    fd.append('titulo', titulo);
    fd.append('contenido', contenido);

    fetch('notas.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                limpiarFormNota();
                cargarNotas();
            } else {
                error.textContent = data.msg;
                error.style.display = 'block';
            }
        });
}

function guardarEdicion(id, el) {
    const contenido = el.innerText.trim();
    const fd = new FormData();
    fd.append('action', 'editar');
    fd.append('id', id);
    fd.append('contenido', contenido);
    fetch('notas.php', { method: 'POST', body: fd });
}

function eliminarNota(id) {
    if (!confirm('¿Eliminar esta nota?')) return;
    const fd = new FormData();
    fd.append('action', 'eliminar');
    fd.append('id', id);
    fetch('notas.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                document.getElementById('nota-' + id).remove();
            }
        });
}

// Cerrar con Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarNotas();
});
</script>

</body>
</html>