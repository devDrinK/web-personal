/**
 * MÓDULO: Repertorio Musical
 * Archivo: js/modulos/musica.js
 *
 * Se carga bajo demanda cuando la sección de música entra en viewport
 * o el usuario interactúa con ella. Funciona sin jQuery.
 */
(function(window) {
    'use strict';

    const MUSIC_CATALOG = [
        // Rock / Alternativo (9)
        { rank: 1, artist: "Linkin Park", genre: "rock", genreLabel: "Rock / Nu Metal", badgeClass: "bg-warning text-dark", songs: "In the End, Numb, Castle of Glass" },
        { rank: 2, artist: "Three Days Grace", genre: "rock", genreLabel: "Rock Alternativo", badgeClass: "bg-warning text-dark", songs: "Animal I Have Become, Pain" },
        { rank: 3, artist: "Avenged Sevenfold", genre: "rock", genreLabel: "Hard Rock / Metal", badgeClass: "bg-warning text-dark", songs: "Nightmare, Hail to the King" },
        { rank: 4, artist: "OneRepublic", genre: "rock", genreLabel: "Pop Rock", badgeClass: "bg-warning text-dark", songs: "Counting Stars, Secrets" },
        { rank: 5, artist: "Paramore", genre: "rock", genreLabel: "Pop Punk / Rock", badgeClass: "bg-warning text-dark", songs: "Misery Business, Ain't It Fun" },
        { rank: 6, artist: "Simple Plan", genre: "rock", genreLabel: "Pop Punk", badgeClass: "bg-warning text-dark", songs: "Welcome to My Life, Perfect" },
        { rank: 7, artist: "Fall Out Boy", genre: "rock", genreLabel: "Rock Alternativo", badgeClass: "bg-warning text-dark", songs: "Centuries, Thnks fr the Mmrs" },
        { rank: 8, artist: "Magic!", genre: "rock", genreLabel: "Reggae Fusion / Pop", badgeClass: "bg-warning text-dark", songs: "Rude" },
        { rank: 9, artist: "R5", genre: "rock", genreLabel: "Pop Rock", badgeClass: "bg-warning text-dark", songs: "Smile, Pass Me By" },

        // Metal / Post-Hardcore (6)
        { rank: 10, artist: "Motionless in White", genre: "metal", genreLabel: "Metalcore / Industrial", badgeClass: "bg-danger text-white", songs: "Masterpiece, Cyberhex" },
        { rank: 11, artist: "Bad Omens", genre: "metal", genreLabel: "Metal Alternativo", badgeClass: "bg-danger text-white", songs: "Just Pretend, The Death of Peace of Mind" },
        { rank: 12, artist: "Falling in Reverse", genre: "metal", genreLabel: "Post-Hardcore / Rock", badgeClass: "bg-danger text-white", songs: "Popular Monster, Voices in My Head" },
        { rank: 13, artist: "Set It Off", genre: "metal", genreLabel: "Rock Sinfónico", badgeClass: "bg-danger text-white", songs: "Wolf in Sheep's Clothing, Punching Bag" },
        { rank: 14, artist: "A Day to Remember", genre: "metal", genreLabel: "Metalcore / Pop Punk", badgeClass: "bg-danger text-white", songs: "If It Means a Lot to You, Downfall" },
        { rank: 15, artist: "Skillet", genre: "metal", genreLabel: "Rock / Alt Metal", badgeClass: "bg-danger text-white", songs: "Monster, Hero" },

        // Pop / Electropop (6)
        { rank: 16, artist: "5 Seconds of Summer", genre: "pop", genreLabel: "Pop Rock", badgeClass: "bg-info text-dark", songs: "Youngblood, Teeth" },
        { rank: 17, artist: "MKTO", genre: "pop", genreLabel: "Pop / R&B", badgeClass: "bg-info text-dark", songs: "Classic, Thank You" },
        { rank: 18, artist: "DNCE", genre: "pop", genreLabel: "Dance Pop / Funk", badgeClass: "bg-info text-dark", songs: "Cake by the Ocean" },
        { rank: 19, artist: "Daft Punk", genre: "pop", genreLabel: "Electrónica / House", badgeClass: "bg-info text-dark", songs: "Get Lucky, Instant Crush" },
        { rank: 20, artist: "The Black Eyed Peas", genre: "pop", genreLabel: "Hip Hop / Pop", badgeClass: "bg-info text-dark", songs: "I Gotta Feeling, Pump It" },
        { rank: 21, artist: "Alec Benjamin", genre: "pop", genreLabel: "Pop Acústico / Indie", badgeClass: "bg-info text-dark", songs: "Let Me Down Slowly, Water Fountain" },

        // Urbano / Reggaetón (5)
        { rank: 22, artist: "Daddy Yankee", genre: "urbano", genreLabel: "Reggaetón", badgeClass: "bg-success text-white", songs: "Gasolina, Despacito, Con Calma" },
        { rank: 23, artist: "Wisin y Yandel", genre: "urbano", genreLabel: "Reggaetón", badgeClass: "bg-success text-white", songs: "Sexy Movimiento, Pam Pam" },
        { rank: 24, artist: "Farruko", genre: "urbano", genreLabel: "Urbano / Trap", badgeClass: "bg-success text-white", songs: "Pepas, Delincuente" },
        { rank: 25, artist: "Chino y Nacho", genre: "urbano", genreLabel: "Pop Latino / Urbano", badgeClass: "bg-success text-white", songs: "Mi Niña Bonita, Me Voy Enamorando" },
        { rank: 26, artist: "Major Lazer", genre: "urbano", genreLabel: "EDM / Dancehall", badgeClass: "bg-success text-white", songs: "Lean On, Cold Water" },

        // Indie / Folk / Rock en Español (5)
        { rank: 27, artist: "Jesse & Joy", genre: "indie", genreLabel: "Pop Latino / Folk", badgeClass: "bg-primary text-white", songs: "¡Corre!, Ecos de Amor" },
        { rank: 28, artist: "Álvaro Soler", genre: "indie", genreLabel: "Pop Latino", badgeClass: "bg-primary text-white", songs: "Sofia, La Cintura" },
        { rank: 29, artist: "Reik", genre: "indie", genreLabel: "Pop / Baladas", badgeClass: "bg-primary text-white", songs: "Yo Quisiera, Ya Me Enteré" },
        { rank: 30, artist: "Natalia Lafourcade", genre: "indie", genreLabel: "Folk / Pop Alt", badgeClass: "bg-primary text-white", songs: "Hasta la Raíz, Nunca Es Suficiente" },
        { rank: 31, artist: "El Cuarteto de Nos", genre: "indie", genreLabel: "Rock Alt / Pop Rock", badgeClass: "bg-primary text-white", songs: "Yendo a la Casa de Damián" }
    ];

    function enableTouchSwipe(elementId) {
        const el = document.getElementById(elementId);
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
                    const bsCarousel = bootstrap.Carousel.getOrCreateInstance(el);
                    if (diffX < 0) bsCarousel.next();
                    else bsCarousel.prev();
                }
            }
        }, { passive: true });
    }

    function renderMusicCarousel(filtro) {
        const carouselInner = document.getElementById('musicCarouselInner');
        const indicators = document.getElementById('musicCarouselIndicators');
        const counter = document.getElementById('musicPageCounter');
        if (!carouselInner) return;

        carouselInner.innerHTML = '';
        if (indicators) indicators.innerHTML = '';

        const filtered = filtro === 'todos'
            ? MUSIC_CATALOG
            : MUSIC_CATALOG.filter(item => item.genre === filtro);

        const itemsPerSlide = window.innerWidth >= 992 ? 4 : 2;
        const colClass = window.innerWidth >= 992 ? 'col-12 col-md-6 mb-2' : 'col-12 mb-2';

        if (filtered.length === 0) {
            carouselInner.innerHTML = '<div class="carousel-item active p-4 text-center text-muted">No se encontraron artistas para este género.</div>';
            if (counter) counter.textContent = '0 canciones';
            return;
        }

        const totalSlides = Math.ceil(filtered.length / itemsPerSlide);

        for (let i = 0; i < totalSlides; i++) {
            const slideItems = filtered.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide);
            const isActive = i === 0 ? 'active' : '';

            let cardsHtml = '';
            slideItems.forEach(item => {
                cardsHtml += `
                    <div class="${colClass}">
                        <div class="music-card-item p-3 h-100 d-flex align-items-center gap-3">
                            <div class="flex-shrink-0 d-flex flex-column align-items-center justify-content-center text-center" style="min-width: 48px;">
                                <i class="fa-solid fa-compact-disc music-disc-icon"></i>
                                <span class="badge bg-secondary bg-opacity-75 text-warning mt-1 fw-bold font-monospace" style="font-size: 0.75rem;">#${item.rank}</span>
                            </div>
                            <div class="flex-grow-1 overflow-hidden">
                                <div class="d-flex justify-content-between align-items-center gap-2 mb-1 flex-wrap">
                                    <h5 class="fw-bold text-white mb-0 text-truncate" style="font-size: 1.12rem; letter-spacing: 0.3px;">
                                        ${item.artist}
                                    </h5>
                                    <span class="badge ${item.badgeClass} flex-shrink-0" style="font-size: 0.74rem; padding: 4px 10px; font-weight: 600;">
                                        ${item.genreLabel}
                                    </span>
                                </div>
                                <p class="text-light opacity-80 mb-0" style="font-size: 0.88rem; line-height: 1.35;">
                                    <i class="fa-solid fa-music text-danger me-1"></i>${item.songs}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            });

            carouselInner.innerHTML += `
                <div class="carousel-item ${isActive}">
                    <div class="row g-2 g-md-3">
                        ${cardsHtml}
                    </div>
                </div>
            `;

            if (indicators) {
                indicators.innerHTML += `
                    <button type="button" data-bs-target="#musicCarousel" data-bs-slide-to="${i}" class="${isActive}" aria-label="Página ${i + 1}"></button>
                `;
            }
        }

        if (counter) counter.textContent = `Página 1 de ${totalSlides} • ${filtered.length} canciones`;

        const carouselEl = document.getElementById('musicCarousel');
        if (carouselEl && typeof bootstrap !== 'undefined') {
            const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, { interval: false });
            bsCarousel.to(0);
        }
    }

    window.Hydration.registrarModulo('musica', {
        init() {
            const host = document.getElementById('musica') || document.getElementById('musica-pwa');
            if (host) this.hidratar(host);
        },

        hidratar(seccion) {
            const host = seccion || document.getElementById('musica') || document.getElementById('musica-pwa');
            if (!host || host.getAttribute('data-hidratado') === 'true') return;

            // Caso A: Carrusel PWA (pwa/index.html)
            const musicCarousel = document.getElementById('musicCarousel');
            if (musicCarousel) {
                renderMusicCarousel('todos');
                enableTouchSwipe('musicCarousel');

                musicCarousel.addEventListener('slid.bs.carousel', function(e) {
                    const total = document.querySelectorAll('#musicCarouselIndicators button').length;
                    const counter = document.getElementById('musicPageCounter');
                    if (counter) counter.textContent = `Página ${e.to + 1} de ${total}`;
                });

                host.querySelectorAll('.btn-filter-music').forEach(btn => {
                    btn.addEventListener('click', function() {
                        host.querySelectorAll('.btn-filter-music').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        const genre = btn.getAttribute('data-filter-music');
                        renderMusicCarousel(genre);
                    });
                });
            }

            // Caso B: Tabla responsiva en sitio principal (index.html)
            const musicFilterButtons = host.querySelectorAll('.btn-filter-music');
            const itemsMusica = host.querySelectorAll('.music-item');
            if (itemsMusica.length > 0) {
                let activeGeneros = new Set();
                function applyMusicFilter() {
                    itemsMusica.forEach(row => {
                        if (activeGeneros.size === 0) {
                            row.style.display = '';
                        } else {
                            row.style.display = activeGeneros.has(row.dataset.genero) ? '' : 'none';
                        }
                    });
                }

                musicFilterButtons.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const genero = btn.getAttribute('data-filter-music');
                        const todosBtn = host.querySelector('.btn-filter-music[data-filter-music="todos"]');

                        if (genero === 'todos') {
                            activeGeneros.clear();
                            musicFilterButtons.forEach(b => b.classList.remove('active'));
                            if (todosBtn) todosBtn.classList.add('active');
                        } else {
                            if (todosBtn) todosBtn.classList.remove('active');
                            if (activeGeneros.has(genero)) {
                                activeGeneros.delete(genero);
                                btn.classList.remove('active');
                            } else {
                                activeGeneros.add(genero);
                                btn.classList.add('active');
                            }
                            if (activeGeneros.size === 0 && todosBtn) {
                                todosBtn.classList.add('active');
                            }
                        }
                        applyMusicFilter();
                    });
                });
            }

            host.setAttribute('data-hidratado', 'true');
            console.log('[Hydration] Módulo musica hidratado.');
        }
    });

})(window);
