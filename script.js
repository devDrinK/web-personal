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
    // 2. FILTRADO DE JUEGOS CON dataset — Selección múltiple
    // =======================================================
    const filterButtons = document.querySelectorAll('.btn-filter');
    // Conjunto de categorías activas (vacío = mostrar todas)
    let activeCategorias = new Set();

    /** Aplica el filtro a las tarjetas según las categorías activas */
    function applyGameFilter() {
        const tarjetas = document.querySelectorAll('.card-juego');
        tarjetas.forEach(card => {
            if (activeCategorias.size === 0) {
                card.style.display = '';
            } else {
                card.style.display = activeCategorias.has(card.dataset.categoria) ? '' : 'none';
            }
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.getAttribute('data-filter');
            const todosBtn = document.querySelector('.btn-filter[data-filter="todos"]');

            if (categoria === 'todos') {
                // Resetear toda selección
                activeCategorias.clear();
                filterButtons.forEach(b => b.classList.remove('active'));
                if (todosBtn) todosBtn.classList.add('active');
            } else {
                // Desactivar "Ver Todos" si estaba activo
                if (todosBtn) todosBtn.classList.remove('active');

                // Toggle de esta categoría
                if (activeCategorias.has(categoria)) {
                    activeCategorias.delete(categoria);
                    btn.classList.remove('active');
                } else {
                    activeCategorias.add(categoria);
                    btn.classList.add('active');
                }

                // Si no queda ninguna categoría seleccionada, volver a "Ver Todos"
                if (activeCategorias.size === 0 && todosBtn) {
                    todosBtn.classList.add('active');
                }
            }

            applyGameFilter();
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
    // 3. FILTRADO DE MÚSICA CON dataset — Selección múltiple
    // =======================================================
    const musicFilterButtons = document.querySelectorAll('.btn-filter-music');
    // Conjunto de géneros activos (vacío = mostrar todos)
    let activeGeneros = new Set();

    /** Aplica el filtro a las filas según los géneros activos */
    function applyMusicFilter() {
        const itemsMusica = document.querySelectorAll('.music-item');
        itemsMusica.forEach(row => {
            if (activeGeneros.size === 0) {
                // Sin selección específica → mostrar todo
                row.style.display = '';
            } else {
                row.style.display = activeGeneros.has(row.dataset.genero) ? '' : 'none';
            }
        });
    }

    musicFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const genero = btn.getAttribute('data-filter-music');
            const todosBtn = document.querySelector('.btn-filter-music[data-filter-music="todos"]');

            if (genero === 'todos') {
                // Resetear toda selección
                activeGeneros.clear();
                musicFilterButtons.forEach(b => b.classList.remove('active'));
                if (todosBtn) todosBtn.classList.add('active');
            } else {
                // Desactivar "Ver Todos" si estaba activo
                if (todosBtn) todosBtn.classList.remove('active');

                // Toggle de este género
                if (activeGeneros.has(genero)) {
                    activeGeneros.delete(genero);
                    btn.classList.remove('active');
                } else {
                    activeGeneros.add(genero);
                    btn.classList.add('active');
                }

                // Si no queda ningún género seleccionado, volver a "Ver Todos"
                if (activeGeneros.size === 0 && todosBtn) {
                    todosBtn.classList.add('active');
                }
            }

            applyMusicFilter();
        });
    });

    // =======================================================
    // 4. VALIDACIÓN Y GESTIÓN DINÁMICA DE COMENTARIOS (DOM)
    // =======================================================
    const form = document.getElementById('contactForm');
    const alertaBox = document.getElementById('alertaBox');
    const listaComentarios = document.getElementById('listaComentarios');
    const contadorComentarios = document.getElementById('contadorComentarios');

    let totalComentarios = 0;

    // --- Helpers de validación ---

    /** Muestra u oculta un error inline bajo cada campo */
    function setError(fieldId, msg) {
        const el = document.getElementById('error-' + fieldId);
        const input = document.getElementById(fieldId);
        if (!el) return;
        el.textContent = msg;
        if (input) {
            if (msg) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        }
    }

    function clearError(fieldId) {
        setError(fieldId, '');
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('is-invalid', 'is-valid');
        }
    }

    /** Valida nombre: solo letras, espacios y tildes; 2–60 caracteres */
    function validarNombre(val) {
        if (!val) return 'El nombre es obligatorio.';
        if (/\d/.test(val)) return 'El nombre no puede contener números.';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-']+$/.test(val)) return 'El nombre solo puede tener letras.';
        if (val.length < 2) return 'El nombre es demasiado corto (mín. 2 caracteres).';
        if (val.length > 60) return 'El nombre es demasiado largo (máx. 60 caracteres).';
        return '';
    }

    /** Valida email: formato RFC básico + TLD mínimo 2 chars */
    function validarEmail(val) {
        if (!val) return 'El correo electrónico es obligatorio.';
        // Formato básico
        const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(val)) return 'Ingresa un correo válido (Ej. juan@gmail.com).';
        // Parte local mínimo 2 chars
        const local = val.split('@')[0];
        if (local.length < 2) return 'La parte del correo antes del @ es muy corta.';
        // Dominio no puede empezar/terminar con punto o guion
        const domain = val.split('@')[1];
        if (/^[.\-]|[.\-]$/.test(domain)) return 'El dominio del correo no es válido.';
        // No permitir puntos o guiones consecutivos
        if (/\.{2,}/.test(val) || /-{2,}/.test(domain)) return 'El correo contiene caracteres repetidos no válidos.';
        return '';
    }

    /** Valida teléfono: opcional, pero si se escribe solo dígitos, 7–15 */
    function validarTelefono(val) {
        if (!val) return ''; // opcional
        if (!/^\d+$/.test(val)) return 'El teléfono solo puede contener números.';
        if (val.length < 7) return 'El teléfono debe tener al menos 7 dígitos.';
        if (val.length > 15) return 'El teléfono no puede superar los 15 dígitos.';
        return '';
    }

    /** Valida mensaje: 10–500 chars */
    function validarMensaje(val) {
        if (!val) return 'El comentario es obligatorio.';
        if (val.length < 10) return `Mínimo 10 caracteres (actuales: ${val.length}).`;
        if (val.length > 500) return 'El comentario no puede superar los 500 caracteres.';
        return '';
    }

    // --- Eventos en tiempo real ---

    const nombreInput   = document.getElementById('nombre');
    const emailInput    = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const mensajeInput  = document.getElementById('mensaje');
    const contadorChars = document.getElementById('contadorChars');
    const categoriaSelect = document.getElementById('categoriaComentario');

    if (nombreInput) {
        nombreInput.addEventListener('input', () => {
            const err = validarNombre(nombreInput.value.trim());
            setError('nombre', err);
        });
        nombreInput.addEventListener('blur', () => {
            const err = validarNombre(nombreInput.value.trim());
            setError('nombre', err);
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const err = validarEmail(emailInput.value.trim());
            setError('email', err);
        });
        emailInput.addEventListener('blur', () => {
            const err = validarEmail(emailInput.value.trim());
            setError('email', err);
        });
    }

    if (telefonoInput) {
        // Bloquear cualquier caracter no numérico al escribir
        telefonoInput.addEventListener('keypress', (e) => {
            if (!/\d/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
        telefonoInput.addEventListener('input', () => {
            // Eliminar cualquier caracter no numérico que haya pegado el usuario
            telefonoInput.value = telefonoInput.value.replace(/\D/g, '');
            const err = validarTelefono(telefonoInput.value.trim());
            setError('telefono', err);
        });
        telefonoInput.addEventListener('blur', () => {
            const err = validarTelefono(telefonoInput.value.trim());
            setError('telefono', err);
        });
    }

    if (mensajeInput && contadorChars) {
        mensajeInput.addEventListener('input', () => {
            const len = mensajeInput.value.length;
            contadorChars.textContent = len + ' / 500';
            // Cambia color del contador al acercarse al límite
            if (len > 450) {
                contadorChars.classList.add('text-warning');
                contadorChars.classList.remove('text-secondary', 'text-danger');
            } else if (len >= 500) {
                contadorChars.classList.add('text-danger');
                contadorChars.classList.remove('text-secondary', 'text-warning');
            } else {
                contadorChars.classList.add('text-secondary');
                contadorChars.classList.remove('text-warning', 'text-danger');
            }
            const err = validarMensaje(mensajeInput.value.trim());
            if (mensajeInput.value.trim().length > 0) setError('mensaje', err);
        });
        mensajeInput.addEventListener('blur', () => {
            const err = validarMensaje(mensajeInput.value.trim());
            setError('mensaje', err);
        });
    }

    // --- Submit con validación completa ---

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombreVal   = nombreInput   ? nombreInput.value.trim()   : '';
            const emailVal    = emailInput    ? emailInput.value.trim()    : '';
            const telefonoVal = telefonoInput ? telefonoInput.value.trim() : '';
            const mensajeVal  = mensajeInput  ? mensajeInput.value.trim()  : '';
            const categoriaVal = categoriaSelect ? categoriaSelect.value   : 'Consulta';

            const errNombre   = validarNombre(nombreVal);
            const errEmail    = validarEmail(emailVal);
            const errTelefono = validarTelefono(telefonoVal);
            const errMensaje  = validarMensaje(mensajeVal);

            // Mostrar todos los errores inline
            setError('nombre',   errNombre);
            setError('email',    errEmail);
            setError('telefono', errTelefono);
            setError('mensaje',  errMensaje);

            // Si hay algún error, detener
            if (errNombre || errEmail || errTelefono || errMensaje) {
                if (alertaBox) {
                    alertaBox.innerHTML = '<div class="msg-error"><i class="fa-solid fa-circle-exclamation me-2"></i>Por favor, corrige los errores antes de publicar.</div>';
                }
                // Enfocar el primer campo con error
                const firstErr = [
                    errNombre   ? nombreInput   : null,
                    errEmail    ? emailInput    : null,
                    errTelefono ? telefonoInput : null,
                    errMensaje  ? mensajeInput  : null,
                ].find(Boolean);
                if (firstErr) firstErr.focus();
                return;
            }

            // ✅ Todo válido — publicar comentario
            if (alertaBox) {
                alertaBox.innerHTML = '<div class="msg-exito"><i class="fa-solid fa-circle-check me-2"></i>¡Comentario publicado con éxito!</div>';
                setTimeout(() => { alertaBox.innerHTML = ''; }, 5000);
            }

            // Incrementamos contador
            totalComentarios++;
            if (contadorComentarios) contadorComentarios.textContent = totalComentarios;

            // Fecha actual formateada
            const fechaActual = new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Creamos tarjeta de comentario
            const nuevaTarjeta = document.createElement('div');
            nuevaTarjeta.className = 'p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary shadow-sm comment-card mb-2';

            // Badge según categoría
            let badgeColor = 'bg-info text-dark';
            if (categoriaVal === 'Felicitación') badgeColor = 'bg-success text-white';
            if (categoriaVal === 'Sugerencia')   badgeColor = 'bg-warning text-dark';

            // Email opcional en la tarjeta
            const emailHtml = emailVal
                ? `<small class="text-secondary d-block"><i class="fa-solid fa-envelope me-1"></i>${escapeHtml(emailVal)}</small>`
                : '';

            nuevaTarjeta.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                    <div>
                        <span class="fw-bold text-warning"><i class="fa-solid fa-user-circle me-1"></i> ${escapeHtml(nombreVal)}</span>
                        ${emailHtml}
                    </div>
                    <div>
                        <span class="badge ${badgeColor} me-2">${escapeHtml(categoriaVal)}</span>
                        <small class="text-muted" style="font-size: 0.75rem;">${fechaActual}</small>
                    </div>
                </div>
                <p class="mb-0 text-light" style="font-size: 0.95rem; word-break: break-word;">${escapeHtml(mensajeVal)}</p>
            `;

            if (listaComentarios) listaComentarios.prepend(nuevaTarjeta);

            // Resetear formulario
            form.reset();
            if (contadorChars) contadorChars.textContent = '0 / 500';
            // Limpiar clases de validación
            ['nombre','email','telefono','mensaje'].forEach(id => clearError(id));
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
