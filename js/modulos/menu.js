/**
 * MÓDULO: Menú y Simulación de Hidratación (UPDS)
 * Archivo: js/modulos/menu.js
 *
 * Se carga bajo demanda tras 500ms de la carga estática inicial.
 * Funciona sin jQuery (Vanilla JS con animaciones CSS).
 */
(function(window) {
    'use strict';

    // Helper para simular slideToggle sin jQuery
    function slideToggle(el, duration) {
        duration = duration || 300;
        if (el.style.display === 'none' || el.offsetHeight === 0) {
            // Slide Down
            el.style.display = 'block';
            el.style.overflow = 'hidden';
            const height = el.scrollHeight;
            el.style.height = '0px';
            el.style.transition = `height ${duration}ms ease`;
            requestAnimationFrame(() => {
                el.style.height = height + 'px';
            });
            setTimeout(() => {
                el.style.height = '';
                el.style.overflow = '';
                el.style.transition = '';
            }, duration);
        } else {
            // Slide Up
            el.style.overflow = 'hidden';
            el.style.height = el.scrollHeight + 'px';
            el.style.transition = `height ${duration}ms ease`;
            requestAnimationFrame(() => {
                el.style.height = '0px';
            });
            setTimeout(() => {
                el.style.display = 'none';
                el.style.height = '';
                el.style.overflow = '';
                el.style.transition = '';
            }, duration);
        }
    }

    window.Hydration.registrarModulo('menu', {
        init() {
            const host = document.getElementById('contenedorMenu');
            if (host) {
                this.hidratar(host);
            }
            this.initNavbarCollapse();
        },

        hidratar(contenedor) {
            if (!contenedor || contenedor.getAttribute('data-hidratado') === 'true') {
                return;
            }

            const btn = document.getElementById('btnMenu') || document.getElementById('btnHidratar');
            const navMenu = document.getElementById('navMenu');

            // 1. Conexión de evento interactivo sin redibujado de DOM
            if (btn && navMenu) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    slideToggle(navMenu, 300);
                });
            }

            // 2. Actualización dinámica de textos
            const textoBtnMenu = document.getElementById('textoBtnMenu');
            const iconoBtnMenu = document.getElementById('iconoBtnMenu');
            if (textoBtnMenu) {
                textoBtnMenu.textContent = 'Menú Interactivo (Hidratado)';
                if (iconoBtnMenu) {
                    iconoBtnMenu.classList.remove('fa-spinner', 'fa-spin');
                    iconoBtnMenu.classList.add('fa-bars');
                }
            } else if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-bars me-2"></i>Menú Interactivo (Hidratado)';
            }

            const badge = document.getElementById('estadoHidratacionBadge');
            if (badge) {
                badge.className = 'badge bg-success px-3 py-2 fs-6';
                badge.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Estado: Menú Interactivo (Hidratado)';
            }

            const subtitulo = document.getElementById('subtituloMenu');
            if (subtitulo) {
                subtitulo.textContent = 'Módulo cargado bajo demanda. Eventos y reactividad conectados sin redibujar.';
            }

            // 3. Botón de reinicio de simulación
            const btnReiniciar = document.getElementById('btnReiniciarHidratacion');
            if (btnReiniciar) {
                btnReiniciar.style.display = '';
                btnReiniciar.addEventListener('click', function() {
                    if (navMenu) navMenu.style.display = 'none';
                    contenedor.setAttribute('data-hidratado', 'false');

                    if (textoBtnMenu) {
                        textoBtnMenu.textContent = 'Cargando Menú...';
                        if (iconoBtnMenu) {
                            iconoBtnMenu.classList.remove('fa-bars');
                            iconoBtnMenu.classList.add('fa-spinner', 'fa-spin');
                        }
                    } else if (btn) {
                        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Cargando Menú...';
                    }

                    if (badge) {
                        badge.className = 'badge bg-secondary px-3 py-2 fs-6';
                        badge.innerHTML = '<i class="fa-solid fa-hourglass-start me-1"></i> Estado: Estático (Sin Hidratar)';
                    }

                    if (subtitulo) {
                        subtitulo.textContent = 'Estructura HTML plana servida inicialmente.';
                    }

                    btnReiniciar.style.display = 'none';

                    setTimeout(() => {
                        window.Hydration.hidratar('menu', contenedor);
                    }, 500);
                });
            }

            // 4. Marcar como hidratado
            contenedor.setAttribute('data-hidratado', 'true');
            this.initNavbarCollapse();
            console.log('[Hydration] Módulo menu hidratado.');
        },

        initNavbarCollapse() {
            const navLinks = document.querySelectorAll('.custom-navbar .nav-link');
            const navbarCollapse = document.getElementById('navbarNav');
            if (navbarCollapse) {
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (navbarCollapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
                            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
                            bsCollapse.hide();
                        }
                    });
                });
            }
        }
    });

})(window);
