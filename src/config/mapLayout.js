export const SANCTUARY_STRUCTURES = [
  // 1. PERIMETER FENCING (A massive 90x90 meter zone)
  { id: 'fence-back', name: 'Back Fence', type: 'box', position: [0, 1, -45], scale: [90, 2, 0.5], color: '#A0522D', collidable: true },
  { id: 'fence-front', name: 'Front Fence', type: 'box', position: [0, 1, 45], scale: [90, 2, 0.5], color: '#A0522D', collidable: true },
  { id: 'fence-left', name: 'Left Fence', type: 'box', position: [-45, 1, 0], scale: [0.5, 2, 90], color: '#A0522D', collidable: true },
  { id: 'fence-right', name: 'Right Fence', type: 'box', position: [45, 1, 0], scale: [0.5, 2, 90], color: '#A0522D', collidable: true },

  // 2. ENTRANCE & UTILITIES (Slide to match expanded left-corner front wall boundary)
  { id: 'main-gate', name: 'Entrance Gate', type: 'box', position: [-30, 1, 44.9], scale: [4, 1.8, 0.3], color: '#696969', collidable: true },
  { id: 'water-spigot', name: 'Water Spigot', type: 'cylinder', position: [-26, 0.5, 43], scale: [0.1, 1, 0.1], color: '#4682B4', collidable: true },

  // 3. THE CENTER BARN COMPLEX (Far Left)
  // Main enclosed section (centered at Z=0, pavilion moves to +Z front side)
  { id: 'barn-enclosed', name: 'Barn Stall Block', type: 'box', position: [-25, 2, 0], scale: [10, 4, 8], color: '#8B4513', collidable: true },
  // Open covered pavilion section (moved to Z=7 front side)
  { id: 'barn-open-roof', name: 'Barn Open Covered Pavilion', type: 'box', position: [-25, 3.8, 7], scale: [10, 0.4, 6], color: '#A0522D', collidable: false },
  // Pillars positioned at the front-facing corners of the pavilion
  { id: 'barn-pillar-1', name: 'Barn Pillar', type: 'cylinder', position: [-20.2, 2, 9.8], scale: [0.2, 4, 0.2], color: '#D3D3D3', collidable: true },
  { id: 'barn-pillar-2', name: 'Barn Pillar', type: 'cylinder', position: [-29.8, 2, 9.8], scale: [0.2, 4, 0.2], color: '#D3D3D3', collidable: true },

  // 4. CAMPSITE (Moved Further Left, tucked between Gate and Barn)
  { id: 'fire-pit', name: 'Campsite Fireplace', type: 'cylinder', position: [-25, 0.1, 22], scale: [1.2, 0.2, 1.2], color: '#4F4F4F', collidable: true },
  { id: 'bench-1', name: 'Campsite Bench A', type: 'box', position: [-25, 0.3, 23.5], scale: [2, 0.4, 0.5], color: '#CD853F', collidable: true },
  { id: 'bench-2', name: 'Campsite Bench B', type: 'box', position: [-26.8, 0.3, 22], scale: [0.5, 0.4, 2], color: '#CD853F', collidable: true },
  { id: 'bench-3', name: 'Campsite Bench C', type: 'box', position: [-23.2, 0.3, 22], scale: [0.5, 0.4, 2], color: '#CD853F', collidable: true },

  // 5. WATER FEATURES (4 pools arranged in a tight diamond cluster + 1 massive 5th pool, moved to far left corner)
  { id: 'pool-1', name: 'Pool Section 1', type: 'cylinder', position: [-25, 0.02, -22], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-2', name: 'Pool Section 2', type: 'cylinder', position: [-25, 0.02, -30], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-3', name: 'Pool Section 3', type: 'cylinder', position: [-29, 0.02, -26], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-4', name: 'Pool Section 4', type: 'cylinder', position: [-21, 0.02, -26], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-large', name: 'Massive Pool Section', type: 'cylinder', position: [-13, 0.02, -26], scale: [4.5, 0.05, 4.5], color: '#1E90FF', collidable: false, isWater: true },

  // 6. FEED CANS (Corn storage outside the barn, moved to far left outside doors)
  { id: 'feed-can-1', name: 'Metal Corn Can A', type: 'cylinder', position: [-31, 0.6, 5], scale: [0.4, 1.2, 0.4], color: '#A9A9A9', collidable: true },
  { id: 'feed-can-2', name: 'Metal Corn Can B', type: 'cylinder', position: [-29.8, 0.6, 5], scale: [0.4, 1.2, 0.4], color: '#A9A9A9', collidable: true },

  // 7. SCATTERED FIELD DETAILS (Rocks spread out in the wider sandbox)
  { id: 'rock-field-1', name: 'Field Rock A', type: 'box', position: [-15, 0.4, 12], scale: [1.5, 0.8, 1.5], color: '#808080', collidable: true },
  { id: 'rock-field-2', name: 'Field Rock B', type: 'box', position: [18, 0.3, -15], scale: [1.2, 0.6, 2], color: '#808080', collidable: true },
  { id: 'rock-field-3', name: 'Field Rock C', type: 'box', position: [-25, 0.5, -18], scale: [2, 1, 1.8], color: '#808080', collidable: true },

  // 8. EXTERNAL LANDMARKS (Outside the sanctuary fences)
  { id: 'ext-road-front', name: 'Country Road Front', type: 'box', position: [0, 0.01, 52], scale: [120, 0.02, 6], color: '#333333', collidable: false },
  { id: 'ext-road-left', name: 'Country Road Left', type: 'box', position: [-52, 0.01, 0], scale: [6, 0.02, 110], color: '#333333', collidable: false },
  { id: 'ext-neighbor-house', name: 'White A-Frame Base', type: 'box', position: [0, 2.5, -60], scale: [12, 5, 10], color: '#FFFFFF', collidable: true },
  { id: 'ext-neighbor-roof', name: 'A-Frame Roof', type: 'cone', position: [0, 6, -60], scale: [8, 3, 8], color: '#444444', collidable: false },
  { id: 'ext-huge-field', name: 'Extended Northern Field', type: 'box', position: [0, -0.05, -140], scale: [300, 0.1, 150], color: '#6B8E23', collidable: false },
  { id: 'ext-river', name: 'Boundary River', type: 'box', position: [0, -0.1, -210], scale: [300, 0.2, 20], color: '#4682B4', collidable: false },

  // 9. SHADE TREES (Procedural trees on the pasture)
  { id: 'tree-1', name: 'Shade Tree A', type: 'tree', position: [15, 0, -15], scale: [1, 1, 1], color: '#228B22', collidable: true },
  { id: 'tree-2', name: 'Shade Tree B', type: 'tree', position: [25, 0, -10], scale: [1, 1, 1], color: '#228B22', collidable: true },
  { id: 'tree-3', name: 'Shade Tree C', type: 'tree', position: [20, 0, 10], scale: [1, 1, 1], color: '#228B22', collidable: true },
  { id: 'tree-4', name: 'Shade Tree D', type: 'tree', position: [30, 0, 25], scale: [1, 1, 1], color: '#228B22', collidable: true },
  { id: 'tree-5', name: 'Shade Tree E', type: 'tree', position: [-10, 0, 32], scale: [1, 1, 1], color: '#228B22', collidable: true },
  { id: 'tree-6', name: 'Shade Tree F', type: 'tree', position: [-35, 0, -12], scale: [1, 1, 1], color: '#228B22', collidable: true },

  // 10. CORNER SHADE & PERIMETER COVER (Bushes scaled out to new corners)
  { id: 'corner-bush-tl', name: 'Corner Foliage TL', type: 'bush', position: [-40, 0, -40], scale: [1, 1, 1], color: '#2E8B57', collidable: true },
  { id: 'corner-bush-tr', name: 'Corner Foliage TR', type: 'bush', position: [40, 0, -40], scale: [1, 1, 1], color: '#2E8B57', collidable: true },
  { id: 'corner-bush-bl', name: 'Corner Foliage BL', type: 'bush', position: [-40, 0, 40], scale: [1, 1, 1], color: '#2E8B57', collidable: true },
  { id: 'corner-bush-br', name: 'Corner Foliage BR', type: 'bush', position: [40, 0, 40], scale: [1, 1, 1], color: '#2E8B57', collidable: true },
]
