import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUp, Building2, Cable, Fan, Wrench,
  Phone, Mail, MapPin, CheckCircle2, ChevronDown, Undo2, Star,
  Search as SearchIcon
} from "lucide-react";
import logo from "/logo-cube.png";       // для шапки/футера
import loaderLogo from "/logo-cube3.png"; // для прелоадера

/* ---------------- palette / constants ---------------- */
const FILTER_BG = "#EDEDED";
const FILTER_BG_HOVER = "#E3E3E3";
const DROPDOWN_HOVER = "#DADADA";

/* ---------------- hooks ---------------- */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(e); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, handler]);
}

function useSectionRouter() {
  const ids = ["services", "projects", "about", "contact"];
  const scrollToId = (id) => {
    if (!id) return window.scrollTo({ top: 0, behavior: "smooth" });
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, "");
    if (ids.includes(path)) requestAnimationFrame(() => scrollToId(path));
    const onPop = () => {
      const p = window.location.pathname.replace(/^\/+/, "");
      if (ids.includes(p)) scrollToId(p); else scrollToId(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (path, id) => { window.history.pushState({}, "", path); scrollToId(id); };
  return navigate;
}

function useActiveTopTitle(sections, defaultLateVH = 0.42, perId = {}, specialStarts = {}) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const anchor = window.scrollY + window.innerHeight / 2;
      let current = null;
      for (const s of sections) {
        const el = s.ref.current; if (!el) continue;

        let start;
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        const bottom = r.bottom + window.scrollY;

        if (specialStarts[s.id]) {
          const trg = document.getElementById(specialStarts[s.id]);
          if (trg) {
            const rr = trg.getBoundingClientRect();
            const center = (rr.top + rr.bottom) / 2 + window.scrollY;
            start = center - window.innerHeight * 0.20; // «чуть раньше центра»
          } else {
            const late = perId[s.id] ?? defaultLateVH;
            start = top - window.innerHeight * late;
          }
        } else {
          const late = perId[s.id] ?? defaultLateVH;
          start = top - window.innerHeight * late;
        }
        if (anchor >= start && anchor <= bottom) { current = s.id; break; }
      }
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; calc(); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    calc();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [sections, defaultLateVH, perId, specialStarts]);
  return active;
}

function useEndFade(sectionRef, spanVH = 25, startVH = 75) {
  const [fade, setFade] = useState(0);
  useEffect(() => {
    let raf = 0;
    const run = () => {
      const el = sectionRef.current; if (!el) return setFade(0);
      const rect = el.getBoundingClientRect();
      const startPx = (startVH / 100) * window.innerHeight;
      const endPx = ((startVH - spanVH) / 100) * window.innerHeight;
      const x = (startPx - rect.bottom) / (startPx - endPx);
      const v = Math.max(0, Math.min(1, x));
      setFade(v);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; run(); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    run();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [sectionRef, spanVH, startVH]);
  return fade;
}

/* ---------------- small UI ---------------- */
function TooltipPill({ label }) {
  return (
    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="relative rounded-full bg-amber-400 text-black text-[13px] leading-none px-3.5 py-2 shadow">
        {label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-amber-400" />
      </div>
    </div>
  );
}

/* ---------------- LOADER ---------------- */
function Loader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-[1px] grid place-items-center"
        >
          {/* ОДИН элемент с маской: белый фон + жёлтая заливка (анимируем только ширину градиента) */}
          <motion.span
            // анимируем CSS-переменную --w от 0% до 100% за 1.8 c
            initial={{ ["--w"]: "0%" }}
            animate={{ ["--w"]: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="block w-[340px] h-[110px] sm:w-[380px] sm:h-[120px]"
            style={{
              // маска по твоему логотипу
              WebkitMask: `url(${loaderLogo}) center / contain no-repeat`,
              mask: `url(${loaderLogo}) center / contain no-repeat`,
              // два фона: верхний — жёлтый, ширина которого растёт; нижний — белый (статичный)
              backgroundImage: "linear-gradient(#fbbf24, #fbbf24), linear-gradient(#ffffff, #ffffff)",
              backgroundRepeat: "no-repeat, no-repeat",
              backgroundPosition: "left, center",
              // ширина верхнего фона берётся из переменной --w
              backgroundSize: "var(--w) 100%, 100% 100%",
            }}
            aria-label="KUB loading"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ---------------- NAV ---------------- */
function Nav({ navigate, activeId, serviceStep, indexForSearch }) {
  const [open, setOpen] = useState(false);

  // поиск
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchWrapRef = useRef(null);
  useClickOutside(searchWrapRef, () => setSearchOpen(false));
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const results = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return indexForSearch.slice(0, 6);
    return indexForSearch.filter(it =>
      it.title.toLowerCase().includes(text) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(text))
    ).slice(0, 8);
  }, [q, indexForSearch]);

  const items = [
    { href: "/services", id: "services", label: "Услуги" },
    { href: "/projects", id: "projects", label: "Проекты" },
    { href: "/about",    id: "about",    label: "О нас" },
    { href: "/contact",  id: "contact",  label: "Контакты" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      {/* desktop */}
      <div className="hidden md:grid h-20 w-full grid-cols-[auto,1fr,auto] items-center">
        <a href="/" onClick={(e)=>{e.preventDefault();navigate("/",null);}} className="group relative flex items-center pl-3 sm:pl-4">
          <span
            className="block h-16 w-28 bg-white transition-colors duration-150 group-hover:bg-amber-400"
            style={{ WebkitMask:`url(${logo}) center / contain no-repeat`, mask:`url(${logo}) center / contain no-repeat` }}
            aria-label="КУБ"
          />
        </a>

        <nav className="hidden md:flex items-center justify-center gap-8 text-sm">
          {items.map((item) => {
            const active = activeId === item.id;
            const isServices = item.id === "services";
            return (
              <span key={item.id} className="relative">
                <a
                  href={item.href}
                  onClick={(e)=>{e.preventDefault();navigate(item.href,item.id);}}
                  className={`relative group transition-colors ${active ? "text-amber-400" : "text-neutral-200 hover:text-amber-400"}`}
                >
                  {item.label}
                  <span className={`pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] bg-amber-400 transition-all duration-300 ${active ? "w-12" : "w-0 group-hover:w-12"}`}/>
                </a>

                {isServices && activeId === "services" && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {[1,2,3,4].map((n)=>(
                      <span key={n} className={`w-3 h-[3px] bg-amber-400 transition-opacity ${serviceStep >= n ? "opacity-100" : "opacity-0"}`}/>
                    ))}
                  </div>
                )}
              </span>
            );
          })}
        </nav>

        {/* icons + tooltips + search dropdown — прижал немного левее */}
        <div className="hidden md:flex items-center gap-6 text-neutral-200 justify-self-end pr-6 sm:pr-8">
          {/* SEARCH */}
          <div className="relative group flex items-center" ref={searchWrapRef}>
            <button
              onClick={() => setSearchOpen(v=>!v)}
              className="inline-flex items-center text-neutral-200 hover:text-amber-400 transition-colors"
              aria-label="Поиск"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            <TooltipPill label="Поиск" />

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 250, damping: 24 }}
                  className="absolute top-[150%] right-0 w-[520px] bg-white text-black rounded-xl shadow-2xl overflow-hidden"
                >
                  <span className="absolute -top-2 right-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
                  <div className="p-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <SearchIcon className="w-5 h-5 text-neutral-500" />
                      <input
                        autoFocus
                        value={q}
                        onChange={(e)=>setQ(e.target.value)}
                        placeholder="Поиск…"
                        className="w-full outline-none text-lg placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                  <ul className="max-h-[60vh] overflow-auto">
                    {results.map((r, i) => (
                      <li key={i}>
                        <button
                          onClick={() => { setSearchOpen(false); r.onSelect(); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                        >
                          <img src={r.image} alt="" className="w-14 h-14 object-cover rounded-md"/>
                          <div className="flex-1">
                            <div className="text-[15px] leading-tight">{r.title}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">{r.subtitle}</div>
                          </div>
                          {r.badge === "new" && (
                            <span className="px-2 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5"/> Новый
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                    <li className="border-t border-neutral-200">
                      <button
                        onClick={() => { setSearchOpen(false); window.history.pushState({}, "", "/projects"); document.getElementById("projects")?.scrollIntoView({behavior:"smooth"}); }}
                        className="w-full text-center px-4 py-4 text-neutral-700 hover:bg-neutral-50"
                      >
                        Посмотреть все ({indexForSearch.length})
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACCOUNT */}
          <div className="relative group flex items-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-200 group-hover:text-amber-400 transition-colors" fill="none">
              <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <TooltipPill label="Учётная запись" />
          </div>

          {/* CART */}
          <div className="relative group flex items-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-200 group-hover:text-amber-400 transition-colors" fill="none">
              <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="18" cy="20" r="1.5" fill="currentColor"/>
            </svg>
            <TooltipPill label="Корзина" />
          </div>
        </div>
      </div>

      {/* mobile bar */}
      <div className="md:hidden h-16 px-3 flex items-center justify-between">
        <button aria-label="Открыть меню" onClick={()=>setOpen(true)} className="text-neutral-200">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <a href="/" onClick={(e)=>{e.preventDefault();navigate("/",null);}} className="group">
          <span className="block h-8 w-14 bg-white transition-colors duration-150 group-hover:bg-amber-400"
                style={{ WebkitMask:`url(${logo}) center / contain no-repeat`, mask:`url(${logo}) center / contain no-repeat` }} />
        </a>
        <div className="flex items-center gap-5 text-neutral-200">
          <SearchIcon className="w-6 h-6"/>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="18" cy="20" r="1.5" fill="currentColor"/></svg>
        </div>
      </div>
    </header>
  );
}

/* ---------------- SERVICES data ---------------- */
const servicesData = [
  { id:"s1", icon:<Cable className="w-6 h-6"/>, title:"Слаботочные системы", blurb:"СКС, видеонаблюдение, СКУД, ОПС, связь", image:"/low_current_systems.png",
    details:["Проектирование и обследование","Монтаж и пусконаладка","Интеграция с IT-инфраструктурой","Сервис и регламентные работы"] },
  { id:"s2", icon:<Wrench className="w-6 h-6"/>, title:"Электросети", blurb:"Внутренние/наружные сети, щиты, заземление, освещение", image:"/electrical.png",
    details:["Расчёт нагрузок, подбор автоматики","Монтаж кабельных линий","Проверки ПУЭ / ПТЭЭП / ГОСТ","Исполнительная документация"] },
  { id:"s3", icon:<Fan className="w-6 h-6"/>, title:"Вентиляция и кондиционирование", blurb:"ПВУ, дымоудаление, чиллер-фанкойлы, автоматика", image:"/ventilation.png",
    details:["Аэродинамические расчёты","Монтаж воздуховодов и агрегатов","Автоматика и диспетчеризация","Паспортные испытания"] },
  { id:"s4", icon:<Building2 className="w-6 h-6"/>, title:"Общестрой под ключ", blurb:"Комплекс СМР: от демонтажа до чистовой отделки", image:"/construction.png",
    details:["Генподряд и управление проектом","Координация субподрядчиков","Технадзор и охрана труда","Сроки и бюджет под контролем"] },
];

/* ---------------- HERO + sticky services (wipe top->down) ---------------- */
function Showcase({ servicesRangeRef, onServiceStepChange }) {
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const serviceRefs = useRef(servicesData.map(() => React.createRef()));
  const [baseIdx, setBaseIdx] = useState(0);
  const [blend, setBlend] = useState(0);
  const IMG_POS = "30% center"; // смещение вправо ≈ 20–30%

  const endFade = useEndFade(sectionRef, 25, 75);

  useEffect(() => {
    let raf = 0; let lastStep = -1;
    const update = () => {
      const els = [heroRef.current, ...serviceRefs.current.map(r=>r.current)].filter(Boolean);
      if (!els.length) return;
      const rects = els.map(el=>el.getBoundingClientRect());
      const centers = rects.map(r=>(r.top+r.bottom)/2 + window.scrollY);
      const anchor = window.scrollY + window.innerHeight/2;
      const last = centers.length-1;

      if (anchor <= centers[0]) { setBaseIdx(0); setBlend(0); }
      else if (anchor >= centers[last]) { setBaseIdx(last-1); setBlend(1); }
      else {
        for (let i=0;i<last;i++){
          const a=centers[i], b=centers[i+1];
          if (anchor>=a && anchor<=b){
            const t=(anchor-a)/(b-a);
            const start=0.30, end=0.80; // смена позже, плавно
            const p = t<=start?0 : t>=end?1 : (t-start)/(end-start);
            setBaseIdx(i); setBlend(Math.max(0,Math.min(1,p)));
            break;
          }
        }
      }

      // прогресс-палочки «Услуги»
      const sRects = serviceRefs.current.map(r=>r.current?.getBoundingClientRect()).filter(Boolean);
      if (sRects.length){
        const sCenters = sRects.map(r=>(r.top+r.bottom)/2 + window.scrollY);
        const a2 = window.scrollY + window.innerHeight/2;
        let min=Infinity, idx=0;
        sCenters.forEach((c,i)=>{ const d=Math.abs(c-a2); if(d<min){min=d; idx=i;} });
        const step = idx + 1;
        if (step !== lastStep){ lastStep = step; onServiceStepChange?.(step); }
      } else if (lastStep !== 0) { lastStep = 0; onServiceStepChange?.(0); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(()=>{ raf=0; update(); }); };
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [onServiceStepChange]);

  const images = useMemo(()=>["/image1.png", ...servicesData.map(s=>s.image)],[]);
  const nextIdx = Math.min(baseIdx+1, images.length-1);
  const clipBottomPct = baseIdx===images.length-1 ? 100 : 100 - blend*100; // wipe сверху-вниз

  return (
    <section ref={sectionRef} className="bg-white text-black">
      <div className="hidden md:grid grid-cols-[35%_65%] w-full" style={{ filter:`grayscale(${endFade})`, opacity:`${1 - endFade*0.6}` }}>
        {/* left */}
        <div className="flex flex-col">
          <article ref={heroRef} className="min-h-[85vh] flex items-center">
            <div className="w-full pl-6 pr-8 lg:pl-16 lg:pr-12">
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Инженерные системы под ключ
              </h1>
              <div className="mt-10">
                <a href="/contact" onClick={(e)=>{e.preventDefault();window.history.pushState({}, "", "/contact");document.getElementById("contact")?.scrollIntoView({behavior:"smooth",block:"start"});}}
                   className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
                  Получить консультацию <ArrowRight className="w-5 h-5"/>
                </a>
              </div>
            </div>
          </article>

          <div id="services" ref={servicesRangeRef}>
            {servicesData.map((s, idx)=>(
              <article key={s.id} id={s.id} ref={serviceRefs.current[idx]} className="min-h-[120vh] flex items-center" {...(idx===0?{id:"services-first"}:{})}>
                <div className="w-full pl-6 pr-8 lg:pl-16 lg:pr-12 -mt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-md">{s.icon}</div>
                    <h3 className="text-4xl font-extrabold leading-tight tracking-tight">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-neutral-700 text-lg">{s.blurb}</p>
                  <ul className="mt-6 space-y-2 text-neutral-800">
                    {s.details.map((d,i)=>(<li key={i} className="flex items-start gap-2 text-base"><CheckCircle2 className="w-4 h-4 mt-1"/>{d}</li>))}
                  </ul>
                  <div className="mt-8">
                    <a href="/contact" onClick={(e)=>{e.preventDefault();window.history.pushState({}, "", "/contact");document.getElementById("contact")?.scrollIntoView({behavior:"smooth",block:"start"});}}
                       className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
                      Получить консультацию <ArrowRight className="w-5 h-5"/>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* right sticky with wipe */}
        <div className="relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            <img src={images[baseIdx]}  alt="" className="absolute inset-0 w-full h-full object-cover" style={{objectPosition:IMG_POS}}/>
            <img src={images[nextIdx]} alt="" className="absolute inset-0 w-full h-full object-cover"
                 style={{objectPosition:IMG_POS, clipPath:`inset(0% 0% ${clipBottomPct}% 0%)`, willChange:"clip-path"}}/>
          </div>
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden">
        <div className="px-5 pt-6">
          <h1 className="text-3xl font-extrabold leading-tight text-center">Инженерные системы под ключ</h1>
          <div className="mt-6"><img src="/image1.png" alt="" className="w-full h-64 object-cover" style={{objectPosition:"30% center"}}/></div>
          <div className="mt-6 flex justify-center">
            <a href="/contact" onClick={(e)=>{e.preventDefault();window.history.pushState({}, "", "/contact");document.getElementById("contact")?.scrollIntoView({behavior:"smooth",block:"start"});}}
               className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium">
              Получить консультацию <ArrowRight className="w-5 h-5"/>
            </a>
          </div>
        </div>
        <h2 className="mt-10 px-5 text-3xl font-semibold text-center">Услуги</h2>
        <div className="mt-6 px-5">
          {servicesData.map((s)=>(
            <div key={s.id} className="mb-10" id={s.id}>
              <img src={s.image} alt={s.title} className="w-full h-56 object-cover" style={{objectPosition:"30% center"}}/>
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-md">{s.icon}</div>
                  <h3 className="text-2xl font-extrabold leading-tight">{s.title}</h3>
                </div>
                <p className="mt-2 text-neutral-700">{s.blurb}</p>
                <ul className="mt-3 space-y-2 text-neutral-800 text-sm">
                  {s.details.map((d,i)=>(<li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5"/>{d}</li>))}
                </ul>
                <div className="mt-5">
                  <a href="/contact" onClick={(e)=>{e.preventDefault();window.history.pushState({}, "", "/contact");document.getElementById("contact")?.scrollIntoView({behavior:"smooth",block:"start"});}}
                     className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium">
                    Получить консультацию <ArrowRight className="w-5 h-5"/>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROJECTS ---------------- */
const projects = [
  { title:"Учебный центр «Газпромнефть»", tag:"СКС + ОПС + Электроснабжение", city:"Ноябрьск",
    service:"СКС + ОПС + Электроснабжение", tags:["СКС","ОПС","Электроснабжение"], date:"2024-11-20",
    images:["/objects/RMM/1.jpeg","/objects/RMM/2.jpeg","/objects/RMM/3.jpeg"] },
  { title:"Ресторан «FRANK by БАСТА»",     tag:"ОПС + ВПВ", city:"Тюмень",
    service:"ОПС + ВПВ", tags:["ОПС","ВПВ"], date:"2024-06-05",
    images:["/objects/Frank/1.jpg","/objects/Frank/2.jpg"] },
  { title:"АБК «Газпром инвест»",          tag:"Обследование инженерных систем", city:"Ноябрьск",
    service:"Обследование инженерных систем", tags:["Обследование инженерных систем"], date:"2023-12-10",
    images:["/objects/Lenina/1.jpg","/objects/Lenina/2.jpg","/objects/Lenina/3.jpg","/objects/Lenina/4.jpg","/objects/Lenina/5.jpg"] },
  { title:"«Газпром инвест»",              tag:"Восстановление СКС, ОПС", city:"Ноябрьск",
    service:"Восстановление СКС, ОПС", tags:["СКС","ОПС"], date:"2023-05-15",
    images:["/objects/Invest/1.jpg","/objects/Invest/2.jpg"] },
];
const EXTRA_YEARS = [2025];
const newestTime = Math.max(...projects.map(p => +new Date(p.date)));

function MultiFilterButton({ id, label, selectedSet, options, onToggle, openId, setOpenId }) {
  const open = openId === id;
  const count = selectedSet.size;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className="h-[40px] min-w-[120px] px-3 pr-8 text-left text-[13px] text-neutral-900 inline-flex items-center relative rounded-md transition-colors"
        style={{ backgroundColor: FILTER_BG }}
        onMouseEnter={(e)=>e.currentTarget.style.backgroundColor = FILTER_BG_HOVER}
        onMouseLeave={(e)=>e.currentTarget.style.backgroundColor = FILTER_BG}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700"/>
        {count>0 && (
          <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-black text-white text-[10px] leading-none grid place-items-center">{count}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-30 mt-2 rounded-md shadow-md overflow-hidden p-1" style={{ backgroundColor: FILTER_BG, minWidth: 260 }}>
          {options.map((opt)=> {
            const checked = selectedSet.has(opt.value);
            return (
              <button
                key={opt.value}
                onClick={()=> onToggle(opt.value)}
                className="flex items-center w-full gap-2 px-3 py-2 text-left text-[13px] text-neutral-900 leading-tight transition-colors"
                style={{ backgroundColor: FILTER_BG }}
                onMouseEnter={(e)=>e.currentTarget.style.backgroundColor = DROPDOWN_HOVER}
                onMouseLeave={(e)=>e.currentTarget.style.backgroundColor = FILTER_BG}
              >
                <span className={`relative inline-block w-4 h-4 border border-black/70 ${checked ? "bg-black" : "bg-transparent"}`}>
                  {checked && (
                    <svg viewBox="0 0 12 10" className="absolute inset-0 m-auto w-3 h-3">
                      <path d="M2 5.5 4.5 8 10 2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="flex-1 whitespace-normal break-words">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectsFilters({ filters, setFilters, yearsOpts, serviceOpts, cityOpts, sort, setSort }) {
  const [openId, setOpenId] = useState(null);
  const hasActive = filters.yearSet.size>0 || filters.serviceSet.size>0 || filters.citySet.size>0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <MultiFilterButton
        id="year"
        label="Дата"
        selectedSet={filters.yearSet}
        options={yearsOpts}
        openId={openId}
        setOpenId={setOpenId}
        onToggle={(val)=> setFilters(f=>{ const s=new Set(f.yearSet); s.has(val)?s.delete(val):s.add(val); return {...f, yearSet:s}; })}
      />
      <MultiFilterButton
        id="service"
        label="Услуга"
        selectedSet={filters.serviceSet}
        options={serviceOpts}
        openId={openId}
        setOpenId={setOpenId}
        onToggle={(val)=> setFilters(f=>{ const s=new Set(f.serviceSet); s.has(val)?s.delete(val):s.add(val); return {...f, serviceSet:s}; })}
      />
      <MultiFilterButton
        id="city"
        label="Город"
        selectedSet={filters.citySet}
        options={cityOpts}
        openId={openId}
        setOpenId={setOpenId}
        onToggle={(val)=> setFilters(f=>{ const s=new Set(f.citySet); s.has(val)?s.delete(val):s.add(val); return {...f, citySet:s}; })}
      />

      {hasActive && (
        <button
          onClick={()=>{ setFilters({yearSet:new Set(), serviceSet:new Set(), citySet:new Set()}); setOpenId(null); }}
          className="h-[40px] px-0 text-[13px] text-neutral-800 inline-flex items-center gap-2"
          title="Сбросить фильтр"
        >
          <Undo2 className="w-5 h-5" />
          <span>Сбросить фильтр</span>
        </button>
      )}

      <div className="ml-auto inline-flex rounded-md overflow-hidden">
        {[{key:"new",label:"Новые"},{key:"pop",label:"Популярные"}].map((t)=>(
          <button key={t.key} onClick={()=>setSort(t.key)}
            className="h-[40px] px-4 text-[13px] rounded-md"
            style={{ backgroundColor: sort===t.key ? FILTER_BG_HOVER : "transparent" }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const [i, setI] = useState(0);
  const many = project.images.length > 1;
  const isNewest = +new Date(project.date) === newestTime;

  return (
    <div className="relative bg-white rounded-md border-[1.5px] border-neutral-300">
      {isNewest && (
        <div className="absolute -top-3 right-3 z-10 px-3 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm inline-flex items-center gap-1">
          <Star className="w-4 h-4"/><span>Новый</span>
        </div>
      )}

      <div className="p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white">
          <AnimatePresence mode="wait">
            <motion.img
              key={project.images[i]}
              src={project.images[i]}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0.25 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          {many && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {project.images.map((_, di) => (
                <button
                  key={di}
                  onClick={() => setI(di)}
                  aria-label={`Слайд ${di + 1}`}
                  className={`h-[3px] w-5 rounded-full ring-1 ring-black/10 transition-colors
                              ${i === di ? "bg-black" : "bg-amber-400"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-5">
        <div className="text-neutral-500 text-xs" style={{minHeight:18}}>{project.city}</div>
        <div className="mt-1 text-[17px] leading-tight text-neutral-900" style={{minHeight:48}}>{project.title}</div>
        <div className="mt-2 text-neutral-500 text-sm" style={{minHeight:20}}>{project.tag}</div>
      </div>
    </div>
  );
}

function Projects({ sectionRef }) {
  const fade = useEndFade(sectionRef, 25, 75);

  const yearsAll = useMemo(()=>{
    const ys = new Set([...projects.map(p=>new Date(p.date).getFullYear()), ...EXTRA_YEARS]);
    return Array.from(ys).sort((a,b)=>b-a);
  },[]);
  const yearCounts = useMemo(()=>{
    const m = new Map(); yearsAll.forEach(y=>m.set(String(y),0));
    projects.forEach(p=>{ const y=String(new Date(p.date).getFullYear()); m.set(y,(m.get(y)||0)+1); });
    return m;
  },[yearsAll]);

  const atomicServices = useMemo(()=>{
    const all = new Set(); projects.forEach(p=>p.tags.forEach(t=>all.add(t))); return Array.from(all).sort();
  },[]);
  const serviceCounts = useMemo(()=>{
    const m = new Map(); atomicServices.forEach(s=>m.set(s,0));
    projects.forEach(p=>p.tags.forEach(t=>m.set(t,(m.get(t)||0)+1)));
    return m;
  },[atomicServices]);

  const citiesAll = useMemo(()=>Array.from(new Set(projects.map(p=>p.city))).sort(),[]);
  const cityCounts = useMemo(()=>{
    const m = new Map(); citiesAll.forEach(c=>m.set(c,0)); projects.forEach(p=>m.set(p.city,(m.get(p.city)||0)+1)); return m;
  },[citiesAll]);

  const [filters, setFilters] = useState({ yearSet:new Set(), serviceSet:new Set(), citySet:new Set() });
  const [sort, setSort] = useState("pop");

  const yearsOpts   = yearsAll.map(y=>({ value:String(y), label:`${y} (${yearCounts.get(String(y))||0})` }));
  const serviceOpts = atomicServices.map(s=>({ value:s, label:`${s} (${serviceCounts.get(s)||0})` }));
  const cityOpts    = citiesAll.map(c=>({ value:c, label:`${c} (${cityCounts.get(c)||0})` }));

  const filtered = useMemo(()=>{
    let arr = projects.filter(p=>{
      const y = String(new Date(p.date).getFullYear());
      const okY = filters.yearSet.size===0 || filters.yearSet.has(y);
      const okS = filters.serviceSet.size===0 || p.tags.some(t=>filters.serviceSet.has(t));
      const okC = filters.citySet.size===0  || filters.citySet.has(p.city);
      return okY && okS && okC;
    });
    if (sort==="new") arr = arr.slice().sort((a,b)=>+new Date(b.date)-+new Date(a.date));
    return arr;
  },[filters,sort]);

  return (
    <section id="projects" ref={sectionRef} className="scroll-mt-20 py-24 bg-white" style={{ filter:`grayscale(${fade})`, opacity:`${1 - fade*0.6}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProjectsFilters
          filters={filters} setFilters={setFilters}
          yearsOpts={yearsOpts} serviceOpts={serviceOpts} cityOpts={cityOpts}
          sort={sort} setSort={setSort}
        />
        <div className="mt-8 grid md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p, idx)=><ProjectCard key={idx} project={p}/>)}
        </div>
        {filtered.length===0 && (
          <div className="mt-10 text-neutral-500">
            Ничего не найдено. Попробуйте{" "}
            <button onClick={()=>setFilters({yearSet:new Set(),serviceSet:new Set(),citySet:new Set()})} className="underline">
              сбросить фильтр
            </button>.
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */
function About({ sectionRef }) {
  const fade = useEndFade(sectionRef, 25, 75);
  const facts = useMemo(()=>[
    { value:"10+", label:"лет на рынке" },
    { value:"120+", label:"проектов" },
    { value:"24/7", label:"сервисная поддержка" },
    { value:"100%", label:"соответствие НТД" },
  ],[]);
  return (
    <section id="about" ref={sectionRef} className="scroll-mt-20 py-24 bg-white" style={{ filter:`grayscale(${fade})`, opacity:`${1 - fade*0.6}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">О компании</h2>
        <p className="max-w-3xl text-neutral-600">Проектируем, строим и обслуживаем инженерные системы любой сложности. Сфокусированы на качестве, прозрачности и сроках.</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f,i)=>(
            <div key={i} className="border border-neutral-200 bg-white p-6 text-center rounded-md">
              <div className="text-3xl font-semibold text-neutral-900">{f.value}</div>
              <div className="mt-2 text-neutral-500 text-sm">{f.label}</div>
            </div>
          ))}
        </div>

        {/* full-width map */}
        <div className="mt-10 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <img src="/map.png" alt="География проектов" className="w-full h-[420px] md:h-[520px] object-cover"/>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact({ sectionRef }) {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" ref={sectionRef} className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Контакты</h2>
        <p className="text-neutral-600 max-w-2xl">Оставьте заявку — ответим в течение рабочего дня и предложим решение под задачи вашего объекта.</p>
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <form onSubmit={(e)=>{e.preventDefault();setSent(true);}} className="border border-neutral-200 bg-white p-6 md:p-8 rounded-md">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm text-neutral-600">Имя</label>
                <input required className="mt-1 w-full bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500 rounded-md" placeholder="Как к вам обращаться"/></div>
              <div><label className="block text-sm text-neutral-600">Телефон или e-mail</label>
                <input required className="mt-1 w/full bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500 rounded-md" placeholder="+7••• или ваша@комания.ru"/></div>
            </div>
            <div className="mt-4"><label className="block text-sm text-neutral-600">Сообщение</label>
              <textarea rows={5} className="mt-1 w-full bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500 rounded-md" placeholder="Коротко о задаче, сроках и объекте"/></div>
            <button type="submit" className="mt-6 inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-medium hover:opacity-90 rounded-md">
              Отправить заявку <ArrowRight className="w-5 h-5"/>
            </button>
            {sent && <div className="mt-4 text-sm text-green-600">Спасибо! Заявка отправлена. Мы свяжемся с вами.</div>}
          </form>

          <div className="border border-neutral-200 bg-white p-6 md:p-8 rounded-md flex flex-col gap-6">
            <div className="flex items-start gap-3 text-neutral-800"><Phone className="w-5 h-5 text-neutral-500"/><a href="tel:+79129112000" className="hover:underline">+7 (912) 911-20-00</a></div>
            <div className="flex items-start gap-3 text-neutral-800"><Mail className="w-5 h-5 text-neutral-500"/><a href="mailto:info@cube-tech.ru" className="hover:underline">info@cube-tech.ru</a></div>
            <div className="flex items-start gap-3 text-neutral-800"><MapPin className="w-5 h-5 text-neutral-500"/>Россия, Ноябрьск (ЯНАО)</div>
            <div className="overflow-hidden border border-neutral-200 bg-neutral-100 h-64 grid place-items-center text-neutral-500 rounded-md">Карта вашего офиса</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function SiteFooter() {
  return (
    <footer className="bg-black text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="block h-6 w-10 bg-white" style={{ WebkitMask:`url(${logo}) center / contain no-repeat`, mask:`url(${logo}) center / contain no-repeat` }}/>
          <span className="text-sm text-neutral-400">© 2025 КУБ</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-neutral-400 hover:text-amber-400 transition-colors cursor-default">ИНН: 7700000000</span>
          <span className="text-neutral-400 hover:text-amber-400 transition-colors cursor-default">ОГРН: 1207700000000</span>
        </div>
        <button onClick={()=>{window.history.pushState({}, "", "/");window.scrollTo({top:0,behavior:"smooth"});}}
          className="relative group inline-flex items-center gap-2 text-neutral-300 hover:text-amber-400 transition-colors" aria-label="Наверх">
          <ArrowUp className="w-5 h-5"/><span>Наверх</span>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 h-[3px] w-0 bg-amber-400 transition-all duration-300 group-hover:w-12"/>
        </button>
      </div>
    </footer>
  );
}

/* ---------------- ROOT ---------------- */
export default function App() {
  const navigate = useSectionRouter();

  const servicesRangeRef = useRef(null);
  const projectsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const sections = useMemo(
    () => [
      { ref: servicesRangeRef, id: "services" },
      { ref: projectsRef,      id: "projects" },
      { ref: aboutRef,         id: "about" },
      { ref: contactRef,       id: "contact" },
    ],
    []
  );

  const activeId = useActiveTopTitle(sections, 0.42, {}, { services: "services-first" });
  const [serviceStep, setServiceStep] = useState(0);

  // Loader — минимум ~1.8s
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const MIN_MS = 1800;
    const started = Date.now();

    const finish = () => {
      const remain = MIN_MS - (Date.now() - started);
      setTimeout(() => setLoading(false), Math.max(0, remain));
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    const hardStop = setTimeout(() => setLoading(false), MIN_MS + 4000);
    return () => clearTimeout(hardStop);
  }, []);

  // индекс для поиска
  const indexForSearch = useMemo(() => {
    const svc = servicesData.map((s) => ({
      title: s.title, subtitle: s.blurb, image: s.image,
      onSelect: () => { window.history.pushState({}, "", "/services"); document.getElementById(s.id)?.scrollIntoView({behavior:"smooth"}); }
    }));
    const newest = Math.max(...projects.map(p=>+new Date(p.date)));
    const prj = projects.map((p) => ({
      title: p.title, subtitle: p.tag, image: p.images[0], badge: (+new Date(p.date)===newest) ? "new" : undefined,
      onSelect: () => { window.history.pushState({}, "", "/projects"); document.getElementById("projects")?.scrollIntoView({behavior:"smooth"}); }
    }));
    return [...svc, ...prj];
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Loader show={loading} />
      <Nav
        navigate={navigate}
        activeId={activeId}
        serviceStep={serviceStep}
        indexForSearch={indexForSearch}
      />
      <main className="flex-1 bg-white pt-20">
        <Showcase
          servicesRangeRef={servicesRangeRef}
          onServiceStepChange={setServiceStep}
        />
        <Projects sectionRef={projectsRef} />
        <About sectionRef={aboutRef} />
        <Contact sectionRef={contactRef} />
      </main>
      <SiteFooter />
    </div>
  );
}
