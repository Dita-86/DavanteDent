// Clase que representa una cita de la clínica
class Cita {
  constructor(id, dia, mes, anio, hora, minuto,
              nombre, apellidos, dni, telefono, email, nacimiento, observaciones) {
    this.id = id;
    this.dia = dia;
    this.mes = mes;
    this.anio = anio;
    this.hora = hora;
    this.minuto = minuto;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.dni = dni;
    this.telefono = telefono;
    this.email = email;
    this.nacimiento = nacimiento;
    this.observaciones = observaciones;
  }
}

// ---------- COOKIES ----------

// Guarda una cookie. Por defecto dura 30 días.
function setCookie(nombre, valor, dias = 30) {
  document.cookie = nombre + "=" + encodeURIComponent(valor) +
                    "; max-age=" + (dias * 24 * 60 * 60) + "; path=/";
}

// Lee una cookie por su nombre. Devuelve null si no existe.
function getCookie(nombre) {
  const lista = document.cookie.split("; ");
  for (const item of lista) {
    const posicion = item.indexOf("=");
    const clave = item.substring(0, posicion);
    if (clave === nombre) {
      return decodeURIComponent(item.substring(posicion + 1));
    }
  }
  return null;
}

// ---------- ALMACENAMIENTO DE CITAS ----------

const NOMBRE_COOKIE = "citas";

// Devuelve el array de citas guardadas (vacío si no hay ninguna)
function cargarCitas() {
  const texto = getCookie(NOMBRE_COOKIE);
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

// Guarda el array de citas completo en la cookie
function guardarCitas(citas) {
  setCookie(NOMBRE_COOKIE, JSON.stringify(citas));
}

// ---------- TABLA ----------

const cuerpoTabla = document.getElementById("cuerpoTabla");
const filaVacia = document.getElementById("filaVacia");

// Crea una celda con texto y la añade a la fila
function añadirCelda(fila, texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  fila.appendChild(celda);
}

// Vuelve a dibujar la tabla entera a partir de las citas guardadas
function pintarTabla() {
  const citas = cargarCitas();

  // Borramos las filas de citas (dejamos la fila "dato vacío")
  const filasCita = cuerpoTabla.querySelectorAll("tr[data-id]");
  filasCita.forEach(function (fila) {
    fila.remove();
  });

  // Mostrar u ocultar "dato vacío"
  filaVacia.hidden = citas.length !== 0;

  // Una fila por cita
  citas.forEach(function (cita, indice) {
    const fila = document.createElement("tr");
    fila.setAttribute("data-id", cita.id); // identificador oculto

    añadirCelda(fila, indice + 1); // Nº de orden
    añadirCelda(fila, cita.dia + "/" + cita.mes + "/" + cita.anio);
    añadirCelda(fila, cita.hora + ":" + String(cita.minuto).padStart(2, "0"));
    añadirCelda(fila, cita.nombre);
    añadirCelda(fila, cita.apellidos);
    añadirCelda(fila, cita.dni);
    añadirCelda(fila, cita.telefono);
    añadirCelda(fila, cita.email || "");
    añadirCelda(fila, cita.nacimiento);
    añadirCelda(fila, cita.observaciones);

    // Celda de acciones con los botones
    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "acciones";

    const botonModificar = document.createElement("button");
    botonModificar.type = "button";
    botonModificar.className = "btn-tabla";
    botonModificar.textContent = "Modificar";
    botonModificar.setAttribute("data-accion", "modificar");

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn-tabla btn-eliminar";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.setAttribute("data-accion", "eliminar");

    celdaAcciones.appendChild(botonModificar);
    celdaAcciones.appendChild(botonEliminar);
    fila.appendChild(celdaAcciones);

    cuerpoTabla.appendChild(fila);
  });

  pintarCalendario(); // el calendario marca los días que tienen citas
}


// ---------- VALIDACIÓN ----------

const formulario = document.getElementById("formCita");

// Muestra u oculta el error de un campo
function mostrarError(campo, mensaje) {
  const span = document.getElementById("error-" + campo);
  const input = document.getElementById(campo);
  span.textContent = mensaje;
  input.classList.toggle("invalido", mensaje !== "");
}

// Comprueba que un texto es un entero dentro de un rango
function enteroEnRango(texto, min, max) {
  return /^[0-9]+$/.test(texto) && Number(texto) >= min && Number(texto) <= max;
}

// Valida todos los campos. Devuelve true si todo es correcto.
function validarFormulario() {
  let correcto = true;

  function comprobar(campo, condicion, mensaje) {
    const valor = document.getElementById(campo).value.trim();
    if (!condicion(valor)) {
      mostrarError(campo, mensaje);
      correcto = false;
    } else {
      mostrarError(campo, "");
    }
  }

  comprobar("dia", v => enteroEnRango(v, 1, 31), "Día entre 1 y 31");
  comprobar("mes", v => enteroEnRango(v, 1, 12), "Mes entre 1 y 12");
  comprobar("anio", v => /^[0-9]{4}$/.test(v) && Number(v) >= 2024, "Año de 4 cifras (2024 o más)");
  comprobar("hora", v => enteroEnRango(v, 0, 23), "Hora entre 0 y 23");
  comprobar("minuto", v => enteroEnRango(v, 0, 59), "Minuto entre 0 y 59");
  comprobar("nombre", v => /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(v), "Solo letras, no puede estar vacío");
  comprobar("apellidos", v => /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(v), "Solo letras, no puede estar vacío");
  comprobar("dni", v => /^[0-9]{8}[A-Za-z]$/.test(v), "8 números y una letra");
  comprobar("telefono", v => /^[0-9]{9}$/.test(v), "Teléfono de 9 dígitos, sin letras");
  comprobar("email", v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Correo no válido (ej. nombre@dominio.com)");
  comprobar("nacimiento", v => v !== "" && new Date(v) <= new Date(), "Fecha obligatoria y no futura");

  return correcto;
}

// Lee los valores del formulario y crea un objeto Cita
function crearCitaDesdeFormulario(id) {
  const valor = function (campo) {
    return document.getElementById(campo).value.trim();
  };

  return new Cita(
    id,
    Number(valor("dia")),
    Number(valor("mes")),
    Number(valor("anio")),
    Number(valor("hora")),
    Number(valor("minuto")),
    valor("nombre"),
    valor("apellidos"),
    valor("dni").toUpperCase(),
    valor("telefono"),
    valor("email").toLowerCase(),
    valor("nacimiento"),
    valor("observaciones")
  );
}

// Evento: al enviar el formulario
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // evita que la página se recargue

  if (!validarFormulario()) {
    return; // hay errores: no se crea la cita y se conservan los datos
  }

  const idOculto = document.getElementById("idCita").value;
  const citas = cargarCitas();

  if (idOculto === "") {
    // Cita nueva: el id es el instante exacto del guardado
    citas.push(crearCitaDesdeFormulario(Date.now()));
  } else {
    // Cita existente: se sustituye conservando su id
    const id = Number(idOculto);
    const posicion = citas.findIndex(function (c) {
      return c.id === id;
    });
    citas[posicion] = crearCitaDesdeFormulario(id);
  }
  guardarCitas(citas);

  pintarTabla();
  formulario.reset(); // dispara el evento "reset" de más abajo, que limpia id y errores
});

// ---------- ELIMINAR Y MODIFICAR ----------

// Un único evento "click" sobre la tabla (delegación de eventos)
cuerpoTabla.addEventListener("click", function (evento) {
  const boton = evento.target;
  const accion = boton.getAttribute("data-accion");
  if (accion === null) {
    return; // no se ha pulsado un botón de acción
  }

  // Identificador oculto de la fila donde se ha pulsado
  const id = Number(boton.closest("tr").getAttribute("data-id"));

  if (accion === "eliminar") {
    eliminarCita(id);
  } else if (accion === "modificar") {
    cargarCitaEnFormulario(id);
  }
});

function eliminarCita(id) {
  const citas = cargarCitas().filter(function (cita) {
    return cita.id !== id;
  });
  guardarCitas(citas);
  pintarTabla();
}

// Carga los datos DESDE LA COOKIE (no desde el HTML) en el formulario
function cargarCitaEnFormulario(id) {
  const cita = cargarCitas().find(function (c) {
    return c.id === id;
  });
  if (cita === undefined) {
    return;
  }

  document.getElementById("idCita").value = cita.id;
  document.getElementById("dia").value = cita.dia;
  document.getElementById("mes").value = cita.mes;
  document.getElementById("anio").value = cita.anio;
  document.getElementById("hora").value = cita.hora;
  document.getElementById("minuto").value = cita.minuto;
  document.getElementById("nombre").value = cita.nombre;
  document.getElementById("apellidos").value = cita.apellidos;
  document.getElementById("dni").value = cita.dni;
  document.getElementById("telefono").value = cita.telefono;
  document.getElementById("email").value = cita.email || "";
  document.getElementById("nacimiento").value = cita.nacimiento;
  document.getElementById("observaciones").value = cita.observaciones;
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Al pulsar "Limpiar" (o tras guardar): vaciar id oculto y quitar errores
formulario.addEventListener("reset", function () {
  document.getElementById("idCita").value = "";
  document.querySelectorAll(".error").forEach(function (span) {
    span.textContent = "";
  });
  formulario.querySelectorAll("input, textarea").forEach(function (campo) {
    campo.classList.remove("invalido");
  });
});

// ---------- CALENDARIO ----------

const NOMBRES_MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                     "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const calDias = document.getElementById("calDias");
const calTitulo = document.getElementById("calTitulo");

// Mes que se está mostrando (empieza en el mes actual)
let calAnio = new Date().getFullYear();
let calMes = new Date().getMonth(); // 0 = enero
let diaElegido = null;              // texto "d-m-a" del día pulsado

// Dibuja el mes completo y marca hoy y los días con citas
function pintarCalendario() {
  calTitulo.textContent = NOMBRES_MES[calMes] + " " + calAnio;
  calDias.innerHTML = "";

  // Días con cita, leídos de la cookie: "dia-mes-anio"
  const diasConCita = new Set(cargarCitas().map(function (c) {
    return c.dia + "-" + c.mes + "-" + c.anio;
  }));

  const hoy = new Date();
  // getDay(): 0 = domingo. Lo pasamos a lunes = 0
  const primerDia = (new Date(calAnio, calMes, 1).getDay() + 6) % 7;
  const totalDias = new Date(calAnio, calMes + 1, 0).getDate();

  for (let i = 0; i < primerDia; i++) {
    const hueco = document.createElement("span");
    hueco.className = "cal-vacio";
    calDias.appendChild(hueco);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const clave = dia + "-" + (calMes + 1) + "-" + calAnio;
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "cal-dia";
    boton.textContent = dia;
    boton.setAttribute("data-dia", dia);

    if (dia === hoy.getDate() && calMes === hoy.getMonth() && calAnio === hoy.getFullYear()) {
      boton.classList.add("hoy");
    }
    if (diasConCita.has(clave)) {
      boton.classList.add("con-cita");
      boton.title = "Hay citas este día";
    }
    if (clave === diaElegido) {
      boton.classList.add("elegido");
    }
    calDias.appendChild(boton);
  }
}

// Botones de mes anterior y siguiente
document.getElementById("calAnterior").addEventListener("click", function () {
  calMes--;
  if (calMes < 0) { calMes = 11; calAnio--; }
  pintarCalendario();
});
document.getElementById("calSiguiente").addEventListener("click", function () {
  calMes++;
  if (calMes > 11) { calMes = 0; calAnio++; }
  pintarCalendario();
});

// Pulsar un día rellena día, mes y año del formulario (delegación de eventos)
calDias.addEventListener("click", function (evento) {
  const dia = evento.target.getAttribute("data-dia");
  if (dia === null) {
    return;
  }
  document.getElementById("dia").value = dia;
  document.getElementById("mes").value = calMes + 1;
  document.getElementById("anio").value = calAnio;
  diaElegido = dia + "-" + (calMes + 1) + "-" + calAnio;
  pintarCalendario();
  document.getElementById("hora").focus();
});

// Al cargar la página, dibujamos lo que haya guardado
pintarTabla();
