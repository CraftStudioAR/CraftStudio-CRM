const fs = require('fs');

const svgContent = fs.readFileSync('c:/Users/giuli/Documents/CraftStudio/public/favicon.svg', 'utf8');

// A simple parser for SVG path data
function getPathBounds(d) {
  let x = 0, y = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  function updateBounds(px, py) {
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }

  // Tokenize the path
  const tokens = d.match(/[a-df-z]|[-+]?[0-9]*\.?[0-9]+/gi);
  if (!tokens) return null;

  let cmd = '';
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[a-df-z]/i.test(t)) {
      cmd = t;
      i++;
    }

    if (i >= tokens.length) break;

    if (cmd === 'M') {
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'm') {
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'L') {
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'l') {
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'H') {
      x = parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'h') {
      x += parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'V') {
      y = parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'v') {
      y += parseFloat(tokens[i++]);
      updateBounds(x, y);
    } else if (cmd === 'C') {
      const cx1 = parseFloat(tokens[i++]);
      const cy1 = parseFloat(tokens[i++]);
      const cx2 = parseFloat(tokens[i++]);
      const cy2 = parseFloat(tokens[i++]);
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      updateBounds(cx1, cy1);
      updateBounds(cx2, cy2);
      updateBounds(x, y);
    } else if (cmd === 'c') {
      const cx1 = x + parseFloat(tokens[i++]);
      const cy1 = y + parseFloat(tokens[i++]);
      const cx2 = x + parseFloat(tokens[i++]);
      const cy2 = y + parseFloat(tokens[i++]);
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      updateBounds(cx1, cy1);
      updateBounds(cx2, cy2);
      updateBounds(x, y);
    } else if (cmd === 'S') {
      const cx2 = parseFloat(tokens[i++]);
      const cy2 = parseFloat(tokens[i++]);
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      updateBounds(cx2, cy2);
      updateBounds(x, y);
    } else if (cmd === 's') {
      const cx2 = x + parseFloat(tokens[i++]);
      const cy2 = y + parseFloat(tokens[i++]);
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      updateBounds(cx2, cy2);
      updateBounds(x, y);
    } else if (cmd === 'Q') {
      const cx1 = parseFloat(tokens[i++]);
      const cy1 = parseFloat(tokens[i++]);
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      updateBounds(cx1, cy1);
      updateBounds(x, y);
    } else if (cmd === 'q') {
      const cx1 = x + parseFloat(tokens[i++]);
      const cy1 = y + parseFloat(tokens[i++]);
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      updateBounds(cx1, cy1);
      updateBounds(x, y);
    } else if (cmd === 'Z' || cmd === 'z') {
      // Close path (nothing to parse)
    } else {
      // Unknown or unsupported command, skip one token to avoid infinite loop
      i++;
    }
  }

  return { minX, maxX, minY, maxY };
}

const matches = svgContent.match(/d="([^"]+)"/g);
if (matches) {
  let gMinX = Infinity, gMaxX = -Infinity;
  let gMinY = Infinity, gMaxY = -Infinity;
  matches.forEach(m => {
    const d = m.slice(3, -1);
    const bounds = getPathBounds(d);
    if (bounds) {
      if (bounds.minX < gMinX) gMinX = bounds.minX;
      if (bounds.maxX > gMaxX) gMaxX = bounds.maxX;
      if (bounds.minY < gMinY) gMinY = bounds.minY;
      if (bounds.maxY > gMaxY) gMaxY = bounds.maxY;
    }
  });

  console.log(`Global Bounds:`);
  console.log(`X: ${gMinX} to ${gMaxX} (width: ${gMaxX - gMinX})`);
  console.log(`Y: ${gMinY} to ${gMaxY} (height: ${gMaxY - gMinY})`);
}
