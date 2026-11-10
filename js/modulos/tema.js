/**
 * MÓDULO: Tema Oscuro / Claro
 * Archivo: js/modulos/tema.js
 *
 * Se carga bajo demanda cuando el usuario hace clic en el botón de tema.
 * Funciona sin jQuery (Vanilla JS puro).
 */
(function(window) {
    'use strict';

    window.Hydration.registrarModulo('tema', {
        init() {
            const btn = document.getElementById('themeBtn');
            if (btn) this.hidratar(btn);
        },

        hidratar(el) {
            const themeBtn = el || document.getElementById('themeBtn');
            if (!themeBtn || themeBtn.getAttribute('data-hidratado') === 'true') return;

            const bodyElement = document.body;

            themeBtn.addEventListener('click', function() {
                bodyElement.classList.toggle('light-mode');
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

            themeBtn.setAttribute('data-hidratado', 'true');
            console.log('[Hydration] Módulo tema hidratado.');
        }
    });

})(window);
