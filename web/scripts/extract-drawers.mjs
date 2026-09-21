import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/markup');

function extract(file, id) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const needle = `id="${id}"`;
  const startAttr = html.indexOf(needle);
  if (startAttr < 0) {
    throw new Error(`missing ${id} in ${file}`);
  }
  const open = html.lastIndexOf('<div', startAttr);
  let i = open;
  let depth = 0;
  while (i < html.length) {
    if (html.startsWith('<div', i)) {
      depth += 1;
      i += 4;
      continue;
    }
    if (html.startsWith('</div>', i)) {
      depth -= 1;
      i += 6;
      if (depth === 0) {
        return { html, block: html.slice(open, i), open, close: i };
      }
      continue;
    }
    i += 1;
  }
  throw new Error(`unclosed ${id}`);
}

const sources = [
  ['analyst/dossiers.html', 'analyst-drawer-backdrop'],
  ['analyst/anomalies.html', 'anomaly-drawer-backdrop'],
  ['agent/dashboard.html', 'agent-drawer-backdrop'],
  ['agent/inspections.html', 'inspection-drawer-backdrop'],
  ['agent/complements.html', 'complements-drawer-backdrop'],
  ['client/requests.html', 'client-request-drawer-backdrop'],
  ['client/schedule.html', 'schedule-drawer-backdrop'],
  ['committee/signed.html', 'signed-pv-drawer-backdrop'],
];

const parts = [];
for (const [file, id] of sources) {
  const { html, block, open, close } = extract(file, id);
  parts.push(block);
  const next = `${html.slice(0, open)}${html.slice(close)}`.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(path.join(root, file), next);
}

const out = path.join(root, 'shared/drawers.html');
fs.writeFileSync(out, parts.join('\n\n'));
console.log('wrote', out, fs.statSync(out).size, 'and stripped page copies');
