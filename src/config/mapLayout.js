export const SANCTUARY_STRUCTURES = [
  // 1. PERIMETER FENCING (A massive 90x90 meter zone)
  { id: 'fence-back', name: 'Back Fence', type: 'box', position: [0, 1, -45], scale: [90, 2, 0.5], color: '#A0522D', collidable: true },
  { id: 'fence-front', name: 'Front Fence', type: 'box', position: [0, 1, 45], scale: [90, 2, 0.5], color: '#A0522D', collidable: true },
  { id: 'fence-left', name: 'Left Fence', type: 'box', position: [-45, 1, 0], scale: [0.5, 2, 90], color: '#A0522D', collidable: true },
  { id: 'fence-right', name: 'Right Fence', type: 'box', position: [45, 1, 0], scale: [0.5, 2, 90], color: '#A0522D', collidable: true },

  // 2. ENTRANCE & UTILITIES (Slide to match expanded left-corner front wall boundary)
  { id: 'main-gate', name: 'Entrance Gate', type: 'box', position: [-30, 1, 44.9], scale: [4, 1.8, 0.3], color: '#696969', collidable: true },
  { id: 'water-spigot', name: 'Water Spigot', type: 'cylinder', position: [-26, 0.5, 43], scale: [0.1, 1, 0.1], color: '#4682B4', collidable: true },

  // 3. THE CENTER BARN COMPLEX (Flipped 180 degrees)
  // Main enclosed section (centered at Z=0, pavilion moves to +Z front side)
  { id: 'barn-enclosed', name: 'Barn Stall Block', type: 'box', position: [-3, 2, 0], scale: [10, 4, 8], color: '#8B4513', collidable: true },
  // Open covered pavilion section (moved to Z=7 front side)
  { id: 'barn-open-roof', name: 'Barn Open Covered Pavilion', type: 'box', position: [-3, 3.8, 7], scale: [10, 0.4, 6], color: '#A0522D', collidable: false },
  // Pillars positioned at the front-facing corners of the pavilion
  { id: 'barn-pillar-1', name: 'Barn Pillar', type: 'cylinder', position: [1.8, 2, 9.8], scale: [0.2, 4, 0.2], color: '#D3D3D3', collidable: true },
  { id: 'barn-pillar-2', name: 'Barn Pillar', type: 'cylinder', position: [-7.8, 2, 9.8], scale: [0.2, 4, 0.2], color: '#D3D3D3', collidable: true },

  // 4. CAMPSITE (Repositioned between Gate and Center Barn)
  { id: 'fire-pit', name: 'Campsite Fireplace', type: 'cylinder', position: [-20, 0.1, 22], scale: [1.2, 0.2, 1.2], color: '#4F4F4F', collidable: true },
  { id: 'bench-1', name: 'Campsite Bench A', type: 'box', position: [-20, 0.3, 23.5], scale: [2, 0.4, 0.5], color: '#CD853F', collidable: true },
  { id: 'bench-2', name: 'Campsite Bench B', type: 'box', position: [-21.8, 0.3, 22], scale: [0.5, 0.4, 2], color: '#CD853F', collidable: true },
  { id: 'bench-3', name: 'Campsite Bench C', type: 'box', position: [-18.2, 0.3, 22], scale: [0.5, 0.4, 2], color: '#CD853F', collidable: true },

  // 5. WATER FEATURES (4 pools arranged in a tight diamond cluster + 1 massive 5th pool)
  { id: 'pool-1', name: 'Pool Section 1', type: 'cylinder', position: [0, 0.02, -22], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-2', name: 'Pool Section 2', type: 'cylinder', position: [0, 0.02, -30], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-3', name: 'Pool Section 3', type: 'cylinder', position: [-4, 0.02, -26], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-4', name: 'Pool Section 4', type: 'cylinder', position: [4, 0.02, -26], scale: [2.25, 0.05, 2.25], color: '#4169E1', collidable: false, isWater: true },
  { id: 'pool-large', name: 'Massive Pool Section', type: 'cylinder', position: [12, 0.02, -26], scale: [4.5, 0.05, 4.5], color: '#1E90FF', collidable: false, isWater: true },



  // 6. FEED CANS (Corn storage outside the barn)
  { id: 'feed-can-1', name: 'Metal Corn Can A', type: 'cylinder', position: [-9, 0.6, 5], scale: [0.4, 1.2, 0.4], color: '#A9A9A9', collidable: true },
  { id: 'feed-can-2', name: 'Metal Corn Can B', type: 'cylinder', position: [-7.8, 0.6, 5], scale: [0.4, 1.2, 0.4], color: '#A9A9A9', collidable: true },

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
]
