// Script to create placeholder images and prepare images directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = ['images', 'public/images', 'dist/images'];
dirs.forEach(d => {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// SVG visual templates tailored for the 3 slides matching the user's uploaded styles
const svgSlide1 = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="bg1" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="glowGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="900" height="900" fill="url(#bg1)"/>
  <circle cx="450" cy="380" r="280" fill="#10b981" opacity="0.08"/>
  <circle cx="650" cy="280" r="180" fill="#fbbf24" opacity="0.06"/>
  
  <!-- Smartphone Graphic -->
  <g transform="translate(320, 180)" filter="url(#shadow)">
    <rect x="0" y="0" width="260" height="480" rx="36" fill="#1e293b" stroke="#334155" stroke-width="6"/>
    <rect x="12" y="14" width="236" height="452" rx="26" fill="#0f172a"/>
    <!-- Screen Header -->
    <rect x="30" y="40" width="200" height="40" rx="8" fill="#10b981" opacity="0.2"/>
    <circle cx="50" cy="60" r="12" fill="#10b981"/>
    <rect x="75" y="52" width="100" height="8" rx="4" fill="#34d399"/>
    <rect x="75" y="64" width="60" height="6" rx="3" fill="#6ee7b7" opacity="0.7"/>
    <!-- Credit Card / Balance on screen -->
    <rect x="30" y="100" width="200" height="110" rx="14" fill="url(#glow1)"/>
    <text x="50" y="135" fill="#022c22" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Crédit Disponible</text>
    <text x="50" y="170" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="900">2 500 000 F</text>
    <text x="50" y="192" fill="#d1fae5" font-family="Arial, sans-serif" font-size="11">Taux 1.2% • Validé</text>
    <!-- Progress bar -->
    <rect x="30" y="230" width="200" height="8" rx="4" fill="#334155"/>
    <rect x="30" y="230" width="160" height="8" rx="4" fill="#fbbf24"/>
    <!-- Transaction items -->
    <rect x="30" y="260" width="200" height="45" rx="10" fill="#1e293b"/>
    <circle cx="55" cy="282" r="12" fill="#3b82f6" opacity="0.3"/>
    <rect x="75" y="275" width="80" height="7" rx="3" fill="#e2e8f0"/>
    <rect x="75" y="286" width="50" height="5" rx="2" fill="#94a3b8"/>
    <rect x="30" y="320" width="200" height="45" rx="10" fill="#1e293b"/>
    <circle cx="55" cy="342" r="12" fill="#10b981" opacity="0.3"/>
    <rect x="75" y="335" width="90" height="7" rx="3" fill="#e2e8f0"/>
    <!-- Button -->
    <rect x="30" y="385" width="200" height="48" rx="14" fill="url(#glowGold)"/>
    <text x="130" y="415" fill="#78350f" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Débloquer les Fonds</text>
  </g>

  <!-- 3D Floating Elements around phone -->
  <!-- 1. Shopping Bag -->
  <g transform="translate(180, 240)" filter="url(#shadow)">
    <rect x="0" y="0" width="90" height="90" rx="22" fill="#0f172a" stroke="#10b981" stroke-width="2" opacity="0.95"/>
    <text x="45" y="55" fill="#34d399" font-family="Arial, sans-serif" font-size="34" text-anchor="middle">🛍️</text>
  </g>
  <!-- 2. Receipt Badge -->
  <g transform="translate(630, 220)" filter="url(#shadow)">
    <rect x="0" y="0" width="100" height="100" rx="22" fill="#0f172a" stroke="#38bdf8" stroke-width="2" opacity="0.95"/>
    <text x="50" y="60" fill="#38bdf8" font-family="Arial, sans-serif" font-size="38" text-anchor="middle">🧾</text>
  </g>
  <!-- 3. Percentage % Badge -->
  <g transform="translate(670, 360)" filter="url(#shadow)">
    <rect x="0" y="0" width="80" height="80" rx="20" fill="#0f172a" stroke="#fbbf24" stroke-width="2" opacity="0.95"/>
    <text x="40" y="52" fill="#fbbf24" font-family="Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle">%</text>
  </g>
  <!-- 4. Fast Approval Checkmark -->
  <g transform="translate(150, 420)" filter="url(#shadow)">
    <rect x="0" y="0" width="110" height="70" rx="18" fill="#065f46" stroke="#34d399" stroke-width="1.5"/>
    <text x="55" y="44" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">✓ Accord 100%</text>
  </g>
</svg>`;

const svgSlide2 = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
    <linearGradient id="glowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="900" height="900" fill="url(#bg2)"/>
  <circle cx="450" cy="380" r="280" fill="#38bdf8" opacity="0.08"/>

  <!-- Network Connection Lines -->
  <path d="M 240 280 L 450 340 L 660 260 M 450 340 L 450 560 M 450 340 L 220 480 M 450 340 L 680 470" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,6" opacity="0.5"/>

  <!-- Central Speed / Clock Hub -->
  <g transform="translate(360, 240)" filter="url(#shadow2)">
    <circle cx="90" cy="90" r="90" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
    <circle cx="90" cy="90" r="75" fill="url(#glowCyan)" opacity="0.2"/>
    <text x="90" y="85" fill="#38bdf8" font-family="Arial, sans-serif" font-size="42" text-anchor="middle">⚡</text>
    <text x="90" y="118" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">&lt; 48H</text>
  </g>

  <!-- Node 1: Calendar / Schedule -->
  <g transform="translate(180, 220)" filter="url(#shadow2)">
    <circle cx="45" cy="45" r="45" fill="#0f172a" stroke="#818cf8" stroke-width="2.5"/>
    <text x="45" y="55" fill="#818cf8" font-family="Arial, sans-serif" font-size="34" text-anchor="middle">📅</text>
  </g>
  <!-- Node 2: SMS & Notification -->
  <g transform="translate(620, 200)" filter="url(#shadow2)">
    <circle cx="45" cy="45" r="45" fill="#0f172a" stroke="#fbbf24" stroke-width="2.5"/>
    <text x="45" y="55" fill="#fbbf24" font-family="Arial, sans-serif" font-size="34" text-anchor="middle">🔔</text>
  </g>
  <!-- Node 3: Community & Commerce -->
  <g transform="translate(150, 440)" filter="url(#shadow2)">
    <circle cx="50" cy="50" r="50" fill="#0f172a" stroke="#34d399" stroke-width="2.5"/>
    <text x="50" y="62" fill="#34d399" font-family="Arial, sans-serif" font-size="38" text-anchor="middle">🏪</text>
  </g>
  <!-- Node 4: Global Map Network -->
  <g transform="translate(640, 430)" filter="url(#shadow2)">
    <circle cx="50" cy="50" r="50" fill="#0f172a" stroke="#c084fc" stroke-width="2.5"/>
    <text x="50" y="62" fill="#c084fc" font-family="Arial, sans-serif" font-size="38" text-anchor="middle">🌐</text>
  </g>
</svg>`;

const svgSlide3 = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="bg3" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2e1065"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="glowPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
    <filter id="shadow3" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="900" height="900" fill="url(#bg3)"/>
  <circle cx="450" cy="380" r="280" fill="#a855f7" opacity="0.08"/>

  <!-- Banknotes Fan Effect -->
  <g transform="translate(330, 200)" filter="url(#shadow3)">
    <!-- Note 1 -->
    <rect x="0" y="0" width="220" height="110" rx="10" fill="#065f46" stroke="#34d399" stroke-width="2" transform="rotate(-15 110 55)"/>
    <text x="40" y="65" fill="#34d399" font-family="Arial, sans-serif" font-size="20" font-weight="900" transform="rotate(-15 110 55)">10 000 FCFA</text>
    <!-- Note 2 -->
    <rect x="20" y="30" width="220" height="110" rx="10" fill="#14532d" stroke="#4ade80" stroke-width="2" transform="rotate(5 110 55)"/>
    <text x="60" y="95" fill="#86efac" font-family="Arial, sans-serif" font-size="20" font-weight="900" transform="rotate(5 110 55)">10 000 FCFA</text>
    <!-- Note 3 (Top) -->
    <rect x="10" y="60" width="220" height="110" rx="10" fill="#047857" stroke="#6ee7b7" stroke-width="2" transform="rotate(20 110 55)"/>
    <text x="60" y="125" fill="#ecfdf5" font-family="Arial, sans-serif" font-size="20" font-weight="900" transform="rotate(20 110 55)">10 000 FCFA</text>
  </g>

  <!-- Mobile Money Provider Floating Badges -->
  <!-- Wave -->
  <g transform="translate(160, 220)" filter="url(#shadow3)">
    <rect x="0" y="0" width="130" height="60" rx="16" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2"/>
    <text x="65" y="38" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="900" text-anchor="middle">🌊 WAVE</text>
  </g>
  <!-- Orange Money -->
  <g transform="translate(610, 220)" filter="url(#shadow3)">
    <rect x="0" y="0" width="140" height="60" rx="16" fill="#431407" stroke="#fb923c" stroke-width="2"/>
    <text x="70" y="38" fill="#fb923c" font-family="Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle">🍊 ORANGE</text>
  </g>
  <!-- Moov Money -->
  <g transform="translate(180, 420)" filter="url(#shadow3)">
    <rect x="0" y="0" width="130" height="60" rx="16" fill="#052e16" stroke="#22c55e" stroke-width="2"/>
    <text x="65" y="38" fill="#4ade80" font-family="Arial, sans-serif" font-size="17" font-weight="900" text-anchor="middle">🟢 MOOV</text>
  </g>
  <!-- Free Money / Instant Receipt -->
  <g transform="translate(590, 420)" filter="url(#shadow3)">
    <rect x="0" y="0" width="150" height="60" rx="16" fill="#581c87" stroke="#c084fc" stroke-width="2"/>
    <text x="75" y="38" fill="#f3e8ff" font-family="Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle">⚡ FREE MONEY</text>
  </g>
</svg>`;

// Write the files to images/, public/images/, and dist/images/
dirs.forEach(d => {
  fs.writeFileSync(path.join(__dirname, d, 'slide1.svg'), svgSlide1, 'utf-8');
  fs.writeFileSync(path.join(__dirname, d, 'slide2.svg'), svgSlide2, 'utf-8');
  fs.writeFileSync(path.join(__dirname, d, 'slide3.svg'), svgSlide3, 'utf-8');

  // Also write dummy placeholder .jpg so 'images/slide1.jpg' exists
  fs.writeFileSync(path.join(__dirname, d, 'slide1.jpg'), svgSlide1, 'utf-8');
  fs.writeFileSync(path.join(__dirname, d, 'slide2.jpg'), svgSlide2, 'utf-8');
  fs.writeFileSync(path.join(__dirname, d, 'slide3.jpg'), svgSlide3, 'utf-8');
});

console.log('Successfully created images directory and populated slide1, slide2, slide3 assets.');
