$(document.body).ready(function () {

  // ==========================================
  // ESTADO GLOBAL DE DATOS
  // ==========================================
  let sociosData = [
    { id: 1, nombre: "Carlos Mendoza", email: "carlos@gmail.com", telefono: "71234567", plan: "Plan Pro Titan ($45)" },
    { id: 2, nombre: "Lucía Fernández", email: "lucia@hotmail.com", telefono: "79876543", plan: "Plan Personalizado ($50)" }
  ];

  let cart = [];
  let ventasData = [];

  // ==========================================
  // 1. ANIMACIONES Y VISTAS DE NAVEGACIÓN
  // ==========================================

  $("#btn-toggle-menu").on("click", function () {
    $("#main-nav").slideToggle(300);
  });

  $("#btn-switch-admin").on("click", function (e) {
    e.preventDefault();
    $("#user-view").fadeOut(200, function () {
      $("#admin-view").fadeIn(300);
      actualizarPanelAdmin();
    });
    if (window.innerWidth <= 768) {
      $("#main-nav").slideUp(200);
    }
  });

  $("#btn-back-user").on("click", function () {
    $("#admin-view").fadeOut(200, function () {
      $("#user-view").fadeIn(300);
    });
  });

  $("#btn-toggle-form").on("click", function () {
    $("#gym-form").slideToggle(400, function () {
      const isVisible = $("#gym-form").is(":visible");
      const icon = $("#btn-toggle-form i");
      if (isVisible) {
        icon.removeClass("fa-chevron-down").addClass("fa-chevron-up");
      } else {
        icon.removeClass("fa-chevron-up").addClass("fa-chevron-down");
      }
    });
  });

  // ==========================================
  // 2. SELECCIÓN DE PLANES PREDETERMINADOS
  // ==========================================

  $(".select-plan").on("click", function () {
    const planNombre = $(this).data("plan");

    $("#plan-seleccionado").val(planNombre);
    validarCampo($("#plan-seleccionado"), planNombre.trim() !== "", "Debes seleccionar un plan válido.");

    $("html, body").animate({
      scrollTop: $("#registro").offset().top - 80
    }, 500);

    if (!$("#gym-form").is(":visible")) {
      $("#gym-form").show(300);
      $("#btn-toggle-form i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
    }
  });


  // ==========================================
  // 3. ARMADOR DE PLAN PERSONALIZADO (DINÁMICO)
  // ==========================================

  function recalcularPlanPersonalizado() {
    let costoBase = parseInt($("#custom-dias").val());
    let diasTexto = $("#custom-dias option:selected").text().split("(")[0].trim();
    
    let total = costoBase;
    let items = [diasTexto];

    $(".custom-addon:checked").each(function() {
      total += parseInt($(this).data("cost"));
      items.push($(this).val());
    });

    $("#custom-total").text(`$${total}`);
    
    let $ul = $("#custom-features-list");
    $ul.empty();
    items.forEach(item => {
      $ul.append(`<li>${item}</li>`);
    });

    return { total, items };
  }

  $("#custom-dias, .custom-addon").on("change", function() {
    recalcularPlanPersonalizado();
  });

  $("#btn-select-custom-plan").on("click", function() {
    const planInfo = recalcularPlanPersonalizado();
    const nombrePlanCustom = `Plan a Medida ($${planInfo.total})`;

    // Añadir opción al select si no existe
    if ($(`#plan-seleccionado option[value="${nombrePlanCustom}"]`).length === 0) {
      $("#plan-seleccionado").append(new Option(`${nombrePlanCustom} - ${planInfo.items.join(", ")}`, nombrePlanCustom));
    }
    
    $("#plan-seleccionado").val(nombrePlanCustom);
    validarCampo($("#plan-seleccionado"), true, "");

    $("html, body").animate({
      scrollTop: $("#registro").offset().top - 80
    }, 500);

    if (!$("#gym-form").is(":visible")) {
      $("#gym-form").show(300);
    }
  });


  // ==========================================
  // 4. TIENDA DE PRODUCTOS Y CARRITO
  // ==========================================

  $(".add-to-cart").on("click", function() {
    const name = $(this).data("name");
    const price = parseFloat($(this).data("price"));

    cart.push({ name, price });
    actualizarCarritoUI();

    $("#cart-drawer").slideDown(300);
  });

  function actualizarCarritoUI() {
    $("#cart-count").text(cart.length);
    const $list = $("#cart-items-list");
    $list.empty();

    let total = 0;
    cart.forEach((item, index) => {
      total += item.price;
      $list.append(`
        <li class="cart-item">
          <span>${item.name}</span>
          <span><strong>$${item.price}</strong> <i class="fa-solid fa-trash btn-delete-cart" data-index="${index}" style="cursor:pointer; color:var(--error-color); margin-left:10px;"></i></span>
        </li>
      `);
    });

    $("#cart-total-price").text(total);
  }

  $(document).on("click", ".btn-delete-cart", function() {
    const idx = $(this).data("index");
    cart.splice(idx, 1);
    actualizarCarritoUI();

    if (cart.length === 0) {
      $("#cart-drawer").slideUp(200);
    }
  });

  $("#btn-checkout").on("click", function() {
    if (cart.length === 0) return;

    const totalVenta = cart.reduce((sum, item) => sum + item.price, 0);
    const nombresProds = cart.map(i => i.name).join(", ");
    const fecha = new Date().toLocaleString();

    ventasData.push({
      id: ventasData.length + 1,
      productos: nombresProds,
      total: totalVenta,
      fecha: fecha
    });

    alert(`¡Compra procesada con éxito! Total: $${totalVenta}`);
    cart = [];
    actualizarCarritoUI();
    $("#cart-drawer").slideUp(200);
  });


  // ==========================================
  // 5. VALIDACIÓN EN TIEMPO REAL Y REGISTRO
  // ==========================================

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexTelefono = /^[0-9]{7,12}$/;

  function validarCampo($input, condicion, mensajeError) {
    const $parent = $input.closest(".form-group");
    const $errorSmall = $parent.find(".error-text");

    if (!condicion) {
      $parent.addClass("invalid").removeClass("valid");
      $errorSmall.text(mensajeError).fadeIn(200);
      return false;
    } else {
      $parent.addClass("valid").removeClass("invalid");
      $errorSmall.fadeOut(100);
      return true;
    }
  }

  $("#nombre").on("input", function () {
    validarCampo($(this), $(this).val().trim().length >= 3, "El nombre debe tener al menos 3 caracteres.");
  });

  $("#email").on("input", function () {
    validarCampo($(this), regexEmail.test($(this).val().trim()), "Ingresa un correo electrónico válido.");
  });

  $("#telefono").on("input", function () {
    validarCampo($(this), regexTelefono.test($(this).val().trim()), "Ingresa un número de teléfono válido (7 a 12 dígitos).");
  });

  $("#plan-seleccionado").on("change", function () {
    validarCampo($(this), $(this).val() !== "", "Por favor selecciona un plan.");
  });

  $("#gym-form").on("submit", function (e) {
    e.preventDefault();

    const vNombre = validarCampo($("#nombre"), $("#nombre").val().trim().length >= 3, "El nombre debe tener al menos 3 caracteres.");
    const vEmail = validarCampo($("#email"), regexEmail.test($("#email").val().trim()), "Ingresa un correo electrónico válido.");
    const vTelefono = validarCampo($("#telefono"), regexTelefono.test($("#telefono").val().trim()), "Ingresa un número válido.");
    const vPlan = validarCampo($("#plan-seleccionado"), $("#plan-seleccionado").val() !== "", "Por favor selecciona un plan.");

    const $alert = $("#alert-message");

    if (vNombre && vEmail && vTelefono && vPlan) {
      const nuevoSocio = {
        id: sociosData.length > 0 ? sociosData[sociosData.length - 1].id + 1 : 1,
        nombre: $("#nombre").val().trim(),
        email: $("#email").val().trim(),
        telefono: $("#telefono").val().trim(),
        plan: $("#plan-seleccionado").val()
      };

      sociosData.push(nuevoSocio);

      $alert
        .removeClass("alert-danger hidden")
        .addClass("alert-success")
        .html(`<i class="fa-solid fa-circle-check"></i> ¡Registro exitoso! Bienvenido a TITAN GYM, <strong>${nuevoSocio.nombre}</strong>.`)
        .fadeIn(400);

      $("#gym-form")[0].reset();
      $(".form-group").removeClass("valid invalid");

      setTimeout(function () {
        $alert.fadeOut(500);
      }, 4000);
    } else {
      $alert
        .removeClass("alert-success hidden")
        .addClass("alert-danger")
        .html('<i class="fa-solid fa-triangle-exclamation"></i> Por favor completa todos los campos obligatorios.')
        .fadeIn(300);
    }
  });


  // ==========================================
  // 6. ADMINISTRACIÓN (SOCIOS Y VENTAS)
  // ==========================================

  function actualizarPanelAdmin(filtro = "") {
    // 1. Tabla de Socios
    const $tbodySocios = $("#socios-table-body");
    $tbodySocios.empty();

    const datosFiltrados = sociosData.filter(s => 
      s.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
      s.email.toLowerCase().includes(filtro.toLowerCase()) ||
      s.plan.toLowerCase().includes(filtro.toLowerCase())
    );

    if (datosFiltrados.length === 0) {
      $tbodySocios.append(`<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No se encontraron socios.</td></tr>`);
    } else {
      datosFiltrados.forEach(socio => {
        $tbodySocios.append(`
          <tr>
            <td>#${socio.id}</td>
            <td><strong>${socio.nombre}</strong></td>
            <td>${socio.email}</td>
            <td>${socio.telefono}</td>
            <td><span class="card-badge" style="position:static; display:inline-block;">${socio.plan}</span></td>
            <td>
              <button class="btn-delete" data-id="${socio.id}" title="Eliminar Socio"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          </tr>
        `);
      });
    }

    // 2. Tabla de Ventas
    const $tbodyVentas = $("#ventas-table-body");
    $tbodyVentas.empty();

    if (ventasData.length === 0) {
      $tbodyVentas.append(`<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No hay ventas registradas en la tienda.</td></tr>`);
    } else {
      ventasData.forEach(v => {
        $tbodyVentas.append(`
          <tr>
            <td>#V-${v.id}</td>
            <td>${v.productos}</td>
            <td><strong>$${v.total}</strong></td>
            <td>${v.fecha}</td>
          </tr>
        `);
      });
    }

    // Métricas
    $("#stat-total-socios").text(sociosData.length);

    let ingresosMembresias = sociosData.reduce((acc, s) => {
      let match = s.plan.match(/\$(\d+)/);
      return acc + (match ? parseInt(match[1]) : 30);
    }, 0);
    $("#stat-ingresos").text(`$${ingresosMembresias}`);

    let ingresosTienda = ventasData.reduce((acc, v) => acc + v.total, 0);
    $("#stat-ventas-tienda").text(`$${ingresosTienda}`);
  }

  $("#search-socio").on("input", function() {
    actualizarPanelAdmin($(this).val());
  });

  $(document).on("click", ".btn-delete", function() {
    const idSocio = $(this).data("id");
    if (confirm("¿Estás seguro de eliminar este socio del sistema?")) {
      sociosData = sociosData.filter(s => s.id !== idSocio);
      actualizarPanelAdmin($("#search-socio").val());
    }
  });


  // ==========================================
  // 7. ENLACES A REDES SOCIALES E INTERACTIVIDAD
  // ==========================================

  $(".social-icon").on("mouseenter", function () {
    const redSocial = $(this).data("name");
    $("#social-feedback")
      .stop(true, true)
      .text(`Abrir enlace oficial de ${redSocial} en una nueva pestaña`)
      .fadeToggle(200);
  }).on("mouseleave", function () {
    $("#social-feedback")
      .stop(true, true)
      .fadeToggle(200, function () {
        $(this).text("");
      });
  });

});