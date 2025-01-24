# Cotishama

Cotishama es un generador de cotizaciones sencillo, desarrollado utilizando **HTML**, **CSS** y **JavaScript**. Este sistema permite crear cotizaciones de manera rápida y eficiente, con un diseño limpio y una funcionalidad intuitiva.

## Características
- Generación de cotizaciones personalizadas
- Sistema de autocompletado de productos usando Trie
- Agregado de productos con cantidad, precio y descripción
- Cálculo automático de subtotales y totales
- Exportación de cotizaciones como imágenes
- Validaciones de entrada con mensajes visuales (usando Notyf)
- Optimización de rendimiento con carga diferida de recursos

## Uso
1. Llena los datos del cliente y los productos que deseas incluir en la cotización
2. Usa el autocompletado para encontrar productos rápidamente
3. Haz clic en **"Agregar Producto"** para incluir productos en la tabla
4. Genera la cotización en formato de imagen con el botón **"Generar Cotización"**

## Instalación
1. Clona este repositorio:
   ```bash
   git clone https://github.com/DavidDevGt/cotishama.git
   ```
2. Abre el archivo `index.html` en tu navegador preferido

## Estructura del proyecto
```plaintext
cotishama/
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── autocomplete.css
│   ├── img/
│   │   └── logoFShama.png
│   ├── js/
│       ├── main.js
│       ├── quoteGenerator.js
│       ├── validations.js
│       ├── dom.js
│       ├── utils.js
│       ├── state.js
│       ├── trie.js
│       ├── autocomplete.js
│       └── html2canvas.min.js
├── index.html
└── README.md
```

## Tecnologías utilizadas
- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Notyf** para notificaciones
- **html2canvas** para exportación de imágenes
