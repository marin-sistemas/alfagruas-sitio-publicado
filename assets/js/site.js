/* Grúas Alfa México · comportamiento del sitio v2 (sin dependencias) */
(function () {
  "use strict";
  var WA = "525659472013";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function svg(id) { return '<svg class="ic" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------- Medición: cada contacto cuenta como prospecto ---------- */
  function evento(metodo) {
    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", { method: metodo });
      window.gtag("event", "contacto_" + metodo);
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-ev]");
    if (a) evento(a.getAttribute("data-ev"));
  });

  /* ---------- Menú ---------- */
  var menu = $("#menu"), abrir = $(".burger");
  function cerrarMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    abrir.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    abrir.focus();
  }
  if (menu && abrir) {
    abrir.addEventListener("click", function () {
      menu.hidden = false;
      abrir.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      $(".cerrar", menu).focus();
    });
    menu.addEventListener("click", function (e) {
      if (e.target === menu || e.target.closest(".cerrar") || e.target.closest("a")) cerrarMenu();
    });
  }

  /* ---------- Barra superior: en teléfono se esconde al bajar y vuelve al
     subir (como Marín Grúas); en escritorio se compacta ---------- */
  var hd = $("#hd"), yAnt = window.scrollY, pend = false;
  function alScroll() {
    var y = window.scrollY;
    if (hd) {
      hd.classList.toggle("mini", y > 40);
      hd.classList.toggle("oculta", y > 140 && y > yAnt + 2 && (!menu || menu.hidden));
      if (y < yAnt - 2 || y < 140) hd.classList.remove("oculta");
    }
    yAnt = y;
    pend = false;
  }
  window.addEventListener("scroll", function () {
    if (!pend) { pend = true; window.requestAnimationFrame(alScroll); }
  }, { passive: true });

  /* ---------- Pestañas de servicios ---------- */
  $$('[role="tablist"]').forEach(function (lista) {
    var tabs = $$('[role="tab"]', lista);
    function elige(t, foco) {
      tabs.forEach(function (x) {
        var si = x === t;
        x.setAttribute("aria-selected", si ? "true" : "false");
        x.tabIndex = si ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !si;
      });
      if (foco) t.focus();
      t.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { elige(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); elige(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------- Estantes: flechas en escritorio ---------- */
  $$(".cr").forEach(function (cr) {
    var c = $(".carril", cr), ant = $(".cr-ant", cr), sig = $(".cr-sig", cr);
    if (!c || !ant) return;
    function estado() {
      ant.disabled = c.scrollLeft < 8;
      sig.disabled = c.scrollLeft + c.clientWidth > c.scrollWidth - 8;
    }
    ant.addEventListener("click", function () { c.scrollBy({ left: -c.clientWidth * 0.8, behavior: "smooth" }); });
    sig.addEventListener("click", function () { c.scrollBy({ left: c.clientWidth * 0.8, behavior: "smooth" }); });
    c.addEventListener("scroll", estado, { passive: true });
    window.addEventListener("resize", estado);
    estado();
  });

  /* ---------- Aparición suave ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("si"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".sp:not([hidden]), .bento > *, .pasos-c, .cob, .faq, .tc, .cierre, .sh, .mh, .sb li, .os, .nt, .us-i, .cz-l, .qm-c, .ub")
      .forEach(function (p) {
        if (p.getBoundingClientRect().top > window.innerHeight) { p.classList.add("rv"); io.observe(p); }
      });
  }

  /* ---------- Trabajos: filtros ---------- */
  var filtros = $$(".fl");
  function filtrar(cat) {
    var hay = filtros.some(function (b) { return b.getAttribute("data-cat") === cat; });
    if (!hay) cat = "todas";
    filtros.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-cat") === cat ? "true" : "false"); });
    $$(".gl-i").forEach(function (it) { it.hidden = !(cat === "todas" || it.getAttribute("data-cat") === cat); });
  }
  if (filtros.length) {
    filtros.forEach(function (b) {
      b.addEventListener("click", function () {
        var cat = b.getAttribute("data-cat");
        filtrar(cat);
        history.replaceState(null, "", cat === "todas" ? location.pathname : "#" + cat);
      });
    });
    if (location.hash.length > 1) filtrar(decodeURIComponent(location.hash.slice(1)));
  }

  /* ---------- Visor de fotos (cualquier galería) ---------- */
  var lb = $(".lb"), lista = [], pos = 0, origen = null;
  function pinta() {
    var b = lista[pos];
    lb.innerHTML =
      '<div class="lb-cab"><span>' + (pos + 1) + " de " + lista.length + "</span>" +
      '<button class="lb-x" type="button" aria-label="Cerrar">' + svg("i-x") + "</button></div>" +
      '<figure class="lb-fig"><img src="' + b.getAttribute("data-src") + '" width="' + b.getAttribute("data-w") +
      '" height="' + b.getAttribute("data-h") + '" alt=""></figure>' +
      '<div class="lb-pie"><button class="lb-f lb-ant" type="button" aria-label="Foto anterior">' + svg("i-chev-l") + "</button>" +
      "<p></p>" +
      '<button class="lb-f lb-sig" type="button" aria-label="Foto siguiente">' + svg("i-chev-r") + "</button></div>";
    $("img", lb).alt = b.getAttribute("data-alt");
    $(".lb-pie p", lb).textContent = b.getAttribute("data-alt");
  }
  function cerrarLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = "";
    if (origen) origen.focus();
  }
  function mueve(n) { pos = (pos + n + lista.length) % lista.length; pinta(); }
  if (lb) {
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".lb-b");
      if (!b) return;
      var gal = b.closest("[data-galeria]") || document;
      lista = $$(".gl-i", gal).filter(function (it) { return !it.hidden; }).map(function (it) { return $(".lb-b", it); });
      pos = Math.max(0, lista.indexOf(b));
      origen = b;
      pinta();
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lb-x", lb).focus();
    });
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".lb-x") || e.target === lb || e.target.classList.contains("lb-fig")) cerrarLb();
      else if (e.target.closest(".lb-ant")) mueve(-1);
      else if (e.target.closest(".lb-sig")) mueve(1);
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "ArrowLeft") mueve(-1);
      if (e.key === "ArrowRight") mueve(1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mueve(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { cerrarMenu(); cerrarLb(); }
  });

  /* ---------- Cotizador por pasos → WhatsApp ---------- */
  var fm = $("#cotizar");
  if (fm) {
    var pasos = $$(".cz-s", fm), paso = 0;
    var atras = $(".cz-atras", fm), sig = $(".cz-sig", fm), env = $(".cz-env", fm);
    var err = $(".fm-err", fm), barra = $(".cz-prog span", fm), num = $(".cz-paso b", fm);
    function val(n) {
      var el = fm.elements[n];
      if (!el) return "";
      if (el.length !== undefined && !el.tagName) {
        var out = [];
        Array.prototype.forEach.call(el, function (x) { if (x.checked) out.push(x.getAttribute("data-nombre") || x.value); });
        return out.join(", ");
      }
      if (el.type === "radio" || el.type === "checkbox") return el.checked ? (el.getAttribute("data-nombre") || el.value) : "";
      return (el.value || "").trim();
    }
    function fecha() {
      var f = val("fecha");
      if (!f) return "";
      var p = f.split("-");
      return p[2] + "/" + p[1] + "/" + p[0];
    }
    function mensaje() {
      var l = ["Hola, quiero cotizar una maniobra."];
      var carga = val("carga"), det = val("detalle");
      if (carga || det) l.push("Qué voy a mover: " + [carga, det].filter(Boolean).join(" — "));
      if (val("peso")) l.push("Peso aproximado: " + val("peso"));
      if (val("medidas")) l.push("Medidas: " + val("medidas"));
      if (val("altura")) l.push("Altura: " + val("altura"));
      if (val("servicio")) l.push("Necesito: " + val("servicio"));
      if (val("lugar")) l.push("Dónde: " + val("lugar"));
      if (fecha()) l.push("Fecha: " + fecha());
      if (val("nombre")) l.push("Mi nombre: " + val("nombre"));
      return l.join("\n");
    }
    function muestra(n) {
      paso = n;
      pasos.forEach(function (p, i) { p.hidden = i !== n; });
      atras.hidden = n === 0;
      sig.hidden = n === pasos.length - 1;
      env.hidden = n !== pasos.length - 1;
      barra.style.width = ((n + 1) / pasos.length * 100) + "%";
      num.textContent = n + 1;
      err.hidden = true;
      if (n === pasos.length - 1) $(".cz-res", fm).innerHTML = "<b>Tu mensaje</b>" + mensaje().split("\n").slice(1).join("\n").replace(/[<>&]/g, "");
    }
    function valida() {
      if (paso === 0 && !val("carga") && !val("detalle")) return "Elige qué vas a mover o descríbelo.";
      if (paso === 3 && !val("lugar")) return "Dinos el municipio y la colonia de la maniobra.";
      return "";
    }
    sig.addEventListener("click", function () {
      var m = valida();
      if (m) { err.textContent = m; err.hidden = false; return; }
      muestra(paso + 1);
      fm.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    atras.addEventListener("click", function () { muestra(paso - 1); });
    fm.addEventListener("change", function () { if (paso === pasos.length - 1) muestra(paso); });
    fm.addEventListener("input", function () { if (paso === pasos.length - 1) $(".cz-res", fm).innerHTML = "<b>Tu mensaje</b>" + mensaje().split("\n").slice(1).join("\n").replace(/[<>&]/g, ""); });
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = valida();
      if (m) { err.textContent = m; err.hidden = false; $("input[name=lugar]", fm).focus(); return; }
      evento("cotizador");
      window.location.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(mensaje());
    });
    /* Viene de «¿Qué vas a mover?»: la carga ya elegida */
    var q = new URLSearchParams(location.search).get("carga");
    if (q) {
      var r = $('input[name=carga][value="' + q.replace(/[^a-z]/g, "") + '"]', fm);
      if (r) { r.checked = true; muestra(1); }
    }
  }
})();
