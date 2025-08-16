import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ArrowUp, Building2, Cable, Fan, Wrench,
  Phone, Mail, MapPin, CheckCircle2, ChevronDown, Undo2, Star,
  Search as SearchIcon, ChevronLeft, ChevronRight, X, Lock
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, Tooltip, Pane, Rectangle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import logo from "/logo-cube.png";
import loaderLogo from "/logo-cube3.png";

/* ---------------- palette / constants ---------------- */
const FILTER_BG = "#EDEDED";
const FILTER_BG_HOVER = "#E3E3E3";
const DROPDOWN_HOVER = "#DADADA";
const GOLD = "#fbbf24";

/* ---------------- utils / hooks ---------------- */
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
            start = center - window.innerHeight * 0.20;
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

/* ---- image preload helpers ---- */
async function decodeOnce(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.decode) {
        img.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}
async function preloadImages(urls, capMs = 2500) {
  const task = Promise.all(urls.map(decodeOnce));
  const timeout = new Promise((r) => setTimeout(r, capMs));
  await Promise.race([task, timeout]);
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
          <motion.span
            initial={{ ["--w"]: "0%" }}
            animate={{ ["--w"]: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="block w-[340px] h-[110px] sm:w-[380px] sm:h-[120px]"
            style={{
              WebkitMask: `url(${loaderLogo}) center / contain no-repeat`,
              mask: `url(${loaderLogo}) center / contain no-repeat`,
              backgroundImage: `linear-gradient(${GOLD}, ${GOLD}), linear-gradient(#ffffff, #ffffff)`,
              backgroundRepeat: "no-repeat, no-repeat",
              backgroundPosition: "left, center",
              backgroundSize: "var(--w) 100%, 100% 100%",
            }}
            aria-label="KUB loading"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- AUTH MODAL ---------------- */
function AuthModal({ open, onClose, onLogin }) {
  const ref = useRef(null);
  useClickOutside(ref, () => open && onClose());

  const [mode, setMode] = useState("login"); // login | register | reset
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const shakeNow = (msg) => { setError(msg); setShakeKey((k) => k + 1); };

  useEffect(() => {
    if (!open) {
      setMode("login");
      setEmail(""); setPwd(""); setConfirm("");
      setError(""); setSent(false); setResetSent(false);
    }
  }, [open]);

  const strongEnough = /[A-Z]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8;

  const doRegister = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return shakeNow("Введите корректный e-mail");
    if (!strongEnough) return shakeNow("Пароль: минимум 8 символов, одна заглавная и один спецсимвол.");
    if (pwd !== confirm) return shakeNow("Пароли не совпадают");

    localStorage.setItem("cube-auth-pending", JSON.stringify({ email, pwd, verified: false }));
    setSent(true);
    setError("");
  };

  const confirmEmail = () => {
    const raw = localStorage.getItem("cube-auth-pending");
    if (!raw) return;
    const data = JSON.parse(raw);
    data.verified = true;
    localStorage.setItem("cube-auth", JSON.stringify(data));
    localStorage.removeItem("cube-auth-pending");
    onLogin(data.email);
    onClose();
  };

  const doLogin = (e) => {
    e.preventDefault();
    const acc = JSON.parse(localStorage.getItem("cube-auth") || "null");
    if (!acc) return shakeNow("Сначала зарегистрируйтесь");
    if (acc.email !== email || acc.pwd !== pwd) return shakeNow("Неверная почта или пароль");
    onLogin(acc.email);
    onClose();
  };

  const doReset = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return shakeNow("Введите корректный e-mail");
    setResetSent(true); setError("");
  };

  const wrapCls = "fixed inset-0 z-[95] bg-gradient-to-b from-black/90 via-black/85 to-black/90 grid place-items-center p-4";
  const panelCls = "w-full max-w-md rounded-2xl bg-[#111] border border-neutral-800 shadow-2xl overflow-hidden";
  const titleCls = "mt-4 text-center text-[28px] font-medium text-white";
  const fieldWrap = "relative";
  const fieldCls = "w-full bg-[#1B1B1B] border border-[#2A2A2A] text-white placeholder:text-neutral-500 rounded-md pl-10 pr-3 py-3 outline-none focus:border-neutral-400";
  const iconCls = "absolute left-3 top-1/2 -translate-y-1/2 text-amber-400";
  const goldBtn = "w-full inline-flex items-center justify-center gap-2 bg-amber-400 text-black rounded-md py-3 font-medium hover:brightness-105 active:brightness-95 transition";
  const linkGold = "text-amber-400 hover:brightness-110";
  const helpLink = "text-sm text-neutral-400 hover:text-amber-400 transition";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className={wrapCls}
        >
          <motion.div
            ref={ref}
            initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 22, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={panelCls}
          >
            {/* HEADER */}
            <div className="px-8 pt-7 pb-2 relative">
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute right-4 top-4 text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ЛОГОРАЗМЕР как в шапке: h-16 w-28 и тот же знак */}
<div className="grid place-items-center">
  <span
    className="block h-16 w-28 mb-5 md:mb-6"
    style={{
      WebkitMask: `url(${logo}) center / contain no-repeat`,
      mask: `url(${logo}) center / contain no-repeat`,
      backgroundColor: "#fff",
    }}
    aria-label="КУБ"
  />
</div>

              <div className={titleCls}>
                {mode === "login" && "Вход"}
                {mode === "register" && "Регистрация"}
                {mode === "reset" && "Восстановление доступа"}
              </div>
            </div>

            {/* BODY */}
            <div className="px-8 pb-7 space-y-5">
              {/* LOGIN */}
              {mode === "login" && (
                <form onSubmit={doLogin} className="space-y-4">
                  <div className={fieldWrap}>
                    <Mail className={iconCls} size={18} />
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className={fieldCls} placeholder="Почта" autoFocus />
                  </div>
                  <div className={fieldWrap}>
                    <Lock className={iconCls} size={18} />
                    <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} className={fieldCls} placeholder="Пароль" />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key={shakeKey}
                        initial={{ x: 0 }} animate={{ x: [0,-10,10,-6,6,-3,3,0] }} transition={{ duration: 0.5 }}
                        className="text-sm text-red-400"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button type="submit" className={goldBtn}>
                    Войти <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <div className="text-sm text-neutral-400">
                      Впервые на сайте?{" "}
                      <button type="button" onClick={()=>{setMode("register"); setError("");}} className={linkGold}>Регистрация</button>
                    </div>
                    <button type="button" onClick={()=>{setMode("reset"); setError("");}} className={helpLink}>Забыли пароль?</button>
                  </div>
                </form>
              )}

              {/* REGISTER */}
              {mode === "register" && (!sent ? (
                <form onSubmit={doRegister} className="space-y-4">
                  <div className={fieldWrap}>
                    <Mail className={iconCls} size={18} />
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className={fieldCls} placeholder="Почта" autoFocus />
                  </div>
                  <div className={fieldWrap}>
                    <Lock className={iconCls} size={18} />
                    <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} className={fieldCls} placeholder="Пароль" />
                  </div>
                  <div className={fieldWrap}>
                    <Lock className={iconCls} size={18} />
                    <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className={fieldCls} placeholder="Повторите пароль" />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key={shakeKey}
                        initial={{ x: 0 }} animate={{ x: [0,-10,10,-6,6,-3,3,0] }} transition={{ duration: 0.5 }}
                        className="text-sm text-red-400"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button type="submit" className={goldBtn}>
                    Зарегистрироваться <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="text-sm text-neutral-400 text-center">
                    Уже есть аккаунт?{" "}
                    <button type="button" onClick={()=>{setMode("login"); setError("");}} className={linkGold}>Войти</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-neutral-200">
                    Мы отправили письмо на <b>{email}</b> для подтверждения.
                  </div>
                  <button onClick={confirmEmail} className={goldBtn}>
                    Я перешёл(ла) по ссылке <ArrowRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={()=>setMode("login")} className={helpLink + " block mx-auto"}>
                    Вернуться к входу
                  </button>
                </div>
              ))}

              {/* RESET */}
              {mode === "reset" && (!resetSent ? (
                <form onSubmit={doReset} className="space-y-4">
                  <div className={fieldWrap}>
                    <Mail className={iconCls} size={18} />
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className={fieldCls} placeholder="Почта для восстановления" autoFocus />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key={shakeKey}
                        initial={{ x: 0 }} animate={{ x: [0,-10,10,-6,6,-3,3,0] }} transition={{ duration: 0.5 }}
                        className="text-sm text-red-400"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button type="submit" className={goldBtn}>
                    Отправить <ArrowRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={()=>setMode("login")} className={helpLink + " block mx-auto"}>
                    Вернуться к входу
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="text-neutral-200">
                    Письмо для восстановления отправлено на <b>{email}</b>.
                  </div>
                  <button type="button" onClick={()=>setMode("login")} className={goldBtn}>
                    К окну входа <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ---------------- NAV ---------------- */
function Nav({ navigate, activeId, serviceStep, indexForSearch, onOpenAuth, userEmail }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const searchWrapRef = useRef(null);
  useClickOutside(searchWrapRef, () => setSearchOpen(false));

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const items = [
    { href: "/services", id: "services", label: "Услуги" },
    { href: "/projects", id: "projects", label: "Проекты" },
    { href: "/about",    id: "about",    label: "О нас" },
    { href: "/contact",  id: "contact",  label: "Контакты" },
  ];

  const results = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return indexForSearch.slice(0, 8);
    return indexForSearch.filter(it => it._keys.some(k => k.includes(text))).slice(0, 12);
  }, [q, indexForSearch]);

  const activate = (res) => { setSearchOpen(false); res.onSelect(); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      {/* локальные стили: эффект «из центра» — две шторки расходятся к краям */}
      <style>{`
        .kub-reveal{ position:relative; display:inline-block; }
        .kub-reveal::before, .kub-reveal::after{
          content:""; position:absolute; top:0; bottom:0; width:50%;
          background:#000; transition:width .35s ease;
        }
        .kub-reveal::before{ left:0; }
        .kub-reveal::after{ right:0; }
        .group:hover .kub-reveal::before,
        .group:hover .kub-reveal::after{ width:0; }
      `}</style>

      {/* desktop */}
      <div className="hidden md:grid h-20 w-full grid-cols-[auto,1fr,auto] items-center">
        {/* ЛОГО + “КУБ”: справа, чуть смещён правее; открытие из центра */}
        <a
          href="/"
          onClick={(e)=>{e.preventDefault();navigate("/",null);}}
          className="group relative flex items-center pl-3"
        >
          <span className="relative block">
            <span
              className="block h-16 w-28 bg-white transition-colors duration-150 group-hover:bg-amber-400"
              style={{ WebkitMask:`url(${logo}) center / contain no-repeat`, mask:`url(${logo}) center / contain no-repeat` }}
              aria-label="КУБ"
            />
            <span
              className="pointer-events-none absolute left-full -ml-5 top-1/2 -translate-y-1/2 z-[2]
                         opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                         transition-all duration-300"
              style={{
                fontFamily: `'Jost', 'Montserrat', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
                fontWeight: 200,         // <<< стало тоньше
                fontSize: "28px",
                letterSpacing: "0.15em",
                color: "#fbbf24"
              }}
            >
              <span className="kub-reveal">КУБ</span>
            </span>
          </span>
        </a>

        {/* навигация */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-sm">
          {items.map((item) => {
            const active = activeId === item.id;
            const isServices = item.id === "services";
            return (
              <span key={item.id} className="relative">
                <a
                  href={item.href}
                  onClick={(e)=>{e.preventDefault();window.history.pushState({}, "", item.href);document.getElementById(item.id)?.scrollIntoView({behavior:"smooth",block:"start"});}}
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

        {/* иконки справа */}
        <div className="hidden md:flex items-center gap-6 text-neutral-200 justify-self-end pr-5">
          {/* SEARCH */}
          <div className="relative group flex items-center" ref={searchWrapRef}>
            <button
              onClick={() => { setSearchOpen(v=>!v); setTimeout(()=>{ const el = document.getElementById("global-search-input"); el && el.focus(); }, 0); }}
              className="inline-flex items-center text-neutral-200 hover:text-amber-400 transition-colors"
              aria-label="Поиск"
              title="Поиск"
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
                  className="absolute top-[150%] right-0 w-[540px] bg-white text-black rounded-xl shadow-2xl overflow-hidden"
                >
                  <span className="absolute -top-2 right-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
                  <div className="p-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <SearchIcon className="w-5 h-5 text-neutral-500" />
                      <input
                        id="global-search-input"
                        value={q}
                        onChange={(e)=>{ setQ(e.target.value); setActiveIdx(0); }}
                        onKeyDown={(e)=>{
                          if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i+1, results.length-1)); }
                          if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i-1, 0)); }
                          if (e.key === "Enter" && results[activeIdx]) { e.preventDefault(); activate(results[activeIdx]); }
                        }}
                        placeholder="Ищите услуги, проекты, города…"
                        className="w-full outline-none text-lg placeholder:text-neutral-400"
                        autoFocus
                      />
                    </div>
                  </div>
                  <ul className="max-h-[60vh] overflow-auto">
                    {results.map((r, i) => (
                      <li key={i}>
                        <button
                          onClick={() => activate(r)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 ${i===activeIdx ? "bg-neutral-50" : "hover:bg-neutral-50"}`}
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
                        Показать всё ({results.length})
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACCOUNT */}
          <div className="relative group flex items-center">
            <button onClick={onOpenAuth} className="inline-flex items-center text-neutral-200 hover:text-amber-400 transition-colors" aria-label="Учётная запись">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <TooltipPill label={userEmail ? userEmail : "Учётная запись"} />
          </div>

          {/* CART */}
          <div className="relative group flex items-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-200 group-hover:text-amber-400 transition-colors" fill="none">
              <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="20" r="1.5" fill="currentColor"/>
              <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
            </svg>
            <TooltipPill label="Корзина" />
          </div>
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden h-16 px-3 flex items-center justify-between">
        <a
          href="/"
          onClick={(e)=>{e.preventDefault();window.history.pushState({}, "", "/"); window.scrollTo({top:0, behavior:"smooth"});}}
          className="group"
        >
          <span
            className="block h-8 w-14 bg-white transition-colors duration-150 group-hover:bg-amber-400"
            style={{ WebkitMask:`url(${logo}) center / contain no-repeat`, mask:`url(${logo}) center / contain no-repeat` }}
          />
        </a>
        <div className="flex items-center gap-5 text-neutral-200">
          <SearchIcon className="w-6 h-6"/>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="20" r="1.5" fill="currentColor"/>
            <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
          </svg>
        </div>
      </div>
    </header>
  );
}


/* ---------------- SERVICES data ---------------- */
const servicesData = [
  { id:"s1", icon:<Cable className="w-6 h-6"/>, title:"Слаботочные системы", blurb:"СКС, видеонаблюдение, СКУД, ОПС, связь", image:"/low_current_systems-1920",
    details:["Проектирование и обследование","Монтаж и пусконаладка","Интеграция с IT-инфраструктурой","Сервис и регламентные работы"] },
  { id:"s2", icon:<Wrench className="w-6 h-6"/>, title:"Электросети", blurb:"Внутренние/наружные сети, щиты, заземление, освещение", image:"/electrical-1920",
    details:["Расчёт нагрузок, подбор автоматики","Монтаж кабельных линий","Проверки ПУЭ / ПТЭЭП / ГОСТ","Исполнительная документация"] },
  { id:"s3", icon:<Fan className="w-6 h-6"/>, title:"Вентиляция и кондиционирование", blurb:"ПВУ, дымоудаление, чиллер-фанкойлы, автоматика", image:"/ventilation-1920",
    details:["Аэродинамические расчёты","Монтаж воздуховодов и агрегатов","Автоматика и диспетчеризация","Паспортные испытания"] },
  { id:"s4", icon:<Building2 className="w-6 h-6"/>, title:"Общестрой под ключ", blurb:"Комплекс СМР: от демонтажа до чистовой отделки", image:"/construction-1920",
    details:["Генподряд и управление проектом","Координация субподрядчиков","Технадзор и охрана труда","Сроки и бюджет под контролем"] },
];

// helper для карточек проектов
const toOptimized = (src) => {
  if (!src) return { webp: "", jpg: "" };
  const dot = src.lastIndexOf(".");
  const base = dot >= 0 ? src.slice(0, dot) : src;
  return { webp: `${base}-1200.webp`, jpg: `${base}-1200.jpg` };
};


/* ---------------- Service Overlay ---------------- */
function ServiceOverlay({ openId, onClose }) {
  const ref = useRef(null);
  useClickOutside(ref, () => openId && onClose?.());

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape" && openId) onClose?.(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [openId, onClose]);

  const isS1 = openId === "s1";

  return (
    <AnimatePresence>
      {openId && (
        <>
          {/* затемняющая подложка */}
          <motion.div
            key="overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black"
          />
          {/* панель */}
          <motion.div
            key="overlay-panel-wrap"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 top-20 bottom-0 z-[100] overflow-auto"
          >
            <div
              ref={ref}
              className="mx-auto max-w-5xl bg-white rounded-t-2xl md:rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden"
            >
              <div className="relative px-6 md:px-8 pt-6 pb-4 border-b border-neutral-200">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-neutral-500 hover:text-black"
                  aria-label="Закрыть"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
                  {isS1 ? "Слаботочные системы" : "Услуга"}
                </h3>
              </div>

              <div className="px-6 md:px-8 py-8">
                <div className="prose max-w-none text-[17px] leading-7 text-neutral-800">
                  {isS1 ? (
                    <>
                      <p><b>СКС.</b> Проектируем и строим структурированные кабельные системы под текущие и будущие нагрузки. Паспортизация линий, маркировка, планы трасс.</p>
                      <p><b>Видеонаблюдение.</b> Камеры, оптика, серверы хранения, аналитика, удалённый доступ. Подбор под освещённость и задачи.</p>
                      <p><b>СКУД.</b> Двери, турникеты, калитки, интеграция с 1С/HR, анти-passback, гостевой доступ.</p>
                      <p><b>ОПС и СОУЭ.</b> Охранно-пожарная сигнализация, оповещение, диспетчеризация, согласование с надзором.</p>
                      <p><b>Связь.</b> IP-телефония, мини-АТС, проводная/беспроводная инфраструктура, QoS.</p>
                      <p><b>Проектирование и обследование.</b> Выезд, инструментальные замеры, рабочая и исполнительная документация.</p>
                      <p><b>Монтаж и ПНР.</b> Этапами, с контролем качества и сроков. Аккуратная укладка трасс, соблюдение НТД.</p>
                      <p><b>Интеграция с IT.</b> Сети, VLAN, PoE-нагрузки, мониторинг, журналирование.</p>
                      <p><b>Сервис.</b> Договорное обслуживание, регламент, SLA, аварийные выезды 24/7.</p>
                    </>
                  ) : (
                    <p>Детальное описание услуги появится позже. Скажи, какую именно услугу открыть, и я заполню раздел.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
/* ---------------- HERO + sticky services (с учетом -1920 и <picture>) ---------------- */
function Showcase({ servicesRangeRef, onServiceStepChange, onOpenService }) {
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const serviceRefs = useRef(servicesData.map(() => React.createRef()));
  const [baseIdx, setBaseIdx] = useState(0);
  const [blend, setBlend] = useState(0);
  const IMG_POS = "30% center";
  const endFade = useEndFade(sectionRef, 25, 75);

  const imageBases = useMemo(()=>["/image1-1920", ...servicesData.map(s=>s.image)],[]);
  const nextIdx = Math.min(baseIdx+1, imageBases.length-1);

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
            const start=0.30, end=0.80;
            const p = t<=start?0 : t>=end?1 : (t-start)/(end-start);
            setBaseIdx(i); setBlend(Math.max(0,Math.min(1,p)));
            break;
          }
        }
      }

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

  // подгружаем «следующие»
  useEffect(() => {
    const webp = (b) => `${b}.webp`;
    const next2 = Math.min(nextIdx + 1, imageBases.length - 1);
    decodeOnce(webp(imageBases[nextIdx]));
    decodeOnce(webp(imageBases[next2]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextIdx]);

  const clipBottomPct = baseIdx===imageBases.length-1 ? 100 : 100 - blend*100;

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
                <a href="#services" onClick={(e)=>{e.preventDefault();document.getElementById("services")?.scrollIntoView({behavior:"smooth"});}}
                   className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
                  Подробнее <ArrowRight className="w-5 h-5"/>
                </a>
              </div>
            </div>
          </article>

          <div id="services-first" aria-hidden="true" className="h-0" />
          <div id="services" ref={servicesRangeRef}>
            {servicesData.map((s, idx)=>(
              <article key={s.id} ref={serviceRefs.current[idx]} className="min-h-[120vh] flex items-center">
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
                    <button onClick={()=>onOpenService(s.id)} className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
                      Подробнее <ArrowRight className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* right sticky: два picture-слоя, верхний клипуем */}
        <div className="relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            {/* base */}
            <div className="absolute inset-0">
              <picture>
                <source srcSet={`${imageBases[baseIdx]}.webp`} type="image/webp" />
                <img src={`${imageBases[baseIdx]}.jpg`} alt="" className="w-full h-full object-cover" style={{objectPosition:IMG_POS}} loading="eager" decoding="async" fetchpriority="high"/>
              </picture>
            </div>
            {/* next with wipe top->down */}
            <div className="absolute inset-0" style={{ clipPath:`inset(0% 0% ${clipBottomPct}% 0%)`, willChange:"clip-path" }}>
              <picture>
                <source srcSet={`${imageBases[nextIdx]}.webp`} type="image/webp" />
                <img src={`${imageBases[nextIdx]}.jpg`} alt="" className="w-full h-full object-cover" style={{objectPosition:IMG_POS}} loading="eager" decoding="async"/>
              </picture>
            </div>
          </div>
        </div>
      </div>

      {/* mobile (кратко) */}
      <div className="md:hidden">
        <div className="px-5 pt-6">
          <h1 className="text-3xl font-extrabold leading-tight text-center">Инженерные системы под ключ</h1>
          <div className="mt-6"><img src="/image1-1920.jpg" alt="" className="w-full h-64 object-cover" style={{objectPosition:"30% center"}}/></div>
          <div className="mt-6 flex justify-center">
            <a href="#services" onClick={(e)=>{e.preventDefault();document.getElementById("services")?.scrollIntoView({behavior:"smooth"});}}
               className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium">
              Подробнее <ArrowRight className="w-5 h-5"/>
            </a>
          </div>
        </div>
        <h2 className="mt-10 px-5 text-3xl font-semibold text-center">Услуги</h2>
        <div className="mt-6 px-5">
          {servicesData.map((s)=>(
            <div key={s.id} className="mb-10" id={s.id}>
              <img src={`${s.image}.jpg`} alt={s.title} className="w-full h-56 object-cover" style={{objectPosition:"30% center"}}/>
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
                  <button onClick={()=>onOpenService(s.id)} className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium">
                    Подробнее <ArrowRight className="w-5 h-5"/>
                  </button>
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
    service:"СКС + ОПС + Электроснабжение", tags:["СКС","ОПС","Электроснабжение"], date:"2025-03-10", isNew:true,
    images:["/objects/RMM/1.jpeg","/objects/RMM/2.jpeg","/objects/RMM/3.jpeg"] },
  { title:"Ресторан «FRANK by БАСТА»", tag:"ОПС + ВПВ", city:"Тюмень",
    service:"ОПС + ВПВ", tags:["ОПС","ВПВ"], date:"2025-05-28",
    images:["/objects/Frank/1.jpg","/objects/Frank/2.jpg"] },
  { title:"АБК «Газпром инвест»", tag:"Обследование инженерных систем", city:"Ноябрьск",
    service:"Обследование инженерных систем", tags:["Обследование инженерных систем"], date:"2025-01-15",
    images:["/objects/Lenina/1.jpg","/objects/Lenina/2.jpg","/objects/Lenina/3.jpg","/objects/Lenina/4.jpg","/objects/Lenina/5.jpg"] },
  { title:"«Газпром инвест»", tag:"Восстановление СКС, ОПС", city:"Ноябрьск",
    service:"Восстановление СКС, ОПС", tags:["СКС","ОПС"], date:"2024-09-07",
    images:["/objects/Invest/1.jpg","/objects/Invest/2.jpg"] },
];
const EXTRA_YEARS = [2025];

function MultiFilterButton({ id, label, selectedSet, options, onToggle, openId, setOpenId }) {
  const open = openId === id;
  const count = selectedSet.size;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className="h-[40px] px-3 pr-8 text-left text-[13px] text-neutral-900 inline-flex items-center relative rounded-md transition-colors w-auto min-w-0 whitespace-nowrap"
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
        <div className="absolute z-30 mt-2 rounded-md shadow-md overflow-hidden p-1 min-w-max" style={{ backgroundColor: FILTER_BG }}>
          {options.map((opt)=> {
            const checked = selectedSet.has(opt.value);
            return (
              <button
                key={opt.value}
                onClick={()=> onToggle(opt.value)}
                className="flex items-center w-full gap-2 px-3 py-2 text-left text-[13px] text-neutral-900 leading-tight transition-colors whitespace-nowrap"
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
        id="year" label="Дата" selectedSet={filters.yearSet} options={yearsOpts}
        openId={openId} setOpenId={setOpenId}
        onToggle={(val)=> setFilters(f=>{ const s=new Set(f.yearSet); s.has(val)?s.delete(val):s.add(val); return {...f, yearSet:s}; })}
      />
      <MultiFilterButton
        id="service" label="Услуга" selectedSet={filters.serviceSet} options={serviceOpts}
        openId={openId} setOpenId={setOpenId}
        onToggle={(val)=> setFilters(f=>{ const s=new Set(f.serviceSet); s.has(val)?s.delete(val):s.add(val); return {...f, serviceSet:s}; })}
      />
      <MultiFilterButton
        id="city" label="Город" selectedSet={filters.citySet} options={cityOpts}
        openId={openId} setOpenId={setOpenId}
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
  const many = project.images?.length > 1;
  const cur = project.images?.[i] || "";
  const { webp, jpg } = toOptimized(cur || "/placeholder");
  const [loaded, setLoaded] = useState(false);

  const prev = () => setI(idx => (idx - 1 + project.images.length) % project.images.length);
  const next = () => setI(idx => (idx + 1) % project.images.length);

  return (
    <div className="relative bg-white rounded-md border border-neutral-300">
      {project.isNew && (
        <div className="absolute -top-3 right-3 z-10 px-3 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs inline-flex items-center gap-1">
          <Star className="w-4 h-4"/><span>Новый</span>
        </div>
      )}

      <div className="p-2.5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white group">
          <AnimatePresence mode="wait">
            <motion.div key={cur} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
              <picture>
                <source srcSet={webp} type="image/webp" />
                <img
                  src={jpg}
                  alt={project.title}
                  className={`w-full h-full object-cover transition-[filter] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] grayscale saturate-0 brightness-[0.88] group-hover:grayscale-0 group-hover:saturate-100 group-hover:brightness-100 ${loaded ? "opacity-100" : "opacity-0"}`}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoaded(true)}
                  onError={() => setLoaded(true)}
                />
              </picture>
              {/* лёгкая вуаль (становится прозрачной на hover) */}
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] bg-neutral-500/10 group-hover:opacity-0" />
            </motion.div>
          </AnimatePresence>

          {many && (
            <>
              <button onClick={prev} aria-label="Назад" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/0 hover:bg-black/15 active:bg-black/20 text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} aria-label="Вперёд" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/0 hover:bg-black/15 active:bg-black/20 text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {project.images.map((_, di) => (
                  <button
                    key={di} onClick={() => setI(di)} aria-label={`Слайд ${di + 1}`}
                    className={`h-[3px] w-5 rounded-full ring-1 ring-black/10 transition-colors ${i === di ? "bg-black" : "bg-amber-400"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-3 pb-4">
        <div className="text-neutral-500 text-xs" style={{minHeight:18}}>{project.city}</div>
        <div className="mt-1 text-[16px] leading-tight text-neutral-900" style={{minHeight:46}}>{project.title}</div>
        <div className="mt-1.5 text-neutral-500 text-sm" style={{minHeight:20}}>{project.tag}</div>
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
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
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

/* ---------------- MAP (CompanyMap) ---------------- */
function CompanyMap({ projects }) {
  const TILE_LIGHT_NO_LABELS = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
  const MAP_ATTR = "© OpenStreetMap contributors · © CARTO";

  const CITY_COORDS = {
    "Ноябрьск": [63.201, 75.451],
    "Тюмень":   [57.153, 65.534],
    "Сургут":   [61.254, 73.396],
  };

  function createPinIcon(size = 16, color = GOLD) {
    const border = "#111";
    const html = `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:2px solid ${border};
        box-shadow:0 0 0 3px rgba(0,0,0,.25);
        transform:translate(-50%,-50%);
      "></div>
    `;
    return L.divIcon({
      html,
      className: "kub-pin",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // подпись: чуть левее и выше пина (X: -56% вместо -50%, Y: -210%)
  function createCityLabelIcon(text) {
    const safe = String(text || "");
    const html = `
      <span style="
        position:absolute; left:50%; top:0; transform:translate(-56%,-210%);
        font-family: 'Arial Narrow', Arial, 'Inter', sans-serif;
        font-size:14px; line-height:1; font-weight:700;
        letter-spacing:.2px; color:#111; background:transparent;
        padding:2px 4px; border-radius:6px;
        pointer-events:none; white-space:nowrap;
        text-shadow: 0 1px 0 rgba(255,255,255,.5);
      ">${safe}</span>
    `;
    return L.divIcon({ html, className: "kub-city-label", iconSize: [0, 0], iconAnchor: [0, 0] });
  }

  function FitBounds({ bounds }) {
    const map = useMap();
    useEffect(() => {
      if (!bounds) return;
      try { map.fitBounds(bounds, { padding: [20, 20] }); } catch {}
    }, [map, bounds]);
    return null;
  }

  const groups = useMemo(() => {
    const m = new Map();
    (projects || []).forEach((p) => {
      const city = (p.city || "").trim();
      if (!city) return;
      if (!m.has(city)) m.set(city, []);
      m.get(city).push(p);
    });
    return m;
  }, [projects]);

  const markers = useMemo(() => {
    const res = [];
    groups.forEach((list, city) => {
      const coords = CITY_COORDS[city];
      if (coords) res.push({ city, lat: coords[0], lng: coords[1], projects: list });
    });
    return res;
  }, [groups]);

  const bounds = useMemo(() => {
    if (!markers.length) return L.latLngBounds([[61, 72], [61, 72]]);
    return L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
  }, [markers]);

  const pinDefault = useMemo(() => createPinIcon(16, GOLD), []);
  const pinHover   = useMemo(() => createPinIcon(20, "#fde68a"), []);

  return (
    <div className="relative w-full h-[420px] md:h-[520px] bg-[#f3f3f3] border border-neutral-200 overflow-hidden">
      <style>{`
        .kub-pin,
        .kub-pin.leaflet-div-icon { background: transparent !important; border: none !important; box-shadow: none !important; }
        .leaflet-container .leaflet-tooltip {
          background: rgba(17,17,17,0.92);
          color: #fff;
          border: 1px solid #222;
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(0,0,0,.35);
          padding: 8px 10px;
        }
        .leaflet-container .leaflet-tooltip-top:before { border-top-color: rgba(17,17,17,0.92); }
      `}</style>

      <MapContainer
        center={[61, 72]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        preferCanvas
        attributionControl={false}
      >
        <TileLayer url={TILE_LIGHT_NO_LABELS} attribution={MAP_ATTR} />

        {/* затемнение тайлов (ниже маркеров) */}
        <Pane name="kub-dim" style={{ zIndex: 350 }}>
          <Rectangle
            bounds={[[-90, -180], [90, 180]]}
            pathOptions={{ color: undefined, fillColor: "#000", fillOpacity: 0.14, weight: 0 }}
          />
        </Pane>

        <FitBounds bounds={bounds} />

        {markers.map((m) => (
          <React.Fragment key={m.city}>
            {/* подпись города — чуть левее и выше пина */}
            <Marker position={[m.lat, m.lng]} icon={createCityLabelIcon(m.city)} zIndexOffset={1000} />
            {/* пин + тултип/попап */}
            <Marker
              position={[m.lat, m.lng]}
              icon={pinDefault}
              eventHandlers={{
                mouseover: (e) => e.target.setIcon(pinHover),
                mouseout:  (e) => e.target.setIcon(pinDefault),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                <div className="space-y-1">
                  <div className="font-semibold">{m.city}</div>
                  <div className="text-xs opacity-70">{m.projects.length} проект(а)</div>
                  <ul className="text-xs mt-1 list-disc ml-4">
                    {m.projects.slice(0, 4).map((p, idx) => (
                      <li key={p.title + idx}>{p.title}</li>
                    ))}
                  </ul>
                </div>
              </Tooltip>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{m.city}</div>
                  <div className="text-xs opacity-70">{m.projects.length} проект(а)</div>
                  <ul className="text-xs mt-1 list-disc ml-4">
                    {m.projects.slice(0, 6).map((p, idx) => (
                      <li key={p.title + idx}>{p.title}</li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
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
    <section id="about" ref={sectionRef} className="scroll-mt-20 py-24 bg-white"
             style={{ filter:`grayscale(${fade})`, opacity:`${1 - fade*0.6}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">О компании</h2>

        {/* одна строка, центр; шрифт/размер как был */}
        <div className="overflow-x-auto flex justify-center">
          <p className="inline-block whitespace-nowrap text-neutral-600">
            Проектируем, строим и обслуживаем инженерные системы любой сложности. Сфокусированы на качестве, прозрачности и сроках.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f,i)=>(
            <div key={i} className="border border-neutral-200 bg-white p-6 text-center rounded-md">
              <div className="text-3xl font-semibold text-neutral-900">{f.value}</div>
              <div className="mt-2 text-neutral-500 text-sm">{f.label}</div>
            </div>
          ))}
        </div>

        {/* карта во всю ширину окна */}
        <div className="mt-10 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <CompanyMap projects={projects} />
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
                <input required className="mt-1 w-full bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500 rounded-md" placeholder="+7••• или ваша@комания.ru"/></div>
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
          <span className="text-neutral-400 hover:text-amber-400 transition-colors cursor-default">Карта: данные OpenStreetMap, плитки CARTO</span>
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

  // Loader: минимум 1.8s + предзагрузка webp
  useEffect(() => {
    const MIN_MS = 1800;
    const started = Date.now();
    const heroBases = ["/image1-1920", ...servicesData.map(s => s.image)];
    const heroWebp = heroBases.map(b => `${b}.webp`);
    const projectFirstWebp = projects.map(p => toOptimized(p.images[0] || "").webp);
    const all = Array.from(new Set([...heroWebp, ...projectFirstWebp]));
    (async () => {
      await preloadImages(all, 2500);
      const remain = MIN_MS - (Date.now() - started);
      setTimeout(() => setLoading(false), Math.max(0, remain));
    })();
  }, []);

  // небольшая предзагрузка первых 3 карточек «Проекты» (JPG fallback)
  useEffect(() => {
    const first = projects.slice(0, 3).map(p => toOptimized(p.images[0] || "").jpg);
    first.forEach((href) => { if (!href) return; const link = document.createElement("link"); link.rel = "preload"; link.as = "image"; link.href = href; document.head.appendChild(link); });
  }, []);

  const [loading, setLoading] = useState(true);

  // простая «сессия»
  const [userEmail, setUserEmail] = useState(()=>{
    const acc = JSON.parse(localStorage.getItem("cube-auth")||"null");
    return acc?.verified ? acc.email : "";
  });
  const [authOpen, setAuthOpen] = useState(false);

  // индекс поиска
  const indexForSearch = useMemo(() => {
    const svc = servicesData.map((s) => ({
      title: s.title, subtitle: s.blurb, image: `${s.image}.jpg`,
      _keys:[s.title, s.blurb, ...s.details].map(t=>t.toLowerCase()),
      onSelect: () => { window.history.pushState({}, "", "/services"); document.getElementById(s.id)?.scrollIntoView({behavior:"smooth",block:"center"}); }
    }));
    const prj = projects.map((p) => ({
      title: p.title, subtitle: `${p.city} • ${p.tag}`, image: toOptimized(p.images[0] || "").jpg, badge: p.isNew ? "new" : undefined,
      _keys:[p.title, p.city, p.tag, ...p.tags].map(t=>t.toLowerCase()),
      onSelect: () => { window.history.pushState({}, "", "/projects"); document.getElementById("projects")?.scrollIntoView({behavior:"smooth",block:"start"}); }
    }));
    const staticPages = [
      { title:"О нас", subtitle:"О компании", image:"/image1-1920.jpg", _keys:["о нас","о компании","about"], onSelect:()=>{window.history.pushState({}, "", "/about"); document.getElementById("about")?.scrollIntoView({behavior:"smooth"});} },
      { title:"Контакты", subtitle:"+7 (912) 911-20-00", image:"/image1-1920.jpg", _keys:["контакты","связаться","email","телефон"], onSelect:()=>{window.history.pushState({}, "", "/contact"); document.getElementById("contact")?.scrollIntoView({behavior:"smooth"});} },
    ];
    return [...svc, ...prj, ...staticPages];
  }, []);

  // Overlay услуги
  const [openServiceId, setOpenServiceId] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Loader show={loading} />
      <Nav
        navigate={navigate}
        activeId={activeId}
        serviceStep={serviceStep}
        indexForSearch={indexForSearch}
        onOpenAuth={()=>setAuthOpen(true)}
        userEmail={userEmail}
      />
      <main className="flex-1 bg-white pt-20">
        <Showcase
          servicesRangeRef={servicesRangeRef}
          onServiceStepChange={setServiceStep}
          onOpenService={(id)=>setOpenServiceId(id)}
        />
        <Projects sectionRef={projectsRef} />
        <About sectionRef={aboutRef} />
        <Contact sectionRef={contactRef} />
      </main>
      <SiteFooter />

      <ServiceOverlay openId={openServiceId} onClose={()=>setOpenServiceId(null)} />

      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onLogin={(email)=>setUserEmail(email)} />
    </div>
  );
}
