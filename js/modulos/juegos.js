/**
 * MÓDULO: Videojuegos y Tráilers
 * Archivo: js/modulos/juegos.js
 *
 * Se carga bajo demanda cuando la sección de juegos entra en viewport
 * o cuando el usuario interactúa con ella. Funciona sin jQuery.
 */
(function(window) {
    'use strict';

    window.Hydration.registrarModulo('juegos', {
        init() {
            const host = document.getElementById('juegos');
            if (host) this.hidratar(host);
        },

        hidratar(seccion) {
            const host = seccion || document.getElementById('juegos');
            if (!host || host.getAttribute('data-hidratado') === 'true') return;

            // 1. Filtrado de Juegos con Dataset (Selección Múltiple)
            const filterButtons = host.querySelectorAll('.btn-filter');
            const tarjetas = host.querySelectorAll('.card-juego');
            let activeCategorias = new Set();

            function applyGameFilter() {
                tarjetas.forEach(card => {
                    if (activeCategorias.size === 0) {
                        card.style.display = '';
                    } else {
                        card.style.display = activeCategorias.has(card.dataset.categoria) ? '' : 'none';
                    }
                });
            }

            filterButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const categoria = btn.getAttribute('data-filter');
                    const todosBtn = host.querySelector('.btn-filter[data-filter="todos"]');

                    if (categoria === 'todos') {
                        activeCategorias.clear();
                        filterButtons.forEach(b => b.classList.remove('active'));
                        if (todosBtn) todosBtn.classList.add('active');
                    } else {
                        if (todosBtn) todosBtn.classList.remove('active');

                        if (activeCategorias.has(categoria)) {
                            activeCategorias.delete(categoria);
                            btn.classList.remove('active');
                        } else {
                            activeCategorias.add(categoria);
                            btn.classList.add('active');
                        }

                        if (activeCategorias.size === 0 && todosBtn) {
                            todosBtn.classList.add('active');
                        }
                    }
                    applyGameFilter();
                });
            });

            // 2. Tráiler de Juegos en Modal
            const modalTrailer = document.getElementById('modalTrailer');
            if (modalTrailer) {
                const iframeTrailer = document.getElementById('iframeTrailer');
                const modalTitle = document.getElementById('modalTrailerLabel');

                modalTrailer.addEventListener('show.bs.modal', (event) => {
                    const card = event.relatedTarget;
                    if (!card) return;
                    const videoUrl = card.getAttribute('data-video') || '';
                    const titulo = card.getAttribute('data-titulo') || 'Videojuego';

                    if (modalTitle) modalTitle.textContent = "Tráiler: " + titulo;
                    if (iframeTrailer) iframeTrailer.src = videoUrl;
                });

                modalTrailer.addEventListener('hidden.bs.modal', () => {
                    if (iframeTrailer) iframeTrailer.src = "";
                });
            }

            host.setAttribute('data-hidratado', 'true');
            console.log('[Hydration] Módulo juegos hidratado.');
        }
    });

})(window);
