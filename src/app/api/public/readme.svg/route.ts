import LZString from "lz-string";
import { getTheme, type Theme } from "@/lib/themes";
import { parseFields } from "@/lib/fields";

const ASCII = `
⠀


⠀⠀⠀⠀⠀⠀⠀⣀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⣾⠟⠓⣯⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⣾⠞⠳⣷⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣏⣿⠀⠀⠿⣾⠶⠾⠶⠶⠶⠶⠭⢶⣶⣿⣇⠀⢀⣿⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⣮⡏⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠈⢿⣕⢄⠀⠀⠀
⠀⠀⣠⣾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣕⠄⠀⠀
⠀⣴⣿⠋⠀⠀⠀⠀⠀⠀⠀⢀⣤⣄⠀⠀⠀⠀⠀⠀⢀⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣾⡄⠀
⢸⣿⠃⠀⠀⠀⠀⠀⠀⠀⢀⡴⠶⣤⡀⠀⠀⠀⠀⠀⠀⣠⠤⣄⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⡀
⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⢺⣷⠴⢿⡇⠀⠀⠀⠀⠀⢸⣧⠤⢿⡆⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇
⢐⣿⡇⠀⠀⠀⠀⣰⣆⡇⣥⣢⡙⠒⠋⠀⠀⠀⣀⠀⠀⠈⠛⠒⢛⣄⣆⣒⢠⡀⠀⠀⠀⣿⡁
⠀⣿⡇⠀⠀⠀⠀⠏⢸⠑⣏⠟⠀⠀⠀⠀⢦⣤⠿⣄⡴⠀⠀⠀⠸⠣⠏⠟⡼⠇⠀⠀⢠⣿⡇
⠀⠹⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠶⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡟⠀
⠀⠀⠙⡿⣆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⿿⠋⠀⠀
⠀⠀⠀⠀⠉⣿⡶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀☘⢫⣿⠁⠀⠀⠀
⠀⠀⠀⠀⠀⣽⡇⢰⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡇⢘⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢻⢧⣼⡃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣧⣸⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡿⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠸⣿⠃⢸⣶⣦⣤⣤⣄⣠⣀⣠⣀⣤⣤⣤⣶⠄⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⡿⣆⣼⡞⠈⠈⠉⠉⠙⠒⠓⠉⠉⠉⣽⣷⣠⣿⠃⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠓⠁⠀⠀⠀⠀⠀⠀`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value: string, maxChars: number): string[] {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of normalized.split(" ")) {
    if (word.length > maxChars) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

async function fetchStats(username: string) {
  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { "User-Agent": "RiceMe" },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: { "User-Agent": "RiceMe" },
      }),
    ]);
    const u = await uRes.json();
    const repos = await rRes.json();
    const stars = Array.isArray(repos)
      ? repos.reduce(
        (a: number, r: { stargazers_count?: number }) =>
          a + (r.stargazers_count ?? 0),
        0,
      )
      : 0;
    return {
      repos: u?.public_repos ?? 0,
      followers: u?.followers ?? 0,
      following: u?.following ?? 0,
      stars,
    };
  } catch {
    return { repos: 0, followers: 0, following: 0, stars: 0 };
  }
}

// ── Typewriter animation config ──────────────────────────────────
const TW_P1 = "i have something very important to say";
const TW_P2 = "tung tung tung sahur";
const TW_CYCLE_MS = 9500;
const TW_PHASE: Array<{ dur: number; label: string }> = [
  { dur: 2400, label: "type p1" },
  { dur: 1500, label: "hold p1" },
  { dur: 600, label: "delete p1" },
  { dur: 500, label: "hold empty" },
  { dur: 2700, label: "type p2" },
  { dur: 3000, label: "hold p2" },
];

const PHASE_OFFSETS: number[] = [];
let acc = 0;
for (const p of TW_PHASE) {
  PHASE_OFFSETS.push(acc);
  acc += p.dur;
}
const TOTAL = acc;

function pct(ms: number): number {
  return (ms / TOTAL) * 100;
}

function genTwCSS(): string {
  const p1In = PHASE_OFFSETS[0];
  const p1InEnd = PHASE_OFFSETS[1];
  const p1Hold = PHASE_OFFSETS[2];
  const p1Out = PHASE_OFFSETS[3];
  const p1OutEnd = PHASE_OFFSETS[4];
  const chars1 = TW_P1.length;

  const p1Stops: string[] = [];
  for (let i = 0; i <= chars1; i++) {
    const t = pct(p1In + (i / chars1) * (p1InEnd - p1In));
    const right = ((chars1 - i) / chars1) * 100;
    p1Stops.push(
      `    ${t.toFixed(2)}%{clip-path:inset(0 ${right.toFixed(1)}% 0 0)}`,
    );
  }
  p1Stops.push(`    ${pct(p1Hold).toFixed(2)}%{clip-path:inset(0 0% 0 0)}`);
  for (let i = 1; i <= chars1; i++) {
    const t = pct(p1Hold + (i / chars1) * (p1Out - p1Hold));
    const right = (i / chars1) * 100;
    p1Stops.push(
      `    ${t.toFixed(2)}%{clip-path:inset(0 ${right.toFixed(1)}% 0 0)}`,
    );
  }
  p1Stops.push(`    ${pct(p1OutEnd).toFixed(2)}%{clip-path:inset(0 100% 0 0)}`);
  p1Stops.push(`    100%{clip-path:inset(0 100% 0 0)}`);

  const p2In = PHASE_OFFSETS[4];
  const p2InEnd = PHASE_OFFSETS[5];
  const p2Hold = PHASE_OFFSETS[6];
  const chars2 = TW_P2.length;

  const p2Stops: string[] = [];
  p2Stops.push(`    0%{clip-path:inset(0 100% 0 0)}`);
  p2Stops.push(`    ${pct(p2In).toFixed(2)}%{clip-path:inset(0 100% 0 0)}`);
  for (let i = 1; i <= chars2; i++) {
    const t = pct(p2In + (i / chars2) * (p2InEnd - p2In));
    const right = ((chars2 - i) / chars2) * 100;
    p2Stops.push(
      `    ${t.toFixed(2)}%{clip-path:inset(0 ${right.toFixed(1)}% 0 0)}`,
    );
  }
  p2Stops.push(`    ${pct(p2Hold).toFixed(2)}%{clip-path:inset(0 0% 0 0)}`);
  p2Stops.push(`    100%{clip-path:inset(0 0% 0 0)}`);

  const cemptyStops: string[] = [];
  cemptyStops.push(`    0%{opacity:0}`);
  cemptyStops.push(`    ${pct(p1Out).toFixed(2)}%{opacity:0}`);
  cemptyStops.push(`    ${(pct(p1Out) + 0.05).toFixed(2)}%{opacity:1}`);
  cemptyStops.push(`    ${pct(p2In).toFixed(2)}%{opacity:1}`);
  cemptyStops.push(`    ${(pct(p2In) + 0.05).toFixed(2)}%{opacity:0}`);
  cemptyStops.push(`    100%{opacity:0}`);

  return `
      @keyframes tw-p1{${p1Stops.join("")}}
      @keyframes tw-p2{${p2Stops.join("")}}
      @keyframes tw-cempty{${cemptyStops.join("")}}
      .tw-p1{animation:tw-p1 ${TW_CYCLE_MS}ms step-end infinite}
      .tw-p2{animation:tw-p2 ${TW_CYCLE_MS}ms step-end infinite}
      .tw-cempty{animation:tw-cempty ${TW_CYCLE_MS}ms step-end infinite}
      .tw-box{clip-path:inset(0 100% 0 0)}`;
}

function buildInfo(params: URLSearchParams, theme: Theme) {
  return parseFields(params, theme.palette).filter(
    (row) => row.visible && row.value.trim().length > 0,
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get("username");
  const username =
    rawUsername === null ? "Solenad" : rawUsername || "your-username";
  const showAscii = searchParams.get("ascii") !== "0";
  const showCrt = searchParams.get("crt") !== "0";
  const rawAscii = searchParams.get("ascii_art");
  const compressedAscii = searchParams.get("aa");
  const customAscii = compressedAscii
    ? (LZString.decompressFromEncodedURIComponent(compressedAscii) ?? rawAscii)
    : rawAscii;
  const themeName = searchParams.get("theme") || "";
  const theme = getTheme(themeName);
  const info = buildInfo(searchParams, theme);
  const stats = await fetchStats(username);

  const W = 900;

  const asciiX = 30;
  const asciiY = 50;
  const asciiSize = 11;
  const asciiLineH = 12;
  const asciiLines = showAscii
    ? customAscii
      ? customAscii.replace(/\\n/g, "\n").replace(/\r/g, "").split("\n")
      : ASCII.split("\n")
    : [];

  const monoCharW = asciiSize * 0.65;
  const maxLineLen = Math.max(...asciiLines.map((l) => l.length), 0);
  const asciiWidthPx = maxLineLen * monoCharW;
  const infoX = showAscii ? asciiX + asciiWidthPx + 40 : 30;
  const sepEndX = W - 30;
  const headerY = 70;
  const rowStartY = 120;
  const rowH = 26;
  const rowGap = 8;
  const labelFontSize = 13;
  const labelCharW = labelFontSize * 0.62;
  const maxLabelLen = Math.max(...info.map((r) => r.label.length), 0);
  const keyColW = Math.max(110, Math.ceil(maxLabelLen * labelCharW) + 12);
  const valueFontSize = 13;
  const valueLineH = 17;
  const valueCharW = valueFontSize * 0.62;
  const maxValueWidth = Math.max(120, sepEndX - (infoX + keyColW));
  const maxValueChars = Math.max(12, Math.floor(maxValueWidth / valueCharW));

  const renderedInfo = info.map((row) => ({
    ...row,
    valueLines: wrapText(row.value, maxValueChars),
  }));

  let nextInfoY = rowStartY;
  const infoRows = renderedInfo
    .map((row) => {
      const y = nextInfoY;
      const rowHeight = Math.max(rowH, row.valueLines.length * valueLineH);
      nextInfoY += rowHeight + rowGap;

      return `<g>
    <text x="${infoX}" y="${y}" font-size="${labelFontSize}" font-weight="700" fill="${row.color}">${esc(row.label)}</text>
    <text x="${infoX + keyColW}" y="${y}" font-size="${valueFontSize}" fill="${theme.fg}">
      ${row.valueLines
        .map(
          (line, i) =>
            `<tspan x="${infoX + keyColW}" dy="${i === 0 ? 0 : valueLineH}">${esc(line)}</tspan>`,
        )
        .join("\n      ")}
    </text>
  </g>`;
    })
    .join("\n  ");

  const paletteY = nextInfoY + 6;

  const cardW = 195;
  const cardH = 90;
  const cardGap = 20;
  const cardStartX = 30;
  const statsY = Math.max(540, paletteY + 92);
  const H = Math.max(760, statsY + cardH + 80);

  const p = theme.palette;
  const statCards = [
    { label: "public repos", value: stats.repos, color: p[3] },
    { label: "followers", value: stats.followers, color: p[4] },
    { label: "following", value: stats.following, color: p[7] },
    { label: "total stars", value: stats.stars, color: p[2] },
  ];

  const asciiSection = showAscii
    ? `
  <g transform="translate(${asciiX}, ${asciiY})" fill="${theme.ascii}">
    <g filter="url(#glow)" opacity="0.55">
      ${asciiLines
      .map(
        (line, i) =>
          `<text x="0" y="${i * asciiLineH}" font-size="${asciiSize}" xml:space="preserve">${esc(line)}</text>`,
      )
      .join("\n      ")}
    </g>
    ${asciiLines
      .map(
        (line, i) =>
          `<text x="0" y="${i * asciiLineH}" font-size="${asciiSize}" xml:space="preserve">${esc(line)}</text>`,
      )
      .join("\n    ")}
  </g>`
    : "";

  const crtOverlay = showCrt
    ? `
  <g class="crt-scan">
    <rect class="crt-layer" width="${W}" height="${H}" fill="url(#scanlines)" opacity="0.25" pointer-events="none"/>
  </g>
  <rect class="crt-beam" width="${W}" height="20" fill="url(#crt-beam)"/>
  <rect class="crt-layer" width="${W}" height="${H}" fill="url(#vignette)" pointer-events="none"/>
  `
    : "";

  const crtCss = showCrt
    ? `
      .crt-layer { pointer-events: none; }
      @keyframes scan-scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-4px); } }
      .crt-scan { animation: scan-scroll 1.2s linear infinite; transform-origin: 0 0; mix-blend-mode: overlay; }
      @keyframes beam-sweep {
        0%   { transform: translateY(-40px); }
        20%  { transform: translateY(-40px); }
        85%  { transform: translateY(${H}px); }
        100% { transform: translateY(${H}px); }
      }
      .crt-beam { animation: beam-sweep 25s linear infinite; transform-origin: 0 0; pointer-events: none; mix-blend-mode: screen; }
    `
    : "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.bgEnd}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="#000" opacity="0.4"/>
    </pattern>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
    </radialGradient>
    <linearGradient id="crt-beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.015"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.015"/>
    </linearGradient>
    <filter id="phosphor-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      .blink { animation: blink 1s step-end infinite; }
      @keyframes glow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
      .pulse { animation: glow 2.5s ease-in-out infinite; }
      ${genTwCSS()}
      ${crtCss}
    </style>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)" rx="12"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${theme.border}" rx="12"/>

  <circle cx="22" cy="22" r="6" fill="${p[0]}"/>
  <circle cx="42" cy="22" r="6" fill="${p[2]}"/>
  <circle cx="62" cy="22" r="6" fill="${p[3]}"/>
  <text x="${W / 2}" y="26" fill="${theme.muted}" font-size="12" text-anchor="middle">${esc(username)}@github</text>

  ${asciiSection}

  <text x="${infoX}" y="${headerY}" font-size="24" font-weight="700" filter="url(#phosphor-glow)">
    <tspan fill="${theme.host}">${esc(info.find((r) => r.id === "host")?.value || username)}</tspan>
  </text>
  <line x1="${infoX}" y1="${headerY + 22}" x2="${sepEndX}" y2="${headerY + 22}" stroke="${theme.card}" stroke-width="1.5"/>

  ${infoRows}

  <g filter="url(#phosphor-glow)" transform="translate(${infoX}, ${paletteY})">
    ${theme.palette
      .map(
        (c, i) =>
          `<circle cx="${i * 22 + 8}" cy="8" r="7" fill="${c}" class="pulse" style="animation-delay: ${i * 0.15}s"/>`,
      )
      .join("\n    ")}
  </g>

  <text x="30" y="${statsY - 20}" fill="${theme.card}" font-size="13" xml:space="preserve">${"━".repeat(95)}</text>
  <text x="30" y="${statsY - 38}" font-size="13" filter="url(#phosphor-glow)">
    <tspan fill="${theme.prompt}">~</tspan><tspan fill="${theme.muted}"> </tspan><tspan fill="${theme.promptAccent}">❯</tspan><tspan fill="${theme.fg}" xml:space="preserve"> gh stats --user ${esc(username)}</tspan>
  </text>

  ${statCards
      .map((s, i) => {
        const x = cardStartX + i * (cardW + cardGap);
        return `<g>
    <rect x="${x}" y="${statsY}" width="${cardW}" height="${cardH}" rx="8" fill="${theme.card}" stroke="${theme.border}"/>
    <text x="${x + 16}" y="${statsY + 50}" font-size="34" font-weight="700" fill="${s.color}" filter="url(#phosphor-glow)">${s.value.toLocaleString()}</text>
    <text x="${x + 16}" y="${statsY + 74}" font-size="12" fill="${theme.muted}">${esc(s.label)}</text>
  </g>`;
      })
      .join("\n  ")}

  <text x="30" y="${H - 30}" font-size="13" filter="url(#phosphor-glow)">
    <tspan fill="${theme.prompt}">~</tspan><tspan fill="${theme.muted}"> </tspan><tspan fill="${theme.promptAccent}">❯</tspan><tspan fill="${theme.muted}"> </tspan>
  </text>
  <g class="tw-p1 tw-box">
    <text x="65" y="${H - 30}" font-size="13" font-family="monospace" fill="${theme.fg}">${esc(TW_P1)}<tspan><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.49;0.5;1" dur="1s" repeatCount="indefinite" />▍</tspan></text>
  </g>
  <g class="tw-p2 tw-box">
    <text x="65" y="${H - 30}" font-size="13" font-family="monospace" fill="${theme.fg}">${esc(TW_P2)}<tspan><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.49;0.5;1" dur="1s" repeatCount="indefinite" />▍</tspan></text>
  </g>
  <g class="tw-cempty">
    <text x="65" y="${H - 30}" font-size="13" font-family="monospace" fill="${theme.fg}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.49;0.5;1" dur="1s" repeatCount="indefinite" />▍</text>
  </g>
  <text x="30" y="${H - 12}" font-size="12" fill="${theme.muted}">
  </text>
  ${crtOverlay}
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control":
        process.env.NODE_ENV === "development"
          ? "no-store"
          : "public, max-age=1800, s-maxage=1800",
    },
  });
}
