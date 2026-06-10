export const SANCTUARY_STRUCTURES = [
  // 1. PERIMETER FENCING (A half-acre square block, roughly 45x45 meters)
  { id: 'fence-back', name: 'Back Fence', type: 'box', position: [0, 1, -22.5], scale: [45, 2, 0.5], color: '#A0522D', collidable: true },
  { id: 'fence-front', name: 'Front Fence', type: 'box', position: [0, 1, 22.5], scale: [45, 2, 0.5], color: '#A0522D', collidable: true },
  { id: 'fence-left', name: 'Left Fence', type: 'box', position: [-22.5, 1, 0], scale: [0.5, 2, 45], color: '#A0522D', collidable: true },
  { id: 'fence-right', name: 'Right Fence', type: 'box', position: [22.5, 1, 0], scale: [0.5, 2, 45], color: '#A0522D', collidable: true },

  // 2. ENTRANCE & UTILITIES (Starting Corner / Front Center)
  { id: 'main-gate', name: 'Entrance Gate', type: 'box', position: [0, 1, 22.4], scale: [4, 1.8, 0.3], color: '#696969', collidable: true },
  { id: 'water-spigot', name: 'Water Spigot', type: 'cylinder', position: [2, 0.5, 21], scale: [0.1, 1, 0.1], color: '#4682B4', collidable: true },

  // 3. THE CENTER BARN COMPLEX
  // Main enclosed section (1 main stall, 4 small stalls)
  { id: 'barn-enclosed', name: 'Barn Stall Block', type: 'box', position: [-3, 2, 0], scale: [8, 4, 10], color: '#8B4513', collidable: true },
  // Open covered pavilion section (roof only - using a flat box placeholder for now)
  { id: 'barn-open-roof', name: 'Barn Open Covered Pavilion', type: 'box', position: [4, 3.8, 0], scale: [6, 0.4, 10], color: '#A0522D', collidable: false },
  { id: 'barn-pillar-1', name: 'Barn Pillar', type: 'cylinder', position: [6.8, 2, 4.8], scale: [0.2, 4, 0.2], color: '#D3D3D3', collidable: true },
  { id: 'barn-pillar-2', name: 'Barn Pillar', type: 'cylinder', position: [6.8, 2, -4.8], scale: [0.2, 4, 0.2], color: '#D3D3D3', collidable: true },

  // 4. CAMPSITE (In between the Gate and the Center Barn)
  { id: 'fire-pit', name: 'Campsite Fireplace', type: 'cylinder', position: [0, 0.1, 11], scale: [1.2, 0.2, 1.2], color: '#4F4F4F', collidable: true },
  { id: 'bench-1', name: 'Campsite Bench A', type: 'box', position: [0, 0.3, 12.5], scale: [2, 0.4, 0.5], color: '#CD853F', collidable: true },
  { id: 'bench-2', name: 'Campsite Bench B', type: 'box', position: [-1.8, 0.3, 11], scale: [0.5, 0.4, 2], color: '#CD853F', collidable: true },
  { id: 'bench-3', name: 'Campsite Bench C', type: 'box', position: [1.8, 0.3, 11], scale: [0.5, 0.4, 2], color: '#CD853F', collidable: true },

  // 5. WATER FEATURE (Opposite side from the gate - 15ft / ~4.5m across)
  { id: 'sanctuary-pond', name: 'Future Pools Section', type: 'cylinder', position: [0, 0.02, -13], scale: [4.5, 0.05, 4.5], color: '#4169E1', collidable: false, isWater: true },

  // 6. CORNER SHADE & PERIMETER COVER (Bushes and Trees clusters)
  { id: 'corner-bush-tl', name: 'Corner Foliage TL', type: 'box', position: [-19, 1.5, -19], scale: [6, 3, 6], color: '#2E8B57', collidable: true },
  { id: 'corner-bush-tr', name: 'Corner Foliage TR', type: 'box', position: [19, 1.5, -19], scale: [6, 3, 6], color: '#2E8B57', collidable: true },
  { id: 'corner-bush-bl', name: 'Corner Foliage BL', type: 'box', position: [-19, 1.5, 19], scale: [6, 3, 6], color: '#2E8B57', collidable: true },
  { id: 'corner-bush-br', name: 'Corner Foliage BR', type: 'box', position: [19, 1.5, 19], scale: [6, 3, 6], color: '#2E8B57', collidable: true },

  // 7. SCATTERED FIELD DETAILS (Rocks spread around the central field)
  { id: 'rock-field-1', name: 'Field Rock A', type: 'box', position: [-8, 0.4, 6], scale: [1.2, 0.8, 1], color: '#808080', collidable: true },
  { id: 'rock-field-2', name: 'Field Rock B', type: 'box', position: [9, 0.3, -7], scale: [0.8, 0.6, 1.4], color: '#808080', collidable: true },
  { id: 'rock-field-3', name: 'Field Rock C', type: 'box', position: [-12, 0.5, -10], scale: [1.5, 1, 1.1], color: '#808080', collidable: true },
]
