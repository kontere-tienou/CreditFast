import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/markup');
const outDir = path.resolve('src/features/modals');

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
const BOOL = new Set(['checked', 'defaultChecked', 'disabled', 'readOnly', 'required', 'selected', 'multiple', 'autoFocus', 'hidden']);
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
  viewbox: 'viewBox',
};
const EVENTS = {
  onclick: 'onClick',
  onchange: 'onChange',
  onsubmit: 'onSubmit',
  oninput: 'onInput',
  onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp',
  ondrop: 'onDrop',
  ondragover: 'onDragOver',
};

const MODALS = [
  ['agent/modal-inspection.html', 'InspectionModal'],
  ['analyst/modal-dossier-360.html', 'AnalystDossierModal'],
  ['client/modal-appointment.html', 'AppointmentModal'],
  ['client/modal-loan-application.html', 'LoanApplicationModal'],
  ['client/modal-payment.html', 'PaymentModal'],
  ['committee/modal-committee.html', 'CommitteeOverlays'],
  ['shared/modal-doc-lightbox.html', 'DocLightboxModal'],
  ['shared/modal-edit-profile.html', 'EditProfileModal'],
  ['shared/modal-qr-scanner.html', 'QrScannerModal'],
  ['shared/modal-settings.html', 'SettingsModal'],
  ['shared/modal-success-animation.html', 'SuccessAnimationModal'],
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

function rewriteArgs(raw) {
  return raw.replace(/\bthis\.value\b/g, 'event.currentTarget.value');
}

function parseArgs(raw) {
  const trimmed = rewriteArgs(raw.trim());
  if (!trimmed) return '';
  return `, ${trimmed}`;
}

function convertCall(stmt) {
  const s = stmt.trim().replace(/;$/, '');
  if (!s) return '';
  if (s === 'event.preventDefault()') return 'event.preventDefault()';
  if (s === 'event.stopPropagation()') return 'event.stopPropagation()';
  const clickEl = s.match(/^document\.getElementById\((['"])(.+)\1\)\.click\(\)$/);
  if (clickEl) return `document.getElementById(${JSON.stringify(clickEl[2])})?.click()`;
  const app = s.match(/^App\.(\w+)\((.*)\)$/s);
  if (app) return `callApp(${JSON.stringify(app[1])}${parseArgs(app[2])})`;
  const inter = s.match(/^AppInteractions\.(\w+)\((.*)\)$/s);
  if (inter) return `callInteractions(${JSON.stringify(inter[1])}${parseArgs(inter[2])})`;
  throw new Error(`unhandled handler stmt: ${s}`);
}

function convertHandler(code) {
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
  const body = stmts.join('; ');
  const needsEvent = /\bevent\b/.test(body) || /\bthis\b/.test(trimmed);
  if (!needsEvent && stmts.length === 1) return `() => ${stmts[0]}`;
  if (needsEvent && stmts.length === 1) return `(event) => ${stmts[0]}`;
  return needsEvent ? `(event) => { ${body}; }` : `() => { ${body}; }`;
}

function convertAttrName(name, tag) {
  if (name === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) return 'defaultValue';
  if (name === 'checked') return 'defaultChecked';
  if (name === 'selected' && tag === 'option') return 'defaultValue';
  return ATTR[name] ?? name;
}

function convertAttrs(raw, tag) {
  const attrs = [];
  const re = /([:@]?[\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = re.exec(raw))) {
    const name = match[1];
    const value = match[2] ?? match[3] ?? match[4];
    if (EVENTS[name]) {
      attrs.push(`${EVENTS[name]}={${convertHandler(value ?? '')}}`);
      continue;
    }
    if (name === 'style' && value != null) {
      attrs.push(`style=${styleObject(value)}`);
      continue;
    }
    if (name === 'selected' && tag === 'option') {
      attrs.push('selected');
      continue;
    }
    const jsName = convertAttrName(name, tag);
    if (value == null) {
      attrs.push(jsName === 'checked' ? 'defaultChecked' : jsName);
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
    if (jsName === 'defaultChecked' || jsName === 'checked') {
      attrs.push('defaultChecked');
      continue;
    }
    if ((jsName === 'rows' || jsName === 'cols' || jsName === 'tabIndex') && /^-?\d+$/.test(value)) {
      attrs.push(`${jsName}={${value}}`);
      continue;
    }
    attrs.push(`${jsName}=${JSON.stringify(value)}`);
  }
  if (tag === 'button' && !/\btype\s*=/.test(raw)) {
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
    const tagMatch = inner.match(/^(\/?[A-Za-z][\w:-]*)([\s\S]*)$/);
    if (!tagMatch) throw new Error(`bad tag: ${inner.slice(0, 80)}`);
    const tagToken = tagMatch[1];
    const attrRaw = tagMatch[2] ?? '';

    if (tagToken.startsWith('/')) {
      out += `</${tagToken.slice(1).split(':')[0] === tagToken.slice(1) ? tagToken.slice(1) : tagToken.slice(1)}>`;
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
      out += `<textarea${attrStr} defaultValue={${JSON.stringify(body)}} />`;
      i = close + '</textarea>'.length;
      continue;
    }

    out += `<${tag}${attrStr}>`;
    i = gt + 1;
  }

  return out;
}

fs.mkdirSync(outDir, { recursive: true });

const only = process.argv[2];
const list = only ? MODALS.filter(([, name]) => name === only) : MODALS;

const names = [];
for (const [file, name] of list) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const jsx = convertFragment(html).trim();
  const needsInteractions = jsx.includes('callInteractions(');
  const needsApp = jsx.includes('callApp(');
  const importBits = [];
  if (needsApp && needsInteractions) importBits.push("import { callApp, callInteractions } from '@/shared/ui/legacy';");
  else if (needsInteractions) importBits.push("import { callInteractions } from '@/shared/ui/legacy';");
  else if (needsApp) importBits.push("import { callApp } from '@/shared/ui/legacy';");
  const fileBody = `${importBits.join('\n')}${importBits.length ? '\n\n' : ''}export function ${name}() {\n  return (\n    <>\n${jsx}\n    </>\n  );\n}\n`;
  fs.writeFileSync(path.join(outDir, `${name}.tsx`), fileBody);
  names.push(name);
}

if (!only) {
  const index = `${names.map((name) => `import { ${name} } from './${name}';`).join('\n')}

export function LegacyDialogs() {
  return (
    <>
      ${names.map((name) => `<${name} />`).join('\n      ')}
    </>
  );
}
`;
  fs.writeFileSync(path.join(outDir, 'index.tsx'), index);
}

console.log('wrote', names.join(', '));
