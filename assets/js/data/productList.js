const herramientasManuales = [
    'MARTILLO DE UÑA',
    'DESTORNILLADOR PHILLIPS',
    'DESTORNILLADOR PLANO',
    'CINTA MÉTRICA',
    'LLAVE INGLESA',
    'LLAVE AJUSTABLE',
    'ALICATE UNIVERSAL',
    'PINZA DE CORTE DIAGONAL',
    'PINZA DE PUNTA LARGA',
    'NIVEL DE BURBUJA',
    'ESCUADRA METÁLICA',
    'SERRUCHO DE CARPINTERO',
    'METRO PLEGABLE DE MADERA',
    'FORMÓN PARA MADERA',
    'LIMA PARA MACHETE',
    'CEPILLO DE ALAMBRE',
    'ARCO DE SIERRA PARA METAL',
    'CINCEL PARA CONCRETO',
    'MAZO DE GOMA',
    'LLAVE DE TUBO',
    'JUEGO DE LLAVES COMBINADAS',
    'TIJERA PARA METAL',
    'CUCHILLA MULTIUSO',
    'PISTOLA PARA SILICÓN'
];

const herramientasElectricas = [
    'SIERRA CIRCULAR',
    'TALADRO ELÉCTRICO',
    'BROCA PARA CONCRETO',
    'BROCA PARA METAL',
    'PULIDORA ANGULAR',
    'ROTOMARTILLO',
    'COMPRESOR DE AIRE',
    'PISTOLA DE CALOR',
    'SIERRA CALADORA',
    'LIJADORA ORBITAL',
    'SOLDADORA ELÉCTRICA',
    'GENERADOR ELÉCTRICO',
    'HIDROLAVADORA',
    'TALADRO INALÁMBRICO',
    'ATORNILLADOR ELÉCTRICO'
];

const materialesConstruccion = [
    'CEMENTO',
    'ARENA DE RÍO',
    'PIEDRÍN',
    'TORNILLO GALVANIZADO',
    'CLAVO DE ACERO',
    'CAL',
    'BLOCK DE CONCRETO',
    'VARILLA DE HIERRO',
    'ALAMBRE DE AMARRE',
    'ELECTROMALLA',
    'PERFIL METÁLICO',
    'LÁMINA GALVANIZADA',
    'TABLA DE MADERA',
    'PLANCHA DE PLYWOOD',
    'PISO CERÁMICO',
    'AZULEJO',
    'ADOQUÍN',
    'LADRILLO',
    'BLOCK DECORATIVO',
    'MALLA CICLÓN'
];

const materialesElectricos = [
    'CABLE ELÉCTRICO',
    'TOMACORRIENTE',
    'INTERRUPTOR SIMPLE',
    'BOMBILLA LED',
    'FOCO AHORRADOR',
    'EXTENSIÓN ELÉCTRICA',
    'CLAVIJA ELÉCTRICA',
    'TABLERO ELÉCTRICO',
    'BREAKER (INTERRUPTOR TERMOMAGNÉTICO)',
    'CAJA OCTOGONAL',
    'CAJA RECTANGULAR',
    'TUBO CONDUIT',
    'CONECTOR PARA CONDUIT',
    'TIMBRE ELÉCTRICO',
    'LÁMPARA FLUORESCENTE',
    'REFLECTOR LED',
    'CABLE COAXIAL',
    'ENCHUFE POLARIZADO',
    'REGULADOR DE VOLTAJE',
    'MULTÍMETRO'
];

const plomeria = [
    'TUBO PVC',
    'CODO PVC',
    'PEGAMENTO PVC',
    'MANGUERA DE JARDÍN',
    'LLAVE DE PASO',
    'LLAVE DE CHORRO',
    'VÁLVULA CHECK',
    'SIFÓN',
    'REDUCCIÓN PVC',
    'TEE PVC',
    'UNIÓN UNIVERSAL',
    'TUBO CPVC',
    'CODO CPVC',
    'TAPÓN PVC',
    'TRAMPA DE GRASA',
    'FLOTADOR DE CISTERNA',
    'FLANGE PARA INODORO',
    'LLAVE DE LAVAMANOS',
    'REGADERA',
    'TUBO FLEXIBLE'
];

const pinturasAccesorios = [
    'BROCHA',
    'RODILLO PARA PINTAR',
    'PINTURA DE AGUA',
    'PINTURA DE ACEITE',
    'THINNER',
    'LIJA PARA MADERA',
    'LIJA PARA METAL',
    'SELLADOR DE MADERA',
    'BARNIZ',
    'PINTURA EN SPRAY',
    'MASILLA',
    'REMOVEDOR DE PINTURA',
    'BANDEJA PARA PINTURA',
    'CINTA DE PINTOR',
    'ESPÁTULA',
    'PISTOLA PARA PINTAR',
    'IMPERMEABILIZANTE',
    'PINTURA ANTICORROSIVA',
    'DILUYENTE',
    'TINTE PARA MADERA'
];

const cerrajeria = [
    'CANDADO',
    'CERRADURA',
    'BISAGRA',
    'PASADOR',
    'ALDABA',
    'MANIJA',
    'CERRADURA ELÉCTRICA',
    'COPIA DE LLAVE',
    'CERROJO',
    'CHAPA DE GAVETA',
    'PICAPORTE',
    'CIERRA PUERTA',
    'TOPE DE PUERTA',
    'CERRADURA DIGITAL',
    'LLAVE MAESTRA'
];

const adhesivos = [
    'SILICÓN',
    'SELLADOR ACRÍLICO',
    'CINTA DE AISLAR',
    'PEGAMENTO EPOXY',
    'CEMENTO DE CONTACTO',
    'CINTA DOBLE CARA',
    'PEGAMENTO INSTANTÁNEO',
    'MASILLA EPÓXICA',
    'CINTA TEFLÓN',
    'CINTA FIBRA DE VIDRIO',
    'ADHESIVO PVC',
    'CINTA ANTIDESLIZANTE',
    'ADHESIVO INDUSTRIAL',
    'CINTA VULCANIZADA',
    'PEGAMENTO PARA MADERA'
];

const equipoJardin = [
    'PALA CUADRADA',
    'PALA PUNTA',
    'CARRETILLA',
    'ESCALERA DE ALUMINIO',
    'RASTRILLO',
    'TIJERA DE PODAR',
    'MANGUERA DE RIEGO',
    'ASPERSOR',
    'PODADORA',
    'PICO',
    'AZADÓN',
    'BOMBA FUMIGADORA',
    'CARRETA DE MANO',
    'ESCOBA METÁLICA',
    'MACHETE COLIMA',
    'MACHETE LARGO',
    'REGADERA',
    'MOTOGUADAÑA',
    'CORTASETOS',
    'PALA DE JARDÍN'
];

export const categorias = {
    herramientasManuales,
    herramientasElectricas,
    materialesConstruccion,
    materialesElectricos,
    plomeria,
    pinturasAccesorios,
    cerrajeria,
    adhesivos,
    equipoJardin
};

export const productList = [
    ...herramientasManuales,
    ...herramientasElectricas,
    ...materialesConstruccion,
    ...materialesElectricos,
    ...plomeria,
    ...pinturasAccesorios,
    ...cerrajeria,
    ...adhesivos,
    ...equipoJardin
];
