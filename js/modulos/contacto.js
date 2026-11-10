/**
 * MÓDULO: Contacto y Comentarios Dinámicos (DOM)
 * Archivo: js/modulos/contacto.js
 *
 * Hidrata los formularios de contacto tanto en la web principal (index.html)
 * como en la PWA (pwa/index.html) bajo demanda.
 */
(function(window) {
    'use strict';

    // Función auxiliar de seguridad para evitar inyecciones HTML (XSS)
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    window.Hydration.registrarModulo('contacto', {
        init() {
            const host = document.getElementById('contacto');
            if (host) this.hidratar(host);
        },

        hidratar(seccion) {
            const host = seccion || document.getElementById('contacto');
            if (!host || host.getAttribute('data-hidratado') === 'true') return;

            // =====================================================================
            // 1. Caso: Formulario en Web Principal (index.html — id="contactForm")
            // =====================================================================
            const formPrincipal = document.getElementById('contactForm');
            if (formPrincipal) {
                const alertaBox = document.getElementById('alertaBox');
                const listaComentarios = document.getElementById('listaComentarios');
                const contadorComentarios = document.getElementById('contadorComentarios');
                const nombreInput = document.getElementById('nombre');
                const emailInput = document.getElementById('email');
                const telefonoInput = document.getElementById('telefono');
                const mensajeInput = document.getElementById('mensaje');
                const contadorChars = document.getElementById('contadorChars');
                const categoriaSelect = document.getElementById('categoriaComentario');

                let totalComentarios = 0;

                // --- Helpers de validación ---
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
                    if (input) input.classList.remove('is-invalid', 'is-valid');
                }

                function validarNombre(val) {
                    if (!val) return 'El nombre es obligatorio.';
                    if (/\d/.test(val)) return 'El nombre no puede contener números.';
                    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s\-']+$/.test(val)) return 'El nombre solo puede tener letras.';
                    if (val.length < 2) return 'El nombre es demasiado corto (mín. 2 caracteres).';
                    if (val.length > 60) return 'El nombre es demasiado largo (máx. 60 caracteres).';
                    return '';
                }

                function validarEmail(val) {
                    if (!val) return 'El correo electrónico es obligatorio.';
                    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
                    if (!re.test(val)) return 'Ingresa un correo válido (Ej. juan@gmail.com).';
                    const local = val.split('@')[0];
                    if (local.length < 2) return 'La parte del correo antes del @ es muy corta.';
                    const domain = val.split('@')[1];
                    if (/^[.\-]|[.\-]$/.test(domain)) return 'El dominio del correo no es válido.';
                    if (/\.{2,}/.test(val) || /-{2,}/.test(domain)) return 'El correo contiene caracteres repetidos no válidos.';
                    return '';
                }

                function validarTelefono(val) {
                    if (!val) return ''; // opcional
                    if (!/^\d+$/.test(val)) return 'El teléfono solo puede contener números.';
                    if (val.length < 7) return 'El teléfono debe tener al menos 7 dígitos.';
                    if (val.length > 15) return 'El teléfono no puede superar los 15 dígitos.';
                    return '';
                }

                function validarMensaje(val) {
                    if (!val) return 'El comentario es obligatorio.';
                    if (val.length < 10) return `Mínimo 10 caracteres (actuales: ${val.length}).`;
                    if (val.length > 500) return 'El comentario no puede superar los 500 caracteres.';
                    return '';
                }

                // --- Eventos en tiempo real (Vanilla JS, sin jQuery) ---
                if (nombreInput) {
                    nombreInput.addEventListener('input', () => setError('nombre', validarNombre(nombreInput.value.trim())));
                    nombreInput.addEventListener('blur', () => setError('nombre', validarNombre(nombreInput.value.trim())));
                }

                if (emailInput) {
                    emailInput.addEventListener('input', () => setError('email', validarEmail(emailInput.value.trim())));
                    emailInput.addEventListener('blur', () => setError('email', validarEmail(emailInput.value.trim())));
                }

                if (telefonoInput) {
                    telefonoInput.addEventListener('keypress', (e) => {
                        if (!/\d/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) {
                            e.preventDefault();
                        }
                    });
                    telefonoInput.addEventListener('input', () => {
                        telefonoInput.value = telefonoInput.value.replace(/\D/g, '');
                        setError('telefono', validarTelefono(telefonoInput.value.trim()));
                    });
                    telefonoInput.addEventListener('blur', () => setError('telefono', validarTelefono(telefonoInput.value.trim())));
                }

                if (mensajeInput && contadorChars) {
                    mensajeInput.addEventListener('input', () => {
                        const len = mensajeInput.value.length;
                        contadorChars.textContent = len + ' / 500';
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
                        if (mensajeInput.value.trim().length > 0) setError('mensaje', validarMensaje(mensajeInput.value.trim()));
                    });
                    mensajeInput.addEventListener('blur', () => setError('mensaje', validarMensaje(mensajeInput.value.trim())));
                }

                // --- Submit con validación completa ---
                formPrincipal.addEventListener('submit', (e) => {
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

                    setError('nombre',   errNombre);
                    setError('email',    errEmail);
                    setError('telefono', errTelefono);
                    setError('mensaje',  errMensaje);

                    if (errNombre || errEmail || errTelefono || errMensaje) {
                        if (alertaBox) {
                            alertaBox.innerHTML = '<div class="msg-error"><i class="fa-solid fa-circle-exclamation me-2"></i>Por favor, corrige los errores antes de publicar.</div>';
                        }
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

                    totalComentarios++;
                    if (contadorComentarios) contadorComentarios.textContent = totalComentarios;

                    const fechaActual = new Date().toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });

                    const nuevaTarjeta = document.createElement('div');
                    nuevaTarjeta.className = 'p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary shadow-sm comment-card mb-2';

                    let badgeColor = 'bg-info text-dark';
                    if (categoriaVal === 'Felicitación') badgeColor = 'bg-success text-white';
                    if (categoriaVal === 'Sugerencia')   badgeColor = 'bg-warning text-dark';

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

                    formPrincipal.reset();
                    if (contadorChars) contadorChars.textContent = '0 / 500';
                    ['nombre','email','telefono','mensaje'].forEach(id => clearError(id));
                });
            }

            // =====================================================================
            // 2. Caso: Formulario Directo PWA (pwa/index.html — id="pwaContactForm")
            // =====================================================================
            const formPwa = document.getElementById('pwaContactForm');
            if (formPwa) {
                const successMsg = document.getElementById('contactSuccessMsg');

                formPwa.addEventListener('submit', function(e) {
                    e.preventDefault();
                    let valid = true;

                    const nombre = document.getElementById('contactNombre');
                    const email = document.getElementById('contactEmail');
                    const mensaje = document.getElementById('contactMensaje');
                    const errNombre = document.getElementById('errContactNombre');
                    const errEmail = document.getElementById('errContactEmail');
                    const errMensaje = document.getElementById('errContactMensaje');

                    if (!nombre || nombre.value.trim().length < 2) {
                        if (errNombre) errNombre.classList.remove('d-none');
                        valid = false;
                    } else {
                        if (errNombre) errNombre.classList.add('d-none');
                    }

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!email || !emailRegex.test(email.value.trim())) {
                        if (errEmail) errEmail.classList.remove('d-none');
                        valid = false;
                    } else {
                        if (errEmail) errEmail.classList.add('d-none');
                    }

                    if (!mensaje || mensaje.value.trim().length < 8) {
                        if (errMensaje) errMensaje.classList.remove('d-none');
                        valid = false;
                    } else {
                        if (errMensaje) errMensaje.classList.add('d-none');
                    }

                    if (!valid) return;

                    // Éxito — mostrar mensaje y resetear
                    if (successMsg) {
                        successMsg.classList.remove('d-none');
                        setTimeout(() => { successMsg.classList.add('d-none'); }, 4000);
                    }
                    formPwa.reset();
                });
            }

            host.setAttribute('data-hidratado', 'true');
            console.log('[Hydration] Módulo contacto hidratado.');
        }
    });

})(window);
