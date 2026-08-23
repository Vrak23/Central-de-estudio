// js/sitios.js

// --- NAVEGACIÓN ---
function showSection(sectionId) {
    document.getElementById('main-selection').style.display = 'none';
    const section = document.getElementById(sectionId);
    section.style.display = 'block';
    section.style.opacity = 0;
    setTimeout(() => {
        section.style.transition = 'opacity 0.4s';
        section.style.opacity = 1;
    }, 10);
}

function hideSections() {
    document.getElementById('main-selection').style.display = 'block';
    document.getElementById('senati-section').style.display = 'none';
    document.getElementById('local-section').style.display = 'none';
}

// --- GESTIÓN DE MODAL ---
function abrirModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('input-nombre').focus(), 100);
}

function cerrarModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('input-nombre').value    = '';
    document.getElementById('input-url').value       = '';
    document.getElementById('input-icono').value     = '';
    document.getElementById('input-categoria').value = 'personal';
    document.getElementById('form-error').style.display = 'none';
}

// Cerrar al hacer clic fuera o presionar Escape
document.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') cerrarModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModal();
        if (typeof cerrarNotas === 'function') cerrarNotas();
    }
});

// --- HELPERS ---

/**
 * Devuelve un icono/favicon automático si el campo queda vacío.
 */
function resolverIcono(url, iconoIngresado) {
    if (iconoIngresado) return iconoIngresado;

    const dominios = [
        { match: 'youtube.com',       favicon: 'youtube.com' },
        { match: 'github.com',        favicon: 'github.com' },
        { match: 'stackoverflow.com', favicon: 'stackoverflow.com' },
    ];

    for (const d of dominios) {
        if (url.includes(d.match)) {
            return `https://www.google.com/s2/favicons?sz=64&domain=${d.favicon}`;
        }
    }

    return '🌐';
}

/**
 * Inserta una tarjeta en #grid-sitios con los datos confirmados por el servidor.
 * Solo debe llamarse cuando la categoría es 'personal' y data.data existe.
 *
 * @param {Object} data  - Respuesta JSON del servidor: { ok, data: { id, nombre, url, icono, categoria } }
 */
function insertarTarjeta(data) {
    const grid = document.getElementById('grid-sitios');
    if (!grid) return;

    const sinSitios = document.getElementById('sin-sitios');
    if (sinSitios) sinSitios.remove();

    const card = document.createElement('div');
    card.className = 'card card-custom';
    card.id = 'sitio-' + data.data.id;
    card.innerHTML = `
        <button class="btn-eliminar" onclick="eliminarSitio(${data.data.id})" title="Eliminar">✕</button>
        <a href="${data.data.url}" target="_blank"
           style="text-decoration:none; color:inherit; display:flex; flex-direction:column; align-items:center; flex:1; justify-content:center;">
            <div style="font-size:2.5rem; margin-bottom:0.75rem;">${data.data.icono}</div>
            <div class="card-title">${data.data.nombre}</div>
            <p style="font-size:0.78rem; color:var(--text-dim); word-break:break-all;">${data.data.url}</p>
        </a>`;

    grid.appendChild(card);
}

// --- OPERACIONES API ---

function agregarSitio() {
    // Capturar valor del <select name="categoria" id="input-categoria">
    const categoria  = document.getElementById('input-categoria').value; // 'personal' | 'fijo'
    const nombre     = document.getElementById('input-nombre').value.trim();
    let   url        = document.getElementById('input-url').value.trim();
    const iconoRaw   = document.getElementById('input-icono').value.trim();
    const errorEl    = document.getElementById('form-error');
    const btnGuardar = document.querySelector('.btn-guardar');

    // Validación en cliente
    if (!nombre || !url) {
        errorEl.textContent = 'Nombre y URL son obligatorios.';
        errorEl.style.display = 'block';
        return;
    }

    // Normalizar URL
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    const icono = resolverIcono(url, iconoRaw);

    errorEl.style.display = 'none';

    // Estado de carga
    btnGuardar.disabled    = true;
    btnGuardar.textContent = 'Guardando…';

    // ── DEBUG: confirmar captura correcta antes de enviar ──
    console.log('Enviando categoria:', categoria);

    const fd = new FormData();
    fd.append('action',    'agregar');
    fd.append('categoria', categoria);
    fd.append('nombre',    nombre);
    fd.append('url',       url);
    fd.append('icono',     icono);

    fetch('sitios.php', { method: 'POST', body: fd })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(data => {
            if (!data.ok) {
                // El servidor reportó un error — mostrarlo y no hacer nada más
                errorEl.textContent = data.msg || 'Error desconocido.';
                errorEl.style.display = 'block';
                return;
            }

            // ── Éxito: bifurcar por la categoría capturada en el closure ──
            // Se usa `categoria` (local, segura) en lugar de data.data.categoria
            // para evitar el TypeError si el servidor no devuelve el objeto data.
            if (categoria === 'fijo') {
                // Portales fijos se renderizan desde PHP → recargar
                window.location.href = 'index.php';
                return;
            }

            // categoria === 'personal': insertar tarjeta dinámicamente
            // Aquí sí es seguro acceder a data.data porque el servidor lo devuelve
            // solo cuando ok === true y la inserción fue exitosa.
            if (data.data) {
                insertarTarjeta(data);
            } else {
                // Fallback defensivo: si data.data falta, recargar igualmente
                console.warn('data.data ausente en respuesta del servidor:', data);
                window.location.href = 'index.php';
                return;
            }

            cerrarModal();
        })
        .catch(err => {
            console.error('Error al agregar sitio:', err);
            errorEl.textContent = 'Error de conexión al servidor.';
            errorEl.style.display = 'block';
        })
        .finally(() => {
            btnGuardar.disabled    = false;
            btnGuardar.textContent = 'Guardar';
        });
}

function eliminarSitio(id) {
    if (!confirm('¿Eliminar este sitio?')) return;

    const fd = new FormData();
    fd.append('action', 'eliminar');
    fd.append('id', id);

    fetch('sitios.php', { method: 'POST', body: fd })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(data => {
            if (data.ok) {
                const card = document.getElementById('sitio-' + id);
                if (card) card.remove();

                // Mostrar mensaje si el grid quedó vacío
                const grid = document.getElementById('grid-sitios');
                if (grid && grid.querySelectorAll('.card-custom').length === 0) {
                    grid.innerHTML = '<p id="sin-sitios" style="color:var(--text-dim);">Aún no tienes sitios guardados. Agrega uno con el botón de arriba.</p>';
                }
            } else {
                alert(data.msg || 'No se pudo eliminar el sitio.');
            }
        })
        .catch(err => {
            console.error('Error al eliminar sitio:', err);
            alert('Error de conexión al servidor.');
        });
}
