// ═══════════════════════════════════════════════════
//  RECORDATORIO DE MEDICAMENTOS — script.js
//  Sistema de personas y medicamentos
// ═══════════════════════════════════════════════════

// ─── ESTADO GLOBAL ───────────────────────────────────
let personas = [];                    // Array de todas las personas
let medicamentos = {};                // medicamentos[personaId] = [{ id, nombre, dosis, hora, tomado, fecha }]
let personaActiva = null;             // ID de la persona actualmente seleccionada

const datosIniciales = {
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

// ─── INIT ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  renderizarPanelPersonas();

  if (personas.length > 0) {
    seleccionarPersona(personas[0].id);
  }
});

// ─── PERSISTENCIA ────────────────────────────────────
function cargarDatos() {
  const savedPersonas = localStorage.getItem("personas");
  const savedMedicamentos = localStorage.getItem("medicamentos");

  if (savedPersonas) personas = JSON.parse(savedPersonas);
  if (savedMedicamentos) medicamentos = JSON.parse(savedMedicamentos);

  // Si no hay datos guardados, usar JSON inicial de ejemplo
  if (personas.length === 0) {
    personas = datosIniciales.personas;
  }
  if (Object.keys(medicamentos).length === 0) {
    medicamentos = datosIniciales.medicamentos;
  }

  // Inicializar medicamentos para personas sin datos
  personas.forEach(p => {
    if (!medicamentos[p.id]) medicamentos[p.id] = [];
  });

  guardarDatos();
}

function guardarDatos() {
  localStorage.setItem("personas", JSON.stringify(personas));
  localStorage.setItem("medicamentos", JSON.stringify(medicamentos));
}

// ─── AGREGAR PERSONA ─────────────────────────────────
function abrirModalAgregarPersona() {
  const nombre = prompt("Ingresa el nombre de la persona:");
  if (!nombre || !nombre.trim()) return;

  const apellidos = prompt("Ingresa los apellidos:");
  if (!apellidos || !apellidos.trim()) return;

  const documento = prompt("Ingresa el documento de identidad (cédula, pasaporte, etc.):");
  if (!documento || !documento.trim()) return;

  // Validar que el documento sea único
  if (personas.some(p => p.documento === documento.trim())) {
    alert("⚠️ Este documento ya está registrado");
    return;
  }

  const nuevaPersona = {
    id: Date.now(),
    nombre: nombre.trim(),
    apellidos: apellidos.trim(),
    documento: documento.trim(),
    avatar: "👤",
    fechaRegistro: hoy()
  };

  personas.push(nuevaPersona);
  medicamentos[nuevaPersona.id] = [];
  guardarDatos();

  renderizarPanelPersonas();
  seleccionarPersona(nuevaPersona.id);

  alert(`✅ Persona registrada exitosamente!\n${nuevaPersona.nombre} ${nuevaPersona.apellidos}`);
}

// ─── ELIMINAR PERSONA ────────────────────────────────
function eliminarPersona(personaId) {
  if (!confirm("¿Estás seguro? Se eliminarán todos los medicamentos de esta persona.")) return;

  personas = personas.filter(p => p.id !== personaId);
  delete medicamentos[personaId];
  guardarDatos();

  if (personaActiva === personaId) {
    personaActiva = personas.length > 0 ? personas[0].id : null;
  }

  renderizarPanelPersonas();
  if (personaActiva) {
    seleccionarPersona(personaActiva);
  }
}

// ─── RENDERIZAR PANEL DE PERSONAS ────────────────────
function renderizarPanelPersonas() {
  const panel = document.getElementById("panel-personas");
  if (!panel) return;

  panel.innerHTML = "";

  if (personas.length === 0) {
    panel.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p class="mb-4">No hay personas registradas</p>
        <button onclick="abrirModalAgregarPersona()"
          class="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
          ➕ Registrar primera persona
        </button>
      </div>
    `;
    return;
  }

  personas.forEach(persona => {
    const btn = document.createElement("button");
    btn.id = `btn-persona-${persona.id}`;
    btn.className = "persona-btn";
    btn.textContent = `${persona.avatar} ${persona.nombre}`;
    btn.style.cssText = `
      padding: 10px 16px;
      border-radius: 12px;
      border: 2px solid #ccc;
      background: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    `;
    btn.onmouseover = () => { if (personaActiva !== persona.id) btn.style.borderColor = "#888"; };
    btn.onmouseout = () => { if (personaActiva !== persona.id) btn.style.borderColor = "#ccc"; };
    btn.onclick = () => seleccionarPersona(persona.id);
    panel.appendChild(btn);
  });

  // Botón para agregar nueva persona
  const btnAgregar = document.createElement("button");
  btnAgregar.textContent = "➕ Nueva persona";
  btnAgregar.onclick = abrirModalAgregarPersona;
  btnAgregar.style.cssText = `
    padding: 10px 16px;
    border-radius: 12px;
    border: 2px dashed #999;
    background: #f5f5f5;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  `;
  btnAgregar.onmouseover = () => btnAgregar.style.borderColor = "#333";
  btnAgregar.onmouseout = () => btnAgregar.style.borderColor = "#999";
  panel.appendChild(btnAgregar);

  actualizarBotonesActivos();
}

// ─── SELECCIONAR PERSONA ─────────────────────────────
function seleccionarPersona(personaId) {
  personaActiva = personaId;
  actualizarBotonesActivos();
  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
  actualizarTitulo();
}

function actualizarBotonesActivos() {
  document.querySelectorAll(".persona-btn").forEach(btn => {
    const id = btn.id.replace("btn-persona-", "");
    if (parseInt(id) === personaActiva) {
      btn.style.background = "black";
      btn.style.color = "white";
      btn.style.borderColor = "black";
    } else {
      btn.style.background = "white";
      btn.style.color = "black";
      btn.style.borderColor = "#ccc";
    }
  });
}

function actualizarTitulo() {
  const persona = personas.find(p => p.id === personaActiva);
  const titulo = document.getElementById("titulo-persona");
  if (titulo && persona) {
    titulo.textContent = `${persona.avatar} ${persona.nombre} ${persona.apellidos}`;
  }
}

// ─── AGREGAR MEDICAMENTO ─────────────────────────────
function agregarMedicamento() {
  if (!personaActiva) {
    alert("⚠️ Selecciona una persona primero");
    return;
  }

  const nombre = document.getElementById("input-nombre").value.trim();
  const dosis = document.getElementById("input-dosis").value.trim();
  const hora = document.getElementById("input-hora").value;
  const errMsg = document.getElementById("error-msg");
  const form = document.querySelector(".bg-white.p-6");

  if (!nombre || !dosis || !hora) {
    errMsg.classList.remove("hidden");
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
    return;
  }

  errMsg.classList.add("hidden");

  const nuevo = {
    id: Date.now(),
    nombre,
    dosis,
    hora,
    tomado: false,
    fecha: hoy(),
  };

  medicamentos[personaActiva].push(nuevo);
  guardarDatos();

  // Limpiar campos
  document.getElementById("input-nombre").value = "";
  document.getElementById("input-dosis").value = "";
  document.getElementById("input-hora").value = "";

  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();

  // Scroll suave a la sección de tarjetas
  document.getElementById("lista-medicamentos").scrollIntoView({ behavior: "smooth" });
}

// ─── MARCAR COMO TOMADO ──────────────────────────────
function marcarTomado(medId) {
  const lista = medicamentos[personaActiva];
  const med = lista.find(m => m.id === medId);
  if (!med) return;

  med.tomado = true;
  guardarDatos();

  const fila = document.getElementById(`hist-row-${medId}`);
  if (fila) {
    fila.classList.add("flash-green");
    setTimeout(() => fila.classList.remove("flash-green"), 700);
  }

  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
}

// ─── ELIMINAR MEDICAMENTO ────────────────────────────
function eliminarMedicamento(medId) {
  medicamentos[personaActiva] = medicamentos[personaActiva].filter(m => m.id !== medId);
  guardarDatos();
  renderizarTarjetas();
  renderizarHistorial();
  actualizarBadge();
}

// ─── RENDERIZAR TARJETAS DE HOY ──────────────────────
function renderizarTarjetas() {
  const contenedor = document.getElementById("lista-medicamentos");
  const emptyHoy = document.getElementById("empty-today");
  const lista = (medicamentos[personaActiva] || []).filter(m => m.fecha === hoy());

  Array.from(contenedor.children).forEach(c => {
    if (c.id !== "empty-today") c.remove();
  });

  if (lista.length === 0) {
    emptyHoy.style.display = "";
    return;
  }

  emptyHoy.style.display = "none";

  const ordenada = [...lista].sort((a, b) => a.hora.localeCompare(b.hora));

  ordenada.forEach((med, i) => {
    const card = document.createElement("div");
    card.className = "med-card";
    card.style.cssText += `
      background: white;
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      border: 2px solid ${med.tomado ? "#bbf7d0" : "#fed7aa"};
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      animation: slideIn 0.35s ease forwards;
      animation-delay: ${i * 60}ms;
      opacity: 0;
    `;

    const info = document.createElement("div");
    info.style.cssText = "flex: 1; min-width: 160px;";

    const titulo = document.createElement("p");
    titulo.textContent = `💊 ${med.nombre}`;
    titulo.style.cssText = "font-size: 18px; font-weight: 700; color: #111; margin: 0 0 4px;";

    const detalle = document.createElement("p");
    detalle.textContent = `⏰ ${formatHora(med.hora)}  ·  ${med.dosis}`;
    detalle.style.cssText = "font-size: 14px; color: #555; margin: 0;";

    info.appendChild(titulo);
    info.appendChild(detalle);

    const badge = document.createElement("span");
    if (med.tomado) {
      badge.textContent = "✅ Tomado";
      badge.style.cssText = `
        background: #dcfce7; color: #16a34a;
        padding: 6px 14px; border-radius: 999px;
        font-size: 13px; font-weight: 700; white-space: nowrap;
      `;
    } else {
      badge.textContent = "🟠 Pendiente";
      badge.className = "badge-pendiente";
      badge.style.cssText = `
        background: #fed7aa; color: #c2410c;
        padding: 6px 14px; border-radius: 999px;
        font-size: 13px; font-weight: 700; white-space: nowrap;
      `;
    }

    const botones = document.createElement("div");
    botones.style.cssText = "display: flex; gap: 8px; align-items: center; flex-wrap: wrap;";

    if (!med.tomado) {
      const btnTomar = document.createElement("button");
      btnTomar.className = "btn-tomar";
      btnTomar.textContent = "✔ Ya tomé mi medicamento";
      btnTomar.style.cssText = `
        background: black; color: white;
        border: none; cursor: pointer;
        padding: 10px 18px; border-radius: 12px;
        font-size: 13px; font-weight: 700;
        transition: all 0.2s; white-space: nowrap;
        font-family: 'DM Sans', sans-serif;
      `;
      btnTomar.onmouseover = () => btnTomar.style.background = "#333";
      btnTomar.onmouseout = () => btnTomar.style.background = "black";
      btnTomar.onclick = () => marcarTomado(med.id);
      botones.appendChild(btnTomar);
    }

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "🗑";
    btnEliminar.title = "Eliminar";
    btnEliminar.style.cssText = `
      background: #fee2e2; color: #dc2626;
      border: none; cursor: pointer;
      padding: 10px 14px; border-radius: 12px;
      font-size: 15px; transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    `;
    btnEliminar.onmouseover = () => btnEliminar.style.background = "#fecaca";
    btnEliminar.onmouseout = () => btnEliminar.style.background = "#fee2e2";
    btnEliminar.onclick = () => eliminarMedicamento(med.id);
    botones.appendChild(btnEliminar);

    card.appendChild(info);
    card.appendChild(badge);
    card.appendChild(botones);
    contenedor.appendChild(card);
  });
}

// ─── RENDERIZAR HISTORIAL ────────────────────────────
function renderizarHistorial() {
  const tbody = document.getElementById("historial-body");
  const emptyRow = document.getElementById("empty-hist");
  const lista = medicamentos[personaActiva] || [];

  Array.from(tbody.children).forEach(c => {
    if (c.id !== "empty-hist") c.remove();
  });

  if (lista.length === 0) {
    emptyRow.style.display = "";
    return;
  }

  emptyRow.style.display = "none";

  const ordenada = [...lista].sort((a, b) => {
    if (b.fecha !== a.fecha) return b.fecha.localeCompare(a.fecha);
    return a.hora.localeCompare(b.hora);
  });

  ordenada.forEach((med, i) => {
    const tr = document.createElement("tr");
    tr.id = `hist-row-${med.id}`;
    tr.className = "hist-row";
    tr.style.cssText = `
      animation: rowIn 0.3s ease forwards;
      animation-delay: ${i * 40}ms;
      opacity: 0;
      border-bottom: 1px solid #f0f0f0;
      ${med.tomado ? "" : "background: #fff7ed;"}
    `;

    const tdNombre = document.createElement("td");
    tdNombre.style.cssText = "padding: 14px 16px; font-weight: 600; color: #111;";
    tdNombre.textContent = `💊 ${med.nombre}`;

    const tdHora = document.createElement("td");
    tdHora.style.cssText = "padding: 14px 16px; color: #444; font-weight: 500;";
    tdHora.textContent = formatHora(med.hora);

    const tdDosis = document.createElement("td");
    tdDosis.style.cssText = "padding: 14px 16px; color: #555;";
    tdDosis.textContent = med.dosis;

    const tdEstado = document.createElement("td");
    tdEstado.style.cssText = "padding: 14px 16px;";

    const estadoBadge = document.createElement("span");
    if (med.tomado) {
      estadoBadge.textContent = "✅ Tomado";
      estadoBadge.style.cssText = `
        background: #dcfce7; color: #16a34a;
        padding: 4px 12px; border-radius: 999px;
        font-size: 12px; font-weight: 700;
      `;
    } else {
      estadoBadge.textContent = "🟠 Pendiente";
      estadoBadge.className = "badge-pendiente";
      estadoBadge.style.cssText = `
        background: #fed7aa; color: #c2410c;
        padding: 4px 12px; border-radius: 999px;
        font-size: 12px; font-weight: 700;
      `;
    }

    tdEstado.appendChild(estadoBadge);
    tr.appendChild(tdNombre);
    tr.appendChild(tdHora);
    tr.appendChild(tdDosis);
    tr.appendChild(tdEstado);
    tbody.appendChild(tr);
  });
}

// ─── BADGE CONTADOR DE PENDIENTES ────────────────────
function actualizarBadge() {
  const badge = document.getElementById("badge-count");
  const lista = (medicamentos[personaActiva] || []).filter(m => m.fecha === hoy() && !m.tomado);

  if (lista.length > 0) {
    badge.textContent = lista.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// ─── HELPERS ─────────────────────────────────────────
function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function formatHora(hora) {
  const [h, m] = hora.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}