/**
 * asset-generator.js — Procedural Vector Asset Pipeline
 * Generates vector SVG mockups, circular ecosystem diagrams, tech banners,
 * brand logos, and inline icons for the Reveal.js Company Profile builder.
 */

/**
 * Convert hex color (#RRGGBB or #RGB) to HSL object { h, s, l }
 */
function hexToHsl(hex) {
  let c = (hex || '#009BAD').replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Standard inline SVG icons dictionary (24x24 viewBox)
 */
const ICONS = {
  dollar: `<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  palette: `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6z"/>`,
  spreadsheet: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>`,
  checkmark: `<polyline points="20 6 9 17 4 12"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
  mail: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  'map-pin': `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
  whatsapp: `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M9.5 8.5c-.3 0-.7.2-.8.5-.2.4-.6 1.4-.6 1.7 0 .5.3 1.3 1 2.1.8.9 1.7 1.4 2.2 1.5.3.1 1.4-.2 1.8-.5.3-.2.5-.6.5-.8s-.2-.3-.5-.4l-1.3-.6c-.2-.1-.4-.1-.5.1l-.5.6c-.1.1-.3.2-.5.1-.4-.2-1.3-.8-1.8-1.5-.1-.2 0-.4.1-.5l.4-.5c.2-.2.2-.4.1-.6L9.8 8.6c-.1-.1-.2-.1-.3-.1z"/>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  'app-store': `<path fill="currentColor" stroke="none" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.4c.64-.78 1.08-1.86.96-2.95-1 .04-2.14.67-2.8 1.44-.58.67-1.1 1.77-.96 2.82 1.12.09 2.18-.58 2.8-1.31z"/>`,
  'google-play': `<path fill="currentColor" stroke="none" d="M3.609 1.814L13.792 12 3.61 22.186a2.03 2.03 0 0 1-.61-1.464V3.278c0-.568.22-1.09.609-1.464zm11.602 11.604l2.138 2.138-12.015 6.945 9.877-9.083zm0-2.836L5.334 1.499l12.015 6.945-2.138 2.138zm1.418 1.418l2.903-1.677c.844-.488.844-1.283 0-1.771l-2.903-1.677-2.122 2.562 2.122 2.563z"/>`,
  warning: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  sparkles: `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>`,
  cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`,
  video: `<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  'arrow-right': `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`
};

/**
 * Get inline SVG string for an icon name
 */
function getIconSvg(name, options = {}) {
  const iconKey = (name || '').toLowerCase().trim();
  const path = ICONS[iconKey] || ICONS.sparkles;
  const size = options.size || 20;
  const className = options.className ? ` class="${options.className}"` : '';
  const strokeWidth = options.strokeWidth || 2;
  const color = options.color || 'currentColor';

  // For app-store and google-play, they are filled paths
  if (iconKey === 'app-store' || iconKey === 'google-play') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"${className} aria-hidden="true">${path}</svg>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${className} aria-hidden="true">${path}</svg>`;
}

/**
 * Generate Smartphone UI Mockup HTML Component
 * Uses classes styled in custom.css (.phone-frame, .dynamic-island, .phone-screen, etc.)
 */
function generateSmartphoneMockupHtml(options = {}) {
  const brandName = options.brandName || 'Venturo Pro';
  const primaryColor = options.primaryColor || '#009BAD';

  return `
<div class="phone-frame">
  <div class="dynamic-island">
    <div class="camera-lens"></div>
    <div class="sensor-indicator"></div>
  </div>
  <div class="phone-screen">
    <div class="phone-status-bar">
      <span>09:41</span>
      <span>5G &bull; 100%</span>
    </div>
    <div class="phone-header">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${primaryColor};"></span>
        <span class="app-title">${brandName} Studio</span>
      </div>
      <span style="font-size:10px; padding:2px 6px; border-radius:99px; background:rgba(0,155,173,0.18); color:${primaryColor}; font-weight:700;">PRO</span>
    </div>

    <!-- KPI / Status Card -->
    <div class="phone-kpi-card">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
        <span>Pipeline Status</span>
        <span style="color:#10b981; font-weight:600;">● GPU Ready</span>
      </div>
      <div class="phone-kpi-val">0 Biaya / Render</div>
      <div style="font-size:10px; color:#cbd5e1;">Brand DNA: "Modern Warm" active</div>
    </div>

    <!-- Video Preview Card -->
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:8px;">
      <div style="height:110px; border-radius:8px; background:linear-gradient(135deg, #004d57 0%, #009BAD 100%); display:flex; flex-direction:column; justify-content:space-between; padding:8px; position:relative; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:9px; font-weight:700; background:rgba(0,0,0,0.6); padding:2px 6px; border-radius:4px; color:#fff;">9:16 Shorts</span>
          <span style="font-size:9px; background:rgba(0,0,0,0.6); padding:2px 6px; border-radius:4px; color:#fff;">00:45</span>
        </div>
        <div style="align-self:center; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.25); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        </div>
        <div style="font-size:10px; font-weight:600; color:#ffffff; text-shadow:0 1px 3px rgba(0,0,0,0.8);">
          Preview: Reels_Ep12_Final.mp4
        </div>
      </div>
      <!-- Progress Bar -->
      <div>
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:4px;">
          <span>Stitching Subtitle & Audio</span>
          <span style="color:${primaryColor}; font-weight:700;">100% Selesai</span>
        </div>
        <div style="height:4px; width:100%; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
          <div style="height:100%; width:100%; background:linear-gradient(90deg, ${primaryColor}, #38bdf8);"></div>
        </div>
      </div>
    </div>

    <!-- Pipeline Steps List -->
    <div class="phone-item-list">
      <div class="phone-list-item">
        <div style="width:20px; height:20px; border-radius:50%; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; color:#10b981;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span style="flex:1; font-weight:500;">Google Sheets Sync</span>
        <span style="font-size:10px; color:#94a3b8;">1 klik</span>
      </div>
      <div class="phone-list-item">
        <div style="width:20px; height:20px; border-radius:50%; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; color:#10b981;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span style="flex:1; font-weight:500;">Brand DNA Form</span>
        <span style="font-size:10px; color:#94a3b8;">Locked</span>
      </div>
    </div>

    <!-- Quick Action Button -->
    <div style="margin-top:auto; padding-top:8px;">
      <div style="background:linear-gradient(135deg, ${primaryColor}, #00b4c8); color:#ffffff; font-weight:700; font-size:12px; text-align:center; padding:10px; border-radius:10px; box-shadow:0 4px 12px rgba(0,155,173,0.35);">
        + Generate Batch Baru
      </div>
    </div>

    <div class="phone-home-indicator"></div>
  </div>
</div>`;
}

/**
 * Generate Smartphone UI Mockup standalone SVG
 */
function generateSmartphoneMockupSvg(options = {}) {
  const brandName = options.brandName || 'Venturo Pro';
  const primaryColor = options.primaryColor || '#009BAD';
  const secondaryColor = options.secondaryColor || '#006D79';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 640" width="320" height="640" fill="none">
  <defs>
    <filter id="phoneShadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000000" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="${primaryColor}" flood-opacity="0.2"/>
    </filter>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="320" y2="640" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#050811"/>
    </linearGradient>
    <linearGradient id="screenThumb" x1="0" y1="0" x2="280" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="100%" stop-color="${primaryColor}"/>
    </linearGradient>
    <linearGradient id="brandBtn" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#00c8db"/>
    </linearGradient>
  </defs>

  <!-- Phone Titanium Frame -->
  <rect x="10" y="10" width="300" height="620" rx="44" fill="url(#bodyGrad)" stroke="#334155" stroke-width="4" filter="url(#phoneShadow)"/>
  <rect x="12" y="12" width="296" height="616" rx="42" fill="none" stroke="#475569" stroke-width="1"/>

  <!-- Screen Safe Area -->
  <g clip-path="url(#screenClip)">
    <clipPath id="screenClip">
      <rect x="18" y="18" width="284" height="604" rx="36"/>
    </clipPath>
    <rect x="18" y="18" width="284" height="604" fill="url(#screenGrad)"/>

    <!-- Status Bar -->
    <text x="36" y="44" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600">09:41</text>
    <text x="284" y="44" text-anchor="end" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600">5G  100%</text>

    <!-- Header -->
    <circle cx="38" cy="74" r="5" fill="${primaryColor}"/>
    <text x="50" y="78" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800">${brandName}</text>
    <rect x="236" y="66" width="46" height="18" rx="9" fill="${primaryColor}" fill-opacity="0.2" stroke="${primaryColor}" stroke-opacity="0.4"/>
    <text x="259" y="79" text-anchor="middle" fill="${primaryColor}" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700">PRO</text>

    <!-- KPI Card -->
    <rect x="30" y="96" width="260" height="74" rx="14" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.08"/>
    <text x="44" y="116" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="11">Pipeline Status</text>
    <circle cx="250" cy="113" r="3.5" fill="#10b981"/>
    <text x="260" y="117" fill="#10b981" font-family="'Inter', sans-serif" font-size="11" font-weight="600">GPU Aktif</text>
    <text x="44" y="145" fill="${primaryColor}" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">0 Biaya / Render</text>
    <text x="44" y="160" fill="#cbd5e1" font-family="'Inter', sans-serif" font-size="10">Brand DNA: Modern Warm Konsisten</text>

    <!-- Video Preview Card -->
    <rect x="30" y="182" width="260" height="210" rx="14" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08"/>
    <rect x="40" y="192" width="240" height="120" rx="10" fill="url(#screenThumb)"/>
    <rect x="48" y="200" width="60" height="18" rx="4" fill="#000000" fill-opacity="0.6"/>
    <text x="78" y="213" text-anchor="middle" fill="#ffffff" font-family="'Inter', sans-serif" font-size="9" font-weight="700">9:16 Shorts</text>
    <rect x="234" y="200" width="40" height="18" rx="4" fill="#000000" fill-opacity="0.6"/>
    <text x="254" y="213" text-anchor="middle" fill="#ffffff" font-family="'Inter', sans-serif" font-size="9" font-weight="600">00:45</text>

    <!-- Play Button -->
    <circle cx="160" cy="252" r="20" fill="#ffffff" fill-opacity="0.25"/>
    <polygon points="155,242 170,252 155,262" fill="#ffffff"/>

    <text x="48" y="302" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700">Reels_Batch_04_Rendered.mp4</text>

    <!-- Progress Bar -->
    <text x="42" y="334" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="10">Stitching Subtitle & Audio</text>
    <text x="278" y="334" text-anchor="end" fill="${primaryColor}" font-family="'Inter', sans-serif" font-size="10" font-weight="700">100%</text>
    <rect x="42" y="342" width="236" height="4" rx="2" fill="#334155"/>
    <rect x="42" y="342" width="236" height="4" rx="2" fill="${primaryColor}"/>

    <text x="42" y="368" fill="#cbd5e1" font-family="'Inter', sans-serif" font-size="11">Resolusi: 1080x1920 (60 FPS)</text>
    <text x="42" y="382" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="10">Penyimpanan: Komputer Lokal</text>

    <!-- List Items -->
    <g transform="translate(30, 404)">
      <rect width="260" height="40" rx="8" fill="#ffffff" fill-opacity="0.03"/>
      <circle cx="20" cy="20" r="10" fill="#10b981" fill-opacity="0.15"/>
      <polyline points="16,20 19,23 24,17" fill="none" stroke="#10b981" stroke-width="2"/>
      <text x="38" y="24" fill="#f8fafc" font-family="'Inter', sans-serif" font-size="12" font-weight="600">Google Sheets Sync</text>
      <text x="246" y="24" text-anchor="end" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="10">1 Klik</text>
    </g>

    <g transform="translate(30, 452)">
      <rect width="260" height="40" rx="8" fill="#ffffff" fill-opacity="0.03"/>
      <circle cx="20" cy="20" r="10" fill="#10b981" fill-opacity="0.15"/>
      <polyline points="16,20 19,23 24,17" fill="none" stroke="#10b981" stroke-width="2"/>
      <text x="38" y="24" fill="#f8fafc" font-family="'Inter', sans-serif" font-size="12" font-weight="600">Brand DNA Engine</text>
      <text x="246" y="24" text-anchor="end" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="10">Terkunci</text>
    </g>

    <!-- Action Button -->
    <rect x="30" y="510" width="260" height="46" rx="12" fill="url(#brandBtn)" filter="url(#phoneShadow)"/>
    <text x="160" y="538" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700">+ Generate Batch Baru</text>

    <!-- Home Indicator -->
    <rect x="105" y="606" width="110" height="4" rx="2" fill="#94a3b8" fill-opacity="0.7"/>
  </g>

  <!-- Dynamic Island -->
  <rect x="112" y="24" width="96" height="24" rx="12" fill="#000000"/>
  <circle cx="130" cy="36" r="4.5" fill="#111827" stroke="#1f2937" stroke-width="1"/>
  <circle cx="188" cy="36" r="3" fill="#059669"/>
</svg>`;
}

/**
 * Generate Circular Ecosystem Diagram SVG
 * Visualizes central brand platform surrounded by satellite feature nodes
 */
function generateEcosystemDiagramSvg(options = {}) {
  const brandName = options.brandName || 'Venturo Pro';
  const primaryColor = options.primaryColor || '#009BAD';
  const secondaryColor = options.secondaryColor || '#006D79';

  const defaultNodes = [
    { title: 'Pipeline GPU Lokal', desc: 'Zero API Cost Render', icon: 'cpu' },
    { title: 'Brand DNA Engine', desc: 'Identitas Menempel Otomatis', icon: 'palette' },
    { title: 'Google Sheets Sync', desc: '1-Klik Tarik Konten & Brief', icon: 'spreadsheet' },
    { title: 'AI Copilot Sidecar', desc: 'Asisten Kontekstual', icon: 'sparkles' },
    { title: 'Audio & Auto Subtitle', desc: 'Voiceover & Dynamic Caption', icon: 'video' },
    { title: 'Multi-AI Gateway', desc: 'Director + Cloud T2I', icon: 'layers' }
  ];

  const nodes = (options.nodes && options.nodes.length >= 4) ? options.nodes : defaultNodes;
  const cx = 480;
  const cy = 260;
  const orbitRadius = 180;
  const numNodes = nodes.length;

  // Calculate satellite node coordinates
  const satellites = nodes.map((node, i) => {
    // Start from top (-90 deg) and distribute evenly
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numNodes;
    const x = Math.round(cx + orbitRadius * Math.cos(angle));
    const y = Math.round(cy + orbitRadius * Math.sin(angle));
    return { ...node, x, y, angle };
  });

  const linesSvg = satellites.map(s => `
    <line x1="${cx}" y1="${cy}" x2="${s.x}" y2="${s.y}" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="${s.x}" cy="${s.y}" r="4" fill="${primaryColor}" />
  `).join('');

  const nodesSvg = satellites.map(s => {
    const cardW = 190;
    const cardH = 58;
    const rectX = s.x - cardW / 2;
    const rectY = s.y - cardH / 2;
    const iconSvgContent = ICONS[s.icon] || ICONS.sparkles;

    return `
    <g transform="translate(${rectX}, ${rectY})" class="satellite-node-group">
      <!-- Glow & card backdrop -->
      <rect width="${cardW}" height="${cardH}" rx="10" fill="#0f172a" fill-opacity="0.92" stroke="${primaryColor}" stroke-opacity="0.35" stroke-width="1.5" filter="url(#nodeShadow)"/>
      
      <!-- Icon Container -->
      <g transform="translate(12, 14)">
        <rect width="30" height="30" rx="6" fill="${primaryColor}" fill-opacity="0.15" stroke="${primaryColor}" stroke-opacity="0.3"/>
        <g transform="translate(5, 5)" stroke="${primaryColor}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvgContent}
        </g>
      </g>

      <!-- Text -->
      <text x="50" y="24" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700">${s.title}</text>
      <text x="50" y="42" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="10">${s.desc}</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 520" width="960" height="520" fill="none">
  <defs>
    <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="100%" stop-color="${primaryColor}"/>
    </linearGradient>
    <radialGradient id="orbitGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Orbit Rings -->
  <circle cx="${cx}" cy="${cy}" r="${orbitRadius + 45}" stroke="#334155" stroke-opacity="0.2" stroke-width="1"/>
  <circle cx="${cx}" cy="${cy}" r="${orbitRadius}" fill="url(#orbitGlow)" stroke="${primaryColor}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="6 6"/>
  <circle cx="${cx}" cy="${cy}" r="${orbitRadius - 55}" stroke="#334155" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Connecting Lines -->
  ${linesSvg}

  <!-- Center Hub Platform -->
  <g class="center-hub-group">
    <!-- Ambient Pulse Glow -->
    <circle cx="${cx}" cy="${cy}" r="92" fill="${primaryColor}" fill-opacity="0.2" filter="url(#hubGlow)"/>
    <circle cx="${cx}" cy="${cy}" r="78" fill="url(#hubGrad)" stroke="#ffffff" stroke-opacity="0.3" stroke-width="3" filter="url(#nodeShadow)"/>
    
    <!-- Central Icon/Symbol -->
    <g transform="translate(${cx - 16}, ${cy - 48})" stroke="#ffffff" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </g>

    <!-- Hub Titles -->
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" letter-spacing="-0.02em">${brandName}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="#ffffff" fill-opacity="0.9" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600">Ecosystem Hub</text>
    <rect x="${cx - 44}" y="${cy + 26}" width="88" height="18" rx="9" fill="#000000" fill-opacity="0.35"/>
    <text x="${cx}" y="${cy + 38}" text-anchor="middle" fill="#5eead4" font-family="'Inter', sans-serif" font-size="9" font-weight="700">100% TERINTEGRASI</text>
  </g>

  <!-- Satellite Feature Nodes -->
  ${nodesSvg}
</svg>`;
}

/**
 * Generate Tech Accent Visual SVG for Hero Slide
 * Creates a modern geometric tech composition with preview frames and brand gradient
 */
function generateTechBannerSvg(options = {}) {
  const brandName = options.brandName || 'Venturo Pro';
  const primaryColor = options.primaryColor || '#009BAD';
  const secondaryColor = options.secondaryColor || '#006D79';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" fill="none">
  <defs>
    <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="${primaryColor}" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bgMesh" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="40%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#00353c"/>
    </linearGradient>
    <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="glowTeal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>

  <!-- Canvas Background -->
  <rect width="800" height="600" rx="24" fill="url(#bgMesh)" stroke="#1e293b" stroke-width="2"/>

  <!-- Ambient Glow Blobs -->
  <circle cx="580" cy="200" r="220" fill="${primaryColor}" fill-opacity="0.18" filter="blur(60px)"/>
  <circle cx="200" cy="420" r="180" fill="${secondaryColor}" fill-opacity="0.22" filter="blur(50px)"/>

  <!-- Subtle Tech Grid -->
  <g stroke="#334155" stroke-opacity="0.15" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="600"/>
    <line x1="250" y1="0" x2="250" y2="600"/>
    <line x1="400" y1="0" x2="400" y2="600"/>
    <line x1="550" y1="0" x2="550" y2="600"/>
    <line x1="700" y1="0" x2="700" y2="600"/>
    <line x1="0" y1="150" x2="800" y2="150"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="0" y1="450" x2="800" y2="450"/>
  </g>

  <!-- Main Showcase Floating Dashboard Card -->
  <g transform="translate(140, 80)" filter="url(#heroShadow)">
    <rect width="520" height="340" rx="20" fill="url(#cardGrad1)" stroke="#334155" stroke-width="1.5"/>
    
    <!-- Window Bar -->
    <rect width="520" height="42" rx="20" fill="#1e293b" fill-opacity="0.8"/>
    <circle cx="24" cy="21" r="5" fill="#ef4444"/>
    <circle cx="40" cy="21" r="5" fill="#f59e0b"/>
    <circle cx="56" cy="21" r="5" fill="#10b981"/>
    <text x="260" y="26" text-anchor="middle" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600">${brandName} &bull; Workspace</text>

    <!-- Content: Video Generation Pipeline -->
    <g transform="translate(30, 64)">
      <!-- Left Column: Settings -->
      <rect width="180" height="230" rx="12" fill="#090d16" fill-opacity="0.6" stroke="#1e293b"/>
      <text x="16" y="28" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700">Brand DNA Profile</text>
      
      <rect x="16" y="44" width="148" height="32" rx="6" fill="${primaryColor}" fill-opacity="0.15" stroke="${primaryColor}" stroke-opacity="0.3"/>
      <circle cx="32" cy="60" r="6" fill="${primaryColor}"/>
      <text x="46" y="64" fill="#f8fafc" font-family="'Inter', sans-serif" font-size="11" font-weight="600">Primary: Teal</text>

      <rect x="16" y="86" width="148" height="32" rx="6" fill="#ffffff" fill-opacity="0.04" stroke="#334155"/>
      <text x="28" y="106" fill="#cbd5e1" font-family="'Inter', sans-serif" font-size="11">Font: Plus Jakarta</text>

      <rect x="16" y="128" width="148" height="32" rx="6" fill="#ffffff" fill-opacity="0.04" stroke="#334155"/>
      <text x="28" y="148" fill="#cbd5e1" font-family="'Inter', sans-serif" font-size="11">Tone: Edukatif & Warm</text>

      <rect x="16" y="174" width="148" height="38" rx="8" fill="url(#glowTeal)"/>
      <text x="90" y="198" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700">Sync Google Sheets</text>

      <!-- Right Column: Video Output Stream -->
      <g transform="translate(200, 0)">
        <rect width="260" height="150" rx="12" fill="#000000" stroke="#1e293b"/>
        <!-- Fake Video Preview -->
        <rect x="10" y="10" width="240" height="130" rx="8" fill="url(#glowTeal)" fill-opacity="0.2"/>
        <circle cx="130" cy="75" r="24" fill="#ffffff" fill-opacity="0.3"/>
        <polygon points="124,65 140,75 124,85" fill="#ffffff"/>
        <text x="20" y="32" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700">Output: Reels_Episode_01.mp4</text>
        <rect x="190" y="20" width="50" height="18" rx="4" fill="#10b981"/>
        <text x="215" y="33" text-anchor="middle" fill="#ffffff" font-family="'Inter', sans-serif" font-size="9" font-weight="700">1080p 60F</text>
      </g>

      <!-- Bottom Status in Window -->
      <g transform="translate(200, 166)">
        <rect width="260" height="64" rx="10" fill="#090d16" fill-opacity="0.6" stroke="#1e293b"/>
        <text x="16" y="24" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="10">Biaya Marginal</text>
        <text x="16" y="48" fill="#10b981" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">Rp0 / Tambahan Render</text>
      </g>
    </g>
  </g>

  <!-- Floating Badge Left: Local GPU -->
  <g transform="translate(60, 380)" filter="url(#heroShadow)">
    <rect width="210" height="74" rx="14" fill="#0f172a" stroke="${primaryColor}" stroke-width="1.5"/>
    <circle cx="34" cy="37" r="18" fill="${primaryColor}" fill-opacity="0.2"/>
    <g transform="translate(24, 27)" stroke="${primaryColor}" fill="none" stroke-width="2">
      <rect x="2" y="2" width="16" height="16" rx="2"/>
      <path d="M9 1v2m6-2v2M9 17v2m6-2v2"/>
    </g>
    <text x="64" y="32" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700">GPU Lokal First</text>
    <text x="64" y="50" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="11">Bebas Limit Kuota API</text>
  </g>

  <!-- Floating Badge Right: Sheets Native -->
  <g transform="translate(540, 420)" filter="url(#heroShadow)">
    <rect width="200" height="74" rx="14" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
    <circle cx="34" cy="37" r="18" fill="#10b981" fill-opacity="0.2"/>
    <g transform="translate(24, 27)" stroke="#10b981" fill="none" stroke-width="2">
      <rect x="2" y="2" width="16" height="16" rx="2"/>
      <path d="M2 8h16M2 12h16M8 2v16"/>
    </g>
    <text x="64" y="32" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700">Sheets-Native</text>
    <text x="64" y="50" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="11">Tarik Brief 1-Klik</text>
  </g>
</svg>`;
}

/**
 * Generate Closing Call-to-Action Banner SVG
 */
function generateClosingBannerSvg(options = {}) {
  const brandName = options.brandName || 'Venturo Pro';
  const primaryColor = options.primaryColor || '#009BAD';
  const secondaryColor = options.secondaryColor || '#006D79';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400" fill="none">
  <defs>
    <linearGradient id="closingBg" x1="0" y1="0" x2="1200" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#00353c"/>
    </linearGradient>
    <radialGradient id="ctaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="400" rx="24" fill="url(#closingBg)" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="1.5"/>
  <circle cx="600" cy="200" r="300" fill="url(#ctaGlow)"/>

  <!-- Wave Accent -->
  <path d="M0 320 C300 240, 600 380, 1200 280 L1200 400 L0 400 Z" fill="${secondaryColor}" fill-opacity="0.15"/>
</svg>`;
}

/**
 * Generate Vector Logo SVG
 */
function generateLogoSvg(brandName = 'Venturo Pro', primaryColor = '#009BAD') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60" fill="none">
  <defs>
    <linearGradient id="logoEmblem" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <!-- Emblem Mark (V + Play Aperture) -->
  <rect x="6" y="6" width="48" height="48" rx="14" fill="url(#logoEmblem)"/>
  <path d="M20 18L30 36L40 18" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="30" cy="24" r="3" fill="#ffffff"/>

  <!-- Wordmark -->
  <text x="68" y="34" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" letter-spacing="-0.02em">${brandName.split(' ')[0] || 'Venturo'}</text>
  <text x="68" y="48" fill="${primaryColor}" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" letter-spacing="0.12em">${brandName.split(' ').slice(1).join(' ') || 'PRO'}</text>
</svg>`;
}

module.exports = {
  hexToHsl,
  getIconSvg,
  generateSmartphoneMockupHtml,
  generateSmartphoneMockupSvg,
  generateEcosystemDiagramSvg,
  generateTechBannerSvg,
  generateClosingBannerSvg,
  generateLogoSvg
};
