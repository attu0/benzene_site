// three.js space: x right, y up, z toward viewer. Units: metres.
// hx/hz are half-extents (footprint), h is height, y (optional) is base height.
// The robot always spawns at (0, 0) on the green dock - keep ~1 m around it clear.

const WALL_H = 2.5

// four outer walls for a w x d room centred on the origin
function room(w, d, color) {
  return [
    { type: 'wall', x: 0, z: -(d / 2 + 0.1), hx: w / 2 + 0.2, hz: 0.1, h: WALL_H, color },
    { type: 'wall', x: 0, z: d / 2 + 0.1, hx: w / 2 + 0.2, hz: 0.1, h: WALL_H, color },
    { type: 'wall', x: -(w / 2 + 0.1), z: 0, hx: 0.1, hz: d / 2 + 0.2, h: WALL_H, color },
    { type: 'wall', x: w / 2 + 0.1, z: 0, hx: 0.1, hz: d / 2 + 0.2, h: WALL_H, color },
  ]
}

const box = (x, z, hx, hz, h, color, extra = {}) => ({ type: 'box', x, z, hx, hz, h, color, ...extra })
const table = (x, z, hx, hz, h, color) => ({ type: 'table', x, z, hx, hz, h, color })
const plant = (x, z, r = 0.22, h = 0.9) => ({ type: 'plant', x, z, hx: r, hz: r, h })

/* ------------------------------------------------------------------ */
/* HOUSE  12 x 9 m : bedroom (NW), kitchen (SW), living room (east)   */
/* ------------------------------------------------------------------ */
const house = {
  label: 'House',
  size: [12, 9],
  floor: '#b89b7a',
  lampColor: '#ffe2b8',
  grid: false,
  lamps: [[-4.2, -2.2], [-4.2, 2.2], [2, -2], [2, 2]],
  flats: [
    { x: 3.2, z: -2.6, w: 3.2, d: 2.0, color: '#8c5a5a' }, // living-room rug
    { x: -4.2, z: -3.0, w: 2.0, d: 2.4, color: '#6f8fb3' }, // bedroom rug
    { x: -4.2, z: 2.1, w: 1.8, d: 1.4, color: '#c9b27c' }, // kitchen mat
  ],
  boxes: [
    ...room(12, 9, '#e9e4da'),
    // divider between west rooms and living room (two doorways, 1.2 m wide)
    box(-2.5, -3.5, 0.1, 1.0, WALL_H, '#e9e4da', { type: 'wall' }),
    box(-2.5, 0, 0.1, 1.3, WALL_H, '#e9e4da', { type: 'wall' }),
    box(-2.5, 3.5, 0.1, 1.0, WALL_H, '#e9e4da', { type: 'wall' }),
    // wall between bedroom and kitchen
    box(-4.25, 0, 1.75, 0.1, WALL_H, '#e9e4da', { type: 'wall' }),

    // bedroom
    box(-4.8, -3.5, 0.9, 1.0, 0.5, '#7a9cc6'), // bed
    box(-3.1, -4.2, 0.2, 0.2, 0.5, '#8b5a2b'), // nightstand
    box(-5.75, -1.2, 0.25, 0.6, 1.9, '#6b4a2f'), // wardrobe

    // kitchen
    box(-4.3, 4.2, 1.6, 0.3, 0.9, '#d8d4cc'), // counter
    box(-5.5, 0.6, 0.35, 0.35, 1.8, '#e5e7eb'), // fridge
    table(-4.2, 2.0, 0.6, 0.4, 0.75, '#a47148'), // dining table

    // living room
    box(3.4, -4.0, 1.0, 0.45, 0.8, '#5b6b8c'), // sofa
    table(3.4, -2.6, 0.5, 0.3, 0.4, '#8b5a2b'), // coffee table
    box(5.7, 0, 0.2, 1.0, 0.5, '#2b2d33'), // TV unit
    box(2, 4.3, 1.0, 0.2, 1.6, '#8b5a2b'), // bookcase
    plant(-1.8, -4.1),
    plant(5.5, 3.8),
  ],
}

/* ------------------------------------------------------------------ */
/* CAFE  10 x 8 m : counter on the north wall, tables, window booth   */
/* ------------------------------------------------------------------ */
const cafeTable = (x, z) => [
  table(x, z, 0.4, 0.4, 0.75, '#e8d9c0'),
  box(x - 0.75, z, 0.2, 0.2, 0.45, '#9a4a2f'),
  box(x + 0.75, z, 0.2, 0.2, 0.45, '#9a4a2f'),
]

const cafe = {
  label: 'Cafe',
  size: [10, 8],
  floor: '#7a5c44',
  lampColor: '#ffcf94',
  grid: false,
  lamps: [[-2.5, -2], [2.5, -2], [-2.5, 2.2], [2.5, 2.2]],
  flats: [
    { x: 0, z: 3.0, w: 3.2, d: 1.2, color: '#9a4a2f' }, // entrance runner
  ],
  boxes: [
    ...room(10, 8, '#d6b99a'),
    // service counter + equipment
    box(0, -3.2, 2.5, 0.35, 1.0, '#6b4a2f'),
    box(-1, -3.2, 0.3, 0.2, 0.4, '#2b2d33', { y: 1.0 }), // espresso machine
    box(1.5, -3.2, 0.5, 0.25, 0.3, '#cfe6f0', { y: 1.0 }), // pastry case
    // booth seating on the west wall
    box(-4.6, -1.0, 0.35, 1.0, 0.8, '#a8452b'),
    // tables + chairs
    ...cafeTable(-3, 0.8),
    ...cafeTable(-3, 2.9),
    ...cafeTable(3, 0.8),
    ...cafeTable(3, 2.9),
    ...cafeTable(0, 2.9),
    // shelving + plants
    box(4.7, -2.2, 0.25, 0.9, 1.6, '#8b5a2b'),
    plant(-4.4, -3.4),
    plant(4.4, -3.5),
    plant(-4.4, 3.5),
  ],
}

/* ------------------------------------------------------------------ */
/* OFFICE  14 x 10 m : desk rows, glass meeting area, cabinets        */
/* ------------------------------------------------------------------ */
const desk = (x, z, chairDir) => [
  table(x, z, 0.8, 0.4, 0.75, '#d9d2c3'),
  box(x, z + chairDir * 0.75, 0.22, 0.22, 0.5, '#374151'),
]

const office = {
  label: 'Office',
  size: [14, 10],
  floor: '#9aa3ad',
  lampColor: '#f4f8ff',
  grid: true,
  lamps: [[-4, -2], [4, -2], [-4, 2], [4, 2]],
  flats: [
    { x: 0, z: 0, w: 14, d: 0.08, color: '#f2c230' }, // walkway line
  ],
  boxes: [
    ...room(14, 10, '#e5e7eb'),
    // desk rows
    ...[-5.5, -2.5, 0.5].flatMap((x) => [...desk(x, -3.2, 1), ...desk(x, 3.2, -1)]),
    // glass meeting area (north-east)
    box(5.2, -0.8, 1.8, 0.05, WALL_H, '#bcd7e6', { type: 'wall' }),
    table(5.2, -2.8, 1.2, 0.6, 0.75, '#8b6b4a'),
    ...[4.4, 5.2, 6.0].flatMap((x) => [
      box(x, -3.8, 0.22, 0.22, 0.5, '#374151'),
      box(x, -1.8, 0.22, 0.22, 0.5, '#374151'),
    ]),
    // storage + misc
    ...[3, 4, 5].map((x) => box(x, 4.6, 0.4, 0.25, 1.3, '#9ca3af')), // filing cabinets
    box(-6.6, 0, 0.2, 0.2, 1.1, '#4a90c2'), // water cooler
    box(-6.95, -3.0, 0.05, 1.2, 0.8, '#ffffff', { y: 1.0 }), // whiteboard
    plant(6.4, 3.6),
    plant(-6.4, 4.4),
  ],
}

export const ENVIRONMENTS = { house, cafe, office }
export const ENV_KEYS = Object.keys(ENVIRONMENTS)

export const ROBOT_RADIUS = 0.2

// Push a circle (robot) out of every box. Returns the corrected [x, z].
export function resolve(x, z, r, boxes) {
  for (const b of boxes) {
    const cx = Math.max(b.x - b.hx, Math.min(x, b.x + b.hx))
    const cz = Math.max(b.z - b.hz, Math.min(z, b.z + b.hz))
    const dx = x - cx
    const dz = z - cz
    const d2 = dx * dx + dz * dz
    if (d2 >= r * r) continue
    if (d2 > 1e-9) {
      const d = Math.sqrt(d2)
      x = cx + (dx / d) * r
      z = cz + (dz / d) * r
    } else {
      // centre is inside the box: exit along the shallowest axis
      const px = b.hx - Math.abs(x - b.x)
      const pz = b.hz - Math.abs(z - b.z)
      if (px < pz) x = b.x + (Math.sign(x - b.x) || 1) * (b.hx + r)
      else z = b.z + (Math.sign(z - b.z) || 1) * (b.hz + r)
    }
  }
  return [x, z]
}