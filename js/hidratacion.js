/**
 * ==============================================================================
 * SISTEMA MODULAR DE HIDRATACIÓN PROGRESIVA (HTML / PWA)
 * ==============================================================================
 * - Sirve la interfaz en estado 100% estático inicialmente (data-hidratado="false").
 * - Carga los módulos JS correspondientes ÚNICAMENTE cuando una función o interacción
 *   lo necesita (On-Demand / Lazy Modular Loading).
 * - Evita duplicidad de eventos con .off() y previene redibujados innecesarios del DOM.
 * ==============================================================================
 */

(function(window) {
    'use strict';

    // Determinar la ruta base según si se ejecuta desde raíz o desde /pwa/
    const isPwaSubfolder = window.location.pathname.includes('/pwa/') || window.location.pathname.endsWith('pwa/');
    const BASE_MODULOS = isPwaSubfolder ? '../js/modulos/' : 'js/modulos/';

    // =========================================================================
    // COLA DE NAVEGACIÓN PWA (Stub temporal)
    // =========================================================================
    // Los botones del HTML de la PWA usan onclick="navigateToSection('#seccion')"
    // pero esa función se define en pwa-core.js que se carga bajo demanda.
    // Este stub encola las llamadas hasta que pwa-core se registre y las ejecute.
    const _navigationQueue = [];
    if (typeof window.navigateToSection !== 'function') {
        window.navigateToSection = function(targetId) {
            _navigationQueue.push(targetId);
            // Forzar la carga inmediata de pwa-core para procesar la cola
            Hydration.cargarModulo('pwa-core').then(function(mod) {
                if (mod && mod.init) mod.init();
                // Procesar llamadas encoladas
                while (_navigationQueue.length > 0) {
                    const id = _navigationQueue.shift();
                    if (typeof window.navigateToSection === 'function') {
                        window.navigateToSection(id);
                    }
                }
            });
        };
    }

    const Hydration = {
        modules: {},             // Definiciones registradas de cada módulo
        loadedScripts: new Set(),// Scripts descargados en memoria
        pendingPromises: {},     // Promesas de carga en curso

        /**
         * Registra un módulo cargado dinámicamente
         * @param {string} nombre - Nombre del módulo ('menu', 'tema', 'juegos', etc.)
         * @param {Object} definicion - Objeto con métodos init() e hidratar(el)
         */
        registrarModulo(nombre, definicion) {
            this.modules[nombre] = definicion;
            console.log(`[Hydration] Módulo '${nombre}' registrado con éxito.`);
        },

        /**
         * Carga el archivo JS de un módulo bajo demanda si aún no ha sido cargado
         * @param {string} nombre - Nombre del módulo
         * @returns {Promise<Object>} Promesa que resuelve la definición del módulo
         */
        cargarModulo(nombre) {
            if (this.modules[nombre]) {
                return Promise.resolve(this.modules[nombre]);
            }

            if (this.pendingPromises[nombre]) {
                return this.pendingPromises[nombre];
            }

            const url = `${BASE_MODULOS}${nombre}.js?v=${Date.now()}`;
            console.log(`[Hydration] Solicitando carga bajo demanda de '${nombre}' desde: ${url}`);

            const promise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                script.async = true;

                script.onload = () => {
                    this.loadedScripts.add(nombre);
                    delete this.pendingPromises[nombre];
                    if (this.modules[nombre]) {
                        resolve(this.modules[nombre]);
                    } else {
                        console.warn(`[Hydration] El script '${nombre}' cargó pero no registró el módulo.`);
                        resolve(null);
                    }
                };

                script.onerror = (err) => {
                    delete this.pendingPromises[nombre];
                    console.error(`[Hydration] Error al cargar módulo '${nombre}' desde ${url}`, err);
                    reject(err);
                };

                document.head.appendChild(script);
            });

            this.pendingPromises[nombre] = promise;
            return promise;
        },

        /**
         * Hidrata un elemento o sección específica cargando su módulo bajo demanda
         * @param {string} nombreModulo - Nombre del módulo
         * @param {HTMLElement|string} [target] - Elemento o selector opcional
         * @returns {Promise<boolean>}
         */
        async hidratar(nombreModulo, target) {
            try {
                const modulo = await this.cargarModulo(nombreModulo);
                if (!modulo || typeof modulo.hidratar !== 'function') {
                    console.warn(`[Hydration] El módulo '${nombreModulo}' no tiene función hidratar().`);
                    return false;
                }

                const elementos = target
                    ? (typeof target === 'string' ? document.querySelectorAll(target) : [target])
                    : document.querySelectorAll(`[data-modulo="${nombreModulo}"]`);

                if (elementos.length === 0 && typeof modulo.init === 'function') {
                    modulo.init();
                    return true;
                }

                elementos.forEach(el => {
                    // Verificar si ya está hidratado para evitar duplicidad de listeners
                    if (el.getAttribute('data-hidratado') === 'true') {
                        return;
                    }
                    modulo.hidratar(el);
                    el.setAttribute('data-hidratado', 'true');
                    console.log(`[Hydration] Elemento hidratado para módulo '${nombreModulo}'.`);
                });

                return true;
            } catch (err) {
                console.error(`[Hydration] Falló la hidratación del módulo '${nombreModulo}':`, err);
                return false;
            }
        },

        /**
         * Inicializa observadores automáticos para hidratación diferida (Lazy Hydration)
         */
        iniciarObservadores() {
            // 1. Hidratación por intersección de pantalla (cuando el usuario scrollea hacia la sección)
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const modulo = entry.target.getAttribute('data-modulo');
                            if (modulo && entry.target.getAttribute('data-hidratado') !== 'true') {
                                Hydration.hidratar(modulo, entry.target);
                                obs.unobserve(entry.target);
                            }
                        }
                    });
                }, { rootMargin: '100px 0px' });

                document.querySelectorAll('[data-modulo]').forEach(el => {
                    if (el.getAttribute('data-hidratado') !== 'true') {
                        observer.observe(el);
                    }
                });
            }

            // 2. Hidratación por interacción directa (clic, enfoque o pulsación en cualquier elemento con data-modulo)
            const handleInteraction = (e) => {
                const host = e.target.closest('[data-modulo]');
                if (!host) return;

                const modulo = host.getAttribute('data-modulo');
                if (modulo && host.getAttribute('data-hidratado') !== 'true') {
                    Hydration.hidratar(modulo, host);
                }
            };

            document.addEventListener('click', handleInteraction, { capture: true, passive: true });
            document.addEventListener('focusin', handleInteraction, { capture: true, passive: true });
        }
    };

    // Exponer globalmente
    window.Hydration = Hydration;

    // Compatibilidad directa con la función de la guía UPDS
    window.hidratarInterfaz = function() {
        return Hydration.hidratar('menu');
    };

    // Al estar listo el DOM, iniciar observadores y la hidratación programada
    document.addEventListener('DOMContentLoaded', () => {
        Hydration.iniciarObservadores();

        // En PWA, cargar el gestor de navegación PWA de inmediato para habilitar transiciones
        if (isPwaSubfolder || document.querySelector('.pwa-section')) {
            Hydration.cargarModulo('pwa-core').then(mod => {
                if (mod && mod.init) mod.init();
                // Procesar las llamadas de navegación que se hayan encolado antes de cargar
                while (_navigationQueue.length > 0) {
                    const id = _navigationQueue.shift();
                    if (typeof window.navigateToSection === 'function') {
                        window.navigateToSection(id);
                    }
                }
            });
        }

        // Simulación de hidratación del menú a los 500ms tras carga estática (Requerimiento Guía UPDS)
        setTimeout(() => {
            Hydration.hidratar('menu');
        }, 500);
    });

})(window);
