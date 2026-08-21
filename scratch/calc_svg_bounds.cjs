const fs = require('fs');

const svgContent = fs.readFileSync('c:/Users/giuli/Documents/CraftStudio/public/favicon.svg', 'utf8');

// Quick regex parsing of all numbers in path data
const matches = svgContent.match(/d="([^"]+)"/g);
if (!matches) {
  console.log("No path data found");
  process.exit(1);
}

let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;

matches.forEach(m => {
  const d = m.slice(3, -1);
  const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (coords) {
    for (let i = 0; i < coords.length; i++) {
      const val = parseFloat(coords[i]);
      // Alternate x and y coords roughly for bounding box estimation
      if (i % 2 === 0) {
        if (val < minX) minX = val;
        if (val > maxX) maxX = val;
      } else {
        if (val < minY) minY = val;
        if (val > maxY) maxY = val;
      }
    }
  }
});

console.log(`Bounding Box:`);
console.log(`X: ${minX} to ${maxX} (width: ${maxX - minX})`);
console.log(`Y: ${minY} to ${maxY} (height: ${maxY - minY})`);
