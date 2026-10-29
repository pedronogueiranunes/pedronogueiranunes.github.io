import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

// One character is one pixel; the first pixel starts at (1, 1).
// O: orange edge, F: orange fill, H: upper-left highlight.
const maps = {
  arrow: `
O
OO
OHO
OHFO
OHFFO
OHFFFO
OHFFFFO
OHFFFFFO
OHFFFFFFO
OHFFFFFFFO
OHFFFFFFFFO
OHFFFFFOOOOO
OHFFOFFO
OHFOOFFO
OFO..OFFO
OO...OFFO
O.....OFFO
......OFFO
.......OO
`,
  hand: `
.....OO
....OHFO
....OHFO
....OHFO
....OHFOOO
....OHFOHFOOO
.OO.OHFOHFOHFOO
OHFOOHFOHFOHFOFO
OHFFOFFFFFFFFFFO
.OHFFFFFFFFFFFO
..OHFFFFFFFFFFO
..OHFFFFFFFFFFO
...OHFFFFFFFFFO
...OHFFFFFFFFFO
....OHFFFFFFFO
....OHFFFFFFFO
....OOOOOOOOOO
`,
  text: `
OOOOOOOOOO
OFFFFFFFFO
OOOOFFOOOO
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
...OFFO...
OOOOFFOOOO
OFFFFFFFFO
OOOOOOOOOO
`,
};
const colors = { O: '#FF5A1F', F: '#FF5A1F', H: '#FFB08F' };
const output = new URL('../public/assets/cursors/', import.meta.url);
await mkdir(output, { recursive: true });
for (const [name, map] of Object.entries(maps)) {
  const rows = map.trim().split('\n');
  if (rows.length > 30 || rows.some(row => row.length > 30 || /[^OFH. ]/.test(row))) {
    throw new Error(`Invalid cursor map: ${name}`);
  }
  const rects = rows.flatMap((row, y) => {
    const runs = [];
    for (let x = 0; x < row.length;) {
      const color = row[x];
      let end = x + 1;
      while (row[end] === color && end < row.length) end++;
      if (colors[color]) runs.push(`  <rect x="${x + 1}" y="${y + 1}" width="${end - x}" height="1" fill="${colors[color]}"/>`);
      x = end;
    }
    return runs;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">\n${rects.join('\n')}\n</svg>\n`;
  await writeFile(new URL(`${name}.svg`, output), svg);
  // Render at native size, then double each pixel without interpolation.
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp(png).resize(64, 64, { kernel: 'nearest' }).toFile(fileURLToPath(new URL(`${name}@2x.png`, output)));
}
