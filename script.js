// Esperamos a que el DOM esté totalmente cargado
document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // 0. NAVEGACIÓN RESPONSIVA (Cierre automático en móvil)
    // =======================================================
    const navLinks = document.querySelectorAll('.custom-navbar .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
                    bsCollapse.hide();
                }
            });
        });
    }

    // =======================================================
    // 1. MODO OSCURO / MODO CLARO (Ejemplo 1 del DOM)
    // =======================================================
    const themeBtn = document.getElementById('themeBtn');
    const bodyElement = document.body;

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            // Alternamos la clase CSS en el body usando classList.toggle
            bodyElement.classList.toggle('light-mode');

            // Actualizamos la etiqueta e icono del botón mediante el DOM
            const customNavbar = document.querySelector('.custom-navbar');
            if (bodyElement.classList.contains('light-mode')) {
                themeBtn.innerHTML = '<i class="fa-solid fa-sun me-1"></i> Modo Oscuro';
                themeBtn.classList.replace('btn-outline-warning', 'btn-outline-dark');
                if (customNavbar) customNavbar.classList.replace('navbar-dark', 'navbar-light');
            } else {
                themeBtn.innerHTML = '<i class="fa-solid fa-moon me-1"></i> Modo Claro';
                themeBtn.classList.replace('btn-outline-dark', 'btn-outline-warning');
                if (customNavbar) customNavbar.classList.replace('navbar-light', 'navbar-dark');
            }
        });
    }

    // =======================================================
    // 2. FILTRADO DE JUEGOS CON dataset (Ejemplo 2 del DOM)
    // =======================================================
    const filterButtons = document.querySelectorAll('.btn-filter');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const categoria = e.target.getAttribute('data-filter');
            
            // Actualizamos visualmente el botón activo
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Seleccionamos todas las tarjetas usando querySelectorAll
            const tarjetas = document.querySelectorAll('.card-juego');

            tarjetas.forEach(card => {
                const catCard = card.dataset.categoria;
                // Manipulamos la propiedad style.display directamente en el DOM
                if (categoria === 'todos' || catCard === categoria) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // =======================================================
    // TRÁILER DE JUEGOS EN MODAL (Sin autoplay)
    // =======================================================
    const modalTrailer = document.getElementById('modalTrailer');
    if (modalTrailer) {
        const iframeTrailer = document.getElementById('iframeTrailer');
        const modalTitle = document.getElementById('modalTrailerLabel');

        modalTrailer.addEventListener('show.bs.modal', (event) => {
            // Botón o tarjeta que activó el modal
            const card = event.relatedTarget;
            const videoUrl = card.getAttribute('data-video');
            const titulo = card.getAttribute('data-titulo');

            // Actualizamos el título y la URL del iframe (sin autoplay)
            modalTitle.textContent = "Tráiler: " + titulo;
            iframeTrailer.src = videoUrl;
        });

        // Al cerrar el modal, limpiamos el src para detener el audio/video por completo
        modalTrailer.addEventListener('hidden.bs.modal', () => {
            iframeTrailer.src = "";
        });
    }

    // =======================================================
    // 3. FILTRADO DE MÚSICA CON dataset (Lógica aplicada al nuevo filtro)
    // =======================================================
    const musicFilterButtons = document.querySelectorAll('.btn-filter-music');

    musicFilterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const genero = e.target.getAttribute('data-filter-music');

            // Actualizamos visualmente el botón activo en música
            musicFilterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Seleccionamos todas las filas de música
            const itemsMusica = document.querySelectorAll('.music-item');

            itemsMusica.forEach(row => {
                const genRow = row.dataset.genero;
                // Manipulamos style.display para mostrar u ocultar según el género
                if (genero === 'todos' || genRow === genero) {
                    row.style.display = ''; // Restaura el display original de la tabla
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // =======================================================
    // 4. VALIDACIÓN Y GESTIÓN DINÁMICA DE COMENTARIOS (DOM)
    // =======================================================
    const form = document.getElementById('contactForm');
    const nombreInput = document.getElementById('nombre');
    const mensajeInput = document.getElementById('mensaje');
    const categoriaSelect = document.getElementById('categoriaComentario');
    const alertaBox = document.getElementById('alertaBox');
    const listaComentarios = document.getElementById('listaComentarios');
    const contadorComentarios = document.getElementById('contadorComentarios');

    let totalComentarios = 0;

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Detiene la recarga automática de la página

            const nombreVal = nombreInput.value.trim();
            const mensajeVal = mensajeInput.value.trim();
            const categoriaVal = categoriaSelect.value;

            // Validación estricta de campos vacíos
            if (nombreVal === "" || mensajeVal === "") {
                alertaBox.innerHTML = '<div class="msg-error"><i class="fa-solid fa-circle-exclamation me-2"></i>Por favor, completa todos los campos obligatorios.</div>';
                return;
            }

            // Limpiamos la alerta de error si todo está correcto
            alertaBox.innerHTML = '<div class="msg-exito"><i class="fa-solid fa-circle-check me-2"></i>¡Comentario publicado con éxito!</div>';

            // Incrementamos contador
            totalComentarios++;
            contadorComentarios.textContent = totalComentarios;

            // Obtenemos la fecha actual formateada
            const fechaActual = new Date().toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Creamos dinámicamente el elemento contenedor del comentario con clase comment-card
            const nuevaTarjeta = document.createElement('div');
            nuevaTarjeta.className = 'p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary shadow-sm comment-card';
            
            // Definimos el color del badge según la categoría seleccionada
            let badgeColor = 'bg-info text-dark';
            if (categoriaVal === 'Felicitación') badgeColor = 'bg-success text-white';
            if (categoriaVal === 'Sugerencia') badgeColor = 'bg-warning text-dark';

            // Inyectamos la estructura interna usando template literals
            nuevaTarjeta.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                    <span class="fw-bold text-warning"><i class="fa-solid fa-user-circle me-1"></i> ${escapeHtml(nombreVal)}</span>
                    <div>
                        <span class="badge ${badgeColor} me-2">${categoriaVal}</span>
                        <small class="text-muted" style="font-size: 0.75rem;">${fechaActual}</small>
                    </div>
                </div>
                <p class="mb-0 text-light" style="font-size: 0.95rem; word-break: break-word;">${escapeHtml(mensajeVal)}</p>
            `;

            // Agregamos el comentario al principio de la lista (prepend) o al final (append)
            listaComentarios.prepend(nuevaTarjeta);

            // Reseteamos los campos del formulario
            nombreInput.value = "";
            mensajeInput.value = "";
            categoriaSelect.selectedIndex = 0;
        });
    }

    // Función auxiliar de seguridad para evitar inyecciones HTML (XSS básico en prácticas de DOM)
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});
