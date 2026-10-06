/* پنل مدیریت اختصاصی — نسخهٔ نمایشی سمت کاربر.
   در نسخهٔ واقعی، همین قواعد دسترسی و گردش کار در سرور (API) اعمال می‌شود. */
(function () {
  const { fa, n, money, moneyShort, esc, toast, store, statusLabel, statusPill } = window.T;
  const SEED = window.TARAZ_SEED;
  const KEY = "taraz-demo-v1", SKEY = "taraz-session";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let S = store.get(KEY, null) || clone(SEED);
  let session = store.get(SKEY, null);
  const save = () => store.set(KEY, S);

  /* تاریخ امروز به شمسی */
  function todayJ(withTime) {
    try {
      const parts = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      const g = (t) => parts.find((p) => p.type === t)?.value;
      const d = `${g("year")}/${g("month")}/${g("day")}`;
      return withTime ? `${d} ${g("hour")}:${g("minute")}` : d;
    } catch (e) { return SEED.TODAY; }
  }

  /* کاربر و دسترسی */
  const me = () => S.users.find((u) => u.id === session);
  const can = (perm) => { const u = me(); return !!u && S.roles[u.role].perms.includes(perm); };
  const inScope = (pid, u = me()) => u && (u.projects.includes("*") || u.projects.includes(pid));
  const projs = () => S.projects.filter((p) => inScope(p.id));
  const P = (id) => S.projects.find((p) => p.id === id);
  const uname = (id) => S.users.find((u) => u.id === id)?.name || "—";
  const initial = (name) => name.replace(/^(مهندس|دکتر|شرکت)\s+/, "").trim()[0] || "؟";
  const log = (text) => { S.activity.unshift([session, todayJ(true), text]); S.activity = S.activity.slice(0, 40); };

  const EXP = {
    pending: ["در انتظار مدیر پروژه", "pill-warn"],
    review: ["در انتظار تأیید نهایی", "pill-warn"],
    approved: ["تأییدشده", "pill-good"],
    rejected: ["ردشده", "pill-bad"],
  };
  const expPill = (s) => `<span class="pill ${EXP[s][1]}">${EXP[s][0]}</span>`;
  const projPill = (p) => `<span class="pill ${statusPill[p.status]}">${statusLabel[p.status]}</span>`;
  const bar = (v, cls = "") => `<div class="progress ${v >= 100 ? "is-done" : ""} ${cls}" style="--v:${Math.min(100, v)}" role="progressbar" aria-valuenow="${Math.round(v)}" aria-valuemin="0" aria-valuemax="100"><span></span></div>`;
  const canAct = (e) => (e.status === "pending" && can("expenses.approve") && inScope(e.project)) || ((e.status === "pending" || e.status === "review") && can("expenses.approve.high"));
  const pendingForMe = () => S.expenses.filter((e) => inScope(e.project) && canAct(e));
  const monthKey = () => todayJ().slice(0, 7);

  /* آیکن‌ها */
  const I = {
    dash: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 4v3h6V4z"/>',
    proj: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
    report: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    doc: '<path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M19 3l1 1 2-2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5.3z"/>',
    home: '<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    site: '<path d="M2 21h20M6 21V9h12v12M9 9V5h6v4M10 13h4M10 17h4"/>',
  };
  const ic = (k, size = 18) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
  const MARK = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" style="width:34px;height:34px"><rect width="40" height="40" rx="8" fill="var(--ink)"/><path d="M9 27h22" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/><path d="M14 13h12l-6 9z" fill="none" stroke="var(--bg)" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 22v5" stroke="var(--bg)" stroke-width="2.4"/></svg>`;

  /* پوسته */
  const isDark = () => document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  const t0 = store.get("taraz-theme", null); if (t0) document.documentElement.dataset.theme = t0;

  /* مودال */
  function modal({ title, body, foot = "", drawer = false, onMount }) {
    const ov = document.createElement("div");
    ov.className = "overlay" + (drawer ? " drawer" : "");
    ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="بستن" style="width:34px;height:34px;border:1px solid var(--line);background:var(--surface);border-radius:8px;cursor:pointer;color:var(--ink);display:grid;place-items:center">${ic("x", 16)}</button></header><div class="mbody">${body}</div>${foot ? `<footer>${foot}</footer>` : ""}</div>`;
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(ov);
    const f = ov.querySelector("input, select, textarea"); if (f) f.focus();
    onMount?.(ov, close);
    return close;
  }
  function confirmBox(text, okLabel, onOk) {
    modal({ title: "تأیید", body: `<p>${text}</p>`, foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-bad btn-sm" id="cf-ok">${okLabel}</button>`,
      onMount: (ov, close) => { $("#cf-ok", ov).onclick = () => { close(); onOk(); }; } });
  }

  /* نمودارها (SVG دست‌ساز، راست‌به‌چپ) */
  function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
  function tipAt(el, xSvg, ySvg, W, html) {
    let tip = $(".tip", el); if (!tip) { tip = document.createElement("div"); tip.className = "tip"; el.appendChild(tip); }
    const k = el.clientWidth / W; tip.innerHTML = html; tip.hidden = false;
    const x = Math.max(70, Math.min(el.clientWidth - 70, xSvg * k));
    tip.style.left = x + "px"; tip.style.top = ySvg * k + "px";
  }
  const hideTip = (el) => { const t = $(".tip", el); if (t) t.hidden = true; };

  function barChart(el, data, fmt) {
    const W = 640, H = 260, pt = 30, pb = 34, pr = 64, pl = 8, pw = W - pr - pl, ph = H - pt - pb;
    const max = niceMax(Math.max(...data.map((d) => d.value)) * 1.08);
    const band = pw / data.length, bw = Math.min(46, band * 0.56), y = (v) => pt + ph - (v / max) * ph;
    let s = `<svg viewBox="0 0 ${W} ${H}" style="direction:ltr" role="img" aria-label="نمودار هزینهٔ ماهانه"><g class="grid">`;
    for (let i = 0; i <= 4; i++) { const v = (max / 4) * i, yy = y(v); s += `<line x1="${pl}" x2="${W - pr}" y1="${yy}" y2="${yy}" ${i === 0 ? 'class="base"' : ""}/>`; }
    s += `</g><g class="axis">`;
    for (let i = 0; i <= 4; i++) { const v = (max / 4) * i; s += `<text x="${W - pr + 8}" y="${y(v) + 4}">${v ? fa((v / 1000).toLocaleString("en", { maximumFractionDigits: 1 })) : "۰"}</text>`; }
    s += `<text x="${W - pr + 8}" y="${pt - 6}" style="font-size:10px">میلیارد</text>`;
    data.forEach((d, i) => { s += `<text x="${W - pr - (i + 0.5) * band}" y="${H - 10}" text-anchor="middle">${esc(d.label)}</text>`; });
    s += `</g>`;
    data.forEach((d, i) => {
      const x = W - pr - (i + 0.5) * band - bw / 2, yy = y(d.value), base = pt + ph, r = Math.min(4, (base - yy) / 2);
      s += `<path d="M${x} ${base} V${yy + r} Q${x} ${yy} ${x + r} ${yy} H${x + bw - r} Q${x + bw} ${yy} ${x + bw} ${yy + r} V${base} Z" fill="var(--series-1)" opacity="${d.current ? 1 : 0.82}"/>`;
      if (d.current) s += `<text class="lbl" direction="rtl" x="${x + bw / 2}" y="${yy - 8}" text-anchor="middle">${fmt(d.value)}</text>`;
      s += `<rect x="${W - pr - (i + 1) * band}" y="${pt}" width="${band}" height="${ph}" fill="transparent" data-i="${i}"/>`;
    });
    s += `</svg>`;
    el.innerHTML = s;
    $$("rect[data-i]", el).forEach((r) => {
      const d = data[r.dataset.i], i = +r.dataset.i;
      const show = () => tipAt(el, W - pr - (i + 0.5) * band, y(d.value), W, `${esc(d.label)}${d.current ? " (تا امروز)" : ""}<br><b>${money(d.value)}</b>`);
      r.addEventListener("mouseenter", show); r.addEventListener("click", show); r.addEventListener("mouseleave", () => hideTip(el));
    });
  }

  function addMonths(j, m) { let [y, mo] = j.split("/").map(Number); mo += m; y += Math.floor((mo - 1) / 12); mo = ((mo - 1) % 12) + 1; return `${y}/${String(mo).padStart(2, "0")}`; }
  function sCurveChart(el, p) {
    const W = 640, H = 260, pt = 20, pb = 34, pr = 44, pl = 70, pw = W - pr - pl, ph = H - pt - pb;
    const pts = p.curve, M = pts.length - 1;
    const X = (m) => W - pr - (m / M) * pw, Y = (v) => pt + ph - (v / 100) * ph;
    const act = pts.filter((r) => r.actual != null), last = act[act.length - 1];
    const line = (key, arr) => arr.map((r, i) => `${i ? "L" : "M"}${X(r.m).toFixed(1)} ${Y(r[key]).toFixed(1)}`).join(" ");
    let s = `<svg viewBox="0 0 ${W} ${H}" style="direction:ltr" role="img" aria-label="منحنی S پیشرفت ${esc(p.name)}"><g class="grid">`;
    [0, 25, 50, 75, 100].forEach((v, i) => { s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" ${i === 0 ? 'class="base"' : ""}/>`; });
    s += `</g><g class="axis">`;
    [0, 25, 50, 75, 100].forEach((v) => { s += `<text x="${W - pr + 8}" y="${Y(v) + 4}">${fa(v)}٪</text>`; });
    const step = M > 30 ? 9 : 6;
    for (let m = 0; m <= M; m += step) s += `<text x="${X(m)}" y="${H - 10}" text-anchor="middle">${fa(addMonths(p.start, m))}</text>`;
    s += `</g>`;
    if (last && last.m < M) s += `<line x1="${X(last.m)}" x2="${X(last.m)}" y1="${pt}" y2="${pt + ph}" stroke="var(--muted)" stroke-dasharray="2 3"/><text x="${X(last.m)}" y="${pt - 6}" text-anchor="middle" class="lbl" style="font-size:11px;fill:var(--muted)">امروز</text>`;
    s += `<path d="${line("actual", act)} L${X(last.m)} ${Y(0)} L${X(0)} ${Y(0)} Z" fill="var(--series-1)" opacity=".10"/>`;
    s += `<path d="${line("planned", pts)}" fill="none" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="6 4"/>`;
    s += `<path d="${line("actual", act)}" fill="none" stroke="var(--series-1)" stroke-width="2.4" stroke-linejoin="round"/>`;
    const pl0 = pts[last.m].planned;
    s += `<circle cx="${X(last.m)}" cy="${Y(last.actual)}" r="5" fill="var(--series-1)" stroke="var(--surface)" stroke-width="2"/>`;
    const lx = X(last.m) - 10, gap = Math.abs(Y(pl0) - Y(last.actual)) < 16;
    s += `<text class="lbl" direction="rtl" x="${lx}" y="${Y(last.actual) + (gap ? 16 : 4)}" text-anchor="start">واقعی ${fa(Math.round(last.actual))}٪</text>`;
    if (last.m < M) s += `<text class="lbl" direction="rtl" x="${lx}" y="${Y(pl0) - (gap ? 8 : -4)}" text-anchor="start" style="fill:var(--muted)">برنامه ${fa(Math.round(pl0))}٪</text>`;
    s += `<line class="xh" x1="0" x2="0" y1="${pt}" y2="${pt + ph}" stroke="var(--ink-2)" stroke-width="1" visibility="hidden"/><circle class="xh-a" r="4" fill="var(--series-1)" stroke="var(--surface)" stroke-width="2" visibility="hidden"/><circle class="xh-p" r="4" fill="var(--series-2)" stroke="var(--surface)" stroke-width="2" visibility="hidden"/>`;
    s += `<rect class="hit" x="${pl}" y="${pt}" width="${pw}" height="${ph}" fill="transparent"/></svg>`;
    el.innerHTML = s;
    const svg = $("svg", el), hit = $(".hit", el);
    const move = (ev) => {
      const r = svg.getBoundingClientRect(), k = W / r.width, x = (ev.clientX - r.left) * k;
      const m = Math.max(0, Math.min(M, Math.round(((W - pr - x) / pw) * M))), row = pts[m];
      $(".xh", el).setAttribute("x1", X(m)); $(".xh", el).setAttribute("x2", X(m)); $(".xh", el).setAttribute("visibility", "visible");
      const cp = $(".xh-p", el); cp.setAttribute("cx", X(m)); cp.setAttribute("cy", Y(row.planned)); cp.setAttribute("visibility", "visible");
      const ca = $(".xh-a", el);
      if (row.actual != null) { ca.setAttribute("cx", X(m)); ca.setAttribute("cy", Y(row.actual)); ca.setAttribute("visibility", "visible"); } else ca.setAttribute("visibility", "hidden");
      tipAt(el, X(m), Math.min(Y(row.planned), row.actual != null ? Y(row.actual) : 999), W,
        `<span class="num">${fa(addMonths(p.start, m))}</span> · ماه ${fa(m)}<br><i style="background:var(--series-2)"></i>برنامه: <b>${fa(Math.round(row.planned))}٪</b>${row.actual != null ? `<br><i style="background:var(--series-1)"></i>واقعی: <b>${fa(Math.round(row.actual))}٪</b>` : ""}`);
    };
    hit.addEventListener("mousemove", move); hit.addEventListener("click", move);
    hit.addEventListener("mouseleave", () => { hideTip(el); $$(".xh, .xh-a, .xh-p", el).forEach((x) => x.setAttribute("visibility", "hidden")); });
  }
  function hbars(rows, fmt) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return rows.map((r) => `<div class="hbar" title="${esc(r.label)}: ${esc(fmt(r.value))}"><span>${esc(r.label)}</span><div class="track"><div class="bar" style="width:${(r.value / max) * 100}%"></div></div><b>${fmt(r.value)}</b></div>`).join("");
  }
  const curveLegend = `<div class="legend"><span><i style="background:var(--series-1)"></i>پیشرفت واقعی</span><span style="color:var(--series-2)"><i class="dash"></i><span style="color:var(--ink-2)">برنامهٔ زمان‌بندی</span></span></div>`;

  /* مسیرها */
  const NAV = [
    { group: "عملیات" },
    { r: "dashboard", t: "داشبورد", i: "dash", perm: "dashboard" },
    { r: "portal", t: "پروژهٔ من", i: "home", perm: "portal" },
    { r: "projects", t: "پروژه‌ها", i: "proj", perm: "projects.view" },
    { r: "reports", t: "گزارش روزانه", i: "report", perm: "reports.view" },
    { r: "expenses", t: "هزینه‌ها و تأیید", i: "money", perm: "expenses.view", badge: () => pendingForMe().length },
    { r: "documents", t: "تصاویر و مدارک", i: "doc", perm: "documents.view" },
    { group: "ارتباطات و گزارش" },
    { r: "people", t: "مشتریان، مالکین، پیمانکاران", i: "people", perm: "people.view" },
    { r: "analytics", t: "گزارش‌گیری", i: "chart", perm: "analytics" },
    { group: "مدیریت سامانه" },
    { r: "users", t: "کاربران و نقش‌ها", i: "users", perm: "users.manage" },
    { r: "settings", t: "تنظیمات", i: "gear", perm: "settings" },
  ];
  const TITLES = Object.fromEntries(NAV.filter((x) => x.r).map((x) => [x.r, x.t])); TITLES.project = "پروژه";
  const PERM = Object.fromEntries(NAV.filter((x) => x.r).map((x) => [x.r, x.perm])); PERM.project = "projects.view";
  const home = () => (can("dashboard") ? "dashboard" : can("portal") ? "portal" : can("reports.view") ? "reports" : "projects");

  function render() {
    const root = $("#root");
    if (!me()) return renderLogin(root);
    let [route, arg] = (location.hash.slice(1) || home()).split("-");
    if (!TITLES[route]) route = home();
    if (!$(".app", root)) shell(root);
    const nav = $("#side-nav");
    nav.innerHTML = NAV.filter((x) => x.group || can(x.perm)).filter((x, i, arr) => !(x.group && (!arr[i + 1] || arr[i + 1].group))).map((x) =>
      x.group ? `<div class="group">${x.group}</div>` : `<a href="#${x.r}" ${x.r === route || (route === "project" && x.r === "projects") ? 'aria-current="page"' : ""}>${ic(x.i)}<span>${x.t}</span>${x.badge && x.badge() ? `<span class="count">${fa(x.badge())}</span>` : ""}</a>`).join("");
    $("#side").classList.remove("open"); $("#scrim").classList.remove("open");
    const c = $("#content");
    const title = route === "project" && P(arg) ? P(arg).name : TITLES[route];
    $("#top-title").textContent = title;
    document.title = `${title} | پنل مدیریت تراز`;
    if (!can(PERM[route]) || (route === "project" && !inScope(arg))) { c.innerHTML = denied(); return; }
    c.innerHTML = "";
    VIEWS[route](c, arg);
    c.focus({ preventScroll: true });
  }

  function shell(root) {
    const u = me();
    root.innerHTML = `<div class="app">
      <aside class="side" id="side" aria-label="منوی پنل">
        <a class="brand" href="#" style="display:flex;gap:10px;align-items:center;text-decoration:none;color:var(--ink)">${MARK}<span><b style="font-family:var(--font-display);font-size:18px;display:block;line-height:1.2">تراز</b><small style="font-size:11px;color:var(--muted)">پنل مدیریت پروژه</small></span></a>
        <nav id="side-nav"></nav>
        <div class="side-foot"><span>نسخهٔ نمایشی · داده‌ها ساختگی‌اند</span><a href="../index.html" style="color:var(--ink-2)">← بازگشت به وب‌سایت</a></div>
      </aside>
      <div class="scrim" id="scrim"></div>
      <div style="min-width:0;display:flex;flex-direction:column">
        <header class="top">
          <button class="icon-btn burger" id="burger" aria-label="منو" style="width:40px;height:40px;border:1px solid var(--line);background:var(--surface);border-radius:8px;color:var(--ink)">${ic("menu")}</button>
          <h1 id="top-title"></h1><div class="spacer"></div>
          <button class="icon-btn" id="theme" aria-label="تغییر حالت روشن و تاریک" style="width:40px;height:40px;border:1px solid var(--line);background:var(--surface);border-radius:8px;color:var(--ink);display:grid;place-items:center;cursor:pointer">${ic(isDark() ? "sun" : "moon")}</button>
          <div style="position:relative">
            <button class="user-chip" id="user-btn" aria-haspopup="true" aria-expanded="false"><span class="who"><b>${esc(u.name)}</b><span>${esc(S.roles[u.role].label)}</span></span><span class="avatar">${initial(u.name)}</span></button>
            <div class="menu" id="user-menu" hidden>
              <div style="padding:8px 12px;font-size:12px;color:var(--muted)">ورود با حساب دیگر (نمایش سطوح دسترسی)</div>
              ${S.users.filter((x) => x.active && x.id !== u.id).map((x) => `<button data-switch="${x.id}">${esc(x.name)}<br><small style="color:var(--muted)">${esc(S.roles[x.role].label)}</small></button>`).join("")}
              <hr><button id="logout" style="color:var(--bad)">خروج از حساب</button>
            </div>
          </div>
        </header>
        <main class="content" id="content" tabindex="-1"></main>
      </div></div>`;
    $("#burger").onclick = () => { $("#side").classList.add("open"); $("#scrim").classList.add("open"); };
    $("#scrim").onclick = () => { $("#side").classList.remove("open"); $("#scrim").classList.remove("open"); };
    $("#theme").onclick = () => { const t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t; store.set("taraz-theme", t); $("#theme").innerHTML = ic(t === "dark" ? "sun" : "moon"); render(); };
    const menu = $("#user-menu");
    $("#user-btn").onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; e.currentTarget.setAttribute("aria-expanded", !menu.hidden); };
    document.addEventListener("click", (e) => { if (!e.target.closest("#user-menu")) menu.hidden = true; });
    $$("[data-switch]", menu).forEach((b) => b.onclick = () => login(b.dataset.switch, true));
    $("#logout").onclick = () => { session = null; store.del(SKEY); location.hash = ""; $("#root").innerHTML = ""; render(); };
  }

  function login(id, switching) {
    session = id; store.set(SKEY, id);
    const u = me(); u.last = todayJ(true); save();
    $("#root").innerHTML = "";
    location.hash = home();
    render();
    toast(`${switching ? "حساب تغییر کرد: " : "خوش آمدید، "}${u.name}`);
  }

  function renderLogin(root) {
    document.title = "ورود | پنل مدیریت تراز";
    const demo = ["ceo", "pm", "finance", "site", "contractor", "owner"].map((un) => S.users.find((u) => u.username === un));
    root.innerHTML = `<div class="login">
      <section class="login-form">
        <a href="../index.html" style="display:flex;gap:10px;align-items:center;text-decoration:none;color:var(--ink)">${MARK}<span><b style="font-family:var(--font-display);font-size:18px;display:block;line-height:1.2">تراز</b><small style="font-size:11px;color:var(--muted)">گروه ساختمانی</small></span></a>
        <div style="display:grid;gap:6px"><h1>ورود به پنل</h1><p class="muted">مدیران، کارکنان، مالکین، خریداران و پیمانکاران از همین صفحه وارد می‌شوند. هر نقش فقط بخش‌های مجاز خود را می‌بیند.</p></div>
        <form id="login-form" novalidate style="display:grid;gap:14px">
          <label class="field"><span>نام کاربری</span><input class="input ltr" id="l-user" autocomplete="username" placeholder="pm"></label>
          <label class="field"><span>رمز عبور</span><input class="input ltr" id="l-pass" type="password" autocomplete="current-password" placeholder="demo1234"></label>
          <p class="form-error" id="l-err" hidden></p>
          <button class="btn btn-primary" type="submit">ورود</button>
        </form>
        <div class="divider">یا ورود سریع با حساب‌های نمایشی</div>
        <div class="demo-accounts">${demo.map((u) => `<button class="demo-acc" type="button" data-id="${u.id}"><b>${esc(S.roles[u.role].label)}</b><span>${esc(u.name)}</span><code>${u.username} / demo1234</code></button>`).join("")}</div>
        <p class="login-note">در نسخهٔ اصلی: رمزها با Argon2 هش می‌شوند، ورود دومرحله‌ای پیامکی فعال است و پس از ۵ تلاش ناموفق حساب ۱۵ دقیقه قفل می‌شود.</p>
      </section>
      <aside class="login-art">
        <span style="display:flex;gap:10px;align-items:center" class="brand"><span><b style="font-family:var(--font-display);font-size:14px">پنل مدیریت پروژه</b></span></span>
        <div class="art">${TArt.building(S.projects[1], { w: 600, h: 400, night: true, variant: "login" })}</div>
        <div style="display:grid;gap:8px"><h2>همهٔ کارگاه‌ها در یک صفحه</h2><p>گزارش روزانه، هزینه‌ها با گردش تأیید دومرحله‌ای، مدارک فنی و پورتال اختصاصی مشتریان و پیمانکاران.</p></div>
      </aside></div>`;
    $$(".demo-acc", root).forEach((b) => b.onclick = () => login(b.dataset.id));
    $("#login-form").onsubmit = (e) => {
      e.preventDefault();
      const un = $("#l-user").value.trim().toLowerCase(), pw = $("#l-pass").value;
      const u = S.users.find((x) => x.username === un), err = $("#l-err");
      err.hidden = false;
      if (!u || pw !== "demo1234") { err.textContent = "نام کاربری یا رمز عبور درست نیست. برای نسخهٔ نمایشی از رمز demo1234 استفاده کنید."; return; }
      if (!u.active) { err.textContent = "این حساب غیرفعال شده است. با مدیر سامانه تماس بگیرید."; return; }
      login(u.id);
    };
  }

  const denied = () => `<div class="card denied">${ic("lock", 48)}<h2 style="font-size:18px">به این بخش دسترسی ندارید</h2><p class="muted">نقش «${esc(S.roles[me().role].label)}» مجوز مشاهدهٔ این صفحه را ندارد. برای تغییر سطح دسترسی با مدیر سامانه تماس بگیرید.</p><a class="btn btn-ghost btn-sm" href="#${home()}">بازگشت</a></div>`;

  /* ——— داشبورد ——— */
  function monthlySeries() {
    const sumNow = S.expenses.filter((e) => e.status === "approved" && e.date.startsWith(monthKey())).reduce((a, e) => a + e.amount, 0);
    return S.monthly.map((m) => (m.current ? { ...m, value: m.value + sumNow } : m));
  }
  function viewDashboard(c) {
    const ps = projs(), active = ps.filter((p) => p.status === "active" || p.status === "presale");
    const avg = active.length ? active.reduce((a, p) => a + p.progress, 0) / active.length : 0;
    const exps = S.expenses.filter((e) => inScope(e.project));
    const monthSum = exps.filter((e) => e.status === "approved" && e.date.startsWith(monthKey())).reduce((a, e) => a + e.amount, 0);
    const waiting = pendingForMe(), waitingSum = waiting.reduce((a, e) => a + e.amount, 0);
    const over = ps.filter((p) => p.spent > p.budget);
    const all = me().projects.includes("*");
    c.innerHTML = `
      <div class="grid g-4">
        <a class="card kpi" href="#projects"><span>پروژه‌های فعال</span><b>${fa(active.length)} <small>از ${fa(ps.length)}</small></b><small>${fa(ps.filter((p) => p.status === "done").length)} پروژه تحویل‌شده</small></a>
        <div class="card kpi"><span>میانگین پیشرفت فیزیکی</span><b>${n(avg, 0)}٪</b>${bar(avg)}</div>
        <a class="card kpi" href="#expenses"><span>هزینهٔ تأییدشدهٔ این ماه</span><b>${moneyShort(monthSum)}</b><small>${all ? "همهٔ پروژه‌ها" : "پروژه‌های شما"} · تومان</small></a>
        <a class="card kpi ${waiting.length ? "attn" : ""}" href="#expenses"><span>منتظر تأیید شما</span><b>${fa(waiting.length)} <small>درخواست</small></b><small>${waiting.length ? "جمع " + money(waitingSum) : "موردی باقی نمانده"}</small>${waiting.length ? '<span class="pill pill-warn flag">اقدام لازم</span>' : ""}</a>
      </div>
      ${over.length ? `<div class="banner" style="background:var(--bad-soft);color:var(--bad)"><b style="color:var(--bad)">هشدار بودجه:</b> ${over.map((p) => `${esc(p.name)} (${n(((p.spent - p.budget) / p.budget) * 100, 1)}٪ فراتر از بودجه)`).join("، ")}</div>` : ""}
      <div class="grid g-21">
        <section class="card"><div class="card-head"><div><h2>منحنی S پیشرفت</h2><div class="sub">پیشرفت تجمعی واقعی در برابر برنامهٔ زمان‌بندی</div></div>
          <select class="select" id="sc-proj" style="width:auto;padding-block:6px" aria-label="انتخاب پروژه">${ps.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
          <div class="card-body" style="display:grid;gap:10px">${curveLegend}<div class="chart-scroll"><div class="chart" id="sc-chart"></div></div><div class="hint" id="sc-note"></div></div></section>
        <section class="card"><div class="card-head"><h2>منتظر تأیید</h2><a class="btn btn-ghost btn-xs" href="#expenses">همه</a></div>
          <div class="list">${waiting.length ? waiting.slice(0, 5).map((e) => `<div class="li"><div><b style="font-size:13.5px">${esc(e.title)}</b></div><b class="num" style="font-size:13px">${moneyShort(e.amount)}</b><div class="meta">${esc(P(e.project).name)} · ${expPill(e.status)}</div><div class="actions" style="grid-column:1/-1"><button class="btn btn-good btn-xs" data-ok="${e.id}">تأیید</button><button class="btn btn-ghost btn-xs" data-open="${e.id}">جزئیات</button></div></div>`).join("") : `<div class="empty-state">${ic("money", 28)}<span>درخواستی منتظر تأیید شما نیست.</span></div>`}</div></section>
      </div>
      <div class="grid g-21">
        <section class="card"><div class="card-head"><div><h2>${all ? "هزینهٔ ماهانهٔ شرکت" : "هزینه به تفکیک دسته"}</h2><div class="sub">${all ? "شش ماه اخیر · تأییدشده · تومان" : "هزینه‌های تأییدشدهٔ پروژه‌های شما"}</div></div></div>
          <div class="card-body"><div class="${all ? "chart-scroll" : ""}"><div class="${all ? "chart" : ""}" id="dash-bar"></div></div></div></section>
        <section class="card"><div class="card-head"><h2>آخرین گزارش‌های کارگاه</h2>${can("reports.view") ? '<a class="btn btn-ghost btn-xs" href="#reports">همه</a>' : ""}</div>
          <div class="list">${S.reports.filter((r) => inScope(r.project)).slice(0, 4).map((r) => `<div class="li"><div><b style="font-size:13.5px">${esc(P(r.project).name)}</b></div><span class="muted num" style="font-size:12px">${fa(r.date)}</span><div class="meta">${esc(r.done.slice(0, 80))}${r.done.length > 80 ? "…" : ""}</div></div>`).join("") || '<div class="empty-state">هنوز گزارشی ثبت نشده است.</div>'}</div></section>
      </div>
      <section class="card"><div class="card-head"><div><h2>بودجه و هزینه به تفکیک پروژه</h2><div class="sub">مقایسهٔ درصد مصرف بودجه با درصد پیشرفت فیزیکی</div></div></div>
        <div class="table-wrap"><table class="t"><thead><tr><th>پروژه</th><th>وضعیت</th><th>پیشرفت فیزیکی</th><th>مصرف بودجه</th><th class="end">هزینه / بودجه</th></tr></thead><tbody>
        ${ps.map((p) => { const u = (p.spent / p.budget) * 100; const gap = u - p.progress; return `<tr class="click" data-go="project-${p.id}"><td class="name">${esc(p.name)}<span class="sub">${esc(p.city)} · ${esc(uname(p.manager))}</span></td><td>${projPill(p)}</td><td><div class="meter">${bar(p.progress)}<b class="n">${n(p.progress)}٪</b></div></td><td><div class="meter">${bar(u, u > 100 ? "over" : "")}<b class="n" style="color:${gap > 10 ? "var(--bad)" : "inherit"}">${n(u, 0)}٪</b></div></td><td class="n end">${moneyShort(p.spent)} / ${moneyShort(p.budget)}</td></tr>`; }).join("")}
        </tbody></table></div></section>
      <section class="card"><div class="card-head"><h2>فعالیت‌های اخیر</h2><span class="sub">ثبت خودکار همهٔ اقدام‌ها (Audit log)</span></div>
        <div class="list feed">${S.activity.slice(0, 6).map(([u, t, x]) => `<div class="li"><span class="avatar">${initial(uname(u))}</span><div><b style="font-size:13px">${esc(uname(u))}</b> <span style="font-size:13px">${esc(x)}</span></div><div class="meta num">${fa(t)}</div></div>`).join("")}</div></section>`;
    const sel = $("#sc-proj", c);
    const drawCurve = () => { const p = P(sel.value); sCurveChart($("#sc-chart", c), p); const last = p.curve.filter((r) => r.actual != null).pop(); const d = p.curve[last.m].planned - last.actual; $("#sc-note", c).innerHTML = p.progress >= 100 ? "پروژه تحویل شده است." : d > 1 ? `پیشرفت واقعی <b style="color:var(--bad)">${n(d, 1)} درصد</b> از برنامه عقب است.` : "پیشرفت مطابق برنامه است."; };
    sel.onchange = drawCurve; drawCurve();
    if (all) barChart($("#dash-bar", c), monthlySeries(), (v) => moneyShort(v));
    else { const rows = SEED.categories.map((k) => ({ label: k, value: exps.filter((e) => e.category === k && e.status === "approved").reduce((a, e) => a + e.amount, 0) })).filter((r) => r.value).sort((a, b) => b.value - a.value); $("#dash-bar", c).innerHTML = hbars(rows, moneyShort); }
    bindExpenseButtons(c);
    $$("[data-go]", c).forEach((tr) => tr.onclick = () => location.hash = tr.dataset.go);
  }

  /* ——— هزینه‌ها ——— */
  function approve(e, note) {
    const high = can("expenses.approve.high");
    if (high) { e.status = "approved"; e.log.push([session, todayJ(true), "تأیید نهایی مدیرعامل" + (note ? " — " + note : "")]); }
    else if (e.amount > S.settings.threshold) { e.status = "review"; e.log.push([session, todayJ(true), "تأیید مدیر پروژه — ارجاع برای تأیید نهایی" + (note ? " — " + note : "")]); }
    else { e.status = "approved"; e.log.push([session, todayJ(true), "تأیید مدیر پروژه" + (note ? " — " + note : "")]); }
    if (e.status === "approved") P(e.project).spent += e.amount;
    log(`${e.status === "approved" ? "هزینهٔ" : "برای تأیید نهایی ارجاع داد:"} «${e.title}»${e.status === "approved" ? " را تأیید کرد" : ""}`);
    save();
    toast(e.status === "approved" ? "هزینه تأیید شد." : "تأیید شد و برای تأیید نهایی مدیرعامل ارسال شد.");
  }
  function reject(e, note) {
    e.status = "rejected"; e.log.push([session, todayJ(true), "رد شد — " + note]);
    log(`هزینهٔ «${e.title}» را رد کرد`); save(); toast("درخواست رد شد و به ثبت‌کننده اطلاع داده شد.");
  }
  function bindExpenseButtons(c) {
    $$("[data-ok]", c).forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); approve(S.expenses.find((x) => x.id === b.dataset.ok)); render(); });
    $$("[data-open]", c).forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); expenseDrawer(S.expenses.find((x) => x.id === b.dataset.open)); });
  }
  function expenseDrawer(e) {
    const p = P(e.project), act = canAct(e), big = e.amount > S.settings.threshold;
    const waitStep = e.status === "pending" ? (big ? "در انتظار تأیید مدیر پروژه، سپس تأیید نهایی مدیرعامل" : "در انتظار تأیید مدیر پروژه") : e.status === "review" ? "در انتظار تأیید نهایی مدیرعامل" : "";
    modal({
      title: "جزئیات درخواست هزینه", drawer: true,
      body: `<div style="display:flex;justify-content:space-between;gap:10px;align-items:start;flex-wrap:wrap"><h3 style="font-size:17px;max-width:32ch">${esc(e.title)}</h3>${expPill(e.status)}</div>
        <div style="font-family:var(--font-display);font-size:26px;font-weight:800" class="num">${money(e.amount)}</div>
        ${big ? `<p class="hint warn">این مبلغ از سقف ${money(S.settings.threshold)} بیشتر است و به تأیید دومرحله‌ای (مدیر پروژه و مدیرعامل) نیاز دارد.</p>` : ""}
        <dl class="dl"><dt>پروژه</dt><dd>${esc(p.name)}</dd><dt>دسته</dt><dd>${esc(e.category)}</dd><dt>فروشنده / طرف حساب</dt><dd>${esc(e.vendor)}</dd><dt>تاریخ</dt><dd class="num">${fa(e.date)}</dd><dt>ثبت‌کننده</dt><dd>${esc(uname(e.by))}</dd><dt>شناسه</dt><dd class="mono">${e.id.toUpperCase()}</dd></dl>
        <div><h4 style="font-size:14px;margin-bottom:12px">گردش تأیید</h4><div class="timeline-s">
          ${e.log.map(([u, t, x]) => `<div class="${x.startsWith("رد") ? "no" : "ok"}">${esc(x)}<small>${esc(uname(u))} · <span class="num">${fa(t)}</span></small></div>`).join("")}
          ${waitStep ? `<div class="wait">${waitStep}</div>` : ""}</div></div>
        ${act ? `<label class="field"><span>یادداشت (برای رد کردن الزامی است)</span><textarea class="textarea" id="ex-note" style="min-height:70px" placeholder="مثلاً: فاکتور رسمی پیوست شود"></textarea></label><p class="form-error" id="ex-err" hidden>برای رد کردن درخواست، دلیل را بنویسید.</p>` : ""}`,
      foot: act ? `<button class="btn btn-bad btn-sm" id="ex-rej">رد درخواست</button><button class="btn btn-good btn-sm" id="ex-ok">${can("expenses.approve.high") ? "تأیید نهایی" : big ? "تأیید و ارجاع به مدیرعامل" : "تأیید"}</button>` : `<button class="btn btn-ghost btn-sm" data-close>بستن</button>`,
      onMount: (ov, close) => {
        if (!act) return;
        $("#ex-ok", ov).onclick = () => { approve(e, $("#ex-note", ov).value.trim()); close(); render(); };
        $("#ex-rej", ov).onclick = () => { const note = $("#ex-note", ov).value.trim(); if (!note) { $("#ex-err", ov).hidden = false; $("#ex-note", ov).focus(); return; } reject(e, note); close(); render(); };
      },
    });
  }
  function expenseForm(preset = {}) {
    const ps = projs();
    modal({
      title: "ثبت درخواست هزینه",
      body: `<div class="fgrid">
        <label class="field full"><span>شرح هزینه</span><input class="input" id="nf-title" placeholder="مثلاً خرید ۲۰ تن سیمان تیپ ۲" value="${esc(preset.title || "")}"></label>
        <label class="field"><span>پروژه</span><select class="select" id="nf-proj">${ps.map((p) => `<option value="${p.id}" ${preset.project === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>
        <label class="field"><span>دسته</span><select class="select" id="nf-cat">${SEED.categories.map((k) => `<option ${preset.category === k ? "selected" : ""}>${k}</option>`).join("")}</select></label>
        <label class="field"><span>مبلغ (میلیون تومان)</span><input class="input ltr" id="nf-amount" inputmode="decimal" placeholder="350"></label>
        <label class="field"><span>فروشنده / طرف حساب</span><input class="input" id="nf-vendor" value="${esc(preset.vendor || "")}"></label>
        <label class="field full"><span>پیوست فاکتور</span><input class="input" type="file" id="nf-file" accept="image/*,.pdf"></label>
        <p class="hint full" id="nf-hint">درخواست‌های تا سقف ${money(S.settings.threshold)} با تأیید مدیر پروژه پرداخت می‌شوند.</p>
        <p class="form-error full" id="nf-err" hidden></p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="nf-save">ثبت و ارسال برای تأیید</button>`,
      onMount: (ov, close) => {
        const amt = $("#nf-amount", ov), hint = $("#nf-hint", ov);
        amt.oninput = () => { const v = parseFloat(amt.value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))); const big = v > S.settings.threshold; hint.className = "hint full" + (big ? " warn" : ""); hint.textContent = isNaN(v) ? `درخواست‌های تا سقف ${money(S.settings.threshold)} با تأیید مدیر پروژه پرداخت می‌شوند.` : `${money(v)} — ${big ? "هزینهٔ مهم: پس از مدیر پروژه، تأیید نهایی مدیرعامل لازم است." : "با تأیید مدیر پروژه پرداخت می‌شود."}`; };
        $("#nf-save", ov).onclick = () => {
          const title = $("#nf-title", ov).value.trim(), v = parseFloat(amt.value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))), err = $("#nf-err", ov);
          if (title.length < 4) { err.hidden = false; err.textContent = "شرح هزینه را بنویسید."; return; }
          if (!(v > 0)) { err.hidden = false; err.textContent = "مبلغ را به عدد و به میلیون تومان وارد کنید."; return; }
          const e = { id: "e" + Date.now().toString().slice(-6), project: $("#nf-proj", ov).value, date: todayJ(), title, category: $("#nf-cat", ov).value, amount: v, vendor: $("#nf-vendor", ov).value.trim() || "—", by: session, status: "pending", log: [[session, todayJ(true), "ثبت درخواست" + ($("#nf-file", ov).files[0] ? " (با پیوست فاکتور)" : "")]] };
          S.expenses.unshift(e); log(`درخواست هزینهٔ «${title}» را ثبت کرد`); save(); close(); render(); toast("درخواست ثبت شد و برای تأیید ارسال شد.");
        };
      },
    });
  }
  function viewExpenses(c, arg) {
    const st = { tab: arg || (pendingForMe().length ? "mine" : "all"), proj: "all", cat: "all", q: "" };
    const base = () => S.expenses.filter((e) => inScope(e.project));
    const tabs = [["mine", "منتظر تأیید من", (e) => canAct(e)], ["all", "همه", () => true], ["pending", "منتظر مدیر پروژه", (e) => e.status === "pending"], ["review", "منتظر تأیید نهایی", (e) => e.status === "review"], ["approved", "تأییدشده", (e) => e.status === "approved"], ["rejected", "ردشده", (e) => e.status === "rejected"]].filter((t) => t[0] !== "mine" || can("expenses.approve"));
    c.innerHTML = `<div class="banner">${ic("money")}<span><b>گردش تأیید:</b> هزینه‌های تا ${money(S.settings.threshold)} با تأیید مدیر پروژه و هزینه‌های بالاتر پس از آن با تأیید نهایی مدیرعامل پرداخت می‌شوند.</span></div>
      <section class="card"><div class="tabs" id="ex-tabs" role="tablist"></div>
        <div class="card-body toolbar">
          <select class="select" id="ex-proj" aria-label="پروژه"><option value="all">همهٔ پروژه‌ها</option>${projs().map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select>
          <select class="select" id="ex-cat" aria-label="دسته"><option value="all">همهٔ دسته‌ها</option>${SEED.categories.map((k) => `<option>${k}</option>`).join("")}</select>
          <input class="input" id="ex-q" type="search" placeholder="جست‌وجو در شرح یا فروشنده" aria-label="جست‌وجو">
          <span class="grow"></span>
          ${can("expenses.create") ? `<button class="btn btn-primary btn-sm" id="ex-new">${ic("plus", 16)}ثبت هزینه</button>` : ""}
        </div>
        <div class="table-wrap"><table class="t"><thead><tr><th>شرح</th><th>پروژه</th><th>دسته</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead><tbody id="ex-body"></tbody></table></div>
        <div class="card-body" id="ex-sum" style="border-top:1px solid var(--line);display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:13px"></div></section>`;
    const draw = () => {
      $("#ex-tabs", c).innerHTML = tabs.map(([k, t, f]) => `<button class="tab" role="tab" data-t="${k}" aria-selected="${st.tab === k}">${t}<span class="c">${fa(base().filter(f).length)}</span></button>`).join("");
      $$("#ex-tabs .tab", c).forEach((b) => b.onclick = () => { st.tab = b.dataset.t; draw(); });
      const f = tabs.find((t) => t[0] === st.tab)?.[2] || (() => true);
      const rows = base().filter(f).filter((e) => (st.proj === "all" || e.project === st.proj) && (st.cat === "all" || e.category === st.cat) && (!st.q || (e.title + e.vendor).includes(st.q)));
      $("#ex-body", c).innerHTML = rows.length ? rows.map((e) => `<tr class="click" data-id="${e.id}"><td class="name">${esc(e.title)}<span class="sub">${esc(e.vendor)}</span></td><td>${esc(P(e.project).name)}</td><td>${esc(e.category)}</td><td class="n">${fa(e.date)}</td><td class="n"><b>${moneyShort(e.amount)}</b>${e.amount > S.settings.threshold ? ' <span class="pill pill-mute" title="بالاتر از سقف — تأیید دومرحله‌ای">مهم</span>' : ""}</td><td>${expPill(e.status)}</td><td class="end">${canAct(e) ? `<button class="btn btn-good btn-xs" data-ok="${e.id}">تأیید</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="7"><div class="empty-state">${st.tab === "mine" ? "همهٔ درخواست‌ها بررسی شده‌اند. موردی منتظر تأیید شما نیست." : "درخواستی با این فیلترها پیدا نشد."}</div></td></tr>`;
      $("#ex-sum", c).innerHTML = `<span class="muted">${fa(rows.length)} ردیف</span><span>جمع: <b class="num">${money(rows.reduce((a, e) => a + e.amount, 0))}</b></span>`;
      $$("#ex-body tr[data-id]", c).forEach((tr) => tr.onclick = () => expenseDrawer(S.expenses.find((x) => x.id === tr.dataset.id)));
      bindExpenseButtons(c);
    };
    $("#ex-proj", c).onchange = (e) => { st.proj = e.target.value; draw(); };
    $("#ex-cat", c).onchange = (e) => { st.cat = e.target.value; draw(); };
    $("#ex-q", c).oninput = (e) => { st.q = e.target.value.trim(); draw(); };
    if ($("#ex-new", c)) $("#ex-new", c).onclick = () => expenseForm();
    draw();
  }

  /* ——— پروژه‌ها ——— */
  function viewProjects(c) {
    c.innerHTML = `<section class="card"><div class="card-head"><div><h2>فهرست پروژه‌ها</h2><div class="sub">${fa(projs().length)} پروژه در دسترس شما</div></div>${can("projects.edit") ? `<button class="btn btn-primary btn-sm" id="pr-new">${ic("plus", 16)}پروژهٔ جدید</button>` : ""}</div>
      <div class="table-wrap"><table class="t"><thead><tr><th>پروژه</th><th>نوع</th><th>وضعیت</th><th>پیشرفت</th><th>طبقات / واحد</th><th>مدیر پروژه</th><th class="end">بودجه</th></tr></thead><tbody>
      ${projs().map((p) => `<tr class="click" data-go="project-${p.id}"><td class="name"><div style="display:flex;gap:12px;align-items:center"><span style="width:56px;height:38px;border-radius:5px;overflow:hidden;flex:none;display:block">${TArt.building(p, { w: 120, h: 80, annotate: false, variant: "t" })}</span><span>${esc(p.name)}<span class="sub">${esc(p.city)}، ${esc(p.district)}</span></span></div></td><td>${esc(p.type)}</td><td>${projPill(p)}</td><td><div class="meter">${bar(p.progress)}<b class="n">${n(p.progress)}٪</b></div></td><td class="n">${fa(p.floors)} / ${fa(p.units)}</td><td>${esc(uname(p.manager))}</td><td class="n end">${moneyShort(p.budget)}</td></tr>`).join("")}
      </tbody></table></div></section>`;
    $$("[data-go]", c).forEach((tr) => tr.onclick = () => location.hash = tr.dataset.go);
    if ($("#pr-new", c)) $("#pr-new", c).onclick = () => projectForm();
  }
  function projectForm(p) {
    const edit = !!p; p = p || { name: "", type: "مسکونی", city: "", district: "", status: "design", floors: 5, basements: 1, units: 10, land: 500, area: 3000, budget: 100000, start: todayJ(), end: "", manager: "u2", summary: "" };
    const pms = S.users.filter((u) => u.role === "pm" || u.role === "admin");
    modal({
      title: edit ? "ویرایش پروژه" : "تعریف پروژهٔ جدید",
      body: `<div class="fgrid">
        <label class="field full"><span>نام پروژه</span><input class="input" id="pf-name" value="${esc(p.name)}" placeholder="مثلاً مجتمع مسکونی افرا"></label>
        <label class="field"><span>نوع کاربری</span><select class="select" id="pf-type">${["مسکونی", "اداری", "تجاری", "اداری و تجاری", "ویلایی"].map((x) => `<option ${p.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
        <label class="field"><span>وضعیت</span><select class="select" id="pf-status">${Object.entries(statusLabel).map(([k, v]) => `<option value="${k}" ${p.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
        <label class="field"><span>شهر</span><input class="input" id="pf-city" value="${esc(p.city)}"></label>
        <label class="field"><span>محله</span><input class="input" id="pf-district" value="${esc(p.district)}"></label>
        <label class="field"><span>تعداد طبقات</span><input class="input ltr" id="pf-floors" type="number" min="1" value="${p.floors}"></label>
        <label class="field"><span>تعداد واحد</span><input class="input ltr" id="pf-units" type="number" min="1" value="${p.units}"></label>
        <label class="field"><span>زیربنا (مترمربع)</span><input class="input ltr" id="pf-area" type="number" value="${p.area}"></label>
        <label class="field"><span>بودجهٔ مصوب (میلیون تومان)</span><input class="input ltr" id="pf-budget" type="number" value="${p.budget}"></label>
        <label class="field"><span>تاریخ شروع</span><input class="input ltr" id="pf-start" value="${esc(p.start)}" placeholder="1405/08/01"></label>
        <label class="field"><span>تحویل برنامه‌ریزی‌شده</span><input class="input ltr" id="pf-end" value="${esc(p.end)}" placeholder="1408/06/31"></label>
        <label class="field full"><span>مدیر پروژه</span><select class="select" id="pf-manager">${pms.map((u) => `<option value="${u.id}" ${p.manager === u.id ? "selected" : ""}>${esc(u.name)}</option>`).join("")}</select></label>
        <label class="field full"><span>توضیح کوتاه (نمایش در سایت)</span><textarea class="textarea" id="pf-summary" style="min-height:70px">${esc(p.summary)}</textarea></label>
        <p class="form-error full" id="pf-err" hidden>نام پروژه و شهر را وارد کنید.</p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="pf-save">${edit ? "ذخیرهٔ تغییرات" : "ایجاد پروژه"}</button>`,
      onMount: (ov, close) => {
        $("#pf-save", ov).onclick = () => {
          const v = (id) => $("#pf-" + id, ov).value.trim();
          if (!v("name") || !v("city")) { $("#pf-err", ov).hidden = false; return; }
          const data = { name: v("name"), type: v("type"), status: v("status"), city: v("city"), district: v("district"), floors: +v("floors") || 1, units: +v("units") || 1, area: +v("area") || 0, budget: +v("budget") || 0, start: v("start"), end: v("end"), manager: v("manager"), summary: v("summary") };
          if (edit) { Object.assign(p, data); log(`مشخصات پروژهٔ «${p.name}» را ویرایش کرد`); }
          else {
            const id = "p" + Date.now().toString().slice(-5);
            const np = { id, slug: id, ...data, basements: 1, land: Math.round(data.area / 4), spent: 0, progress: 0, art: data.type === "ویلایی" ? "villa" : data.floors > 16 ? "tower" : data.type.includes("اداری") ? "commercial" : "midrise", hue: 200, features: [], months: 30, lag: 0 };
            np.phases = SEED.projects[0].phases.map((f) => ({ name: f.name, pct: 0 })); np.curve = Array.from({ length: 31 }, (_, m) => ({ m, planned: (100 / (1 + Math.exp(-10 * (m / 30 - 0.5)))), actual: m === 0 ? 0 : undefined }));
            S.projects.push(np); me().projects.includes("*") || me().projects.push(id); log(`پروژهٔ «${data.name}» را تعریف کرد`);
          }
          save(); close(); render(); toast(edit ? "تغییرات ذخیره شد." : "پروژه ایجاد شد.");
        };
      },
    });
  }
  function viewProject(c, id) {
    const p = P(id); if (!p) { c.innerHTML = denied(); return; }
    const st = { tab: "overview" };
    c.innerHTML = `<section class="card card-body"><div class="proj-head"><div class="thumb">${TArt.building(p, { w: 360, h: 240, variant: "h" })}</div>
      <div style="display:grid;gap:10px;min-width:0"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${projPill(p)}<span class="muted" style="font-size:13px">${esc(p.type)} · ${esc(p.city)}، ${esc(p.district)} · مدیر پروژه: ${esc(uname(p.manager))}</span></div>
      <div class="meter" style="max-width:420px">${bar(p.progress)}<b class="n" style="font-size:18px">${n(p.progress)}٪</b></div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px"><span>بودجه: <b class="num">${money(p.budget)}</b></span><span>هزینه‌شده: <b class="num">${money(p.spent)}</b></span><span>تحویل: <b class="num">${fa(p.end || "—")}</b></span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${can("projects.edit") ? `<button class="btn btn-ghost btn-sm" id="pj-edit">ویرایش مشخصات</button>` : ""}${can("reports.create") ? `<button class="btn btn-ghost btn-sm" id="pj-rep">ثبت گزارش روزانه</button>` : ""}${can("expenses.create") ? `<button class="btn btn-ghost btn-sm" id="pj-exp">ثبت هزینه</button>` : ""}<a class="btn btn-ghost btn-sm" href="../project.html#${p.slug}" target="_blank" rel="noopener">صفحهٔ عمومی پروژه</a></div></div></div></section>
      <section class="card"><div class="tabs" id="pj-tabs" role="tablist"></div><div id="pj-body"></div></section>`;
    const tabs = [["overview", "نمای کلی"], ["reports", "گزارش‌ها"], ["expenses", "هزینه‌ها"], ["docs", "مدارک"], ["people", "ذی‌نفعان"]].filter(([k]) => k === "overview" || (k === "reports" && can("reports.view")) || (k === "expenses" && can("expenses.view")) || (k === "docs" && can("documents.view")) || (k === "people" && can("people.view")));
    const draw = () => {
      $("#pj-tabs", c).innerHTML = tabs.map(([k, t]) => `<button class="tab" role="tab" aria-selected="${st.tab === k}" data-t="${k}">${t}</button>`).join("");
      $$("#pj-tabs .tab", c).forEach((b) => b.onclick = () => { st.tab = b.dataset.t; draw(); });
      const body = $("#pj-body", c);
      if (st.tab === "overview") {
        const editable = can("projects.edit");
        body.innerHTML = `<div class="grid g-2" style="padding:18px">
          <div style="display:grid;gap:10px;min-width:0;align-content:start"><h3 style="font-size:15px">منحنی S</h3>${curveLegend}<div class="chart-scroll"><div class="chart" id="pj-curve"></div></div></div>
          <div style="display:grid;gap:4px;min-width:0;align-content:start"><h3 style="font-size:15px;margin-bottom:6px">پیشرفت مراحل ${editable ? '<span class="hint">(قابل ویرایش)</span>' : ""}</h3>
            ${p.phases.map((f, i) => `<div class="range-row"><span>${esc(f.name)}</span>${editable ? `<input type="range" min="0" max="100" step="5" value="${f.pct}" data-ph="${i}" aria-label="${esc(f.name)}">` : bar(f.pct)}<b data-phv="${i}">${n(f.pct)}٪</b></div>`).join("")}
            ${editable ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap"><span class="hint">پیشرفت کل به‌صورت وزنی از مراحل محاسبه می‌شود: <b id="pj-total" class="num">${n(p.progress)}٪</b></span><button class="btn btn-primary btn-sm" id="pj-save">ذخیرهٔ پیشرفت</button></div>` : ""}
          </div></div>`;
        sCurveChart($("#pj-curve", body), p);
        if (editable) {
          const W = [6, 9, 8, 22, 15, 16, 18, 6];
          const calc = () => Math.round($$("[data-ph]", body).reduce((a, r) => a + (r.value / 100) * W[r.dataset.ph], 0));
          $$("[data-ph]", body).forEach((r) => r.oninput = () => { $(`[data-phv="${r.dataset.ph}"]`, body).textContent = n(r.value) + "٪"; $("#pj-total", body).textContent = n(calc()) + "٪"; });
          $("#pj-save", body).onclick = () => {
            $$("[data-ph]", body).forEach((r) => p.phases[r.dataset.ph].pct = +r.value);
            const old = p.progress; p.progress = calc();
            const last = p.curve.filter((r) => r.actual != null).pop(); if (last) last.actual = p.progress;
            if (p.progress >= 100) p.status = "done";
            log(`پیشرفت «${p.name}» را از ${fa(old)}٪ به ${fa(p.progress)}٪ تغییر داد`); save(); render(); toast("پیشرفت پروژه به‌روز شد و در سایت عمومی هم نمایش داده می‌شود.");
          };
        }
      } else if (st.tab === "reports") {
        const rs = S.reports.filter((r) => r.project === p.id);
        body.innerHTML = rs.length ? rs.map(reportItem).join("") : `<div class="empty-state">برای این پروژه هنوز گزارشی ثبت نشده است.</div>`;
      } else if (st.tab === "expenses") {
        const es = S.expenses.filter((e) => e.project === p.id);
        body.innerHTML = `<div class="table-wrap"><table class="t"><thead><tr><th>شرح</th><th>دسته</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>${es.map((e) => `<tr class="click" data-id="${e.id}"><td class="name">${esc(e.title)}<span class="sub">${esc(e.vendor)}</span></td><td>${esc(e.category)}</td><td class="n">${fa(e.date)}</td><td class="n">${moneyShort(e.amount)}</td><td>${expPill(e.status)}</td></tr>`).join("") || `<tr><td colspan="5"><div class="empty-state">هزینه‌ای ثبت نشده است.</div></td></tr>`}</tbody></table></div>`;
        $$("tr[data-id]", body).forEach((tr) => tr.onclick = () => expenseDrawer(S.expenses.find((x) => x.id === tr.dataset.id)));
      } else if (st.tab === "docs") {
        body.innerHTML = docTable(S.documents.filter((d) => d.project === p.id), false);
      } else {
        const ppl = S.people.filter((x) => x.project === p.id);
        body.innerHTML = peopleTable(ppl);
      }
    };
    draw();
    if ($("#pj-edit", c)) $("#pj-edit", c).onclick = () => projectForm(p);
    if ($("#pj-rep", c)) $("#pj-rep", c).onclick = () => reportForm(p.id);
    if ($("#pj-exp", c)) $("#pj-exp", c).onclick = () => expenseForm({ project: p.id });
  }

  /* ——— گزارش روزانه ——— */
  function photoThumbs(r) {
    const p = P(r.project);
    if (r.photoData?.length) return r.photoData.map((src) => `<div class="ph"><img src="${src}" alt="عکس کارگاه"></div>`).join("");
    return Array.from({ length: Math.min(r.photos, 6) }, (_, i) => `<div class="ph">${TArt.building(p, { w: 160, h: 160, variant: r.id + i, night: i % 3 === 2, annotate: false })}</div>`).join("") + (r.photos > 6 ? `<div class="ph" style="display:grid;place-items:center;font-size:12px;font-weight:700;color:var(--muted);text-align:center">${fa(r.photos - 6)} عکس دیگر</div>` : "");
  }
  const reportItem = (r) => `<article class="report"><div class="report-head"><b>${esc(P(r.project).name)}</b><span class="pill pill-mute num">${fa(r.date)}</span></div>
    <div class="report-meta"><span>ثبت: ${esc(uname(r.by))}</span><span>هوا: ${esc(r.weather)}</span><span>نیروی کار: <b class="num">${fa(r.workers)}</b> نفر</span><span>پیشرفت امروز: <b class="num" dir="ltr">+${n(r.progress, 1)}٪</b></span></div>
    <p><b>کارهای انجام‌شده</b>${esc(r.done)}</p>${r.issues && r.issues !== "—" ? `<p><b>مشکلات</b><span style="color:var(--warn)">${esc(r.issues)}</span></p>` : ""}<p><b>برنامهٔ فردا</b>${esc(r.next)}</p>
    <div class="photos">${photoThumbs(r)}</div></article>`;
  function viewReports(c) {
    const st = { proj: "all" };
    c.innerHTML = `<section class="card"><div class="card-head"><div><h2>گزارش‌های روزانهٔ کارگاه</h2><div class="sub">هر روز توسط سرپرست کارگاه یا مدیر پروژه ثبت می‌شود</div></div>
      <div class="toolbar"><select class="select" id="rp-proj" aria-label="پروژه"><option value="all">همهٔ پروژه‌ها</option>${projs().map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select>${can("reports.create") ? `<button class="btn btn-primary btn-sm" id="rp-new">${ic("plus", 16)}ثبت گزارش امروز</button>` : ""}</div></div><div id="rp-list"></div></section>`;
    const draw = () => { const rs = S.reports.filter((r) => inScope(r.project) && (st.proj === "all" || r.project === st.proj)); $("#rp-list", c).innerHTML = rs.length ? rs.map(reportItem).join("") : `<div class="empty-state">${ic("report", 28)}<span>گزارشی ثبت نشده است.</span></div>`; };
    $("#rp-proj", c).onchange = (e) => { st.proj = e.target.value; draw(); };
    if ($("#rp-new", c)) $("#rp-new", c).onclick = () => reportForm();
    draw();
  }
  function resizeImage(file) {
    return new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => { const img = new Image(); img.onload = () => { const k = 240 / Math.max(img.width, img.height); const cv = document.createElement("canvas"); cv.width = img.width * k; cv.height = img.height * k; cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); res(cv.toDataURL("image/jpeg", 0.7)); }; img.onerror = () => res(null); img.src = fr.result; };
      fr.onerror = () => res(null); fr.readAsDataURL(file);
    });
  }
  function reportForm(pid) {
    const photos = [];
    modal({
      title: "ثبت گزارش روزانه",
      body: `<div class="fgrid">
        <label class="field"><span>پروژه</span><select class="select" id="rf-proj">${projs().filter((p) => p.status !== "done").map((p) => `<option value="${p.id}" ${p.id === pid ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>
        <label class="field"><span>تاریخ</span><input class="input ltr" id="rf-date" value="${todayJ()}"></label>
        <label class="field"><span>وضعیت هوا</span><select class="select" id="rf-weather"><option>آفتابی</option><option>نیمه‌ابری</option><option>ابری</option><option>بارانی</option><option>برفی</option></select></label>
        <label class="field"><span>تعداد نیروی کار</span><input class="input ltr" id="rf-workers" type="number" min="0" value="40"></label>
        <label class="field full"><span>کارهای انجام‌شده</span><textarea class="textarea" id="rf-done" placeholder="مثلاً: قالب‌بندی و آرماتوربندی سقف طبقهٔ ۵"></textarea></label>
        <label class="field full"><span>مشکلات و موانع</span><input class="input" id="rf-issues" placeholder="اختیاری"></label>
        <label class="field full"><span>برنامهٔ روز بعد</span><input class="input" id="rf-next"></label>
        <div class="field full"><span>عکس‌های کارگاه</span><label class="dropzone" id="rf-drop">${ic("upload", 24)}<span>عکس‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید (حداکثر ۶ عکس)</span><input type="file" id="rf-files" accept="image/*" multiple hidden></label><div class="photos" id="rf-prev" style="margin-top:8px"></div></div>
        <p class="form-error full" id="rf-err" hidden>شرح کارهای انجام‌شده را بنویسید.</p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="rf-save">ثبت گزارش</button>`,
      onMount: (ov, close) => {
        const add = async (files) => { for (const f of [...files].slice(0, 6 - photos.length)) { const d = await resizeImage(f); if (d) photos.push(d); } $("#rf-prev", ov).innerHTML = photos.map((s) => `<div class="ph"><img src="${s}" alt=""></div>`).join(""); };
        $("#rf-files", ov).onchange = (e) => add(e.target.files);
        const dz = $("#rf-drop", ov);
        dz.ondragover = (e) => { e.preventDefault(); dz.classList.add("over"); }; dz.ondragleave = () => dz.classList.remove("over");
        dz.ondrop = (e) => { e.preventDefault(); dz.classList.remove("over"); add(e.dataTransfer.files); };
        $("#rf-save", ov).onclick = () => {
          const done = $("#rf-done", ov).value.trim(); if (done.length < 5) { $("#rf-err", ov).hidden = false; return; }
          const r = { id: "r" + Date.now().toString().slice(-6), project: $("#rf-proj", ov).value, date: $("#rf-date", ov).value, by: session, weather: $("#rf-weather", ov).value, workers: +$("#rf-workers", ov).value || 0, progress: 0.2, done, issues: $("#rf-issues", ov).value.trim() || "—", next: $("#rf-next", ov).value.trim() || "—", photos: photos.length, photoData: photos };
          S.reports.unshift(r); log(`گزارش روزانهٔ «${P(r.project).name}» را ثبت کرد`); save(); close(); render(); toast("گزارش ثبت شد و برای مالکین پروژه قابل مشاهده است.");
        };
      },
    });
  }

  /* ——— مدارک ——— */
  const DOC_C = { pdf: ["var(--bad-soft)", "var(--bad)"], dwg: ["var(--info-soft)", "var(--info)"], xlsx: ["var(--good-soft)", "var(--good)"], docx: ["var(--info-soft)", "var(--info)"], jpg: ["var(--warn-soft)", "var(--warn)"], png: ["var(--warn-soft)", "var(--warn)"] };
  function docTable(docs, showProject = true) {
    if (!docs.length) return `<div class="empty-state">${ic("doc", 28)}<span>مدرکی پیدا نشد.</span></div>`;
    return `<div class="table-wrap"><table class="t"><thead><tr><th>نام فایل</th>${showProject ? "<th>پروژه</th>" : ""}<th>نوع مدرک</th><th>حجم</th><th>بارگذاری</th><th></th></tr></thead><tbody>
      ${docs.map((d) => { const ext = d.name.split(".").pop().toLowerCase(), [bg, fg] = DOC_C[ext] || ["var(--surface-2)", "var(--muted)"]; return `<tr><td><div class="doc-name"><span class="doc-ic" style="background:${bg};color:${fg}">${ext.toUpperCase()}</span><span class="name">${esc(d.name)}</span></div></td>${showProject ? `<td>${esc(P(d.project)?.name || "—")}</td>` : ""}<td>${esc(d.kind)}</td><td class="n mono" dir="ltr" style="text-align:right">${esc(d.size)}</td><td><span>${esc(uname(d.by))}</span><span class="sub num" style="display:block;font-size:12px;color:var(--muted)">${fa(d.date)}</span></td><td class="end"><button class="btn btn-ghost btn-xs" data-dl="${d.id}">دریافت</button></td></tr>`; }).join("")}
      </tbody></table></div>`;
  }
  function viewDocuments(c) {
    const kinds = ["نقشه", "قرارداد", "پروانه و مجوز", "صورت‌وضعیت", "صورتجلسه", "آزمایش و کنترل کیفیت", "بیمه", "عکس"];
    const st = { proj: "all", kind: "all" };
    c.innerHTML = `<section class="card"><div class="card-head"><div><h2>تصاویر و مدارک پروژه</h2><div class="sub">نقشه، قرارداد، مجوز، صورت‌وضعیت و گزارش آزمایش‌ها با کنترل دسترسی</div></div>
      <div class="toolbar"><select class="select" id="dc-proj" aria-label="پروژه"><option value="all">همهٔ پروژه‌ها</option>${projs().map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select>
      <select class="select" id="dc-kind" aria-label="نوع"><option value="all">همهٔ انواع</option>${kinds.map((k) => `<option>${k}</option>`).join("")}</select>
      ${can("documents.upload") ? `<button class="btn btn-primary btn-sm" id="dc-up">${ic("upload", 16)}بارگذاری</button>` : ""}</div></div><div id="dc-list"></div></section>`;
    const draw = () => {
      $("#dc-list", c).innerHTML = docTable(S.documents.filter((d) => inScope(d.project) && (st.proj === "all" || d.project === st.proj) && (st.kind === "all" || d.kind === st.kind)));
      $$("[data-dl]", c).forEach((b) => b.onclick = () => toast("در نسخهٔ نمایشی فایل واقعی وجود ندارد؛ در نسخهٔ اصلی دانلود با لینک امضاشده و زمان‌دار انجام می‌شود."));
    };
    $("#dc-proj", c).onchange = (e) => { st.proj = e.target.value; draw(); };
    $("#dc-kind", c).onchange = (e) => { st.kind = e.target.value; draw(); };
    if ($("#dc-up", c)) $("#dc-up", c).onclick = () => modal({
      title: "بارگذاری مدرک",
      body: `<div class="fgrid"><label class="field"><span>پروژه</span><select class="select" id="du-proj">${projs().map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label>
        <label class="field"><span>نوع مدرک</span><select class="select" id="du-kind">${kinds.map((k) => `<option>${k}</option>`).join("")}</select></label>
        <label class="field full"><span>فایل</span><input class="input" type="file" id="du-file" multiple></label>
        <label class="field full" style="display:flex;gap:10px;align-items:center;grid-template-columns:none"><input type="checkbox" id="du-client" class="switch"><span>برای مالکین و خریداران این پروژه قابل مشاهده باشد</span></label>
        <p class="form-error full" id="du-err" hidden>یک فایل انتخاب کنید.</p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="du-save">بارگذاری</button>`,
      onMount: (ov, close) => { $("#du-save", ov).onclick = () => {
        const files = $("#du-file", ov).files; if (!files.length) { $("#du-err", ov).hidden = false; return; }
        [...files].forEach((f) => { const kb = f.size / 1024; S.documents.unshift({ id: "d" + Date.now() + Math.random().toString(36).slice(2, 5), project: $("#du-proj", ov).value, name: f.name, kind: $("#du-kind", ov).value, size: kb > 1024 ? (kb / 1024).toFixed(1) + "MB" : Math.max(1, Math.round(kb)) + "KB", by: session, date: todayJ(), shared: $("#du-client", ov).checked }); });
        log(`${fa(files.length)} مدرک بارگذاری کرد`); save(); close(); render(); toast("مدارک بارگذاری شد.");
      }; },
    });
    draw();
  }

  /* ——— اشخاص ——— */
  const KIND = { buyer: "خریدار", owner: "مالک / شریک", contractor: "پیمانکار" };
  function peopleTable(rows) {
    if (!rows.length) return `<div class="empty-state">موردی ثبت نشده است.</div>`;
    return `<div class="table-wrap"><table class="t"><thead><tr><th>نام</th><th>نقش</th><th>پروژه</th><th>شرح</th><th>تماس</th><th>مبلغ قرارداد</th><th>پرداخت / وصول</th></tr></thead><tbody>
      ${rows.map((x) => { const pct = x.contract ? (x.paid / x.contract) * 100 : 0; return `<tr><td class="name">${esc(x.name)}</td><td><span class="pill ${x.kind === "buyer" ? "pill-info" : x.kind === "owner" ? "pill-mute" : "pill-warn"}">${KIND[x.kind]}</span></td><td>${esc(P(x.project)?.name || "—")}</td><td>${esc(x.unit)}</td><td class="n" dir="ltr" style="text-align:right">${fa(x.phone)}</td><td class="n">${x.contract ? moneyShort(x.contract) : "—"}</td><td>${x.contract ? `<div class="meter">${bar(pct)}<b class="n">${n(pct)}٪</b></div>` : '<span class="muted">مشارکتی</span>'}</td></tr>`; }).join("")}
      </tbody></table></div>`;
  }
  function viewPeople(c) {
    const st = { kind: "buyer" };
    const tabs = [["buyer", "مشتریان و خریداران"], ["owner", "مالکین و شرکا"], ["contractor", "پیمانکاران"]];
    c.innerHTML = `<section class="card"><div class="tabs" id="pp-tabs" role="tablist"></div><div class="card-body toolbar"><input class="input" id="pp-q" type="search" placeholder="جست‌وجوی نام" aria-label="جست‌وجو"><span class="grow"></span>${can("people.edit") ? `<button class="btn btn-primary btn-sm" id="pp-new">${ic("plus", 16)}افزودن</button>` : ""}</div><div id="pp-list"></div></section>`;
    let q = "";
    const draw = () => {
      const base = S.people.filter((x) => inScope(x.project));
      $("#pp-tabs", c).innerHTML = tabs.map(([k, t]) => `<button class="tab" role="tab" data-k="${k}" aria-selected="${st.kind === k}">${t}<span class="c">${fa(base.filter((x) => x.kind === k).length)}</span></button>`).join("");
      $$("#pp-tabs .tab", c).forEach((b) => b.onclick = () => { st.kind = b.dataset.k; draw(); });
      $("#pp-list", c).innerHTML = peopleTable(base.filter((x) => x.kind === st.kind && (!q || x.name.includes(q))));
    };
    $("#pp-q", c).oninput = (e) => { q = e.target.value.trim(); draw(); };
    if ($("#pp-new", c)) $("#pp-new", c).onclick = () => modal({
      title: "افزودن شخص",
      body: `<div class="fgrid"><label class="field full"><span>نام کامل یا نام شرکت</span><input class="input" id="np-name"></label>
        <label class="field"><span>نقش</span><select class="select" id="np-kind">${Object.entries(KIND).map(([k, v]) => `<option value="${k}" ${k === st.kind ? "selected" : ""}>${v}</option>`).join("")}</select></label>
        <label class="field"><span>پروژه</span><select class="select" id="np-proj">${projs().map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label>
        <label class="field"><span>شمارهٔ تماس</span><input class="input ltr" id="np-phone" inputmode="tel"></label>
        <label class="field"><span>مبلغ قرارداد (میلیون تومان)</span><input class="input ltr" id="np-contract" type="number" value="0"></label>
        <label class="field full"><span>شرح (واحد، سهم یا موضوع قرارداد)</span><input class="input" id="np-unit"></label>
        <label class="field full" style="display:flex;gap:10px;align-items:center;grid-template-columns:none"><input type="checkbox" id="np-acc" class="switch" checked><span>ساخت حساب پورتال و ارسال رمز یک‌بار مصرف با پیامک</span></label>
        <p class="form-error full" id="np-err" hidden>نام را وارد کنید.</p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="np-save">ذخیره</button>`,
      onMount: (ov, close) => { $("#np-save", ov).onclick = () => {
        const name = $("#np-name", ov).value.trim(); if (!name) { $("#np-err", ov).hidden = false; return; }
        S.people.push({ id: "x" + Date.now().toString().slice(-6), kind: $("#np-kind", ov).value, name, phone: $("#np-phone", ov).value.trim() || "—", project: $("#np-proj", ov).value, unit: $("#np-unit", ov).value.trim() || "—", contract: +$("#np-contract", ov).value || 0, paid: 0 });
        log(`«${name}» را به فهرست ${KIND[$("#np-kind", ov).value]}ها افزود`); save(); close(); st.kind = $("#np-kind", ov).value; draw(); toast("ذخیره شد.");
      }; },
    });
    draw();
  }

  /* ——— گزارش‌گیری ——— */
  function viewAnalytics(c) {
    const st = { proj: "all", status: "approved" };
    c.innerHTML = `<section class="card"><div class="card-body toolbar">
        <select class="select" id="an-proj" aria-label="پروژه"><option value="all">همهٔ پروژه‌ها</option>${projs().map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select>
        <select class="select" id="an-status" aria-label="وضعیت"><option value="approved">فقط تأییدشده</option><option value="open">در جریان تأیید</option><option value="all">همهٔ درخواست‌ها</option></select>
        <span class="grow"></span><button class="btn btn-ghost btn-sm" id="an-copy">کپی جدول</button><button class="btn btn-dark btn-sm" id="an-csv">خروجی اکسل (CSV)</button></div></section>
      <div class="grid g-4" id="an-kpis"></div>
      <div class="grid g-2"><section class="card"><div class="card-head"><h2>هزینه به تفکیک دسته</h2><span class="sub">تومان</span></div><div class="card-body" id="an-cat"></div></section>
        <section class="card"><div class="card-head"><h2>هزینه به تفکیک پروژه</h2><span class="sub">تومان</span></div><div class="card-body" id="an-proj-bars"></div></section></div>
      <section class="card"><div class="card-head"><h2>پیش‌نمایش گزارش</h2><span class="sub" id="an-count"></span></div><div class="table-wrap" id="an-table"></div></section>`;
    let rows = [];
    const draw = () => {
      rows = S.expenses.filter((e) => inScope(e.project) && (st.proj === "all" || e.project === st.proj) && (st.status === "all" || (st.status === "approved" ? e.status === "approved" : e.status === "pending" || e.status === "review")));
      const sum = rows.reduce((a, e) => a + e.amount, 0);
      const ps = projs().filter((p) => st.proj === "all" || p.id === st.proj);
      const budget = ps.reduce((a, p) => a + p.budget, 0), spent = ps.reduce((a, p) => a + p.spent, 0);
      $("#an-kpis", c).innerHTML = `<div class="card kpi"><span>جمع مبالغ انتخاب‌شده</span><b>${moneyShort(sum)}</b><small>${fa(rows.length)} درخواست</small></div>
        <div class="card kpi"><span>بودجهٔ مصوب</span><b>${moneyShort(budget)}</b><small>${fa(ps.length)} پروژه</small></div>
        <div class="card kpi"><span>هزینهٔ تجمعی</span><b>${moneyShort(spent)}</b>${bar((spent / budget) * 100)}</div>
        <div class="card kpi"><span>باقی‌ماندهٔ بودجه</span><b style="color:${budget - spent < 0 ? "var(--bad)" : "inherit"}">${moneyShort(budget - spent)}</b><small>${n(((budget - spent) / budget) * 100, 1)}٪ از بودجه</small></div>`;
      $("#an-cat", c).innerHTML = hbars(SEED.categories.map((k) => ({ label: k, value: rows.filter((e) => e.category === k).reduce((a, e) => a + e.amount, 0) })).filter((r) => r.value).sort((a, b) => b.value - a.value), moneyShort) || `<div class="empty-state">داده‌ای نیست.</div>`;
      $("#an-proj-bars", c).innerHTML = hbars(ps.map((p) => ({ label: p.name, value: rows.filter((e) => e.project === p.id).reduce((a, e) => a + e.amount, 0) })).filter((r) => r.value).sort((a, b) => b.value - a.value), moneyShort) || `<div class="empty-state">داده‌ای نیست.</div>`;
      $("#an-count", c).textContent = `${fa(rows.length)} ردیف`;
      $("#an-table", c).innerHTML = `<table class="t"><thead><tr><th>تاریخ</th><th>پروژه</th><th>شرح</th><th>دسته</th><th>فروشنده</th><th>مبلغ (میلیون تومان)</th><th>وضعیت</th></tr></thead><tbody>${rows.map((e) => `<tr><td class="n">${fa(e.date)}</td><td>${esc(P(e.project).name)}</td><td>${esc(e.title)}</td><td>${esc(e.category)}</td><td>${esc(e.vendor)}</td><td class="n">${n(e.amount)}</td><td>${expPill(e.status)}</td></tr>`).join("")}</tbody></table>`;
    };
    const csv = () => "﻿" + [["تاریخ", "پروژه", "شرح", "دسته", "فروشنده", "مبلغ (میلیون تومان)", "وضعیت"], ...rows.map((e) => [e.date, P(e.project).name, e.title, e.category, e.vendor, e.amount, EXP[e.status][0]])].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    $("#an-proj", c).onchange = (e) => { st.proj = e.target.value; draw(); };
    $("#an-status", c).onchange = (e) => { st.status = e.target.value; draw(); };
    $("#an-csv", c).onclick = () => { try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv()], { type: "text/csv;charset=utf-8" })); a.download = `taraz-expenses-${todayJ().replace(/\//g, "-")}.csv`; document.body.appendChild(a); a.click(); a.remove(); toast("فایل CSV ساخته شد."); } catch (e) { toast("دانلود در این محیط مجاز نیست؛ از «کپی جدول» استفاده کنید."); } };
    $("#an-copy", c).onclick = () => { const txt = csv().slice(1).replace(/","/g, "\t").replace(/^"|"$/gm, ""); navigator.clipboard?.writeText(txt).then(() => toast("جدول کپی شد؛ در اکسل Paste کنید."), () => toast("کپی انجام نشد؛ جدول را دستی انتخاب کنید.")); };
    draw();
  }

  /* ——— کاربران و نقش‌ها ——— */
  function viewUsers(c) {
    const roleKeys = Object.keys(S.roles);
    c.innerHTML = `<section class="card"><div class="card-head"><div><h2>کاربران</h2><div class="sub">${fa(S.users.length)} حساب · محدودهٔ دسترسی هر کاربر به پروژه‌ها جداگانه تعیین می‌شود</div></div><button class="btn btn-primary btn-sm" id="us-new">${ic("plus", 16)}کاربر جدید</button></div>
      <div class="table-wrap"><table class="t"><thead><tr><th>کاربر</th><th>نقش</th><th>پروژه‌های مجاز</th><th>آخرین ورود</th><th>فعال</th></tr></thead><tbody>
      ${S.users.map((u) => `<tr><td class="name">${esc(u.name)}<span class="sub mono" dir="ltr" style="text-align:right">${esc(u.username)}</span></td>
        <td><select class="select" data-role="${u.id}" style="padding-block:6px;min-width:150px" ${u.id === session ? "disabled title='نقش خودتان را نمی‌توانید تغییر دهید'" : ""} aria-label="نقش">${roleKeys.map((r) => `<option value="${r}" ${u.role === r ? "selected" : ""}>${esc(S.roles[r].label)}</option>`).join("")}</select></td>
        <td style="font-size:12.5px">${u.projects.includes("*") ? '<span class="pill pill-info">همهٔ پروژه‌ها</span>' : u.projects.map((id) => esc(P(id)?.name || id)).join("، ")}</td>
        <td class="n" style="font-size:12.5px">${fa(u.last)}</td><td><input type="checkbox" class="switch" data-active="${u.id}" ${u.active ? "checked" : ""} ${u.id === session ? "disabled" : ""} aria-label="فعال بودن حساب"></td></tr>`).join("")}
      </tbody></table></div></section>
      <section class="card"><div class="card-head"><div><h2>ماتریس دسترسی نقش‌ها</h2><div class="sub">تغییرات بلافاصله اعمال می‌شود. با «ورود با حساب دیگر» از منوی کاربر، نتیجه را ببینید.</div></div></div>
      <div class="table-wrap"><table class="t perm-table"><thead><tr><th>مجوز</th>${roleKeys.map((r) => `<th>${esc(S.roles[r].label)}</th>`).join("")}</tr></thead><tbody>
      ${SEED.permissions.map((p) => `<tr><td>${esc(p.label)}<span class="sub mono" dir="ltr" style="text-align:right">${p.key}</span></td>${roleKeys.map((r) => `<td><input type="checkbox" data-perm="${p.key}" data-r="${r}" ${S.roles[r].perms.includes(p.key) ? "checked" : ""} ${r === "admin" && p.key === "users.manage" ? "disabled title='برای جلوگیری از قفل‌شدن سامانه'" : ""} aria-label="${esc(p.label)} برای ${esc(S.roles[r].label)}"></td>`).join("")}</tr>`).join("")}
      </tbody></table></div></section>`;
    $$("[data-role]", c).forEach((s) => s.onchange = () => { const u = S.users.find((x) => x.id === s.dataset.role); u.role = s.value; log(`نقش «${u.name}» را به «${S.roles[s.value].label}» تغییر داد`); save(); toast("نقش کاربر تغییر کرد."); });
    $$("[data-active]", c).forEach((s) => s.onchange = () => { const u = S.users.find((x) => x.id === s.dataset.active); u.active = s.checked; log(`حساب «${u.name}» را ${s.checked ? "فعال" : "غیرفعال"} کرد`); save(); toast(s.checked ? "حساب فعال شد." : "حساب غیرفعال شد؛ این کاربر دیگر نمی‌تواند وارد شود."); });
    $$("[data-perm]", c).forEach((x) => x.onchange = () => { const r = S.roles[x.dataset.r]; r.perms = x.checked ? [...new Set([...r.perms, x.dataset.perm])] : r.perms.filter((k) => k !== x.dataset.perm); log(`مجوز «${x.dataset.perm}» را برای نقش «${r.label}» ${x.checked ? "فعال" : "غیرفعال"} کرد`); save(); render(); });
    $("#us-new", c).onclick = () => modal({
      title: "کاربر جدید",
      body: `<div class="fgrid"><label class="field full"><span>نام کامل</span><input class="input" id="nu-name"></label>
        <label class="field"><span>نام کاربری</span><input class="input ltr" id="nu-user"></label>
        <label class="field"><span>نقش</span><select class="select" id="nu-role">${roleKeys.map((r) => `<option value="${r}">${esc(S.roles[r].label)}</option>`).join("")}</select></label>
        <div class="field full"><span>پروژه‌های مجاز</span><div style="display:flex;flex-wrap:wrap;gap:8px 18px">${S.projects.map((p) => `<label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" value="${p.id}" class="nu-p">${esc(p.name)}</label>`).join("")}</div></div>
        <p class="hint full">رمز موقت با پیامک ارسال می‌شود و کاربر در اولین ورود باید آن را تغییر دهد. (در دمو رمز همه demo1234 است.)</p>
        <p class="form-error full" id="nu-err" hidden></p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="nu-save">ایجاد کاربر</button>`,
      onMount: (ov, close) => { $("#nu-save", ov).onclick = () => {
        const name = $("#nu-name", ov).value.trim(), un = $("#nu-user", ov).value.trim().toLowerCase(), err = $("#nu-err", ov);
        if (!name || !/^[a-z0-9_.]{3,}$/.test(un)) { err.hidden = false; err.textContent = "نام و نام کاربری لاتین (حداقل ۳ حرف) را وارد کنید."; return; }
        if (S.users.some((u) => u.username === un)) { err.hidden = false; err.textContent = "این نام کاربری قبلاً ثبت شده است."; return; }
        const role = $("#nu-role", ov).value, ps = $$(".nu-p:checked", ov).map((x) => x.value);
        S.users.push({ id: "u" + Date.now().toString().slice(-5), name, username: un, role, title: S.roles[role].label, projects: role === "admin" || role === "finance" ? ["*"] : ps, active: true, last: "—" });
        log(`کاربر «${name}» را با نقش «${S.roles[role].label}» ایجاد کرد`); save(); close(); render(); toast("کاربر ایجاد شد.");
      }; },
    });
  }

  /* ——— تنظیمات ——— */
  function viewSettings(c) {
    c.innerHTML = `<section class="card"><div class="card-head"><h2>قواعد گردش کار</h2></div><div class="card-body" style="display:grid;gap:16px;max-width:560px">
        <label class="field"><span>سقف تأیید مدیر پروژه (میلیون تومان)</span><input class="input ltr" id="st-th" type="number" min="0" value="${S.settings.threshold}"><span class="hint">هزینه‌های بالاتر از این مبلغ «هزینهٔ مهم» محسوب می‌شوند و تأیید نهایی مدیرعامل لازم دارند.</span></label>
        <label class="field"><span>نام شرکت</span><input class="input" id="st-co" value="${esc(S.settings.company)}"></label>
        <div><button class="btn btn-primary btn-sm" id="st-save">ذخیرهٔ تنظیمات</button></div></div></section>
      <section class="card"><div class="card-head"><h2>امنیت (در نسخهٔ اصلی)</h2></div><div class="card-body"><ul style="margin:0;padding-inline-start:18px;display:grid;gap:6px;font-size:13.5px;color:var(--ink-2)">
        <li>ورود دومرحله‌ای با رمز یک‌بار مصرف پیامکی برای نقش‌های مدیریتی</li><li>قفل حساب پس از ۵ تلاش ناموفق و ثبت IP و دستگاه در گزارش فعالیت</li>
        <li>بررسی مجوز در سمت سرور برای هر درخواست API و محدودسازی داده به پروژه‌های مجاز کاربر</li><li>نگهداری فایل‌ها در فضای ذخیره‌سازی خصوصی با لینک دانلود امضاشده و زمان‌دار</li>
        <li>پشتیبان‌گیری خودکار روزانه از پایگاه داده</li></ul></div></section>
      <section class="card"><div class="card-head"><h2>دادهٔ نمایشی</h2></div><div class="card-body" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="muted" style="font-size:13px">همهٔ تغییرات شما در این مرورگر ذخیره شده است. با بازنشانی، داده‌های نمونهٔ اولیه برمی‌گردد.</span><button class="btn btn-bad btn-sm" id="st-reset">بازنشانی دادهٔ نمایشی</button></div></section>`;
    $("#st-save", c).onclick = () => { S.settings.threshold = Math.max(0, +$("#st-th", c).value || 0); S.settings.company = $("#st-co", c).value.trim() || S.settings.company; log(`سقف تأیید را ${money(S.settings.threshold)} تعیین کرد`); save(); toast("تنظیمات ذخیره شد."); };
    $("#st-reset", c).onclick = () => confirmBox("همهٔ پروژه‌ها، هزینه‌ها، گزارش‌ها و کاربرانی که در این مرورگر اضافه یا ویرایش کرده‌اید پاک می‌شود. ادامه می‌دهید؟", "بله، بازنشانی کن", () => { S = clone(SEED); save(); render(); toast("دادهٔ نمایشی بازنشانی شد."); });
  }

  /* ——— پورتال مالک / خریدار / پیمانکار ——— */
  function viewPortal(c) {
    const u = me(), person = S.people.find((x) => x.id === u.personId), p = P(person?.project || u.projects[0]);
    if (!p) { c.innerHTML = `<div class="card empty-state">پروژه‌ای به حساب شما متصل نیست.</div>`; return; }
    const reports = S.reports.filter((r) => r.project === p.id).slice(0, 3);
    const docs = S.documents.filter((d) => d.project === p.id && (u.role === "contractor" ? ["نقشه", "قرارداد", "صورت‌وضعیت"].includes(d.kind) : ["پروانه و مجوز", "قرارداد", "صورتجلسه"].includes(d.kind) || d.shared));
    const phaseNow = p.phases.find((f) => f.pct < 100);
    const head = `<section class="card card-body"><div class="proj-head"><div class="thumb">${TArt.building(p, { w: 360, h: 240, variant: "portal" })}</div><div style="display:grid;gap:10px;min-width:0">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${projPill(p)}<span class="muted" style="font-size:13px">${esc(p.name)} · ${esc(p.city)}، ${esc(p.district)}</span></div>
      <h2 style="font-size:20px">${esc(person?.unit || p.name)}</h2>
      <div class="meter" style="max-width:420px">${bar(p.progress)}<b class="n" style="font-size:18px">${n(p.progress)}٪</b></div>
      <span class="muted" style="font-size:13px">${p.progress >= 100 ? "پروژه تحویل شده است." : `مرحلهٔ فعلی: ${esc(phaseNow.name)} · تحویل برنامه‌ریزی‌شده ${fa(p.end)}`}</span></div></div></section>`;
    let money_ = "";
    if (u.role === "client" && person) {
      const sch = person.schedule || [], next = sch.find((s) => !s[3]);
      money_ = `<div class="grid g-4"><div class="card kpi"><span>مبلغ قرارداد</span><b>${moneyShort(person.contract)}</b><small>تومان</small></div><div class="card kpi"><span>پرداخت‌شده</span><b>${moneyShort(person.paid)}</b>${bar((person.paid / person.contract) * 100)}</div><div class="card kpi"><span>مانده</span><b>${moneyShort(person.contract - person.paid)}</b><small>تومان</small></div><div class="card kpi ${next ? "attn" : ""}"><span>قسط بعدی</span><b class="num">${next ? fa(next[1]) : "—"}</b><small>${next ? esc(next[0]) + " · " + money(next[2]) : "همهٔ اقساط پرداخت شده"}</small></div></div>
        <section class="card"><div class="card-head"><h2>برنامهٔ پرداخت اقساط</h2><span class="sub">اقساط به نقاط کنترل پیشرفت پروژه گره خورده‌اند</span></div><div class="table-wrap"><table class="t"><thead><tr><th>مرحله</th><th>موعد</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>${sch.map((s) => `<tr><td class="name">${esc(s[0])}</td><td class="n">${fa(s[1])}</td><td class="n">${money(s[2])}</td><td>${s[3] ? '<span class="pill pill-good">پرداخت شد</span>' : s === next ? '<span class="pill pill-warn">قسط بعدی</span>' : '<span class="pill pill-mute">آینده</span>'}</td></tr>`).join("")}</tbody></table></div></section>`;
    }
    if (u.role === "contractor" && person) {
      money_ = `<div class="grid g-4"><div class="card kpi"><span>مبلغ قرارداد</span><b>${moneyShort(person.contract)}</b><small>${esc(person.unit)}</small></div><div class="card kpi"><span>دریافت‌شده</span><b>${moneyShort(person.paid)}</b>${bar((person.paid / person.contract) * 100)}</div><div class="card kpi"><span>مانده قرارداد</span><b>${moneyShort(person.contract - person.paid)}</b><small>تومان</small></div><div class="card kpi"><span>صورت‌وضعیت‌ها</span><b>${fa((person.statements || []).length)}</b><small>ثبت‌شده</small></div></div>
        <section class="card"><div class="card-head"><h2>صورت‌وضعیت‌ها</h2><button class="btn btn-primary btn-sm" id="pt-st">${ic("upload", 16)}ارسال صورت‌وضعیت جدید</button></div><div class="table-wrap"><table class="t"><thead><tr><th>عنوان</th><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>
        ${(person.statements || []).map((s) => `<tr><td class="name">${esc(s[0])}</td><td class="n">${fa(s[1])}</td><td class="n">${money(s[2])}</td><td><span class="pill ${s[3] === "پرداخت شد" ? "pill-good" : "pill-warn"}">${esc(s[3])}</span></td></tr>`).join("")}</tbody></table></div></section>`;
    }
    c.innerHTML = head + money_ + `<div class="grid g-2"><section class="card"><div class="card-head"><h2>آخرین گزارش‌های کارگاه</h2></div>${reports.map(reportItem).join("") || '<div class="empty-state">گزارشی منتشر نشده است.</div>'}</section>
      <div style="display:grid;gap:20px;align-content:start"><section class="card"><div class="card-head"><h2>مدارک من</h2></div>${docTable(docs, false)}</section>
      <section class="card"><div class="card-head"><h2>پیام به مدیر پروژه</h2><span class="sub">${esc(uname(p.manager))}</span></div><div class="card-body" style="display:grid;gap:10px"><textarea class="textarea" id="pt-msg" placeholder="سؤال یا درخواست خود را بنویسید…" aria-label="متن پیام"></textarea><div><button class="btn btn-dark btn-sm" id="pt-send">ارسال پیام</button></div></div></section></div></div>`;
    $$("[data-dl]", c).forEach((b) => b.onclick = () => toast("در نسخهٔ اصلی فایل با لینک امن دانلود می‌شود."));
    $("#pt-send", c).onclick = () => { const m = $("#pt-msg", c).value.trim(); if (m.length < 3) { toast("متن پیام را بنویسید."); return; } log(`برای مدیر پروژهٔ «${p.name}» پیام فرستاد`); save(); $("#pt-msg", c).value = ""; toast("پیام شما برای مدیر پروژه ثبت شد."); };
    if ($("#pt-st", c)) $("#pt-st", c).onclick = () => modal({
      title: "ارسال صورت‌وضعیت",
      body: `<div class="fgrid"><label class="field full"><span>عنوان</span><input class="input" id="sv-title" value="صورت‌وضعیت ${fa((person.statements || []).length + 5)}"></label><label class="field"><span>مبلغ (میلیون تومان)</span><input class="input ltr" id="sv-amt" type="number" min="1"></label><label class="field"><span>فایل صورت‌وضعیت</span><input class="input" type="file" id="sv-file"></label><p class="form-error full" id="sv-err" hidden>مبلغ را وارد کنید.</p></div>`,
      foot: `<button class="btn btn-ghost btn-sm" data-close>انصراف</button><button class="btn btn-primary btn-sm" id="sv-save">ارسال برای بررسی</button>`,
      onMount: (ov, close) => { $("#sv-save", ov).onclick = () => {
        const amt = +$("#sv-amt", ov).value; if (!(amt > 0)) { $("#sv-err", ov).hidden = false; return; }
        const title = $("#sv-title", ov).value.trim() || "صورت‌وضعیت";
        person.statements = [...(person.statements || []), [title, todayJ(), amt, "در انتظار بررسی"]];
        S.expenses.unshift({ id: "e" + Date.now().toString().slice(-6), project: p.id, date: todayJ(), title: `${title} – ${person.name}`, category: "پیمانکار جزء", amount: amt, vendor: person.name, by: session, status: "pending", log: [[session, todayJ(true), "ارسال صورت‌وضعیت توسط پیمانکار"]] });
        log(`${title} را برای «${p.name}» ارسال کرد`); save(); close(); render(); toast("صورت‌وضعیت ارسال شد و در صف تأیید مدیر پروژه قرار گرفت.");
      }; },
    });
  }

  const VIEWS = { dashboard: viewDashboard, projects: viewProjects, project: viewProject, reports: viewReports, expenses: viewExpenses, documents: viewDocuments, people: viewPeople, analytics: viewAnalytics, users: viewUsers, settings: viewSettings, portal: viewPortal };
  window.addEventListener("hashchange", render);
  render();
})();
