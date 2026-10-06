/* داده‌های نمونهٔ دمو — همهٔ اعداد و نام‌ها ساختگی هستند.
   مبالغ به «میلیون تومان» ذخیره می‌شوند. تاریخ‌ها شمسی و با ارقام لاتین. */
(function () {
  const TODAY = "1405/07/14";

  const phasesTemplate = [
    "طراحی و اخذ پروانه", "گودبرداری و سازهٔ نگهبان", "فونداسیون", "اجرای اسکلت",
    "سفت‌کاری", "تأسیسات مکانیکی و برقی", "نازک‌کاری و نما", "محوطه‌سازی و تحویل",
  ];
  // تبدیل درصد کل به درصد هر فاز (وزن‌دار)
  const weights = [6, 9, 8, 22, 15, 16, 18, 6];
  function phasesFor(progress) {
    let left = progress;
    return phasesTemplate.map((name, i) => {
      const w = weights[i];
      const done = Math.max(0, Math.min(w, left));
      left -= done;
      return { name, pct: Math.round((done / w) * 100) };
    });
  }
  // منحنی S: برنامه در برابر واقعی (تجمعی ماهانه). نقطهٔ آخرِ «واقعی» دقیقاً برابر پیشرفت فعلی است.
  function sCurve(months, progress, lag) {
    const lo = 1 / (1 + Math.exp(5)), hi = 1 / (1 + Math.exp(-5));
    const plan = (m) => ((1 / (1 + Math.exp(-10 * (m / months - 0.5))) - lo) / (hi - lo)) * 100;
    const target = Math.min(100, progress / (1 - lag));
    let elapsed = 0;
    while (elapsed < months && plan(elapsed) < target) elapsed++;
    const pts = [];
    for (let m = 0; m <= months; m++) {
      const row = { m, planned: plan(m) };
      if (m <= elapsed) row.actual = m === elapsed ? progress : plan(m) * (1 - lag * (m / Math.max(1, elapsed)));
      pts.push(row);
    }
    return pts;
  }

  const projects = [
    {
      id: "p1", slug: "aseman", name: "برج مسکونی آسمان", type: "مسکونی", city: "تهران", district: "الهیه",
      status: "active", progress: 68, floors: 22, basements: 6, units: 84, land: 3200, area: 41500,
      start: "1402/03/01", end: "1405/12/25", budget: 1850000, spent: 1186400, manager: "u2", art: "tower", hue: 205,
      summary: "برج ۲۲ طبقه با لابی دوطبقه، استخر، سالن ورزش و روف‌گاردن با چشم‌انداز البرز.",
      features: ["سازهٔ بتنی با سیستم دیوار برشی", "نمای سنگ و شیشهٔ دوجداره", "۴ دستگاه آسانسور", "مدیریت هوشمند ساختمان (BMS)", "پارکینگ مکانیزه", "مخزن آتش‌نشانی ۲۵۰ مترمکعب"],
      months: 45, lag: 0.07,
    },
    {
      id: "p2", slug: "negin", name: "مجتمع اداری‌تجاری نگین", type: "اداری و تجاری", city: "تهران", district: "سعادت‌آباد",
      status: "active", progress: 41, floors: 14, basements: 5, units: 120, land: 4100, area: 52800,
      start: "1403/01/20", end: "1406/09/30", budget: 2420000, spent: 905300, manager: "u2", art: "commercial", hue: 190,
      summary: "پنج طبقه تجاری با فودکورت و نه طبقه اداری با پلان باز و نمای کرتین‌وال.",
      features: ["سازهٔ فولادی با اتصالات پیچ‌ومهره", "نمای کرتین‌وال یونیتایز", "۶ پله‌برقی و ۸ آسانسور", "سیستم اعلام و اطفای حریق", "۴۲۰ جای پارک"],
      months: 42, lag: 0.12,
    },
    {
      id: "p3", slug: "sarv", name: "ساختمان مسکونی سرو", type: "مسکونی", city: "کرج", district: "گوهردشت",
      status: "active", progress: 92, floors: 8, basements: 2, units: 32, land: 1150, area: 9600,
      start: "1402/08/10", end: "1405/09/15", budget: 410000, spent: 381200, manager: "u3", art: "midrise", hue: 150,
      summary: "هشت طبقه مسکونی با واحدهای ۹۰ تا ۱۴۰ متری، در مرحلهٔ نازک‌کاری نهایی.",
      features: ["سازهٔ بتنی قاب خمشی", "نمای ترکیبی آجر و سنگ", "پکیج و رادیاتور مستقل", "انباری و پارکینگ اختصاصی"],
      months: 26, lag: 0.03,
    },
    {
      id: "p4", slug: "kouhpayeh", name: "ویلای کوهپایه", type: "ویلایی", city: "لواسان", district: "نجارکلا",
      status: "done", progress: 100, floors: 2, basements: 1, units: 1, land: 1800, area: 780,
      start: "1401/06/01", end: "1403/02/30", budget: 96000, spent: 93100, manager: "u3", art: "villa", hue: 30,
      summary: "ویلای دوطبقه با استخر سرپوشیده، باغ ۱۰۰۰ متری و نمای چوب ترمو.",
      features: ["سازهٔ بتنی", "استخر، سونا و جکوزی", "گرمایش از کف", "خانهٔ هوشمند"],
      months: 21, lag: 0,
    },
    {
      id: "p5", slug: "pardis", name: "مجتمع مسکونی پردیس", type: "مسکونی", city: "شیراز", district: "معالی‌آباد",
      status: "presale", progress: 12, floors: 12, basements: 3, units: 64, land: 2600, area: 23400,
      start: "1404/11/01", end: "1407/12/29", budget: 960000, spent: 98700, manager: "u2", art: "midrise", hue: 25,
      summary: "دو بلوک دوازده طبقه، در مرحلهٔ گودبرداری. پیش‌فروش واحدها آغاز شده است.",
      features: ["سازهٔ بتنی", "فضای سبز مشاع ۹۰۰ متری", "سالن اجتماعات و کودک", "لابی با نگهبانی ۲۴ ساعته"],
      months: 38, lag: 0.08,
    },
    {
      id: "p6", slug: "rahnama", name: "ساختمان اداری رهنما", type: "اداری", city: "اصفهان", district: "چهارباغ بالا",
      status: "done", progress: 100, floors: 9, basements: 3, units: 36, land: 1400, area: 12300,
      start: "1400/04/15", end: "1403/06/30", budget: 520000, spent: 534800, manager: "u3", art: "commercial", hue: 215,
      summary: "ساختمان اداری نه طبقه با گواهی بهینه‌سازی انرژی و نمای سرامیکی تهویه‌شونده.",
      features: ["سازهٔ فولادی", "نمای ونتیله سرامیکی", "هواساز مرکزی", "اتاق سرور و برق اضطراری"],
      months: 38, lag: 0,
    },
  ];
  projects.forEach((p) => {
    p.phases = phasesFor(p.progress);
    p.curve = sCurve(p.months, p.progress, p.lag);
  });

  const users = [
    { id: "u1", name: "مهندس کاوه رستمی", username: "ceo", role: "admin", title: "مدیرعامل", projects: ["*"], active: true, last: "1405/07/14 09:12" },
    { id: "u2", name: "مهندس نگار صدری", username: "pm", role: "pm", title: "مدیر پروژه", projects: ["p1", "p2", "p5"], active: true, last: "1405/07/14 08:40" },
    { id: "u3", name: "مهندس آرش کیانی", username: "pm2", role: "pm", title: "مدیر پروژه", projects: ["p3", "p4", "p6"], active: true, last: "1405/07/13 17:05" },
    { id: "u4", name: "سمیرا اکبرپور", username: "finance", role: "finance", title: "کارشناس ارشد مالی", projects: ["*"], active: true, last: "1405/07/14 10:02" },
    { id: "u5", name: "مهندس حمید نوروزی", username: "site", role: "site", title: "سرپرست کارگاه آسمان", projects: ["p1"], active: true, last: "1405/07/14 07:15" },
    { id: "u6", name: "شرکت فولاد سازان البرز", username: "contractor", role: "contractor", title: "پیمانکار اسکلت فلزی", projects: ["p2"], active: true, last: "1405/07/12 14:30", personId: "c1" },
    { id: "u7", name: "دکتر لیلا فرهمند", username: "owner", role: "client", title: "خریدار واحد ۱۴۰۲ برج آسمان", projects: ["p1"], active: true, last: "1405/07/10 21:48", personId: "b1" },
    { id: "u8", name: "رضا قاسمی", username: "site2", role: "site", title: "سرپرست کارگاه سرو", projects: ["p3"], active: false, last: "1405/05/02 08:00" },
  ];

  const permissions = [
    { key: "dashboard", label: "مشاهدهٔ داشبورد مدیریتی" },
    { key: "projects.view", label: "مشاهدهٔ پروژه‌ها" },
    { key: "projects.edit", label: "ایجاد و ویرایش پروژه" },
    { key: "reports.view", label: "مشاهدهٔ گزارش روزانه" },
    { key: "reports.create", label: "ثبت گزارش روزانه" },
    { key: "expenses.view", label: "مشاهدهٔ هزینه‌ها" },
    { key: "expenses.create", label: "ثبت درخواست هزینه" },
    { key: "expenses.approve", label: "تأیید هزینه (تا سقف)" },
    { key: "expenses.approve.high", label: "تأیید نهایی هزینهٔ مهم" },
    { key: "documents.view", label: "مشاهدهٔ مدارک" },
    { key: "documents.upload", label: "بارگذاری مدارک" },
    { key: "people.view", label: "مشاهدهٔ مشتریان و پیمانکاران" },
    { key: "people.edit", label: "ویرایش مشتریان و پیمانکاران" },
    { key: "analytics", label: "گزارش‌گیری و خروجی" },
    { key: "users.manage", label: "مدیریت کاربران و نقش‌ها" },
    { key: "settings", label: "تنظیمات سامانه" },
    { key: "portal", label: "پورتال اختصاصی" },
  ];

  const roles = {
    admin: { label: "مدیرعامل / مدیر سیستم", perms: permissions.map((p) => p.key).filter((k) => k !== "portal") },
    pm: { label: "مدیر پروژه", perms: ["dashboard", "projects.view", "projects.edit", "reports.view", "reports.create", "expenses.view", "expenses.create", "expenses.approve", "documents.view", "documents.upload", "people.view", "people.edit", "analytics"] },
    finance: { label: "کارشناس مالی", perms: ["dashboard", "projects.view", "expenses.view", "expenses.create", "documents.view", "people.view", "analytics"] },
    site: { label: "سرپرست کارگاه", perms: ["projects.view", "reports.view", "reports.create", "expenses.create", "expenses.view", "documents.view", "documents.upload"] },
    contractor: { label: "پیمانکار", perms: ["portal", "reports.view", "documents.view"] },
    client: { label: "مالک / خریدار", perms: ["portal"] },
  };

  const categories = ["مصالح", "دستمزد", "ماشین‌آلات", "پیمانکار جزء", "تأسیسات", "حمل‌ونقل", "اداری و عوارض"];

  // درخواست‌های هزینه. status: pending (منتظر مدیر پروژه) | review (منتظر تأیید نهایی) | approved | rejected
  const expenses = [
    { id: "e101", project: "p1", date: "1405/07/14", title: "خرید ۱۸۰ تن میلگرد A3 سایز ۱۶ تا ۲۵", category: "مصالح", amount: 9180, vendor: "ذوب‌آهن – نمایندگی تهران", by: "u5", status: "review", log: [["u5", "1405/07/14 08:10", "ثبت درخواست"], ["u2", "1405/07/14 09:05", "تأیید مدیر پروژه — ارجاع برای تأیید نهایی"]] },
    { id: "e102", project: "p2", date: "1405/07/13", title: "صورت‌وضعیت شمارهٔ ۷ اسکلت فلزی", category: "پیمانکار جزء", amount: 14250, vendor: "فولاد سازان البرز", by: "u4", status: "review", log: [["u4", "1405/07/13 11:20", "ثبت درخواست"], ["u2", "1405/07/13 16:40", "تأیید مدیر پروژه — ارجاع برای تأیید نهایی"]] },
    { id: "e103", project: "p1", date: "1405/07/13", title: "اجارهٔ پمپ بتن دکل ۴۲ متری – ۳ روز", category: "ماشین‌آلات", amount: 186, vendor: "پمپاژ بتن پارس", by: "u5", status: "pending", log: [["u5", "1405/07/13 15:02", "ثبت درخواست"]] },
    { id: "e104", project: "p3", date: "1405/07/12", title: "کاشی و سرامیک واحدهای طبقهٔ ۶ تا ۸", category: "مصالح", amount: 1240, vendor: "سرامیک البرز", by: "u3", status: "pending", log: [["u3", "1405/07/12 10:30", "ثبت درخواست"]] },
    { id: "e105", project: "p5", date: "1405/07/12", title: "حمل خاک گودبرداری – ۲۲۰ سرویس", category: "حمل‌ونقل", amount: 352, vendor: "ترابری فارس", by: "u2", status: "pending", log: [["u2", "1405/07/12 13:00", "ثبت درخواست"]] },
    { id: "e106", project: "p1", date: "1405/07/11", title: "دستمزد اکیپ قالب‌بندی – نیمهٔ اول مهر", category: "دستمزد", amount: 640, vendor: "اکیپ استاد محمدی", by: "u5", status: "approved", log: [["u5", "1405/07/11 09:00", "ثبت درخواست"], ["u2", "1405/07/11 12:30", "تأیید مدیر پروژه"]] },
    { id: "e107", project: "p2", date: "1405/07/10", title: "عوارض تمدید پروانهٔ ساخت", category: "اداری و عوارض", amount: 2850, vendor: "شهرداری منطقهٔ ۲", by: "u4", status: "approved", log: [["u4", "1405/07/10 10:00", "ثبت درخواست"], ["u2", "1405/07/10 11:10", "تأیید مدیر پروژه — ارجاع برای تأیید نهایی"], ["u1", "1405/07/10 18:22", "تأیید نهایی مدیرعامل"]] },
    { id: "e108", project: "p3", date: "1405/07/09", title: "آسانسور ۸ توقف – پیش‌پرداخت دوم", category: "تأسیسات", amount: 1980, vendor: "آسانسور سپهر", by: "u3", status: "approved", log: [["u3", "1405/07/09 09:40", "ثبت درخواست"], ["u1", "1405/07/09 17:15", "تأیید نهایی مدیرعامل"]] },
    { id: "e109", project: "p1", date: "1405/07/08", title: "بتن C35 – ۴۲۰ مترمکعب سقف طبقهٔ ۱۶", category: "مصالح", amount: 2310, vendor: "بتن آماده تهران", by: "u5", status: "approved", log: [["u5", "1405/07/08 07:30", "ثبت درخواست"], ["u2", "1405/07/08 08:15", "تأیید مدیر پروژه — ارجاع برای تأیید نهایی"], ["u1", "1405/07/08 09:00", "تأیید نهایی مدیرعامل"]] },
    { id: "e110", project: "p2", date: "1405/07/07", title: "کرایهٔ جرثقیل برجی – مهرماه", category: "ماشین‌آلات", amount: 420, vendor: "جرثقیل‌داران ایران", by: "u2", status: "approved", log: [["u2", "1405/07/07 10:00", "ثبت درخواست"]] },
    { id: "e111", project: "p5", date: "1405/07/06", title: "خرید لوازم‌التحریر و ملزومات کارگاه", category: "اداری و عوارض", amount: 28, vendor: "فروشگاه کارگاه", by: "u2", status: "rejected", log: [["u2", "1405/07/06 12:00", "ثبت درخواست"], ["u1", "1405/07/06 18:00", "رد شد — فاکتور رسمی پیوست نشده"]] },
    { id: "e112", project: "p1", date: "1405/07/05", title: "دوربین‌های مداربستهٔ کارگاه – ۱۲ عدد", category: "تأسیسات", amount: 168, vendor: "ایمن‌نگار", by: "u5", status: "approved", log: [["u5", "1405/07/05 09:00", "ثبت درخواست"], ["u2", "1405/07/05 10:00", "تأیید مدیر پروژه"]] },
    { id: "e113", project: "p3", date: "1405/07/04", title: "دستمزد اکیپ نقاشی", category: "دستمزد", amount: 310, vendor: "اکیپ رنگ‌آذین", by: "u3", status: "approved", log: [["u3", "1405/07/04 08:00", "ثبت درخواست"]] },
    { id: "e114", project: "p2", date: "1405/07/02", title: "پروفیل و شیشهٔ کرتین‌وال – پیش‌پرداخت", category: "مصالح", amount: 6400, vendor: "نمای شیشه‌ای آرین", by: "u4", status: "approved", log: [["u4", "1405/07/02 10:30", "ثبت درخواست"], ["u2", "1405/07/02 14:00", "تأیید مدیر پروژه — ارجاع برای تأیید نهایی"], ["u1", "1405/07/03 09:00", "تأیید نهایی مدیرعامل"]] },
  ];

  // هزینهٔ ماهانهٔ تجمیعی شش ماه اخیر (میلیون تومان) برای نمودار
  const monthly = [
    { label: "اردیبهشت", value: 38400 }, { label: "خرداد", value: 42100 }, { label: "تیر", value: 35900 },
    { label: "مرداد", value: 47800 }, { label: "شهریور", value: 51200 }, { label: "مهر", value: 18600, current: true },
  ];

  const reports = [
    { id: "r501", project: "p1", date: "1405/07/14", by: "u5", weather: "آفتابی، ۲۴°", workers: 86, progress: 0.4,
      done: "آرماتوربندی دیوارهای برشی طبقهٔ ۱۷ تکمیل شد. قالب‌بندی ستون‌های محور C تا F آغاز شد.",
      issues: "تأخیر ۲ ساعته در تحویل بتن به‌دلیل ترافیک بزرگراه.", next: "بتن‌ریزی ستون‌های طبقهٔ ۱۷", photos: 6 },
    { id: "r502", project: "p2", date: "1405/07/14", by: "u2", weather: "آفتابی، ۲۵°", workers: 64, progress: 0.3,
      done: "نصب تیرهای اصلی طبقهٔ ۹ و جوشکاری اتصالات صلب محور ۳.", issues: "—", next: "بازرسی جوش توسط ناظر مقیم", photos: 4 },
    { id: "r503", project: "p3", date: "1405/07/13", by: "u3", weather: "ابری، ۲۰°", workers: 22, progress: 0.2,
      done: "نصب کابینت واحدهای ۱۵ تا ۱۸ و رنگ‌آمیزی راه‌پله.", issues: "کسری ۱۲ متر سنگ پله؛ سفارش مجدد ثبت شد.", next: "نصب شیرآلات و چراغ‌ها", photos: 8 },
    { id: "r504", project: "p1", date: "1405/07/13", by: "u5", weather: "آفتابی، ۲۳°", workers: 81, progress: 0.3,
      done: "بتن‌ریزی دال طبقهٔ ۱۶ (۴۲۰ مترمکعب) و نمونه‌گیری مقاومت.", issues: "—", next: "باز کردن قالب ستون‌ها", photos: 11 },
    { id: "r505", project: "p5", date: "1405/07/13", by: "u2", weather: "آفتابی، ۲۹°", workers: 18, progress: 0.5,
      done: "گودبرداری تا تراز ‎-۷٫۵۰ در ضلع شمالی و اجرای ردیف دوم نیلینگ.", issues: "برخورد با لولهٔ آب قدیمی؛ هماهنگی با آبفا انجام شد.", next: "ادامهٔ نیلینگ ضلع شرقی", photos: 5 },
    { id: "r506", project: "p2", date: "1405/07/12", by: "u2", weather: "نیمه‌ابری، ۲۲°", workers: 59, progress: 0.3,
      done: "اجرای دک فلزی طبقهٔ ۸ و نصب برشگیرها.", issues: "—", next: "بتن‌ریزی سقف طبقهٔ ۸", photos: 3 },
  ];

  const documents = [
    { id: "d1", project: "p1", name: "پروانهٔ ساخت – برج آسمان.pdf", kind: "پروانه و مجوز", size: "2.4MB", by: "u1", date: "1402/02/18" },
    { id: "d2", project: "p1", name: "نقشه‌های معماری – ویرایش ۴.dwg", kind: "نقشه", size: "38MB", by: "u2", date: "1404/11/03" },
    { id: "d3", project: "p1", name: "قرارداد پیمانکار تأسیسات.pdf", kind: "قرارداد", size: "1.1MB", by: "u4", date: "1404/06/20" },
    { id: "d4", project: "p1", name: "گزارش آزمایش مقاومت بتن – مهر.pdf", kind: "آزمایش و کنترل کیفیت", size: "640KB", by: "u5", date: "1405/07/10" },
    { id: "d5", project: "p2", name: "نقشه‌های سازه – اسکلت فلزی.dwg", kind: "نقشه", size: "54MB", by: "u2", date: "1403/03/12" },
    { id: "d6", project: "p2", name: "صورت‌وضعیت ۷ – فولاد سازان.xlsx", kind: "صورت‌وضعیت", size: "220KB", by: "u4", date: "1405/07/13" },
    { id: "d7", project: "p2", name: "بیمه‌نامهٔ مسئولیت کارفرما.pdf", kind: "بیمه", size: "900KB", by: "u4", date: "1405/01/15" },
    { id: "d8", project: "p3", name: "صورتجلسهٔ تحویل موقت طبقات ۱ تا ۴.pdf", kind: "صورتجلسه", size: "480KB", by: "u3", date: "1405/06/28" },
    { id: "d9", project: "p3", name: "شناسنامهٔ فنی ساختمان.pdf", kind: "پروانه و مجوز", size: "3.2MB", by: "u3", date: "1405/05/11" },
    { id: "d10", project: "p5", name: "گزارش ژئوتکنیک.pdf", kind: "آزمایش و کنترل کیفیت", size: "7.8MB", by: "u2", date: "1404/09/02" },
    { id: "d11", project: "p5", name: "فرم قرارداد پیش‌فروش.docx", kind: "قرارداد", size: "180KB", by: "u4", date: "1404/12/01" },
    { id: "d12", project: "p6", name: "پایان‌کار ساختمان رهنما.pdf", kind: "پروانه و مجوز", size: "1.6MB", by: "u3", date: "1403/07/20" },
  ];

  // اشخاص: buyer (خریدار) | owner (مالک زمین / شریک) | contractor (پیمانکار)
  const people = [
    { id: "b1", kind: "buyer", name: "دکتر لیلا فرهمند", phone: "0912 410 2233", project: "p1", unit: "واحد ۱۴۰۲ – ۱۶۵ متر", contract: 41250, paid: 30900,
      schedule: [["پیش‌پرداخت", "1403/02/10", 12375, true], ["پس از اسکلت", "1404/08/01", 10300, true], ["پس از سفت‌کاری", "1405/03/01", 8225, true], ["پس از نازک‌کاری", "1405/11/01", 6200, false], ["تحویل و سند", "1406/01/15", 4150, false]] },
    { id: "b2", kind: "buyer", name: "مهدی سلطانی", phone: "0935 778 1290", project: "p1", unit: "واحد ۸۰۳ – ۱۲۲ متر", contract: 28060, paid: 22400 },
    { id: "b3", kind: "buyer", name: "فرزانه موسوی", phone: "0919 220 6541", project: "p3", unit: "واحد ۷ – ۱۱۰ متر", contract: 9350, paid: 9350 },
    { id: "b4", kind: "buyer", name: "علیرضا احمدی", phone: "0917 302 4466", project: "p5", unit: "واحد B-۹۰۱ – ۱۳۸ متر", contract: 13800, paid: 4140 },
    { id: "o1", kind: "owner", name: "خانوادهٔ مشیری (۴ مالک)", phone: "021 2240 1180", project: "p1", unit: "مشارکت در ساخت – سهم ۴۰٪", contract: 0, paid: 0 },
    { id: "o2", kind: "owner", name: "مهندس پرویز صالحی", phone: "0912 115 0090", project: "p3", unit: "مشارکت در ساخت – سهم ۴۵٪", contract: 0, paid: 0 },
    { id: "c1", kind: "contractor", name: "فولاد سازان البرز", phone: "026 3440 8800", project: "p2", unit: "اسکلت فلزی – ۲,۸۰۰ تن", contract: 186000, paid: 112400,
      statements: [["صورت‌وضعیت ۵", "1405/04/30", 15800, "پرداخت شد"], ["صورت‌وضعیت ۶", "1405/05/31", 16900, "پرداخت شد"], ["صورت‌وضعیت ۷", "1405/07/13", 14250, "در انتظار تأیید نهایی"]] },
    { id: "c2", kind: "contractor", name: "تأسیسات آریا تهویه", phone: "021 8812 3300", project: "p1", unit: "تأسیسات مکانیکی", contract: 94000, paid: 41200 },
    { id: "c3", kind: "contractor", name: "آسانسور سپهر", phone: "021 6603 1122", project: "p3", unit: "۲ دستگاه آسانسور", contract: 4600, paid: 3960 },
    { id: "c4", kind: "contractor", name: "نمای شیشه‌ای آرین", phone: "021 4490 7711", project: "p2", unit: "کرتین‌وال ۹,۴۰۰ مترمربع", contract: 21500, paid: 6400 },
  ];

  const activity = [
    ["u2", "1405/07/14 09:05", "هزینهٔ «خرید ۱۸۰ تن میلگرد» را برای تأیید نهایی ارجاع داد"],
    ["u5", "1405/07/14 08:31", "گزارش روزانهٔ برج آسمان را ثبت کرد"],
    ["u5", "1405/07/14 08:10", "درخواست هزینهٔ ۹٫۱۸ میلیارد تومانی ثبت کرد"],
    ["u4", "1405/07/13 11:20", "صورت‌وضعیت ۷ فولاد سازان را بارگذاری کرد"],
    ["u3", "1405/07/13 18:02", "پیشرفت ساختمان سرو را به ۹۲٪ به‌روز کرد"],
  ];

  window.TARAZ_SEED = {
    TODAY, projects, users, roles, permissions, categories, expenses, monthly, reports, documents, people, activity,
    settings: { threshold: 2000, company: "گروه ساختمانی تراز" }, // سقف تأیید مدیر پروژه: ۲ میلیارد تومان
  };

  /* ابزارهای مشترک */
  const nf = new Intl.NumberFormat("fa-IR");
  const fa = (v) => String(v).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  window.T = {
    fa,
    n: (v, digits = 0) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v),
    money(m) { // m = میلیون تومان
      if (Math.abs(m) >= 1000) return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: m >= 100000 ? 0 : 1 }).format(m / 1000) + " میلیارد تومان";
      return nf.format(Math.round(m)) + " میلیون تومان";
    },
    moneyShort(m) {
      if (Math.abs(m) >= 1000) return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(m / 1000) + " میلیارد";
      return nf.format(Math.round(m)) + " میلیون";
    },
    statusLabel: { active: "در حال ساخت", done: "تحویل‌شده", presale: "پیش‌فروش", design: "در حال طراحی" },
    statusPill: { active: "pill-info", done: "pill-good", presale: "pill-warn", design: "pill-mute" },
    esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
    toast(msg) {
      let wrap = document.querySelector(".toast-wrap");
      if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
      const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; wrap.appendChild(t);
      setTimeout(() => t.remove(), 3200);
    },
    store: {
      get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
      set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* حافظهٔ مرورگر در دسترس نیست */ } },
      del(k) { try { localStorage.removeItem(k); } catch (e) {} },
    },
  };
})();
