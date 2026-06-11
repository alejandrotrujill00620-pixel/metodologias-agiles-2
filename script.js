// ═══════════════════════════════════════════════════
//  RECORDATORIO DE MEDICAMENTOS — script.js
//  Código simplificado para aprender más fácil
// ═══════════════════════════════════════════════════

var personas = [];
var medicamentos = {};
var personaActiva = null;

var datosIniciales = {
  personas: [
    { id: 1, nombre: "Ana", apellidos: "González", documento: "12345678", avatar: "👵", fechaRegistro: hoy() },
    { id: 2, nombre: "Jorge", apellidos: "Ramírez", documento: "87654321", avatar: "👨‍🦳", fechaRegistro: hoy() }
  ],
  medicamentos: {
    1: [
      { id: 101, nombre: "Paracetamol", dosis: "500 mg", hora: "09:00", tomado: false, fecha: hoy() },
      { id: 102, nombre: "Ácido fólico", dosis: "1 comprimido", hora: "13:00", tomado: true, fecha: hoy() }
    ],
    2: [
      { id: 201, nombre: "Amlodipino", dosis: "5 mg", hora: "08:00", tomado: false, fecha: hoy() }
    ]
  }
};

document.addEventListener("DOMContentLoaded", function() {
  cargarDatos();
  renderizarPanelPersonas();
  if (personas.length > 0) {
    seleccionarPersona(personas[0].id);
  }
});

function cargarDatos() {
  var savedPersonas = localStorage.getItem("personas");
  var savedMedicamentos = localStorage.getItem("medicamentos");

  if (savedPersonas) { personas = JSON.parse(savedPersonas); }
  if (savedMedicamentos) { medicamentos = JSON.parse(savedMedicamentos); }

  if (personas.length === 0) {
    personas = datosIniciales.personas;
  }

  if (Object.keys(medicamentos).length === 0) {
    medicamentos = datosIniciales.medicamentos;
  }

  for (var i = 0; i < personas.length; i++) {
    var persona = personas[i];
    if (!medicamentos[persona.id]) {
      medicamentos[persona.id] = [];
    }
  }

  guardarDatos();
}

function guardarDatos() {
  localStorage.setItem("personas", JSON.stringify(personas));
  localStorage.setItem("medicamentos", JSON.stringify(medicamentos));
}

function abrirModalAgregarPersona() {
  var modal = document.getElementById("modal-persona");
  if (!modal) { return; }

  document.getElementById("persona-nombre").value = "";
  document.getElementById("persona-apellidos").value = "";
  document.getElementById("persona-documento").value = "";
  document.getElementById("persona-avatar").value = "";

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("persona-nombre").focus();
}

function cerrarModalAgregarPersona() {
  var modal = document.getElementById("modal-persona");
  if (!modal) { return; }
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function enviarNuevaPersona() {
  var nombre = document.getElementById("persona-nombre").value.trim();
  var apellidos = document.getElementById("persona-apellidos").value.trim();
  var documento = document.getElementById("persona-documento").value.trim();
  var avatar = document.getElementById("persona-avatar").value.trim() || "👤";

  if (!nombre || !apellidos || !documento) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  for (var i = 0; i < personas.length; i++) {
    if (personas[i].documento === documento) {
      alert("⚠️ Este documento ya está registrado");
      return;
    }
  }

  var nuevaPersona = {
    id: Date.now(),
    nombre: nombre,
    apellidos: apellidos,
    documento: documento,
    avatar: avatar,
    fechaRegistro: hoy()
  };

  personas.push(nuevaPersona);
  medicamentos[nuevaPersona.id] = [];
  guardarDatos();
  renderizarPanelPersonas();
  seleccionarPersona(nuevaPersona.id);
  cerrarModalAgregarPersona();
  alert("✅ Persona registrada: " + nuevaPersona.nombre + " " + nuevaPersona.apellidos);
}

function eliminarPersona(personaId) {
  if (!confirm("¿Estás seguro? Se eliminarán los medicamentos de esta persona.")) {
    return;
  }

  var nuevaLista = [];
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].id !== personaId) {
      nuevaLista.push(personas[i]);
    }
  }
  personas = nuevaLista;
  delete medicamentos[personaId];
  guardarDados();

  if (personaActiva === personaId) {
    if (personas.length > 0) {
      personaActiva = personas[0].id;
    } else {
      personaActiva = null;
    }
  }

  renderizarPanelPersonas();
  if (personaActiva) {
    seleccionarPersona(personaActiva);
  }
}

function renderizarPanelPersonas() {
  var panel = document.getElementById("panel-personas");
  if (!panel) { return; }

  if (personas.length === 0) {
    panel.innerHTML =
      '<div style="text-align:center; padding: 32px; color: #64748b;">' +
      '<p style="margin-bottom: 16px;">No hay personas registradas</p>' +
      '<button onclick="abrirModalAgregarPersona()" style="background: black; color: white; padding: 10px 18px; border-radius: 12px; border: none; cursor: pointer;">➕ Registrar primera persona</button>' +
      '</div>';
    return;
  }

  var html = "";
  for (var i = 0; i < personas.length; i++) {
    var persona = personas[i];
    html += '<div style="display:flex; align-items:center; gap:8px;">';
    html += '<button id="btn-persona-' + persona.id + '" class="persona-btn" onclick="seleccionarPersona(' + persona.id + ')" style="padding:10px 16px; border-radius:12px; border:2px solid #ccc; background:white; font-size:14px; font-weight:600; cursor:pointer;">' + persona.avatar + ' ' + persona.nombre + '</button>';
    html += '<button onclick="eliminarPersona(' + persona.id + ')" style="background:#fee2e2; color:#dc2626; border:none; cursor:pointer; padding:10px 14px; border-radius:12px;">✖</button>';
    html += '</div>';
  }

  html += '<button onclick="abrirModalAgregarPersona()" style="margin-top:8px; padding:10px 16px; border-radius:12px; border:2px dashed #999; background:#f5f5f5; cursor:pointer;">➕ Nueva persona</button>';
  panel.innerHTML = html;
  actualizarBotonesActivos();
}

function seleccionarPersona(personaId) {
  personaActiva = personaId;
  actualizarBotonesActivos();
  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
  actualizarTitulo();
}

function actualizarBotonesActivos() {
  var botones = document.getElementsByClassName("persona-btn");
  for (var i = 0; i < botones.length; i++) {
    var btn = botones[i];
    var id = btn.id.replace("btn-persona-", "");
    if (parseInt(id, 10) === personaActiva) {
      btn.style.background = "black";
      btn.style.color = "white";
      btn.style.borderColor = "black";
    } else {
      btn.style.background = "white";
      btn.style.color = "black";
      btn.style.borderColor = "#ccc";
    }
  }
}

function actualizarTitulo() {
  var persona = null;
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].id === personaActiva) {
      persona = personas[i];
      break;
    }
  }

  var titulo = document.getElementById("titulo-persona");
  if (titulo && persona) {
    titulo.textContent = persona.avatar + " " + persona.nombre + " " + persona.apellidos;
  }
}

function agregarMedicamento() {
  if (!personaActiva) {
    alert("⚠️ Selecciona una persona primero");
    return;
  }

  var nombre = document.getElementById("input-nombre").value.trim();
  var dosis = document.getElementById("input-dosis").value.trim();
  var hora = document.getElementById("input-hora").value;
  var errMsg = document.getElementById("error-msg");
  var form = document.getElementById("form-agregar");

  if (!nombre || !dosis || !hora) {
    errMsg.classList.remove("hidden");
    form.classList.add("shake");
    setTimeout(function() { form.classList.remove("shake"); }, 500);
    return;
  }

  errMsg.classList.add("hidden");

  var nuevo = {
    id: Date.now(),
    nombre: nombre,
    dosis: dosis,
    hora: hora,
    tomado: false,
    fecha: hoy()
  };

  medicamentos[personaActiva].push(nuevo);
  guardarDatos();

  document.getElementById("input-nombre").value = "";
  document.getElementById("input-dosis").value = "";
  document.getElementById("input-hora").value = "";

  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
  document.getElementById("lista-medicamentos").scrollIntoView({ behavior: "smooth" });
}

function marcarTomado(medId) {
  var lista = medicamentos[personaActiva];
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === medId) {
      lista[i].tomado = true;
      break;
    }
  }

  guardarDatos();
  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
}

function eliminarMedicamento(medId) {
  var nuevaLista = [];
  var lista = medicamentos[personaActiva];
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id !== medId) {
      nuevaLista.push(lista[i]);
    }
  }
  medicamentos[personaActiva] = nuevaLista;
  guardarDatos();
  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
}

function renderizarTarjetas() {
  var contenedor = document.getElementById("lista-medicamentos");
  var emptyHoy = document.getElementById("empty-today");
  var lista = [];
  var todos = medicamentos[personaActiva] || [];

  for (var i = 0; i < todos.length; i++) {
    if (todos[i].fecha === hoy()) {
      lista.push(todos[i]);
    }
  }

  if (lista.length === 0) {
    contenedor.innerHTML = "";
    emptyHoy.style.display = "";
    return;
  }

  emptyHoy.style.display = "none";
  var html = "";

  for (var i = 0; i < lista.length; i++) {
    var med = lista[i];
    var statusHtml = "";
    if (med.tomado) {
      statusHtml = '<span style="background:#dcfce7;color:#16a34a;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:700;white-space:nowrap;">✅ Tomado</span>';
    } else {
      statusHtml = '<span style="background:#fed7aa;color:#c2410c;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:700;white-space:nowrap;">🟠 Pendiente</span>';
    }

    var botonTomar = "";
    if (!med.tomado) {
      botonTomar = '<button onclick="marcarTomado(' + med.id + ')" style="background:black;color:white;border:none;cursor:pointer;padding:10px 18px;border-radius:12px;font-size:13px;font-weight:700;">✔ Ya tomé mi medicamento</button>';
    }

    var botonEliminar = '<button onclick="eliminarMedicamento(' + med.id + ')" style="background:#fee2e2;color:#dc2626;border:none;cursor:pointer;padding:10px 14px;border-radius:12px;font-size:15px;">🗑</button>';

    html += '<div class="med-card" style="background:white;border-radius:16px;padding:20px 24px;box-shadow:0 2px 12px rgba(0,0,0,0.07);border:2px solid ' + (med.tomado ? '#bbf7d0' : '#fed7aa') + ';display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">';
    html += '<div style="flex:1;min-width:160px;"><p style="font-size:18px;font-weight:700;color:#111;margin:0 0 4px;">💊 ' + med.nombre + '</p>';
    html += '<p style="font-size:14px;color:#555;margin:0;">⏰ ' + formatHora(med.hora) + ' · ' + med.dosis + '</p></div>';
    html += statusHtml;
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' + botonTomar + botonEliminar + '</div>';
    html += '</div>';
  }

  contenedor.innerHTML = html;
}

function renderizarHistorial() {
  var tbody = document.getElementById("historial-body");
  var emptyRow = document.getElementById("empty-hist");
  var lista = medicamentos[personaActiva] || [];

  if (lista.length === 0) {
    tbody.innerHTML = '<tr id="empty-hist"><td colspan="4" style="padding:32px;text-align:center;color:#94a3b8;font-weight:600;">📭 Aún no hay registros en el historial</td></tr>';
    return;
  }

  var html = "";
  var ordenada = lista.slice();
  ordenada.sort(function(a, b) {
    if (a.fecha !== b.fecha) { return b.fecha.localeCompare(a.fecha); }
    return a.hora.localeCompare(b.hora);
  });

  for (var i = 0; i < ordenada.length; i++) {
    var med = ordenada[i];
    var estado = "";
    if (med.tomado) {
      estado = '<span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">✅ Tomado</span>';
    } else {
      estado = '<span style="background:#fed7aa;color:#c2410c;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">🟠 Pendiente</span>';
    }

    html += '<tr style="border-bottom:1px solid #f0f0f0;' + (med.tomado ? '' : 'background:#fff7ed;') + '">';
    html += '<td style="padding:14px 16px;font-weight:600;color:#111;">💊 ' + med.nombre + '</td>';
    html += '<td style="padding:14px 16px;color:#444;font-weight:500;">' + formatHora(med.hora) + '</td>';
    html += '<td style="padding:14px 16px;color:#555;">' + med.dosis + '</td>';
    html += '<td style="padding:14px 16px;">' + estado + '</td>';
    html += '</tr>';
  }

  tbody.innerHTML = html;
}

function actualizarBadge() {
  var badge = document.getElementById("badge-count");
  var count = 0;
  var lista = medicamentos[personaActiva] || [];
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].fecha === hoy() && !lista[i].tomado) {
      count = count + 1;
    }
  }

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function formatHora(hora) {
  var parts = hora.split(":");
  var h = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  var ampm = h >= 12 ? "PM" : "AM";
  var h12 = h % 12;
  if (h12 === 0) { h12 = 12; }
  var minuto = m < 10 ? "0" + m : m;
  return h12 + ":" + minuto + " " + ampm;
}
