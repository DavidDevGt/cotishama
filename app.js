const fechaActual = new Date();
const fechaString = fechaActual.toLocaleDateString();

const clienteInput = document.getElementById('cliente');
const empresaInput = document.getElementById('empresa');
const productoInput = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');
const precioInput = document.getElementById('precio');
const agregarBtn = document.getElementById('agregar');
const productosTable = document.getElementById('productos');
const totalTd = document.getElementById('total');
const generarPDFBtn = document.getElementById('generar-pdf');

let productos = [];
let contadorCotizaciones = 1;

function agregarProducto() {
    const producto = {
        nombre: productoInput.value,
        cantidad: parseInt(cantidadInput.value),
        precio: parseFloat(precioInput.value),
        cliente: clienteInput.value,
    };

    productos.push(producto);

    renderizarProductos();
    limpiarCampos();
}

function renderizarProductos() {
    const nombreCliente = document.getElementById('nombre');
    nombreCliente.textContent = clienteInput.value;

    const fecha = document.getElementById('fecha');
    fecha.textContent = fechaString;

    productosTable.innerHTML = '';

    let subtotal = 0;

    productos.forEach((producto, index) => {
        const row = document.createElement('tr');
        const nombreTd = document.createElement('td');
        const cantidadTd = document.createElement('td');
        const precioTd = document.createElement('td');
        const subtotalTd = document.createElement('td');
        const eliminarTd = document.createElement('td');
        const eliminarBtn = document.createElement('button');

        nombreTd.textContent = producto.nombre;
        cantidadTd.textContent = producto.cantidad;
        precioTd.textContent = `Q${producto.precio.toFixed(2)} GTQ`;
        subtotalTd.textContent = `Q${(producto.cantidad * producto.precio).toFixed(2)} GTQ`;

        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => eliminarFila(index));
        eliminarBtn.setAttribute('type', 'button');
        eliminarTd.appendChild(eliminarBtn);

        row.appendChild(nombreTd);
        row.appendChild(cantidadTd);
        row.appendChild(precioTd);
        row.appendChild(subtotalTd);
        row.appendChild(eliminarTd);

        productosTable.appendChild(row);

        subtotal += producto.cantidad * producto.precio;
    });

    totalTd.textContent = `Q${subtotal.toFixed(2)} GTQ`;

    function eliminarFila(index) {
        productos.splice(index, 1);
        renderizarProductos();
    }
}

function limpiarCampos() {
    productoInput.value = '';
    cantidadInput.value = '';
    precioInput.value = '';
}

agregarBtn.addEventListener('click', agregarProducto);

generarPDFBtn.addEventListener('click', generarCotizacionImagen);

function generarIdentificadorCotizacion() {
    const identificador = contadorCotizaciones.toString().padStart(3, '0');
    contadorCotizaciones++;
    return identificador;
}

function obtenerIniciales(nombre) {
    const palabras = nombre.split(' ');
    const iniciales = palabras.map((palabra) => palabra.charAt(0).toUpperCase()).join('');
    return iniciales;
}

function limpiarFecha(fecha) {
    const caracteresEspeciales = ['/', '-'];
    caracteresEspeciales.forEach((caracter) => {
        fecha = fecha.replace(caracter, '');
    });
    return fecha;
}

function generarCotizacionImagen() {
    const tabla = document.getElementById('capture');

    // Ocultar la columna de eliminar
    const columnasEliminar = tabla.querySelectorAll('td:nth-child(5)');
    columnasEliminar.forEach((columna) => {
        columna.style.display = 'none';
    });

    html2canvas(tabla).then((canvas) => {
        const imagen = canvas.toDataURL('image/png');

        const nombreCliente = clienteInput.value;
        const fechaCotizacion = limpiarFecha(fechaString);
        const inicialesCliente = obtenerIniciales(nombreCliente);
        const identificadorCotizacion = generarIdentificadorCotizacion();

        const nombreArchivo = `${inicialesCliente}${fechaCotizacion}-${identificadorCotizacion}.png`;

        const enlaceDescarga = document.createElement('a');
        enlaceDescarga.href = imagen;
        enlaceDescarga.download = nombreArchivo;
        enlaceDescarga.click();

        // Restaurar la visibilidad de la columna de eliminar
        columnasEliminar.forEach((columna) => {
            columna.style.display = '';
        });
    });
}