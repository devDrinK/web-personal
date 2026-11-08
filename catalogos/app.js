/**
 * SISTEMA BASE DE CATÁLOGO CON 25 PRODUCTOS Y LOGIN ADMIN OCULTO
 */

// 1. GESTIÓN DE SESIÓN
const AuthService = {
    KEY: 'app_admin_session',
    
    isAdminLoggedIn: function() {
        return localStorage.getItem(this.KEY) === 'true';
    },

    login: function(user, pass) {
        if (user === 'admin' && pass === '1234') {
            localStorage.setItem(this.KEY, 'true');
            return true;
        }
        return false;
    },

    logout: function() {
        localStorage.removeItem(this.KEY);
    }
};

// 2. SERVICIO DE DATOS (25 PRODUCTOS PRECARGADOS)
const StorageService = {
    KEY: 'app_catalog_data_v2', // Cambiamos la clave para forzar la carga de los 25 productos
    getProducts: function() {
        const data = localStorage.getItem(this.KEY);
        if (!data) {
            const initialData = [
                { id: 1, title: 'Monitor Curvo 27" Gaming', category: 'Monitores', price: 329.99, stock: 8, image: 'https://picsum.photos/seed/mon1/400/300', description: 'Pantalla curva con tasa de refresco de 165Hz e iluminación LED RGB envolvente.' },
                { id: 2, title: 'Teclado Mecánico RGB Pro', category: 'Periféricos', price: 89.50, stock: 15, image: 'https://picsum.photos/seed/tec2/400/300', description: 'Switches táctiles intercambiables, estructura de aluminio y macros programables.' },
                { id: 3, title: 'Mouse Ergonómico Inalámbrico', category: 'Periféricos', price: 49.99, stock: 22, image: 'https://picsum.photos/seed/mou3/400/300', description: 'Sensor óptico de alta precisión con batería de larga duración de hasta 90 días.' },
                { id: 4, title: 'Laptop Ultrabook Slim 14"', category: 'Laptops', price: 899.00, stock: 5, image: 'https://picsum.photos/seed/lap4/400/300', description: 'Procesador de última generación, 16GB RAM y disco SSD NVMe de 512GB.' },
                { id: 5, title: 'Audífonos Inalámbricos ANC', category: 'Audio', price: 149.00, stock: 10, image: 'https://picsum.photos/seed/aud5/400/300', description: 'Cancelación activa de ruido híbrida y controladores de alta fidelidad sonora.' },
                { id: 6, title: 'Silla Ergonómica Ejecutiva', category: 'Mobiliario', price: 219.99, stock: 7, image: 'https://picsum.photos/seed/sil6/400/300', description: 'Soporte lumbar ajustable, malla transpirable y reposabrazos multidireccionales.' },
                { id: 7, title: 'Escritorio Elevable Eléctrico', category: 'Mobiliario', price: 380.00, stock: 4, image: 'https://picsum.photos/seed/esc7/400/300', description: 'Control digital de altura con memoria programable y estructura de doble motor.' },
                { id: 8, title: 'Micrófono USB para Streaming', category: 'Audio', price: 99.00, stock: 14, image: 'https://picsum.photos/seed/mic8/400/300', description: 'Patrón polar cardioide, salida de audífonos con latencia cero y mute táctil.' },
                { id: 9, title: 'Webcam 4K Ultra HD', category: 'Cámaras', price: 129.99, stock: 9, image: 'https://picsum.photos/seed/cam9/400/300', description: 'Enfoque automático avanzado, lente de cristal y doble micrófono estéreo integrado.' },
                { id: 10, title: 'Tablet Gráfica Profesional', category: 'Periféricos', price: 199.50, stock: 11, image: 'https://picsum.photos/seed/tab10/400/300', description: '8192 niveles de presión en lápiz sin batería y área de trabajo optimizada.' },
                { id: 11, title: 'Smartwatch Deportivo GPS', category: 'Wearables', price: 159.00, stock: 18, image: 'https://picsum.photos/seed/wat11/400/300', description: 'Monitoreo de frecuencia cardíaca 24/7, oxígeno en sangre y resistencia al agua 5ATM.' },
                { id: 12, title: 'Disco Duro Externo SSD 1TB', category: 'Almacenamiento', price: 109.99, stock: 25, image: 'https://picsum.photos/seed/ssd12/400/300', description: 'Velocidades de lectura de hasta 1050 MB/s en un diseño compacto y resistente a golpes.' },
                { id: 13, title: 'Router WiFi 6 Mesh Dual-Band', category: 'Redes', price: 179.00, stock: 6, image: 'https://picsum.photos/seed/rou13/400/300', description: 'Cobertura de alta velocidad para toda la casa sin cortes ni zonas con señal débil.' },
                { id: 14, title: 'Hub USB-C 7 en 1 Multifunción', category: 'Accesorios', price: 39.99, stock: 30, image: 'https://picsum.photos/seed/hub14/400/300', description: 'Incluye puertos HDMI 4K, lectores de tarjetas SD/TF y puertos USB 3.0 de alta velocidad.' },
                { id: 15, title: 'Lámpara LED de Escritorio', category: 'Iluminación', price: 45.00, stock: 16, image: 'https://picsum.photos/seed/lam15/400/300', description: 'Temperatura de color ajustable, puerto USB de carga rápida y base antideslizante.' },
                { id: 16, title: 'Proyector Portátil Full HD', category: 'Video', price: 249.99, stock: 8, image: 'https://picsum.photos/seed/pro16/400/300', description: 'Corrección trapezoidal automática, conectividad inalámbrica y parlantes estéreo.' },
                { id: 17, title: 'Soporte Dual para Monitores', category: 'Mobiliario', price: 59.99, stock: 13, image: 'https://picsum.photos/seed/sop17/400/300', description: 'Brazo articulado con resortes de gas para pantallas de hasta 32 pulgadas.' },
                { id: 18, title: 'Kit Herramientas de Precisión', category: 'Accesorios', price: 29.99, stock: 20, image: 'https://picsum.photos/seed/kit18/400/300', description: '60 puntas de acero magnéticas para reparación de electrónicos, laptops y celulares.' },
                { id: 19, title: 'Parlante Bluetooth Impermeable', category: 'Audio', price: 69.00, stock: 15, image: 'https://picsum.photos/seed/par19/400/300', description: 'Sonido envolvente 360°, certificación IPX7 contra agua y 12 horas de reproducción.' },
                { id: 20, title: 'Base Refrigerante para Laptop', category: 'Accesorios', price: 34.50, stock: 19, image: 'https://picsum.photos/seed/bas20/400/300', description: '5 ventiladores silenciosos con iluminación LED azul e inclinación ajustable.' },
                { id: 21, title: 'Cámara de Seguridad WiFi 360°', category: 'Cámaras', price: 49.00, stock: 12, image: 'https://picsum.photos/seed/cam21/400/300', description: 'Visión nocturna infrarroja, detección de movimiento por IA y audio bidireccional.' },
                { id: 22, title: 'Mochila Antirrobo Laptop 15.6"', category: 'Accesorios', price: 65.00, stock: 14, image: 'https://picsum.photos/seed/moc22/400/300', description: 'Puerto de carga USB externo, compartimentos acolchados y material repelente al agua.' },
                { id: 23, title: 'Alfombrilla XL Escritorio RGB', category: 'Periféricos', price: 24.99, stock: 28, image: 'https://picsum.photos/seed/alf23/400/300', description: 'Superficie de tela microtexturizada optimizada para control de velocidad y precisión.' },
                { id: 24, title: 'Tarjeta Gráfica Dedicada 8GB', category: 'Componentes', price: 449.00, stock: 3, image: 'https://picsum.photos/seed/gpu24/400/300', description: 'Arquitectura avanzada para renderizado 3D fluido y gaming en alta resolución.' },
                { id: 25, title: 'Impresora Multifuncional EcoTank', category: 'Oficina', price: 229.00, stock: 6, image: 'https://picsum.photos/seed/imp25/400/300', description: 'Sistema de tanques de tinta de ultra alto rendimiento y conectividad Wi-Fi directa.' }
            ];
            this.saveProducts(initialData);
            return initialData;
        }
        return JSON.parse(data);
    },
    saveProducts: function(products) {
        localStorage.setItem(this.KEY, JSON.stringify(products));
    }
};

// 3. CARRITO DE COMPRAS
const CartModule = {
    items: [],
    add: function(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            if (existing.qty < product.stock) existing.qty++;
            else alert('Stock máximo alcanzado');
        } else {
            this.items.push({ ...product, qty: 1 });
        }
        this.render();
    },
    remove: function(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.render();
    },
    clear: function() {
        this.items = [];
        this.render();
    },
    getTotal: function() {
        return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0).toFixed(2);
    },
    render: function() {
        const $container = $('#cart-items').empty();
        let totalCount = 0;
        
        this.items.forEach(item => {
            totalCount += item.qty;
            $container.append(`
                <div class="cart-item">
                    <div>
                        <strong>${item.title}</strong><br>
                        <small>$${item.price} x ${item.qty}</small>
                    </div>
                    <button class="btn btn-danger btn-sm btn-remove-cart" data-id="${item.id}">&times;</button>
                </div>
            `);
        });

        $('#cart-counter').text(totalCount);
        $('#cart-total-amount').text(this.getTotal());
    }
};

// 4. CONTROLADOR PRINCIPAL
const CatalogApp = {
    products: [],

    init: function() {
        this.products = StorageService.getProducts();
        this.updateAdminUI();
        this.renderCategories();
        this.filterAndSort();
        this.bindEvents();
    },

    updateAdminUI: function() {
        const isAdmin = AuthService.isAdminLoggedIn();

        if (isAdmin) {
            $('#admin-panel').removeClass('hidden');
            $('#admin-session-badge').removeClass('hidden');
        } else {
            $('#admin-panel').addClass('hidden');
            $('#admin-session-badge').addClass('hidden');
        }

        this.renderCatalog(this.products);
    },

    renderCatalog: function(items) {
        const $grid = $('#catalog-grid').empty();
        const isAdmin = AuthService.isAdminLoggedIn();

        if (items.length === 0) {
            $grid.append('<p class="full-width">No hay productos disponibles.</p>');
            return;
        }

        items.forEach(item => {
            const adminButtons = isAdmin ? `
                <button class="btn btn-warning btn-sm btn-edit" title="Editar">Editar</button>
                <button class="btn btn-danger btn-sm btn-delete" title="Eliminar">Quitar</button>
            ` : '';

            $grid.append(`
                <article class="card" data-id="${item.id}">
                    <div class="card-img-container">
                        <span class="card-badge">${item.category}</span>
                        <img src="${item.image}" alt="${item.title}" class="card-img" loading="lazy">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-desc">${item.description}</p>
                        <div class="card-footer-info">
                            <span class="card-price">$${Number(item.price).toFixed(2)}</span>
                            <span class="card-stock">Stock: ${item.stock}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm btn-add-cart">Agregar</button>
                            <button class="btn btn-secondary btn-sm btn-detail">Detalle</button>
                            ${adminButtons}
                        </div>
                    </div>
                </article>
            `);
        });
    },

    renderCategories: function() {
        const categories = [...new Set(this.products.map(p => p.category))];
        const $filter = $('#category-filter').empty().append('<option value="">Todas las categorías</option>');
        const $datalist = $('#category-list').empty();

        categories.forEach(cat => {
            $filter.append(`<option value="${cat}">${cat}</option>`);
            $datalist.append(`<option value="${cat}">`);
        });
    },

    filterAndSort: function() {
        const search = $('#search-input').val().toLowerCase();
        const category = $('#category-filter').val();
        const sort = $('#sort-select').val();

        let filtered = this.products.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
            const matchesCategory = !category || p.category === category;
            return matchesSearch && matchesCategory;
        });

        if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        if (sort === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === 'name-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));

        this.renderCatalog(filtered);
    },

    saveProduct: function(e) {
        e.preventDefault();
        if (!AuthService.isAdminLoggedIn()) return alert('Acceso no autorizado');

        const id = $('#form-product-id').val();
        const productData = {
            id: id ? parseInt(id) : Date.now(),
            title: $('#form-title').val(),
            category: $('#form-category').val(),
            price: parseFloat($('#form-price').val()),
            stock: parseInt($('#form-stock').val()),
            image: $('#form-image').val(),
            description: $('#form-description').val()
        };

        if (id) {
            const index = this.products.findIndex(p => p.id === productData.id);
            this.products[index] = productData;
        } else {
            this.products.push(productData);
        }

        StorageService.saveProducts(this.products);
        this.resetForm();
        this.renderCategories();
        this.filterAndSort();
    },

    editProduct: function(id) {
        const p = this.products.find(item => item.id === id);
        if (!p) return;

        $('#form-product-id').val(p.id);
        $('#form-title').val(p.title);
        $('#form-category').val(p.category);
        $('#form-price').val(p.price);
        $('#form-stock').val(p.stock);
        $('#form-image').val(p.image);
        $('#form-description').val(p.description);

        $('#btn-save-product').text('Actualizar Producto');
        $('#btn-cancel-edit').removeClass('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteProduct: function(id) {
        if (!AuthService.isAdminLoggedIn()) return alert('Acceso no autorizado');

        if (confirm('¿Deseas eliminar este producto del catálogo?')) {
            this.products = this.products.filter(p => p.id !== id);
            StorageService.saveProducts(this.products);
            this.renderCategories();
            this.filterAndSort();
        }
    },

    resetForm: function() {
        $('#product-form')[0].reset();
        $('#form-product-id').val('');
        $('#btn-save-product').text('Guardar Producto');
        $('#btn-cancel-edit').addClass('hidden');
    },

    bindEvents: function() {
        const self = this;

        // Disparador Oculto 1: Triple clic en el logo
        let logoClicks = 0;
        let logoTimer;
        $('#secret-logo-trigger').on('click', function() {
            logoClicks++;
            clearTimeout(logoTimer);
            if (logoClicks === 3) {
                $('#admin-login-modal').removeClass('hidden');
                logoClicks = 0;
            } else {
                logoTimer = setTimeout(() => { logoClicks = 0; }, 700);
            }
        });

        // Disparador Oculto 2: Atajo de teclado (Ctrl + Alt + A)
        $(document).on('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                $('#admin-login-modal').removeClass('hidden');
            }
        });

        $('#admin-login-form').on('submit', function(e) {
            e.preventDefault();
            const user = $('#admin-user').val();
            const pass = $('#admin-pass').val();

            if (AuthService.login(user, pass)) {
                $('#admin-login-modal').addClass('hidden');
                $('#admin-login-form')[0].reset();
                $('#admin-login-error').addClass('hidden');
                self.updateAdminUI();
            } else {
                $('#admin-login-error').removeClass('hidden');
            }
        });

        $('#btn-logout-admin').on('click', function() {
            AuthService.logout();
            self.updateAdminUI();
        });

        // Búsqueda y Filtros
        $('#search-input').on('input', () => self.filterAndSort());
        $('#category-filter, #sort-select').on('change', () => self.filterAndSort());

        // Checkout Público
        $('#btn-open-checkout').on('click', function() {
            if (CartModule.items.length === 0) return alert('El carrito está vacío');
            $('#cart-sidebar').addClass('hidden');
            $('#checkout-modal').removeClass('hidden');
        });

        $('#checkout-form').on('submit', function(e) {
            e.preventDefault();
            alert(`¡Gracias por tu compra, ${$('#checkout-name').val()}! Tu pedido ha sido procesado con éxito.`);
            CartModule.clear();
            $('#checkout-modal').addClass('hidden');
            $('#checkout-form')[0].reset();
        });

        // CRUD
        $('#product-form').on('submit', (e) => self.saveProduct(e));
        $('#btn-cancel-edit').on('click', () => self.resetForm());

        // Tarjetas
        $('#catalog-grid')
            .on('click', '.btn-add-cart', function() {
                const id = $(this).closest('.card').data('id');
                CartModule.add(self.products.find(p => p.id === id));
            })
            .on('click', '.btn-detail', function() {
                const id = $(this).closest('.card').data('id');
                const p = self.products.find(item => item.id === id);
                $('#detail-modal-body').html(`
                    <h2>${p.title}</h2><br>
                    <img src="${p.image}" style="width:100%; max-height: 250px; object-fit: cover; border-radius: 8px;"><br><br>
                    <p><strong>Categoría:</strong> ${p.category}</p>
                    <p><strong>Precio:</strong> $${p.price}</p>
                    <p><strong>Stock disponible:</strong> ${p.stock}</p>
                    <p><strong>Descripción:</strong> ${p.description}</p>
                `);
                $('#detail-modal').removeClass('hidden');
            })
            .on('click', '.btn-edit', function() {
                self.editProduct($(this).closest('.card').data('id'));
            })
            .on('click', '.btn-delete', function() {
                self.deleteProduct($(this).closest('.card').data('id'));
            });

        // Carrito
        $('#btn-toggle-cart, #btn-close-cart').on('click', () => $('#cart-sidebar').toggleClass('hidden'));
        $('#cart-items').on('click', '.btn-remove-cart', function() {
            CartModule.remove($(this).data('id'));
        });

        // Modales
        $('.modal-close, .modal-backdrop').on('click', function(e) {
            if (e.target === this) {
                $('#detail-modal, #admin-login-modal, #checkout-modal').addClass('hidden');
            }
        });
    }
};

$(document).ready(() => CatalogApp.init());