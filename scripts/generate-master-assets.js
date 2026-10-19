const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

// 1. Master Symbol SVG (Full color)
const masterSymbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="emasku-title">
  <title id="emasku-title">emasKu Logo - CertiVault</title>
  <defs>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="gold-bright" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <!-- CertiCard Frame -->
  <rect x="44" y="28" width="168" height="200" rx="28" fill="#18181B" stroke="url(#gold-grad)" stroke-width="4"/>
  
  <!-- Security Micro-Grid Lines -->
  <path d="M 64 68 L 192 68 M 64 188 L 192 188" stroke="#3F3F46" stroke-width="2" stroke-dasharray="4 4"/>
  
  <!-- Embedded Minted Gold Ingot (Beveled 3D bullion) -->
  <!-- Top Face -->
  <polygon points="76,84 180,84 164,104 92,104" fill="#FEF3C7"/>
  <!-- Front Main Face -->
  <polygon points="92,104 164,104 164,164 92,164" fill="url(#gold-grad)"/>
  <!-- Right Bevel Face -->
  <polygon points="180,84 164,104 164,164 180,148" fill="#B45309"/>
  <!-- Left Bevel Face -->
  <polygon points="76,84 92,104 92,164 76,148" fill="#D97706"/>
  <!-- Bottom Bevel Face -->
  <polygon points="76,148 92,164 164,164 180,148" fill="#78350F"/>
  
  <!-- 999.9 Purity Hallmark Symbol (Symmetrical 5-point Star) -->
  <path d="M 128.0 120.0 L 131.4 129.3 L 141.3 129.7 L 133.5 135.8 L 136.2 145.3 L 128.0 139.8 L 119.8 145.3 L 122.5 135.8 L 114.7 129.7 L 124.6 129.3 Z" fill="#FFFBEB"/>
</svg>`;

// 2. Simplified Favicon Source (Bullion + Hallmark Star on 128x128)
const faviconSourceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" role="img" aria-labelledby="fav-title">
  <title id="fav-title">emasKu Ingot</title>
  <defs>
    <linearGradient id="fav-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <!-- Top Face -->
  <polygon points="14,24 114,24 98,44 30,44" fill="#FEF3C7"/>
  <!-- Front Face -->
  <polygon points="30,44 98,44 98,104 30,104" fill="url(#fav-gold)"/>
  <!-- Right Face -->
  <polygon points="114,24 98,44 98,104 114,88" fill="#B45309"/>
  <!-- Left Face -->
  <polygon points="14,24 30,44 30,104 14,88" fill="#D97706"/>
  <!-- Bottom Face -->
  <polygon points="14,88 30,104 98,104 114,88" fill="#78350F"/>
  <!-- Hallmark Star -->
  <path d="M 64.0 60.0 L 67.4 69.3 L 77.3 69.7 L 69.5 75.8 L 72.2 85.3 L 64.0 79.8 L 55.8 85.3 L 58.5 75.8 L 50.7 69.7 L 60.6 69.3 Z" fill="#FFFBEB"/>
</svg>`;

// 3. Avatar SVG (Perfect 256x256 Squircle Tile for Social & Profiles)
const avatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="avatar-title">
  <title id="avatar-title">emasKu Avatar</title>
  <defs>
    <linearGradient id="av-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="#18181B"/>
  <g transform="translate(14, 14) scale(0.89)">
    <rect x="44" y="28" width="168" height="200" rx="28" fill="#18181B" stroke="url(#av-gold)" stroke-width="4"/>
    <path d="M 64 68 L 192 68 M 64 188 L 192 188" stroke="#3F3F46" stroke-width="2" stroke-dasharray="4 4"/>
    <polygon points="76,84 180,84 164,104 92,104" fill="#FEF3C7"/>
    <polygon points="92,104 164,104 164,164 92,164" fill="url(#av-gold)"/>
    <polygon points="180,84 164,104 164,164 180,148" fill="#B45309"/>
    <polygon points="76,84 92,104 92,164 76,148" fill="#D97706"/>
    <polygon points="76,148 92,164 164,164 180,148" fill="#78350F"/>
    <path d="M 128.0 120.0 L 131.4 129.3 L 141.3 129.7 L 133.5 135.8 L 136.2 145.3 L 128.0 139.8 L 119.8 145.3 L 122.5 135.8 L 114.7 129.7 L 124.6 129.3 Z" fill="#FFFBEB"/>
  </g>
</svg>`;

// Load font for vector wordmarks
const fontBuf = fs.readFileSync('/System/Library/Fonts/Supplemental/Arial Bold.ttf');
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));

const pEmas = font.getPath('emas', 0, 78, 62);
const wEmas = pEmas.getBoundingBox().x2;
const pKu = font.getPath('Ku', wEmas + 3, 78, 62);
const wTotal = pKu.getBoundingBox().x2;

// 4. Horizontal Lockup SVG (Dark surface, tight 390x140 canvas)
const lockupDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 140" width="390" height="140" role="img" aria-labelledby="lk-dark-title">
  <title id="lk-dark-title">emasKu Logo (Dark)</title>
  <defs>
    <linearGradient id="gold-lk-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <rect width="390" height="140" rx="16" fill="#18181B"/>
  
  <!-- Symbol scaled 0.48 and placed at (18, 12) -->
  <g transform="translate(18, 12) scale(0.48)">
    <rect x="44" y="28" width="168" height="200" rx="28" fill="#18181B" stroke="url(#gold-lk-dark)" stroke-width="6"/>
    <path d="M 64 68 L 192 68 M 64 188 L 192 188" stroke="#3F3F46" stroke-width="3" stroke-dasharray="4 4"/>
    <polygon points="76,84 180,84 164,104 92,104" fill="#FEF3C7"/>
    <polygon points="92,104 164,104 164,164 92,164" fill="url(#gold-lk-dark)"/>
    <polygon points="180,84 164,104 164,164 180,148" fill="#B45309"/>
    <polygon points="76,84 92,104 92,164 76,148" fill="#D97706"/>
    <polygon points="76,148 92,164 164,164 180,148" fill="#78350F"/>
    <path d="M 128.0 120.0 L 131.4 129.3 L 141.3 129.7 L 133.5 135.8 L 136.2 145.3 L 128.0 139.8 L 119.8 145.3 L 122.5 135.8 L 114.7 129.7 L 124.6 129.3 Z" fill="#FFFBEB"/>
  </g>
  
  <!-- Text Block at x=148 -->
  <g transform="translate(148, 14)">
    <path d="${pEmas.toPathData(2)}" fill="#FFFFFF"/>
    <path d="${pKu.toPathData(2)}" fill="url(#gold-lk-dark)"/>
  </g>
</svg>`;

// 5. Horizontal Lockup SVG (Transparent / Light surface)
const lockupLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 140" width="390" height="140" role="img" aria-labelledby="lk-light-title">
  <title id="lk-light-title">emasKu Logo (Light)</title>
  <defs>
    <linearGradient id="gold-lk-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <!-- Symbol scaled 0.48 and placed at (18, 12) -->
  <g transform="translate(18, 12) scale(0.48)">
    <rect x="44" y="28" width="168" height="200" rx="28" fill="#18181B" stroke="url(#gold-lk-light)" stroke-width="6"/>
    <path d="M 64 68 L 192 68 M 64 188 L 192 188" stroke="#3F3F46" stroke-width="3" stroke-dasharray="4 4"/>
    <polygon points="76,84 180,84 164,104 92,104" fill="#FEF3C7"/>
    <polygon points="92,104 164,104 164,164 92,164" fill="url(#gold-lk-light)"/>
    <polygon points="180,84 164,104 164,164 180,148" fill="#B45309"/>
    <polygon points="76,84 92,104 92,164 76,148" fill="#D97706"/>
    <polygon points="76,148 92,164 164,164 180,148" fill="#78350F"/>
    <path d="M 128.0 120.0 L 131.4 129.3 L 141.3 129.7 L 133.5 135.8 L 136.2 145.3 L 128.0 139.8 L 119.8 145.3 L 122.5 135.8 L 114.7 129.7 L 124.6 129.3 Z" fill="#FFFBEB"/>
  </g>
  
  <!-- Text Block at x=148 -->
  <g transform="translate(148, 14)">
    <path d="${pEmas.toPathData(2)}" fill="#18181B"/>
    <path d="${pKu.toPathData(2)}" fill="url(#gold-lk-light)"/>
  </g>
</svg>`;

// 6. Stacked Lockup SVG (Centered, 280x280)
const textOffset = Math.round((280 - wTotal) / 2);
const stackedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280" role="img" aria-labelledby="st-title">
  <title id="st-title">emasKu Stacked Logo</title>
  <defs>
    <linearGradient id="gold-st" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <rect width="280" height="280" rx="20" fill="#18181B"/>
  
  <!-- Symbol centered at top (offset = (280 - 256*0.6)/2 = 63) -->
  <g transform="translate(63, 16) scale(0.6)">
    <rect x="44" y="28" width="168" height="200" rx="28" fill="#18181B" stroke="url(#gold-st)" stroke-width="6"/>
    <path d="M 64 68 L 192 68 M 64 188 L 192 188" stroke="#3F3F46" stroke-width="3" stroke-dasharray="4 4"/>
    <polygon points="76,84 180,84 164,104 92,104" fill="#FEF3C7"/>
    <polygon points="92,104 164,104 164,164 92,164" fill="url(#gold-st)"/>
    <polygon points="180,84 164,104 164,164 180,148" fill="#B45309"/>
    <polygon points="76,84 92,104 92,164 76,148" fill="#D97706"/>
    <polygon points="76,148 92,164 164,164 180,148" fill="#78350F"/>
    <path d="M 128.0 120.0 L 131.4 129.3 L 141.3 129.7 L 133.5 135.8 L 136.2 145.3 L 128.0 139.8 L 119.8 145.3 L 122.5 135.8 L 114.7 129.7 L 124.6 129.3 Z" fill="#FFFBEB"/>
  </g>
  
  <!-- Centered text block -->
  <g transform="translate(${textOffset}, 170)">
    <path d="${pEmas.toPathData(2)}" fill="#FFFFFF"/>
    <path d="${pKu.toPathData(2)}" fill="url(#gold-st)"/>
  </g>
</svg>`;

// Ensure output dirs
const logoDir = path.resolve(__dirname, '../design/logo');
fs.mkdirSync(logoDir, { recursive: true });

fs.writeFileSync(path.join(logoDir, 'emasku-symbol.svg'), masterSymbolSvg);
fs.writeFileSync(path.join(logoDir, 'emasku-favicon-source.svg'), faviconSourceSvg);
fs.writeFileSync(path.join(logoDir, 'emasku-avatar.svg'), avatarSvg);
fs.writeFileSync(path.join(logoDir, 'emasku-lockup-dark.svg'), lockupDarkSvg);
fs.writeFileSync(path.join(logoDir, 'emasku-lockup.svg'), lockupLightSvg);
fs.writeFileSync(path.join(logoDir, 'emasku-stacked.svg'), stackedSvg);

console.log('Master vector files refreshed successfully in design/logo/');
