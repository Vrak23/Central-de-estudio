function showSection(sectionId) {
    document.getElementById('main-selection').style.display = 'none';
    const section = document.getElementById(sectionId);
    section.style.display = 'block';
    // Añadimos una pequeña animación de entrada
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