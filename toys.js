// ===== TOY SHOP: the 10 stuffed toys and where they sit in the shop =====
// Toys 1-5 hang from the clothesline, toys 6-10 sit on the shelves.
// (The shop itself - tent, curtains, shelves, shopkeeper, counter - is drawn in index.html.)
(function () {
  const DARK = '#3b2a35';

  // small drawing helpers (SVG as text)
  const raw = (tag, attrs, fill) => `<${tag} ${attrs} fill="${fill}"/>`;
  // "soft" = the shape plus a little shade and shine, so it looks like plush
  const soft = (tag, attrs, fill) =>
    raw(tag, attrs, fill) + raw(tag, attrs, 'url(#gShade)') + raw(tag, attrs, 'url(#gShine)');
  const ell = (cx, cy, rx, ry, fill, more = '') =>
    soft('ellipse', `cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${more}`, fill);
  const dot = (cx, cy, r, fill) => raw('circle', `cx="${cx}" cy="${cy}" r="${r}"`, fill);
  const line = (d, stroke, w = 2.4) =>
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

  const eyes = (y = 41, gap = 13) =>
    dot(50 - gap, y, 4.6, DARK) + dot(50 + gap, y, 4.6, DARK) +
    dot(50 - gap + 1.6, y - 1.8, 1.6, '#fff') + dot(50 + gap + 1.6, y - 1.8, 1.6, '#fff');
  const cheeks = (y = 51, x = 29) =>
    `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="3.6" fill="#ff8fab" opacity=".6"/>` +
    `<ellipse cx="${100 - x}" cy="${y}" rx="5.5" ry="3.6" fill="#ff8fab" opacity=".6"/>`;
  const smile = (y = 52, w = 7) => line(`M${50 - w} ${y} Q50 ${y + 7} ${50 + w} ${y}`, DARK);
  const nose = (y = 47, rx = 4.4, ry = 3.2, c = DARK) =>
    raw('ellipse', `cx="50" cy="${y}" rx="${rx}" ry="${ry}"`, c);

  // body, belly, arms and feet (all toys share this)
  const body = (c, belly, limb = c, feet = limb) =>
    ell(36, 114, 13, 9, feet) + ell(64, 114, 13, 9, feet) +
    ell(50, 92, 27, 25, c) + ell(50, 97, 16, 14, belly) +
    ell(23, 88, 9, 15, limb, 'transform="rotate(25 23 88)"') +
    ell(77, 88, 9, 15, limb, 'transform="rotate(-25 77 88)"');
  const head = (c, ry = 30) => ell(50, 42, 33, ry, c);

  const TOYS = [
    // 1  bear
    () => body('#d9a066', '#f6dcb8') +
      ell(24, 17, 12, 12, '#d9a066') + dot(24, 17, 6, '#f2b5a0') +
      ell(76, 17, 12, 12, '#d9a066') + dot(76, 17, 6, '#f2b5a0') +
      head('#d9a066') + ell(50, 52, 13, 10, '#f6dcb8') +
      eyes(40) + nose(48) + line('M50 51 V54 M50 54 Q46 58 42 55 M50 54 Q54 58 58 55', DARK, 2) + cheeks(49, 27),

    // 2  bunny
    () => body('#ffc2d6', '#ffffff') +
      ell(36, 12, 9, 24, '#ffc2d6', 'transform="rotate(-8 36 20)"') + ell(36, 14, 4.5, 16, '#ff9fbd', 'transform="rotate(-8 36 20)"') +
      ell(64, 12, 9, 24, '#ffc2d6', 'transform="rotate(8 64 20)"') + ell(64, 14, 4.5, 16, '#ff9fbd', 'transform="rotate(8 64 20)"') +
      head('#ffc2d6') + eyes(41) + nose(48, 3.6, 2.6, '#ff6f9c') +
      line('M50 50 Q46 56 42 52 M50 50 Q54 56 58 52', DARK, 2) +
      raw('rect', 'x="46.5" y="54" width="7" height="6" rx="1.5"', '#fff') + cheeks(50, 27),

    // 3  kitten
    () => body('#ffb866', '#fff1d6') +
      `<path d="M20 32 L22 2 L47 17 Z" fill="#ffb866"/><path d="M27 25 L27 11 L39 18 Z" fill="#ff9fb8"/>` +
      `<path d="M80 32 L78 2 L53 17 Z" fill="#ffb866"/><path d="M73 25 L73 11 L61 18 Z" fill="#ff9fb8"/>` +
      head('#ffb866') +
      line('M50 14 V22 M42 15 V21 M58 15 V21', '#e08a2e', 2.4) +
      eyes(41) + `<path d="M46.5 47 L53.5 47 L50 51 Z" fill="#ff6f9c"/>` +
      line('M50 51 Q46 56 42 53 M50 51 Q54 56 58 53', DARK, 2) +
      line('M25 49 L9 46 M25 53 L9 56 M75 49 L91 46 M75 53 L91 56', '#a07a55', 1.6) + cheeks(51, 31),

    // 4  puppy
    () => body('#f0d9b5', '#ffffff') +
      ell(17, 40, 10, 21, '#a9744f', 'transform="rotate(12 17 40)"') +
      ell(83, 40, 10, 21, '#a9744f', 'transform="rotate(-12 83 40)"') +
      head('#f0d9b5') + ell(64, 39, 10, 9, '#a9744f') +
      eyes(40) + ell(50, 53, 14, 10, '#ffffff') + nose(48, 6, 4.2) +
      `<path d="M45 58 Q50 69 55 58 Z" fill="#ff8fab"/>` + line('M50 52 V57 M50 57 Q44 60 40 57 M50 57 Q56 60 60 57', DARK, 2),

    // 5  elephant
    () => body('#b9cdf0', '#e9f0ff') +
      ell(12, 44, 17, 20, '#a8bfe6') + ell(13, 44, 10, 13, '#ffc2d6') +
      ell(88, 44, 17, 20, '#a8bfe6') + ell(87, 44, 10, 13, '#ffc2d6') +
      head('#b9cdf0') + eyes(38, 15) + cheeks(50, 26) +
      ell(50, 64, 9, 18, '#b9cdf0') +
      line('M44 58 H56 M44 65 H56 M45 72 H55', '#8ea6d6', 1.6),

    // 6  penguin
    () => body('#4a5a8a', '#ffffff', '#3c4a78', '#ffa94d') +
      head('#4a5a8a') + ell(50, 47, 23, 21, '#ffffff') + eyes(42, 11) +
      `<path d="M43 49 Q50 44 57 49 L50 58 Z" fill="#ffa94d"/>` + cheeks(52, 31) +
      `<path d="M26 70 Q50 82 74 70 L74 77 Q50 89 26 77 Z" fill="#ff6b81"/>`,

    // 7  duck
    () => body('#ffe066', '#fff3b0', '#ffe066', '#ffa94d') +
      `<path d="M46 14 Q43 -2 55 1 Q50 8 55 14 Z" fill="#ffe066"/>` +
      head('#ffe066') + eyes(40, 15) + ell(50, 52, 15, 8, '#ffa94d') +
      line('M38 52 Q50 55 62 52', '#e0822a', 1.6) + cheeks(50, 24),

    // 8  frog
    () => body('#8fdc8f', '#e6ffd9') +
      dot(34, 20, 13, '#8fdc8f') + dot(66, 20, 13, '#8fdc8f') +
      head('#8fdc8f', 28) +
      dot(34, 19, 9, '#fff') + dot(66, 19, 9, '#fff') +
      dot(35, 20, 4.6, DARK) + dot(67, 20, 4.6, DARK) + dot(36.6, 18.2, 1.6, '#fff') + dot(68.6, 18.2, 1.6, '#fff') +
      dot(46, 46, 1.6, '#4aa84a') + dot(54, 46, 1.6, '#4aa84a') +
      line('M30 53 Q50 69 70 53', DARK, 2.4) + cheeks(55, 25) +
      dot(36, 84, 4, '#6cc46c') + dot(62, 80, 3, '#6cc46c') + dot(58, 100, 3.6, '#6cc46c'),

    // 9  panda
    () => body('#ffffff', '#ffffff', '#2d2d3a') +
      dot(22, 18, 11, '#2d2d3a') + dot(78, 18, 11, '#2d2d3a') +
      head('#ffffff') +
      ell(36, 42, 9, 11, '#2d2d3a', 'transform="rotate(20 36 42)"') +
      ell(64, 42, 9, 11, '#2d2d3a', 'transform="rotate(-20 64 42)"') +
      dot(36, 41, 3.6, '#fff') + dot(64, 41, 3.6, '#fff') + dot(36.4, 41.4, 1.8, DARK) + dot(63.6, 41.4, 1.8, DARK) +
      nose(52, 5, 3.4, '#2d2d3a') + smile(55, 6) + cheeks(55, 22),

    // 10 unicorn
    () => body('#fff3fa', '#ffffff') +
      ell(20, 30, 10, 17, '#ff9fd0') + ell(16, 47, 9, 14, '#b388ff') + ell(20, 62, 8, 12, '#7ec8ff') +
      `<path d="M27 24 L29 6 L41 17 Z" fill="#fff3fa" stroke="#ffd1e8" stroke-width="1.5"/>` +
      head('#fff3fa') +
      `<path d="M43 17 L50 -14 L57 17 Z" fill="#ffd93d"/>` +
      line('M45 8 L54.6 5 M46.8 -1 L53.2 -3.4', '#f0a020', 2) +
      eyes(42, 12) + nose(50, 2.6, 1.9, '#ff9fb8') + smile(53, 6) + cheeks(51, 29)
  ];

  // where each toy sits (scene is 1600 x 900)
  const lineY = (x) => { const t = (x - 150) / 1300; return 200 + 120 * t * (1 - t); }; // clothesline sag
  const HANG_S = 1.2;
  const SHELF_S = 1.15;
  const PLACES = [
    ...[340, 570, 800, 1030, 1260].map(x => ({ x: x - 50 * HANG_S, y: lineY(x) - 8 * HANG_S, s: HANG_S, hang: true })),
    ...[
      { cx: 345, y: 535 }, { cx: 235, y: 715 }, { cx: 455, y: 715 },
      { cx: 1150, y: 610 }, { cx: 1360, y: 610 }
    ].map(p => ({ x: p.cx - 50 * SHELF_S, y: p.y - 123 * SHELF_S, s: SHELF_S, hang: false }))
  ];

  const PUFF_COLORS = ['#ff8fab', '#ffe08a', '#9bd0ff', '#caffbf'];

  function slotMarkup(n) {
    const p = PLACES[n - 1];
    const badge =
      `<circle cx="50" cy="99" r="16" fill="#fff" stroke="#e0527f" stroke-width="3.5"/>` +
      `<text x="50" y="100" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Fredoka, 'Comic Sans MS', sans-serif" font-weight="600" font-size="${n > 9 ? 19 : 23}" fill="#e0527f">${n}</text>`;
    const pin = p.hang
      ? `<g transform="translate(44 -6)"><rect width="12" height="28" rx="3" fill="#e0a56a" stroke="#b9814a" stroke-width="1.5"/>` +
        `<rect y="11" width="12" height="3" fill="#b9814a"/></g>`
      : '';
    const toy =
      `<g class="toy" tabindex="0" role="button" aria-label="Toy number ${n}" data-i="${n - 1}">` +
      `<rect class="hit" x="-8" y="-16" width="116" height="152" rx="18"/>` +
      TOYS[n - 1]() + badge + pin + `</g>`;

    let dots = '';
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI * 2 * k) / 8;
      dots += `<circle class="dot" r="6" fill="${PUFF_COLORS[k % 4]}" style="--dx:${Math.round(Math.cos(a) * 75)}px;--dy:${Math.round(Math.sin(a) * 75)}px"/>`;
    }
    const puff = `<g class="puff" transform="translate(50 62)"><circle class="ring" r="40" fill="none" stroke="#fff" stroke-width="7"/>${dots}</g>`;

    const inner = p.hang ? `<g class="sway" style="animation-delay:-${(n * 0.9).toFixed(1)}s">${toy}</g>` : toy;
    return `<g class="slot${p.hang ? ' hang' : ''}" id="slot${n}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.s})">${inner}${puff}</g>`;
  }

  window.ToyShop = {
    // draws the 10 toys into `layer` (an SVG <g>) and calls onPick(index 0-9) when one is clicked
    build(layer, onPick) {
      let html = '';
      for (let n = 1; n <= 10; n++) html += slotMarkup(n);
      layer.innerHTML = html;

      layer.addEventListener('click', (e) => {
        const t = e.target.closest('.toy');
        if (t) onPick(Number(t.dataset.i));
      });
      layer.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const t = e.target.closest ? e.target.closest('.toy') : null;
        if (t) { e.preventDefault(); onPick(Number(t.dataset.i)); }
      });

      return Array.from({ length: 10 }, (_, i) => layer.querySelector('#slot' + (i + 1)));
    }
  };
})();