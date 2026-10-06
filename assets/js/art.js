/* تصویرسازی رویه‌ای ساختمان‌ها: هر پروژه بر اساس نوع، تعداد طبقات و درصد پیشرفت
   به‌صورت SVG رسم می‌شود — طبقات تکمیل‌شده با نما، طبقات اسکلت با قاب، و طبقات آینده خط‌چین. */
(function () {
  function rng(seed) {
    let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function building(p, opts = {}) {
    const W = 480, H = 320; // هندسه ثابت است؛ SVG با CSS مقیاس می‌گیرد
    const rand = rng(p.id + (opts.variant || ""));
    const hue = p.hue;
    const ground = H - 42;
    const night = opts.night;
    const skyTop = night ? `hsl(${hue} 45% 14%)` : `hsl(${hue} 38% 86%)`;
    const skyBot = night ? `hsl(${hue} 40% 26%)` : `hsl(${hue + 20} 30% 95%)`;
    const body = night ? `hsl(${hue} 18% 24%)` : `hsl(${hue} 14% 34%)`;
    const glass = night ? `hsl(${hue} 60% 62%)` : `hsl(${hue} 42% 66%)`;
    const glassLit = `hsl(42 90% 70%)`;
    const frame = night ? `hsl(${hue} 30% 70%)` : `hsl(${hue} 20% 38%)`;

    const types = {
      tower: { bw: 108, maxH: ground - 78 },
      commercial: { bw: 230, maxH: ground - 90 },
      midrise: { bw: 176, maxH: ground - 110 },
      villa: { bw: 250, maxH: 92 },
    };
    const t = types[p.art] || types.midrise;
    const N = p.floors;
    const fh = Math.min(p.art === "villa" ? 42 : 18, t.maxH / N);
    const bw = t.bw;
    const bx = (W - bw) / 2 + (p.art === "tower" ? -20 : 0);
    const top = ground - N * fh;
    const pr = p.progress;
    const built = pr >= 100 ? N : Math.round(N * Math.min(1, Math.max(0, (pr - 12) / 58)));
    const clad = pr >= 100 ? N : Math.round(N * Math.max(0, (pr - 40) / 55));

    let vb = `0 0 ${W} ${H}`;
    if (opts.zoom) { const zw = Math.min(W, bw + 150), zh = zw * H / W, zx = Math.max(0, Math.min(W - zw, bx - 50)), zy = Math.max(0, Math.min(H - zh, top - 30)); vb = `${zx.toFixed(1)} ${zy.toFixed(1)} ${zw.toFixed(1)} ${zh.toFixed(1)}`; }
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${p.name}" style="direction:ltr" preserveAspectRatio="xMidYMid slice">`;
    const gid = "g" + p.id + (opts.variant || "") + (night ? "n" : "");
    s += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBot}"/></linearGradient>`;
    s += `<linearGradient id="${gid}gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${glass}"/><stop offset="1" stop-color="hsl(${hue} 35% ${night ? 40 : 52}%)"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#${gid})"/>`;
    if (night) for (let i = 0; i < 30; i++) s += `<circle cx="${(rand() * W).toFixed(1)}" cy="${(rand() * ground * 0.6).toFixed(1)}" r="${(rand() * 1.1 + .3).toFixed(2)}" fill="#fff" opacity="${(rand() * .6 + .2).toFixed(2)}"/>`;
    else s += `<circle cx="${W * 0.18}" cy="${H * 0.2}" r="22" fill="hsl(40 90% 92%)" opacity=".9"/>`;

    // کوه‌ها و ساختمان‌های پس‌زمینه
    s += `<path d="M0 ${ground - 70} L${W * .18} ${ground - 120} L${W * .32} ${ground - 84} L${W * .5} ${ground - 136} L${W * .7} ${ground - 92} L${W * .86} ${ground - 126} L${W} ${ground - 80} L${W} ${ground} L0 ${ground}Z" fill="hsl(${hue} 20% ${night ? 18 : 76}%)" opacity=".7"/>`;
    for (let i = 0; i < 9; i++) {
      const w = 26 + rand() * 40, h = 30 + rand() * 90, x = rand() * (W - w);
      s += `<rect x="${x.toFixed(1)}" y="${(ground - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="hsl(${hue} 14% ${night ? 16 : 68}%)" opacity=".85"/>`;
    }

    // گود و سازهٔ نگهبان برای پروژه‌های ابتدایی
    if (pr < 20) {
      s += `<rect x="${bx - 10}" y="${ground}" width="${bw + 20}" height="${H - ground}" fill="hsl(28 30% ${night ? 22 : 52}%)"/>`;
      for (let i = 0; i <= 12; i++) s += `<line x1="${bx - 10 + i * (bw + 20) / 12}" y1="${ground}" x2="${bx - 10 + i * (bw + 20) / 12}" y2="${H}" stroke="hsl(28 20% 30%)" stroke-width="1.2" opacity=".6"/>`;
    }

    // طبقات
    const cols = Math.max(3, Math.floor(bw / (p.art === "villa" ? 40 : 15)));
    for (let i = 0; i < N; i++) {
      const y = ground - (i + 1) * fh;
      if (i < clad) {
        s += `<rect x="${bx}" y="${y.toFixed(1)}" width="${bw}" height="${(fh + .5).toFixed(1)}" fill="${body}"/>`;
        const cw = bw / cols;
        for (let c = 0; c < cols; c++) {
          const lit = night && rand() > .55;
          const pad = p.art === "commercial" ? 1 : Math.max(1.5, cw * 0.18);
          s += `<rect x="${(bx + c * cw + pad).toFixed(1)}" y="${(y + fh * 0.2).toFixed(1)}" width="${(cw - pad * 2).toFixed(1)}" height="${(fh * 0.62).toFixed(1)}" fill="${lit ? glassLit : `url(#${gid}gl)`}" opacity="${lit ? .9 : .95}"/>`;
        }
        if (p.art === "midrise" && i > 0 && i % 1 === 0) s += `<rect x="${bx - 6}" y="${(y + fh - 2).toFixed(1)}" width="${bw + 12}" height="2.5" fill="${frame}" opacity=".9"/>`;
      } else if (i < built) {
        s += `<rect x="${bx}" y="${(y + fh - 2.4).toFixed(1)}" width="${bw}" height="2.4" fill="${frame}"/>`;
        const n = Math.max(3, Math.round(bw / 36));
        for (let c = 0; c <= n; c++) s += `<rect x="${(bx + c * (bw / n) - 1.6).toFixed(1)}" y="${y.toFixed(1)}" width="3.2" height="${fh.toFixed(1)}" fill="${frame}"/>`;
      } else {
        s += `<rect x="${bx}" y="${y.toFixed(1)}" width="${bw}" height="${fh.toFixed(1)}" fill="none" stroke="${frame}" stroke-width="1" stroke-dasharray="3 4" opacity=".55"/>`;
      }
    }
    if (clad === N && p.art !== "villa") s += `<rect x="${bx - 4}" y="${top - 4}" width="${bw + 8}" height="5" fill="${frame}"/>`;
    if (p.art === "commercial" && clad > 0) s += `<rect x="${bx - 18}" y="${ground - fh * 2}" width="${bw + 36}" height="${fh * 2}" fill="${body}" opacity=".92"/><rect x="${bx - 12}" y="${ground - fh * 1.6}" width="${bw + 24}" height="${fh * 1.2}" fill="url(#${gid}gl)"/>`;

    // جرثقیل برجی
    if (pr < 100 && pr >= 8) {
      const mx = bx + bw + 30, mt = Math.max(28, Math.min(top, ground - built * fh) - 40);
      s += `<g stroke="hsl(40 85% ${night ? 60 : 48}%)" stroke-width="2.4" fill="none">`;
      s += `<line x1="${mx}" y1="${ground}" x2="${mx}" y2="${mt}"/><line x1="${mx + 8}" y1="${ground}" x2="${mx + 8}" y2="${mt}"/>`;
      for (let y = ground; y > mt + 8; y -= 12) s += `<line x1="${mx}" y1="${y}" x2="${mx + 8}" y2="${y - 12}" stroke-width="1.2"/>`;
      s += `<line x1="${mx - 150}" y1="${mt}" x2="${mx + 48}" y2="${mt}"/><line x1="${mx - 150}" y1="${mt + 6}" x2="${mx + 48}" y2="${mt + 6}" stroke-width="1.2"/>`;
      s += `<line x1="${mx + 4}" y1="${mt - 22}" x2="${mx - 150}" y2="${mt}" stroke-width="1"/><line x1="${mx + 4}" y1="${mt - 22}" x2="${mx + 48}" y2="${mt}" stroke-width="1"/>`;
      s += `<line x1="${mx - 90}" y1="${mt + 6}" x2="${mx - 90}" y2="${mt + 60}" stroke-width="1"/></g>`;
      s += `<rect x="${mx + 30}" y="${mt + 6}" width="18" height="12" fill="hsl(${hue} 10% 30%)"/><rect x="${mx - 97}" y="${mt + 60}" width="14" height="8" fill="hsl(${hue} 10% 30%)"/>`;
    }

    // زمین
    s += `<rect y="${ground}" width="${pr < 20 ? Math.max(0, bx - 10) : W}" height="${H - ground}" fill="hsl(${hue} 10% ${night ? 12 : 42}%)"/>`;
    if (pr < 20) s += `<rect x="${bx + bw + 10}" y="${ground}" width="${W}" height="${H - ground}" fill="hsl(${hue} 10% ${night ? 12 : 42}%)"/>`;
    if (pr >= 100) for (let i = 0; i < 7; i++) {
      const x = 20 + i * (W - 40) / 6;
      s += `<circle cx="${x}" cy="${ground - 10}" r="${10 + (i % 3) * 3}" fill="hsl(130 30% ${night ? 22 : 38}%)"/><rect x="${x - 1.2}" y="${ground - 4}" width="2.4" height="6" fill="hsl(30 30% 25%)"/>`;
    }

    // خط تراز (نشانه‌گذاری نقشه‌کشی)
    if (opts.annotate !== false && !opts.zoom && p.art !== "villa") {
      const ax = bx - 22, lvl = (N * 3.3).toFixed(2);
      s += `<g stroke="${night ? "#cfe3ff" : "#21384c"}" stroke-width="1" opacity=".75"><line x1="${ax}" y1="${ground}" x2="${ax}" y2="${top}"/><line x1="${ax - 5}" y1="${top}" x2="${ax + 5}" y2="${top}"/><line x1="${ax - 5}" y1="${ground}" x2="${ax + 5}" y2="${ground}"/></g>`;
      s += `<path d="M${ax - 14} ${top - 9} l6 8 l6 -8z" fill="none" stroke="${night ? "#cfe3ff" : "#21384c"}" stroke-width="1"/>`;
      s += `<text x="${ax - 4}" y="${top - 12}" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="10" fill="${night ? "#cfe3ff" : "#21384c"}">+${lvl}</text>`;
    }
    s += `</svg>`;
    return s;
  }

  window.TArt = { building };
})();
