/* اسکریپت وب‌سایت عمومی */
(function () {
  const D = window.TARAZ_SEED, { fa, n, money, esc, statusLabel, statusPill } = window.T;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const root = document.body.dataset.root || "";

  const ICON = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };
  const MARK = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="8" fill="var(--ink)"/><path d="M9 27h22" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round"/><path d="M14 13h12l-6 9z" fill="none" stroke="var(--bg)" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 22v5" stroke="var(--bg)" stroke-width="2.4"/></svg>`;

  /* پوسته */
  function applyTheme(t) {
    if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
    const btn = $("#theme-btn"); if (btn) btn.innerHTML = isDark() ? ICON.sun : ICON.moon;
  }
  const isDark = () => document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  applyTheme(T.store.get("taraz-theme", null));

  function header() {
    const links = [["index.html", "home", "خانه"], ["projects.html", "projects", "پروژه‌ها"], ["about.html", "about", "دربارهٔ ما"], ["contact.html", "contact", "تماس با ما"]];
    const el = $("#site-header"); if (!el) return;
    el.className = "site-header";
    el.innerHTML = `<div class="wrap">
      <a class="brand" href="${root}index.html" aria-label="صفحهٔ اصلی گروه ساختمانی تراز">${MARK}<span><b>تراز</b><small>گروه ساختمانی</small></span></a>
      <nav class="nav" id="nav" aria-label="منوی اصلی">${links.map(([h, k, t]) => `<a href="${root}${h}" ${k === page || (page === "project" && k === "projects") ? 'aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
      <div class="header-actions">
        <button class="icon-btn" id="theme-btn" type="button" aria-label="تغییر حالت روشن و تاریک"></button>
        <a class="btn btn-dark btn-sm btn-panel" href="${root}panel/index.html">${ICON.lock.replace("<svg", '<svg width="16" height="16"')}<span>ورود به پنل</span></a>
        <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="باز کردن منو" aria-expanded="false" aria-controls="nav">${ICON.menu}</button>
      </div></div>`;
    $("#menu-btn").onclick = (e) => { const o = $("#nav").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", o); };
    $("#theme-btn").onclick = () => { const t = isDark() ? "light" : "dark"; T.store.set("taraz-theme", t); applyTheme(t); };
    applyTheme(document.documentElement.dataset.theme);
  }

  function footer() {
    const el = $("#site-footer"); if (!el) return;
    el.className = "site-footer";
    el.innerHTML = `<div class="wrap"><div class="footer-grid">
      <div><a class="brand" href="${root}index.html">${MARK}<span><b>تراز</b><small>گروه ساختمانی</small></span></a>
        <p>طراحی، اجرا و مدیریت پروژه‌های مسکونی، اداری و تجاری با گزارش‌دهی شفاف به مالکین و خریداران.</p></div>
      <div><h4>پروژه‌ها</h4><ul>${D.projects.slice(0, 4).map((p) => `<li><a href="${root}project.html#${p.slug}">${esc(p.name)}</a></li>`).join("")}</ul></div>
      <div><h4>دسترسی سریع</h4><ul><li><a href="${root}about.html">دربارهٔ ما</a></li><li><a href="${root}projects.html">همهٔ پروژه‌ها</a></li><li><a href="${root}contact.html">درخواست مشاوره</a></li><li><a href="${root}panel/index.html">پورتال مالکین و پیمانکاران</a></li></ul></div>
      <div><h4>دفتر مرکزی</h4><ul><li>تهران، خیابان ولیعصر، بالاتر از پارک ملت، برج ۲۴، طبقهٔ ۹</li><li class="num">۰۲۱-۹۱۰۰۲۴۰۰</li><li class="mono" dir="ltr" style="text-align:right">info@taraz-group.ir</li></ul></div>
    </div><div class="footer-bottom"><span>© ${fa(1405)} گروه ساختمانی تراز. تمام حقوق محفوظ است.</span><span>نسخهٔ نمایشی · نام برند، پروژه‌ها و داده‌ها ساختگی است</span></div></div>`;
  }

  /* اجزای مشترک */
  function card(p) {
    return `<a class="pcard" href="${root}project.html#${p.slug}">
      <div class="art">${TArt.building(p, { w: 480, h: 320 })}<span class="pill ${statusPill[p.status]}">${statusLabel[p.status]}</span></div>
      <div class="body">
        <h3>${esc(p.name)}</h3>
        <div class="loc">${ICON.pin}${esc(p.city)}، ${esc(p.district)} · ${esc(p.type)}</div>
        <div class="prog-row"><span class="muted">پیشرفت</span><div class="progress ${p.progress >= 100 ? "is-done" : ""}" style="--v:${p.progress}" role="progressbar" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="درصد پیشرفت"><span></span></div><b>${n(p.progress)}٪</b></div>
        <div class="specs"><div>طبقات<b>${n(p.floors)}</b></div><div>واحد<b>${n(p.units)}</b></div><div>زیربنا (م²)<b>${n(p.area)}</b></div></div>
      </div></a>`;
  }

  function ring(v, size = 104) {
    const r = 44, c = 2 * Math.PI * r, off = c * (1 - v / 100);
    return `<svg class="ring" viewBox="0 0 104 104" width="${size}" height="${size}" role="img" aria-label="${v} درصد پیشرفت">
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="var(--line)" stroke-width="9"/>
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="${v >= 100 ? "var(--good)" : "var(--accent)"}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 52 52)"/>
      <text x="52" y="60" text-anchor="middle" font-size="24" fill="var(--ink)">${n(v)}٪</text></svg>`;
  }

  /* صفحهٔ اصلی */
  function home() {
    const p = D.projects[0];
    $("#hero-art").innerHTML = TArt.building(p, { w: 600, h: 400, night: true, variant: "hero" });
    $("#hero-chip-v").textContent = n(p.progress) + "٪";
    $("#hero-chip-bar").style.setProperty("--v", p.progress);
    $("#featured").innerHTML = D.projects.filter((x) => x.status !== "done").slice(0, 3).map(card).join("");
  }

  /* فهرست پروژه‌ها */
  function projects() {
    const state = { status: "all", city: "all", q: "" };
    const cities = [...new Set(D.projects.map((p) => p.city))];
    $("#f-city").innerHTML = `<option value="all">همهٔ شهرها</option>` + cities.map((c) => `<option>${esc(c)}</option>`).join("");
    const draw = () => {
      const list = D.projects.filter((p) => (state.status === "all" || p.status === state.status) && (state.city === "all" || p.city === state.city) && (!state.q || (p.name + p.district + p.type).includes(state.q)));
      $("#list").innerHTML = list.length ? list.map(card).join("") : `<div class="empty" style="grid-column:1/-1">پروژه‌ای با این فیلترها پیدا نشد. فیلترها را تغییر دهید.</div>`;
      $("#count").textContent = `${n(list.length)} پروژه`;
    };
    $$("#f-status .chip").forEach((b) => b.onclick = () => { $$("#f-status .chip").forEach((x) => x.setAttribute("aria-pressed", x === b)); state.status = b.dataset.v; draw(); });
    $("#f-city").onchange = (e) => { state.city = e.target.value; draw(); };
    $("#f-q").oninput = (e) => { state.q = e.target.value.trim(); draw(); };
    draw();
  }

  /* جزئیات پروژه */
  function project() {
    const show = () => {
      const slug = location.hash.slice(1);
      const p = D.projects.find((x) => x.slug === slug) || D.projects[0];
      document.title = `${p.name} | گروه ساختمانی تراز`;
      $("#p-name").textContent = p.name;
      $("#p-crumb").textContent = p.name;
      $("#p-sub").textContent = `${p.type} · ${p.city}، ${p.district}`;
      const views = [{ night: false, variant: "a", label: "نمای روز" }, { night: true, variant: "b", label: "نمای شب" }, { night: false, variant: "c", zoom: true, label: "نمای نزدیک" }, { night: true, variant: "d", zoom: true, label: "نمای نزدیک شب" }];
      $("#g-main").innerHTML = TArt.building(p, { w: 720, h: 480, ...views[0] });
      $("#g-thumbs").innerHTML = views.map((v, i) => `<button type="button" aria-label="${v.label}" aria-pressed="${i === 0}" data-i="${i}">${TArt.building(p, { w: 240, h: 160, ...v, annotate: false })}</button>`).join("");
      $$("#g-thumbs button").forEach((b) => b.onclick = () => { $$("#g-thumbs button").forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#g-main").innerHTML = TArt.building(p, { w: 720, h: 480, ...views[b.dataset.i] }); });
      const phaseNow = p.phases.find((f) => f.pct < 100);
      $("#p-summary").innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><span class="pill ${statusPill[p.status]}">${statusLabel[p.status]}</span><span class="muted" style="font-size:13px">آخرین به‌روزرسانی: <span class="num">${fa(D.TODAY)}</span></span></div>
        <div class="big-progress">${ring(p.progress)}<div><h2 style="font-size:20px">${p.progress >= 100 ? "پروژه تحویل شده است" : "مرحلهٔ فعلی: " + esc(phaseNow.name)}</h2><p class="muted" style="font-size:14px;margin-top:4px">${esc(p.summary)}</p></div></div>
        <div class="kv">
          <div>تعداد طبقات<b>${n(p.floors)} طبقه + ${n(p.basements)} زیرزمین</b></div><div>تعداد واحد<b>${n(p.units)}</b></div>
          <div>مساحت زمین<b>${n(p.land)} م²</b></div><div>زیربنای کل<b>${n(p.area)} م²</b></div>
          <div>شروع عملیات<b>${fa(p.start)}</b></div><div>${p.status === "done" ? "تاریخ تحویل" : "تحویل برنامه‌ریزی‌شده"}<b>${fa(p.end)}</b></div>
        </div>
        <a class="btn btn-primary" href="contact.html">درخواست مشاوره و بازدید</a>`;
      $("#p-phases").innerHTML = p.phases.map((f) => `<div class="phase"><span>${esc(f.name)}</span><div class="progress ${f.pct >= 100 ? "is-done" : ""}" style="--v:${f.pct}" role="progressbar" aria-valuenow="${f.pct}" aria-label="${esc(f.name)}"><span></span></div><b>${n(f.pct)}٪</b></div>`).join("");
      $("#p-features").innerHTML = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
      $("#p-map").innerHTML = mapArt(p);
      $("#p-addr").textContent = `${p.city}، ${p.district}`;
      $("#p-maplink").href = `https://www.google.com/maps/search/${encodeURIComponent(p.city + " " + p.district)}`;
      $("#p-more").innerHTML = D.projects.filter((x) => x.id !== p.id).slice(0, 3).map(card).join("");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", show);
    show();
  }

  function mapArt(p) {
    let s = `<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="نقشهٔ موقعیت ${esc(p.name)}"><rect width="640" height="360" fill="var(--surface-2)"/>`;
    for (let i = 0; i < 12; i++) s += `<line x1="${i * 60 - 40}" y1="0" x2="${i * 60 + 80}" y2="360" stroke="var(--line)" stroke-width="${i % 4 ? 6 : 14}"/>`;
    for (let i = 0; i < 7; i++) s += `<line x1="0" y1="${i * 60 + 20}" x2="640" y2="${i * 60 - 10}" stroke="var(--line)" stroke-width="${i % 3 ? 5 : 12}"/>`;
    s += `<path d="M0 260 C 160 220 260 300 400 250 S 600 180 640 200" fill="none" stroke="var(--line-strong)" stroke-width="20" opacity=".6"/>`;
    s += `<rect x="440" y="40" width="120" height="80" rx="10" fill="hsl(130 30% 50% / .25)"/>`;
    s += `<circle cx="320" cy="170" r="46" fill="var(--accent)" opacity=".16"/><circle cx="320" cy="170" r="12" fill="var(--accent)" stroke="var(--surface)" stroke-width="4"/></svg>`;
    return s;
  }

  /* تماس */
  function contact() {
    const f = $("#contact-form");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$(".form-error", f).forEach((x) => x.remove());
      const need = (id, test, msg) => { const el = $("#" + id, f); if (!test(el.value.trim())) { ok = false; el.insertAdjacentHTML("afterend", `<span class="form-error">${msg}</span>`); el.setAttribute("aria-invalid", "true"); } else el.removeAttribute("aria-invalid"); };
      need("c-name", (v) => v.length >= 3, "نام و نام خانوادگی را کامل بنویسید.");
      need("c-phone", (v) => /^(\+98|0)?9\d{9}$/.test(v.replace(/[\s-]/g, "").replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))), "شمارهٔ موبایل را به شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد کنید.");
      need("c-msg", (v) => v.length >= 10, "توضیح کوتاهی دربارهٔ درخواست‌تان بنویسید (حداقل ۱۰ حرف).");
      if (!ok) return;
      const name = $("#c-name").value.trim();
      f.hidden = true;
      $("#contact-done").hidden = false;
      $("#contact-done-name").textContent = name;
      $("#contact-done-code").textContent = fa("TRZ-" + (1405071400 + Math.floor(Math.random() * 99)));
    });
    $("#contact-again").onclick = () => { f.reset(); f.hidden = false; $("#contact-done").hidden = true; };
  }

  header(); footer();
  ({ home, projects, project, contact })[page]?.();
})();
