export const duocSedes = [
  {
    name: 'Sede San Joaquín (1km alrededor)',
    polygon: [
      { lat: -33.4978 + 0.009, lng: -70.6132 },  // 1 km al norte
      { lat: -33.4978, lng: -70.6132 + 0.009 },  // 1 km al este
      { lat: -33.4978 - 0.009, lng: -70.6132 },  // 1 km al sur
      { lat: -33.4978, lng: -70.6132 - 0.009 },  // 1 km al oeste
      { lat: -33.4978 + 0.009, lng: -70.6132 - 0.009 },  // 1 km noreste
      { lat: -33.4978 - 0.009, lng: -70.6132 + 0.009 },  // 1 km sureste
      { lat: -33.4978 + 0.009, lng: -70.6132 + 0.009 },  // 1 km noroeste
      { lat: -33.4978 - 0.009, lng: -70.6132 - 0.009 },  // 1 km suroeste
      { lat: -33.4978 + 0.009, lng: -70.6132 },  // Regresa al punto inicial
    ],
  },
];