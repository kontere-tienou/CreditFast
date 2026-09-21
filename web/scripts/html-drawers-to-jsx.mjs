import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve('src/markup/shared/drawers.html');
const outDir = path.resolve('src/features/drawers');

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
const BOOL = new Set(['checked', 'disabled', 'readOnly', 'required', 'selected', 'multiple', 'autoFocus', 'hidden']);
const ATTR = {
  class: 'className',
  for: 'htmlFor',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  maxlength: 'maxLength',
  tabindex: 'tabIndex',
  autocomplete: 'autoComplete',
  readonly: 'readOnly',
  autofocus: 'autoFocus',
};

const DRAWERS = [
  ['analyst-drawer-backdrop', 'AnalystDossierDrawer'],
  ['anomaly-drawer-backdrop', 'AnomalyDrawer'],
  ['agent-drawer-backdrop', 'AgentDossierDrawer'],
  ['inspection-drawer-backdrop', 'InspectionDrawer'],
  ['complements-drawer-backdrop', 'ComplementsDrawer'],
  ['client-request-drawer-backdrop', 'ClientRequestDrawer'],
  ['schedule-drawer-backdrop', 'ScheduleDrawer'],
  ['signed-pv-drawer-backdrop', 'SignedPvDrawer'],
];

function camelProp(key) {
  if (key.startsWith('--')) return `'${key}'`;
  if (key === 'float') return 'cssFloat';
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function styleObject(raw) {
  const parts = [];
  let buf = '';
  let depth = 0;
  for (const ch of raw) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ';' && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);

  const entries = [];
  for (const part of parts) {
    const idx = part.indexOf(':');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    const jsKey = camelProp(key);
    const numeric = /^-?\d+(\.\d+)?$/.test(val);
    entries.push(`${jsKey}: ${numeric ? val : JSON.stringify(val)}`);
  }
  return `{{ ${entries.join(', ')} }}`;
}

function parseArgs(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return `, ${trimmed}`;
}

function convertCall(stmt) {
  const s = stmt.trim().replace(/;$/, '');
  if (!s) return '';
  const app = s.match(/^App\.(\w+)\((.*)\)$/s);
  if (app) return `callApp(${JSON.stringify(app[1])}${parseArgs(app[2])})`;
  const inter = s.match(/^AppInteractions\.(\w+)\((.*)\)$/s);
  if (inter) return `callInteractions(${JSON.stringify(inter[1])}${parseArgs(inter[2])})`;
  throw new Error(`unhandled onclick stmt: ${s}`);
}

function convertOnclick(code) {
  const trimmed = code.trim().replace(/;$/, '');
  if (trimmed === 'event.stopPropagation()') {
    return '(event) => event.stopPropagation()';
  }
  if (/^if\s*\(\s*event\.target\s*===\s*this\s*\)/.test(trimmed)) {
    const rest = trimmed.replace(/^if\s*\(\s*event\.target\s*===\s*this\s*\)\s*/, '');
    return `(event) => { if (event.target === event.currentTarget) ${convertCall(rest)}; }`;
  }
  const stmts = trimmed
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map(convertCall);
  if (stmts.length === 1) return `() => ${stmts[0]}`;
  return `() => { ${stmts.join('; ')}; }`;
}

function convertAttrName(name) {
  return ATTR[name] ?? name;
}

function convertAttrs(raw, tag) {
  const attrs = [];
  const re = /([:@]?[\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = re.exec(raw))) {
    const name = match[1];
    const value = match[2] ?? match[3] ?? match[4];
    if (name === 'onclick') {
      attrs.push(`onClick={${convertOnclick(value ?? '')}}`);
      continue;
    }
    if (name === 'style' && value != null) {
      attrs.push(`style=${styleObject(value)}`);
      continue;
    }
    const jsName = convertAttrName(name);
    if (value == null) {
      if (BOOL.has(jsName) || BOOL.has(name)) attrs.push(jsName);
      else attrs.push(jsName);
      continue;
    }
    if (tag === 'img' && name === 'src' && value.startsWith('images/')) {
      attrs.push(`${jsName}=${JSON.stringify(`/${value}`)}`);
      continue;
    }
    if (name === 'class' && value.includes('fa-shield-check')) {
      attrs.push(`${jsName}=${JSON.stringify(value.replace('fa-shield-check', 'fa-shield-halved'))}`);
      continue;
    }
    attrs.push(`${jsName}=${JSON.stringify(value)}`);
  }
  if (tag === 'button' && !/\btype=/.test(raw)) {
    attrs.unshift('type="button"');
  }
  return attrs;
}

function convertFragment(html) {
  let i = 0;
  let out = '';

  const pushText = (text) => {
    if (!text) return;
    out += text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      if (end < 0) throw new Error('unclosed comment');
      const body = html.slice(i + 4, end).replace(/\*\//g, '*\\/');
      out += `{/*${body}*/}`;
      i = end + 3;
      continue;
    }

    if (html[i] !== '<') {
      const next = html.indexOf('<', i);
      const chunk = next < 0 ? html.slice(i) : html.slice(i, next);
      pushText(chunk);
      i = next < 0 ? html.length : next;
      continue;
    }

    const gt = html.indexOf('>', i);
    if (gt < 0) throw new Error('unclosed tag');
    const rawTag = html.slice(i + 1, gt);
    const selfClosing = rawTag.endsWith('/');
    const inner = selfClosing ? rawTag.slice(0, -1).trim() : rawTag.trim();
    const tagMatch = inner.match(/^(\/?[\w-]+)([\s\S]*)$/);
    if (!tagMatch) throw new Error(`bad tag: ${inner.slice(0, 40)}`);
    const tagToken = tagMatch[1];
    const attrRaw = tagMatch[2] ?? '';

    if (tagToken.startsWith('/')) {
      out += `</${tagToken.slice(1)}>`;
      i = gt + 1;
      continue;
    }

    const tag = tagToken.toLowerCase();
    const attrs = convertAttrs(attrRaw, tag);
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';

    if (VOID.has(tag) || selfClosing) {
      out += `<${tag}${attrStr} />`;
      i = gt + 1;
      continue;
    }

    if (tag === 'textarea') {
      const close = html.indexOf('</textarea>', gt + 1);
      if (close < 0) throw new Error('unclosed textarea');
      const body = html.slice(gt + 1, close);
      const valueAttr = `defaultValue={${JSON.stringify(body)}}`;
      out += `<textarea${attrStr} ${valueAttr} />`;
      i = close + '</textarea>'.length;
      continue;
    }

    out += `<${tag}${attrStr}>`;
    i = gt + 1;
  }

  return out;
}

function extract(html, id) {
  const needle = `id="${id}"`;
  const startAttr = html.indexOf(needle);
  if (startAttr < 0) throw new Error(`missing ${id}`);
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
      if (depth === 0) return html.slice(open, i);
      continue;
    }
    i += 1;
  }
  throw new Error(`unclosed ${id}`);
}

const source = fs.readFileSync(htmlPath, 'utf8');
fs.mkdirSync(outDir, { recursive: true });

const names = [];
for (const [id, name] of DRAWERS) {
  const fragment = extract(source, id);
  const jsx = convertFragment(fragment);
  const needsInteractions = jsx.includes('callInteractions(');
  const imports = [`import { callApp${needsInteractions ? ', callInteractions' : ''} } from '@/shared/ui/legacy';`];
  const file = `${imports.join('\n')}\n\nexport function ${name}() {\n  return (\n${jsx}\n  );\n}\n`;
  fs.writeFileSync(path.join(outDir, `${name}.tsx`), file);
  names.push(name);
}

const index = `${names.map((name) => `import { ${name} } from './${name}';`).join('\n')}

export function LegacyDrawers() {
  return (
    <>
      ${names.map((name) => `<${name} />`).join('\n      ')}
    </>
  );
}
`;
fs.writeFileSync(path.join(outDir, 'index.tsx'), index);
console.log('wrote', names.length, 'drawers');
