// js/sitios.js

// --- NAVEGACIÓN ---
function showSection(sectionId) {
    document.getElementById('main-selection').style.display = 'none';
    const section = document.getElementById(sectionId);
    section.style.display = 'block';
    // Animación de entrada
    section.style.opacity = 0;
    setTimeout(() => {
        section.style.transition = "opacity 0.4s";
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
    // Limpiar campos
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-url').value = '';
    document.getElementById('input-icono').value = '';
    document.getElementById('form-error').style.display = 'none';
}

// Cerrar al hacer clic fuera o presionar Escape
document.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') cerrarModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModal();
        if (typeof cerrarNotas === 'function') cerrarNotas(); // Integración con notas.php
    }
});

// --- OPERACIONES API ---
function agregarSitio() {
    const categoria = document.getElementById('input-categoria').value;
    const nombre = document.getElementById('input-nombre').value.trim();
    let url = document.getElementById('input-url').value.trim();
    let icono = document.getElementById('input-icono').value.trim();
    const error = document.getElementById('form-error');

    if (!nombre || !url) {
        error.textContent = 'Nombre y URL son obligatorios.';
        error.style.display = 'block';
        return;
    }

    // Asegurar protocolo HTTPS
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    // Lógica de Logos Automáticos (Favicon API de Google)
    if (!icono) {
        if (url.includes('youtube.com')) {
            icono = 'https://www.google.com/s2/favicons?sz=64&domain=youtube.com';
        } else if (url.includes('github.com')) {
            icono = 'https://www.google.com/s2/favicons?sz=64&domain=github.com';
        } else if (url.includes('stackoverflow.com')) {
            icono = 'https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com';
        } else {
            icono = '🌐';
        }
    }

    const fd = new FormData();
    fd.append('action', 'agregar');
    fd.append('categoria', categoria);
    fd.append('nombre', nombre);
    fd.append('url', url);
    fd.append('icono', icono);

    fetch('sitios.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                location.reload(); 
            } else {
                error.textContent = data.msg;
                error.style.display = 'block';
            }
        })
        .catch(err => {
            console.error("Error al agregar:", err);
            error.textContent = "Error de conexión al servidor.";
            error.style.display = 'block';
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
                location.reload();
            }
        });
}