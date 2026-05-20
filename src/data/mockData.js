export const CATEGORIES = [
  { id: 'todas', name: 'Todas', emoji: '🍽️' },
  { id: 'entradas', name: 'Entradas', emoji: '🥗' },
  { id: 'fuertes', name: 'Fuertes', emoji: '🥩' },
  { id: 'bebidas', name: 'Bebidas', emoji: '🍹' },
  { id: 'postres', name: 'Postres', emoji: '🍰' },
];

export const MENU_ITEMS = [
  // Entradas
  {
    id: 'ent_1',
    category: 'entradas',
    name: 'Bruschetta de Pomodoro',
    price: 120,
    emoji: '🥖',
    description: 'Pan artesanal tostado con tomate fresco, albahaca orgánica, ajo y un toque de aceite de oliva extra virgen.',
    prepTime: 10,
    tags: ['italiana', 'saludable'],
    restrictions: ['vegetariano', 'sin lactosa'],
  },
  {
    id: 'ent_2',
    category: 'entradas',
    name: 'Calamari Fritti',
    price: 180,
    emoji: '🦑',
    description: 'Anillos de calamar crujientes acompañados de una salsa tártara casera y rodajas de limón fresco.',
    prepTime: 15,
    tags: ['mariscos', 'crujiente'],
    restrictions: [],
  },
  {
    id: 'ent_3',
    category: 'entradas',
    name: 'Tabla de Quesos y Carnes',
    price: 260,
    emoji: '🧀',
    description: 'Selección premium de quesos maduros y embutidos finos acompañados de frutos secos y miel silvestre.',
    prepTime: 12,
    tags: ['carnes', 'queso'],
    restrictions: ['sin gluten'],
  },
  {
    id: 'ent_4',
    category: 'entradas',
    name: 'Empanadas Argentinas',
    price: 110,
    emoji: '🥟',
    description: 'Dos empanadas horneadas rellenas de carne cortada a cuchillo, sazonadas con comino y aceitunas, servidas con salsa picante.',
    prepTime: 12,
    tags: ['carnes', 'picante'],
    restrictions: [],
  },

  // Platillos Fuertes
  {
    id: 'fuerte_1',
    category: 'fuertes',
    name: 'Ribeye Prime a la Parrilla',
    price: 490,
    emoji: '🥩',
    description: 'Corte jugoso de 400g a las brasas, servido con papas rústicas al romero, chimichurri picante y mantequilla aromática.',
    prepTime: 25,
    tags: ['carnes', 'picante'],
    restrictions: ['sin gluten'],
  },
  {
    id: 'fuerte_2',
    category: 'fuertes',
    name: 'Salmon Glaseado con Teriyaki',
    price: 380,
    emoji: '🐟',
    description: 'Filete de salmón fresco a la plancha con salsa teriyaki dulce, servido sobre una cama de arroz jazmín.',
    prepTime: 20,
    tags: ['mariscos', 'saludable'],
    restrictions: ['sin lactosa'],
  },
  {
    id: 'fuerte_3',
    category: 'fuertes',
    name: 'Ravioles de Espinaca y Ricotta',
    price: 290,
    emoji: '🍝',
    description: 'Pasta artesanal rellena de espinacas tiernas y queso ricotta, bañada en una cremosa salsa de trufa blanca.',
    prepTime: 18,
    tags: ['italiana', 'vegetariano'],
    restrictions: ['vegetariano'],
  },
  {
    id: 'fuerte_4',
    category: 'fuertes',
    name: 'Hamburguesa Royal Gourmet',
    price: 240,
    emoji: '🍔',
    description: 'Carne de res angus, queso cheddar fundido, tocino crujiente, cebolla caramelizada en pan brioche sin gluten opcional.',
    prepTime: 15,
    tags: ['carnes', 'casual'],
    restrictions: [],
  },

  // Bebidas
  {
    id: 'beb_1',
    category: 'bebidas',
    name: 'Maracuyá Mojito Premium',
    price: 110,
    emoji: '🍹',
    description: 'Ron blanco, pulpa de maracuyá fresca, hojas de menta maceradas, limón y un toque de soda.',
    prepTime: 5,
    tags: ['refrescante', 'dulce'],
    restrictions: ['vegetariano', 'sin gluten', 'sin lactosa'],
  },
  {
    id: 'beb_2',
    category: 'bebidas',
    name: 'Vino Tinto Copa (Reserva)',
    price: 140,
    emoji: '🍷',
    description: 'Copa de Cabernet Sauvignon con notas de frutos rojos, roble y un final aterciopelado elegante.',
    prepTime: 3,
    tags: ['elegante'],
    restrictions: ['vegetariano', 'sin gluten', 'sin lactosa'],
  },
  {
    id: 'beb_3',
    category: 'bebidas',
    name: 'Limonada de Lavanda y Menta',
    price: 75,
    emoji: '🍋',
    description: 'Refrescante limonada natural infusionada con flores de lavanda orgánica y hojas de menta.',
    prepTime: 5,
    tags: ['refrescante', 'saludable'],
    restrictions: ['vegetariano', 'sin gluten', 'sin lactosa'],
  },
  {
    id: 'beb_4',
    category: 'bebidas',
    name: 'Café Espresso Doble',
    price: 60,
    emoji: '☕',
    description: 'Extracción concentrada de granos de café seleccionados de altura con un aroma intenso.',
    prepTime: 4,
    tags: ['saludable'],
    restrictions: ['vegetariano', 'sin gluten', 'sin lactosa'],
  },

  // Postres
  {
    id: 'pos_1',
    category: 'postres',
    name: 'Volcán de Chocolate Fondant',
    price: 130,
    emoji: '🌋',
    description: 'Bizcocho tibio de chocolate amargo con centro líquido fundido, acompañado de helado de vainilla.',
    prepTime: 15,
    tags: ['dulce', 'postres'],
    restrictions: ['vegetariano'],
  },
  {
    id: 'pos_2',
    category: 'postres',
    name: 'Tiramisú de la Casa',
    price: 120,
    emoji: '🍰',
    description: 'Capas de bizcocho soletilla remojadas en café espresso, licor de amaretto y crema mascarpone.',
    prepTime: 8,
    tags: ['dulce', 'italiana', 'postres'],
    restrictions: ['vegetariano'],
  },
  {
    id: 'pos_3',
    category: 'postres',
    name: 'Cheesecake de Frutos Rojos',
    price: 115,
    emoji: '🍓',
    description: 'Clásico pay de queso cremoso al estilo Nueva York, bañado en una compota casera de frutos del bosque.',
    prepTime: 8,
    tags: ['dulce', 'postres'],
    restrictions: ['vegetariano'],
  },
];

export const POPULAR_ITEMS = [
  MENU_ITEMS[4], // Ribeye
  MENU_ITEMS[8], // Mojito
  MENU_ITEMS[12], // Volcán de chocolate
  MENU_ITEMS[0], // Bruschetta
];

export const RECENT_ORDERS = [
  {
    id: 'ORD-9875',
    status: 'En Cocina',
    date: 'Hoy, 20:32',
    total: 660,
    items: [
      { name: 'Ribeye Prime', qty: 1, price: 490 },
      { name: 'Maracuyá Mojito', qty: 1, price: 110 },
      { name: 'Café Espresso Doble', qty: 1, price: 60 },
    ],
  },
  {
    id: 'ORD-9851',
    status: 'Entregado',
    date: 'Ayer, 15:15',
    total: 360,
    items: [
      { name: 'Hamburguesa Royal', qty: 1, price: 240 },
      { name: 'Tiramisú de la Casa', qty: 1, price: 120 },
    ],
  },
];

export const UPCOMING_RESERVATIONS = [
  {
    id: 'RES-4412',
    date: 'Mañana, 19 de Mayo',
    time: '20:30',
    guests: 4,
    table: 'Mesa 12 (Terraza)',
  },
];

export const ORDER_HISTORY = [
  {
    id: 'ORD-9742',
    status: 'Completado',
    date: '15 de Mayo, 21:05',
    total: 820,
    items: [
      { name: 'Salmon Glaseado', qty: 1, price: 380 },
      { name: 'Calamari Fritti', qty: 1, price: 180 },
      { name: 'Vino Tinto Copa', qty: 2, price: 130 },
    ],
  },
  {
    id: 'ORD-9531',
    status: 'Completado',
    date: '10 de Mayo, 14:30',
    total: 350,
    items: [
      { name: 'Bruschetta de Pomodoro', qty: 1, price: 120 },
      { name: 'Ravioles de Espinaca', qty: 1, price: 290 },
      { name: 'Limonada de Lavanda', qty: 1, price: 75 },
      { name: 'Descuento Promoción', qty: 1, price: -135 }, // Simulación de cupón
    ],
  },
  {
    id: 'ORD-9102',
    status: 'Completado',
    date: '28 de Abril, 20:15',
    total: 1040,
    items: [
      { name: 'Tabla de Quesos', qty: 1, price: 260 },
      { name: 'Ribeye Prime', qty: 1, price: 490 },
      { name: 'Volcán de Chocolate', qty: 2, price: 130 },
      { name: 'Maracuyá Mojito', qty: 2, price: 110 },
      { name: 'Descuento Promoción', qty: 1, price: -160 },
    ],
  },
];

export const AVAILABLE_TIMES = [
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];

export const MOCK_CART = [
  {
    id: 'fuerte_2',
    name: 'Salmon Glaseado',
    price: 380,
    qty: 1,
    emoji: '🐟',
    description: 'Filete de salmón fresco a la plancha con salsa teriyaki.',
  },
  {
    id: 'beb_1',
    name: 'Maracuyá Mojito',
    price: 110,
    qty: 2,
    emoji: '🍹',
    description: 'Ron blanco, pulpa de maracuyá fresca y menta.',
  },
  {
    id: 'pos_1',
    name: 'Volcán de Chocolate',
    price: 130,
    qty: 1,
    emoji: '🌋',
    description: 'Bizcocho tibio de chocolate amargo con centro líquido.',
  },
];

export const AI_QUESTIONNAIRE = {
  cravings: [
    { id: 'salado', label: '🥩 Algo Salado y Robusto', value: 'salado' },
    { id: 'fresco', label: '🥗 Fresco, Ligero y Sano', value: 'fresco' },
    { id: 'dulce', label: '🍰 Un Capricho Dulce', value: 'dulce' },
    { id: 'refrescante', label: '🍹 Refrescante / Bebida', value: 'refrescante' },
  ],
  budget: [
    { id: 'bajo', label: '💵 Económico (Hasta $150)', value: 'bajo' },
    { id: 'medio', label: '💸 Moderado ($150 - $300)', value: 'medio' },
    { id: 'premium', label: '👑 Gourmet ($300+)', value: 'premium' },
  ],
  foodType: [
    { id: 'italiana', label: '🇮🇹 Pastas y Bruschettas', value: 'italiana' },
    { id: 'carnes', label: '🥩 Parrilla y Carnes', value: 'carnes' },
    { id: 'mariscos', label: '🐟 Mariscos y Salmón', value: 'mariscos' },
    { id: 'casual', label: '🍔 Casual y Snacks', value: 'casual' },
  ],
};
