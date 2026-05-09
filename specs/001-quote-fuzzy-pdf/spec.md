# Feature Specification: Sistema de Cotizaciones con Búsqueda Fuzzy y PDF para Ferretería

**Feature Branch**: `001-quote-fuzzy-pdf`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: User description: "El sistema debe permitir buscar productos con búsqueda fuzzy tolerante a errores, crear cotizaciones con múltiples ítems, guardar las cotizaciones con snapshot de precios, y generar un PDF descargable. La interfaz debe ser User Friendly para no cambiar el flujo de trabajo de la usuario, necesitamos que sea simple, pocos pasos pero bien ejecutados."

**Context**: Este sistema es para **Ferretería Shama** (Km 23.1 Ruta al Atlántico, Azacualpilla, Palencia, Guatemala). Moneda: Quetzales (Q/GTQ).

## Clarifications

### Session 2026-03-22

- Q: Authentication & Authorization model → A: Basic single-user mode (anyone with access can do everything)
- Q: Performance targets (search latency, PDF generation) → A: Search <500ms, PDF <3s
- Q: Out-of-scope features → A: Include basic email infrastructure (compatible but not activated), include basic inventory tracking with option disabled by default
- Q: Observability (logging, metrics, error tracking) → A: Basic console logging for errors + key user actions
- Q: User roles/personas differentiation → A: Single user type (any staff can perform all actions)
- Q: Technology stack to use → A: Monorepo Bun Workspaces: apps/web (Next.js 15) + apps/api (Hono.js), Supabase PostgreSQL with Drizzle ORM, búsqueda pg_trgm con índice GIN, PDF con React-PDF desde servidor Hono

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Búsqueda de Productos con Tolerancia a Errores (Priority: P1)

Como usuario del sistema de cotizaciones de ferretería, necesito buscar productos rápidamente incluso si cometo errores de tipeo, para poder encontrar los productos que necesito sin frustraciones.

**Why this priority**: La búsqueda de productos es la puerta de entrada a todo el flujo de cotización. Si el usuario no encuentra el producto, no puede crear la cotización. En una ferretería con cientos de productos, la búsqueda debe ser robusta.

**Independent Test**: Se puede probar independientemente permitiendo al usuario escribir términos de búsqueda con errores tipográficos y verificar que los productos relevantes aparezcan en los resultados.

**Acceptance Scenarios**:

1. **Given** el usuario escribe "tornillo" pero escribe "tornilo", **When** presiona buscar o espera autosugerencia, **Then** el sistema muestra productos de tornillos aunque no esté escrito correctamente
2. **Given** el usuario escribe "tubo pvc" buscando "tubo PVC", **When** inicia la búsqueda, **Then** el sistema muestra tubos PVC en los resultados
3. **Given** el usuario escribe "martillo drmañ" buscando "martillo de mano", **When** ejecuta la búsqueda, **Then** el sistema muestra martillos de mano en los resultados
4. **Given** el usuario escribe "pintura blnca" buscando "pintura blanca", **When** ejecuta la búsqueda, **Then** el sistema muestra pinturas de color blanco

---

### User Story 2 - Crear Cotización con Múltiples Ítems (Priority: P1)

Como usuario, necesito agregar múltiples productos a una cotización para poder crear una propuesta completa en una sola operación.

**Why this priority**: La esencia de una cotización es incluir varios productos. El usuario debe poder agregar todos los items que necesita sin tener que crear múltiples cotizaciones.

**Independent Test**: Se puede probar independientemente permitiendo agregar 5+ productos diferentes a una cotización y verificando que todos aparezcan correctamente con sus precios.

**Acceptance Scenarios**:

1. **Given** el usuario ha buscado y seleccionado un producto, **When** hace clic en "Agregar a Cotización", **Then** el producto aparece en la lista de ítems de la cotización con nombre, precio unitario y cantidad por defecto de 1
2. **Given** la cotización contiene productos, **When** el usuario ajusta la cantidad de un ítem, **Then** el subtotal se actualiza automáticamente
3. **Given** el usuario quiere agregar más productos, **When** realiza una nueva búsqueda, **Then** puede agregar productos adicionales sin perder los items ya agregados

---

### User Story 3 - Guardar Cotización con Snapshot de Precios (Priority: P1)

Como usuario, necesito guardar las cotizaciones con los precios del momento para tener un registro exacto de lo que se cotizó en esa fecha, protegiendo contra cambios posteriores de precios.

**Why this priority**: Los precios de productos cambian frecuentemente. Guardar el snapshot de precios permite referencia futura precisa y evita disputas sobre precios cotizados.

**Independent Test**: Se puede probar independientemente guardando una cotización, modificando precios del producto, y verificando que la cotización guardada mantenga los precios originales.

**Acceptance Scenarios**:

1. **Given** el usuario ha agregado productos a la cotización, **When** hace clic en "Guardar Cotización", **Then** el sistema guarda la cotización incluyendo todos los precios actuales de cada producto como referencia inmutable
2. **Given** una cotización está guardada con snapshot, **When** el usuario la abre posteriormente, **Then** ve los precios que tenía en el momento de creación, junto con la fecha de creación
3. **Given** el usuario necesita modificar una cotización guardada, **When** hace clic en "Duplicar" o "Editar", **Then** se crea una nueva versión con los precios actuales del catálogo

---

### User Story 4 - Generar PDF Descargable (Priority: P1)

Como usuario, necesito generar un PDF de la cotización para poder compartirla con clientes o imprimirla para entregas físicas.

**Why this priority**: El PDF es el formato estándar para compartir cotizaciones formales. Permite al usuario enviar la cotización por email o imprimirla para entregas presenciales.

**Independent Test**: Se puede probar independientemente generando el PDF de una cotización y verificando que contenga todos los productos, precios, totales y datos de la empresa.

**Acceptance Scenarios**:

1. **Given** la cotización tiene productos agregados, **When** el usuario hace clic en "Generar PDF", **Then** se descarga un archivo PDF con la cotización completa
2. **Given** el PDF se genera, **Then** incluye: **Ferretería Shama** (Km 23.1 Ruta al Atlántico), fecha de la cotización, datos del cliente, lista de productos con cantidades y precios unitarios, subtotales por item, total general en Quetzales (Q), y observaciones
3. **Given** el usuario abre el PDF, **Then** el diseño es profesional y legible, apropiado para compartir con clientes

---

### User Story 5 - Interfaz Simple con Pocos Pasos (Priority: P2)

Como usuario, necesito que el flujo de creación de cotizaciones sea rápido y sencillo, con el menor número de pasos posible, parano perder tiempo en procesos complicados.

**Why this priority**: La simplicidad es un requisito explícito del usuario. Un flujo complejo desanimará a los usuarios y reducirá la adopción del sistema.

**Independent Test**: Se puede probar independientemente cronometrando el tiempo que toma un nuevo usuario en crear y descargar una cotización con 3 productos.

**Acceptance Scenarios**:

1. **Given** el usuario accede a la función de cotización, **When** llega a la pantalla principal, **Then** ve claramente los 3 pasos principales: Buscar Productos → Revisar Cotización → Generar PDF
2. **Given** el usuario completa los 3 pasos, **Then** el flujo total no excede 2 minutos para una cotización simple de 3 productos
3. **Given** durante el proceso el usuario necesita ayuda, **Then** encuentra tooltips o ayuda contextual sin necesidad de abandonar el flujo

---

### Edge Cases

- ¿Qué sucede cuando la búsqueda no encuentra ningún producto coincidente? (Mostrar mensaje amigable con sugerencias)
- ¿Cómo maneja el sistema productos con nombres muy similares? (Permitir selección clara)
- ¿Qué pasa si un producto se descataloga después de agregado a la cotización? (Marcar como no disponible, mantener precio original)
- ¿Qué sucede si el usuario intenta generar PDF con cotización vacía? (Bloquear botón, mostrar mensaje instructivo)
- ¿Cómo maneja el sistemaTimeouts de conexión durante la búsqueda o guardado? (Mensaje de error claro, opción de reintento)
- ¿Qué sucede si el usuario cierra el navegador sin guardar? (Confirmación si hay productos sin guardar)

---

### Out of Scope

- Envío automático de cotizaciones por email (infraestructura incluida pero no activada)
- Gestión activa de inventario (módulo básico incluido con opción deshabilitada por defecto)
- Sistema de point-of-sale (POS)
- Integración con sistemas externos de contabilidad

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir buscar productos utilizando texto con errores tipográficos y mostrar resultados relevantes mediante búsqueda fuzzy
- **FR-002**: El sistema DEBE mostrar resultados de búsqueda en tiempo real conforme el usuario escribe (autosugerencia)
- **FR-003**: Los usuarios DEBEN poder agregar múltiples productos a una cotización desde los resultados de búsqueda
- **FR-004**: Los usuarios DEBEN poder ajustar la cantidad de cada ítem en la cotización
- **FR-005**: El sistema DEBE calcular automáticamente los subtotales por ítem y el total general de la cotización
- **FR-006**: El sistema DEBE guardar las cotizaciones incluyendo un snapshot (captura) de los precios de cada producto en el momento de la creación
- **FR-007**: Las cotizaciones guardadas DEBEN mostrar la fecha de creación y los precios originales del snapshot
- **FR-008**: El sistema DEBE generar un archivo PDF descargable con el contenido completo de la cotización
- **FR-009**: El PDF generado DEBE incluir: datos de **Ferretería Shama** (Km 23.1 Ruta al Atlántico, Azacualpilla, Palencia), fecha, lista de productos con cantidades y precios en Quetzales (Q), subtotales, y total general
- **FR-010**: El sistema DEBE mantener un flujo de usuario simple con un máximo de 3 pasos principales visibles
- **FR-011**: El sistema DEBE mostrar mensajes de error claros y recuperables cuando ocurran problemas
- **FR-012**: El sistema DEBE permitir visualizar cotizaciones guardadas previamente

### Key Entities *(include if data from Supabase)*

Las entidades corresponden a las tablas del schema de Supabase:

- **products**: Catálogo de productos de ferretería. Incluye id, name, code, price (Q), category, available.索引: GIN con pg_trgm para búsqueda fuzzy.
- **quotations**: Cotizaciones guardadas. Incluye id, client_name, client_address, created_at, status, prices_snapshot (JSONB).
- **quotation_items**: Líneas de cotización. Incluye id, quotation_id, product_id, quantity, unit_price (del snapshot).
- **Snapshot de Precios**: JSONB en quotations que almacena precios inmutables al momento de crear/modificar.

---

## Success Criteria *(mandatory)*

### Non-Functional Requirements

- **NFR-001**: Búsqueda fuzzy debe responder en menos de 500ms
- **NFR-002**: Generación de PDF debe completar en menos de 3 segundos
- **NFR-003**: El sistema debe registrar errores y acciones clave del usuario en logs de consola

### Measurable Outcomes

- **SC-001**: Los usuarios encuentran productos correctos incluso con errores tipográficos comunes (hasta 2 caracteres incorrectos o faltantes) en el 90% de los casos
- **SC-002**: Los usuarios pueden crear una cotización con 5 productos y descargarla en PDF en menos de 2 minutos
- **SC-003**: El 95% de las cotizaciones guardadas mantienen los precios correctos del snapshot y se pueden recuperar posteriormente
- **SC-004**: Los usuarios completan exitosamente el flujo de cotización (búsqueda → agregar → guardar → PDF) en el primer intento el 90% de las veces
- **SC-005**: El flujo de cotización es intuitivo para usuarios nuevos sin capacitación previa, medido por tasa de éxito en prueba de usuario
- **SC-006**: Los PDFs generados son descargables y legibles, con formato profesional apropiado para presentación a clientes

---

## Assumptions *(optional)*

### Tech Stack (from Constitution)

- **Runtime**: Bun (latest stable)
- **Backend**: Hono.js con TypeScript
- **Frontend**: Next.js 15 con App Router
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Búsqueda**: PostgreSQL pg_trgm con índice GIN para fuzzy search
- **PDF**: React-PDF renderizado en servidor Hono

### Sistema Existente

- Se asume que existe un catálogo de productos de ferretería base en el sistema (actualmente ~154 productos en 8 categorías)
- Se asume que cada producto tiene un precio unitario definido en Quetzales (Q)
- La empresa es Ferretería Shama (Km 23.1 Ruta al Atlántico, Azacualpilla, Palencia, Guatemala)
- El catálogo existente incluye: Herramientas Manuales, Herramientas Eléctricas, Materiales de Construcción, Materiales Eléctricos, Plomería, Pinturas, Cerrajería, Adhesivos y Jardín
- Se asume que el sistema actual ya tiene autocompletado con Trie, pero necesita mejorarse a búsqueda fuzzy tolerante a errores
- Se asume que el sistema usa html2canvas para generar imágenes PNG, pero el usuario quiere PDF
- Se asume que el sistema tiene autenticación de usuarios en modo single-user (cualquier persona con acceso puede realizar todas las acciones)
- Se asume que el volumen de productos en catálogo es manejable con búsqueda local (menos de 10,000 productos)
- El idioma principal del sistema es español (Guatemala)
