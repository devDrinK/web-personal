/**
 * MÓDULO: Núcleo de la PWA (Navegación Sin Scroll, Desvanecimiento e Instalación)
 * Archivo: js/modulos/pwa-core.js
 *
 * Se carga de inmediato al detectar que estamos en la PWA.
 * Funciona sin jQuery (Vanilla JS con animaciones CSS).
 */
(function(window) {
    'use strict';

    // =========================================================================
    // HELPER: Animación de fade sin jQuery
    // =========================================================================
    function fadeOut(el, duration, callback) {
        duration = duration || 200;
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.display = 'none';
            el.classList.remove('active');
            el.style.opacity = '';
            el.style.transition = '';
            if (callback) callback();
        }, duration);
    }

    function fadeIn(el, duration) {
        duration = duration || 250;
        el.style.opacity = '0';
        el.style.display = 'flex';
        el.classList.add('active');
        el.style.transition = `opacity ${duration}ms ease`;
        requestAnimationFrame(() => {
            el.style.opacity = '1';
        });
        setTimeout(() => {
            el.style.opacity = '';
            el.style.transition = '';
        }, duration);
    }

    function slideToggle(el, duration) {
        duration = duration || 220;
        if (el.style.display === 'none' || el.offsetHeight === 0 || getComputedStyle(el).display === 'none') {
            el.style.display = 'block';
            el.style.overflow = 'hidden';
            const height = el.scrollHeight;
            el.style.height = '0px';
            el.style.transition = `height ${duration}ms ease`;
            requestAnimationFrame(() => { el.style.height = height + 'px'; });
            setTimeout(() => { el.style.height = ''; el.style.overflow = ''; el.style.transition = ''; }, duration);
        } else {
            el.style.overflow = 'hidden';
            el.style.height = el.scrollHeight + 'px';
            el.style.transition = `height ${duration}ms ease`;
            requestAnimationFrame(() => { el.style.height = '0px'; });
            setTimeout(() => { el.style.display = 'none'; el.style.height = ''; el.style.overflow = ''; el.style.transition = ''; }, duration);
        }
    }

    function slideUp(el, duration) {
        duration = duration || 200;
        if (getComputedStyle(el).display === 'none') return;
        el.style.overflow = 'hidden';
        el.style.height = el.scrollHeight + 'px';
        el.style.transition = `height ${duration}ms ease`;
        requestAnimationFrame(() => { el.style.height = '0px'; });
        setTimeout(() => { el.style.display = 'none'; el.style.height = ''; el.style.overflow = ''; el.style.transition = ''; }, duration);
    }

    // =========================================================================
    // FUNCIÓN PRINCIPAL DE NAVEGACIÓN
    // =========================================================================
    function navigateToSection(targetId) {
        const currentEl = document.querySelector('.pwa-section.active');
        const targetEl = document.querySelector(targetId);
        const drawer = document.getElementById('mobileDrawer');

        if (!targetEl || (currentEl && currentEl.id === targetEl.id)) {
            if (drawer) slideUp(drawer, 200);
            return;
        }

        if (drawer) slideUp(drawer, 200);

        // Actualizar estados activos en navegación
        document.querySelectorAll('.pwa-nav-btn, .mobile-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.pwa-nav-btn[data-target="${targetId}"], .mobile-nav-btn[data-target="${targetId}"]`).forEach(b => b.classList.add('active'));

        // Transición suave por desvanecimiento
        if (currentEl) {
            fadeOut(currentEl, 180, () => {
                fadeIn(targetEl, 240);

                // Cargar e hidratar el módulo correspondiente bajo demanda
                const modulo = targetEl.getAttribute('data-modulo');
                if (modulo && targetEl.getAttribute('data-hidratado') !== 'true') {
                    window.Hydration.hidratar(modulo, targetEl);
                }
            });
        } else {
            fadeIn(targetEl, 240);
            const modulo = targetEl.getAttribute('data-modulo');
            if (modulo && targetEl.getAttribute('data-hidratado') !== 'true') {
                window.Hydration.hidratar(modulo, targetEl);
            }
        }
    }

    // Sobrescribir el stub con la implementación real
    window.navigateToSection = navigateToSection;

    window.Hydration.registrarModulo('pwa-core', {
        init() {
            this.initNavigation();
            this.initInstallPrompt();
            this.initHeroCarousel();
        },

        initNavigation() {
            // Clic en botones de navegación PC y móvil
            document.querySelectorAll('.pwa-nav-btn, .mobile-nav-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const target = btn.getAttribute('data-target');
                    if (target) navigateToSection(target);
                });
            });

            // Menú hamburguesa móvil
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileDrawer = document.getElementById('mobileDrawer');

            if (mobileMenuBtn && mobileDrawer) {
                mobileMenuBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    slideToggle(mobileDrawer, 220);
                });

                document.addEventListener('click', function(e) {
                    if (!e.target.closest('#mobileDrawer') && !e.target.closest('#mobileMenuBtn')) {
                        slideUp(mobileDrawer, 200);
                    }
                });
            }
        },

        initHeroCarousel() {
            const el = document.getElementById('pwaHeroCarousel');
            if (!el) return;

            let startX = 0, startY = 0;
            el.addEventListener('touchstart', function(e) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, { passive: true });

            el.addEventListener('touchend', function(e) {
                const diffX = e.changedTouches[0].clientX - startX;
                const diffY = e.changedTouches[0].clientY - startY;

                if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (typeof bootstrap !== 'undefined') {
                        const bs = bootstrap.Carousel.getOrCreateInstance(el);
                        if (diffX < 0) bs.next();
                        else bs.prev();
                    }
                }
            }, { passive: true });
        },

        initInstallPrompt() {
            let deferredPrompt = null;
            const pwaInstallBtn = document.getElementById('pwaInstallBtn');

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                if (pwaInstallBtn) pwaInstallBtn.classList.remove('d-none');
            });

            if (pwaInstallBtn) {
                pwaInstallBtn.addEventListener('click', async () => {
                    if (!deferredPrompt) return;
                    deferredPrompt.prompt();
                    const choice = await deferredPrompt.userChoice;
                    console.log('[PWA] Decisión de instalación:', choice.outcome);
                    deferredPrompt = null;
                    pwaInstallBtn.classList.add('d-none');
                });
            }

            window.addEventListener('appinstalled', () => {
                console.log('[PWA] Aplicación instalada exitosamente.');
                if (pwaInstallBtn) pwaInstallBtn.classList.add('d-none');
            });
        }
    });

})(window);
