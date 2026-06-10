const duckNames = [
  'Quackers', 'Daffy', 'Donald', 'Daisy', 'Waddles', 'Pip', 'Squeak', 'Bubbles', 
  'Webby', 'Puddles', 'Splash', 'Feathers', 'Bill', 'Mallard', 'Campbell', 'Pekin', 
  'Scooter', 'Nibbles', 'Lucky', 'Cookie', 'Peanut', 'Sunny', 'Stormy', 'Bluey', 'Garry'
]

const duckColors = ['#8B5A2B', '#CD853F', '#DEB887', '#F5F5DC']

const generateDucks = () => {
  const arr = []
  for (let i = 0; i < 25; i++) {
    // Random scale between [0.4, 0.4, 0.4] and [0.7, 0.7, 0.7]
    const sVal = 0.4 + Math.random() * 0.3
    const scale = [sVal, sVal, sVal]
    
    // Random organic color
    const color = duckColors[Math.floor(Math.random() * duckColors.length)]
    
    // Random speed between 1.0 and 1.6
    const speed = 1.0 + Math.random() * 0.6
    
    // Random position within pasture bounds [-35, 35]
    const px = -35 + Math.random() * 70
    const pz = -35 + Math.random() * 70
    
    arr.push({
      id: `npc-duck-${i}`,
      name: duckNames[i] || `Duck ${i + 1}`,
      color,
      pos: [px, 0, pz],
      type: 'duck',
      speed,
      scale
    })
  }
  return arr
}

export const SANCTUARY_NPCS = [
  ...generateDucks(),
  { id: 'npc-mama-goose', name: 'Mama Goose', color: '#FFFFFF', pos: [0, 0, -20], type: 'goose', speed: 1.0, scale: [1.1, 1.4, 1.1] },
  { id: 'npc-huff', name: 'Huff', color: '#FFFFFF', pos: [15, 0, 15], type: 'turkey', speed: 0.8, scale: [1.5, 1.5, 1.5] },
  { id: 'npc-companion', name: 'Companion', color: '#808080', pos: [18, 0, 18], type: 'turkey', speed: 0.9, scale: [1.1, 1.1, 1.1] },
]
