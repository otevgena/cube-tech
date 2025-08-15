import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  Building2,
  Cable,
  Fan,
  Wrench,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import logo from "/logo-cube.png";

/* ===== Router for clean URLs (no #hash) ===== */
function useSectionRouter() {
  const ids = ["services", "projects", "about", "contact"];
  const scrollToId = (id) => {
    if (!id) return window.scrollTo({ top: 0, behavior: "smooth" });
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  React.useEffect(() => {
    const path = window.location.pathname.replace(/^\/+/, "");
    if (ids.includes(path)) requestAnimationFrame(() => scrollToId(path));
    const onPop = () => {
      const p = window.location.pathname.replace(/^\/+/, "");
      if (ids.includes(p)) scrollToId(p);
      else scrollToId(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (path, id) => {
    window.history.pushState({}, "", path);
    scrollToId(id);
  };
  return navigate;
}

/* ===== NAV (чёрная, НЕ фиксированная) ===== */
function Nav({ navigate }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full bg-black">
      {/* Desktop */}
      <div className="hidden md:grid h-20 w-full grid-cols-[auto,1fr,auto] items-center">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/", null);
          }}
          className="flex items-center pl-3 sm:pl-4"
        >
          <img src={logo} alt="КУБ" className="block h-16 w-auto" />
        </a>
        <nav className="hidden md:flex items-center justify-center gap-8 text-sm">
          {[
            { href: "/services", id: "services", label: "Услуги" },
            { href: "/projects", id: "projects", label: "Проекты" },
            { href: "/about", id: "about", label: "О нас" },
            { href: "/contact", id: "contact", label: "Контакты" },
          ].map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href, item.id);
              }}
              className="relative group text-neutral-200 hover:text-amber-400 transition-colors"
            >
              {item.label}
              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-0 rounded bg-amber-400 transition-all duration-300 group-hover:w-12" />
            </a>
          ))}
        </nav>
        {/* Иконки справа */}
        <div className="hidden md:flex items-center gap-6 text-neutral-200 justify-self-end pr-3 sm:pr-4">
          {[
            (<path key="s" d="M11 19a8 8 0 1 0-5.657-2.343A8 8 0 0 0 11 19Zm10 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />),
            (<g key="u"><path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></g>),
            (<g key="c"><path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="18" cy="20" r="1.5" fill="currentColor"/></g>),
          ].map((paths, i) => (
            <div key={i} className="relative group">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-neutral-200 group-hover:text-amber-400 transition-colors" fill="none">
                {paths}
              </svg>
              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-0 rounded bg-amber-400 transition-all duration-300 group-hover:w-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile bar */}
      <div className="md:hidden h-16 px-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button aria-label="Открыть меню" onClick={() => setOpen(true)} className="text-neutral-200">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/", null);
            }}
            className="flex items-center"
          >
            <img src={logo} alt="КУБ" className="h-8 w-auto" />
          </a>
        </div>
        <div className="flex items-center gap-5 text-neutral-200">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <path d="M11 19a8 8 0 1 0-5.657-2.343A8 8 0 0 0 11 19Zm10 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="20" r="1.5" fill="currentColor" />
            <circle cx="18" cy="20" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Mobile side menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="panel"
              className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-xs bg-black text-neutral-100 shadow-xl p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <img src={logo} alt="КУБ" className="h-8 w-auto" />
                <button aria-label="Закрыть" onClick={() => setOpen(false)} className="text-neutral-300">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <nav className="mt-6 flex flex-col">
                {["services", "projects", "about", "contact"].map((id) => (
                  <a
                    key={id}
                    href={`/${id}`}
                    className="py-3 text-lg border-b border-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      navigate(`/${id}`, id);
                    }}
                  >
                    {{ services: "Услуги", projects: "Проекты", about: "О нас", contact: "Контакты" }[id]}
                  </a>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ===== данные услуг ===== */
const servicesData = [
  {
    id: "s1",
    icon: <Cable className="w-6 h-6" />,
    title: "Слаботочные системы",
    blurb: "СКС, видеонаблюдение, СКУД, ОПС, связь",
    image: "/low_current_systems.png",
    details: ["Проектирование и обследование", "Монтаж и пусконаладка", "Интеграция с IT-инфраструктурой", "Сервис и регламентные работы"],
  },
  {
    id: "s2",
    icon: <Wrench className="w-6 h-6" />,
    title: "Электросети",
    blurb: "Внутренние/наружные сети, щиты, заземление, освещение",
    image: "/electrical.png",
    details: ["Расчёт нагрузок, подбор автоматики", "Монтаж кабельных линий", "Проверки ПУЭ / ПТЭЭП / ГОСТ", "Исполнительная документация"],
  },
  {
    id: "s3",
    icon: <Fan className="w-6 h-6" />,
    title: "Вентиляция и кондиционирование",
    blurb: "ПВУ, дымоудаление, чиллер-фанкойлы, автоматика",
    image: "/ventilation.png",
    details: ["Аэродинамические расчёты", "Монтаж воздуховодов и агрегатов", "Автоматика и диспетчеризация", "Паспортные испытания"],
  },
  {
    id: "s4",
    icon: <Building2 className="w-6 h-6" />,
    title: "Общестрой под ключ",
    blurb: "Комплекс СМР: от демонтажа до чистовой отделки",
    image: "/construction.png",
    details: ["Генподряд и управление проектом", "Координация субподрядчиков", "Технадзор и охрана труда", "Сроки и бюджет под контролем"],
  },
];

/* ===== HERO + УСЛУГИ: «вайп» по ЦЕНТРАМ блоков; сдвиг фокуса вправо ===== */
function Showcase() {
  const heroRef = useRef(null);
  const serviceRefs = useRef(servicesData.map(() => React.createRef()));

  const [baseIdx, setBaseIdx] = useState(0); // 0 — hero, далее услуги
  const [blend, setBlend] = useState(0); // 0..1
  const [showTitle, setShowTitle] = useState(false); // «Услуги» сверху по центру

  // общий сдвиг фокуса картинок вправо (~20%)
  const IMG_POS = "30% center";

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const els = [heroRef.current, ...serviceRefs.current.map((r) => r.current)].filter(Boolean);
      if (!els.length) return;

      const rects = els.map((el) => el.getBoundingClientRect());
      const centers = rects.map((r) => (r.top + r.bottom) / 2 + window.scrollY);

      const vh = window.innerHeight;
      const anchor = window.scrollY + vh / 2; // центр вьюпорта

      // Показываем «Услуги» чуть раньше центра первой услуги и до центра последней
      const firstServiceCenter = centers[1];
      const lastServiceCenter = centers[centers.length - 1];
      const EARLY_VH = 0.15; // раньше на 15% высоты экрана
      setShowTitle(anchor >= firstServiceCenter - window.innerHeight * EARLY_VH && anchor <= lastServiceCenter);

      // Вайп между ЦЕНТРАМИ соседних блоков
      const last = centers.length - 1;
      if (anchor <= centers[0]) {
        setBaseIdx(0);
        setBlend(0);
        return;
      }
      if (anchor >= centers[last]) {
        setBaseIdx(last - 1);
        setBlend(1);
        return;
      }

      for (let i = 0; i < last; i++) {
        const a = centers[i];
        const b = centers[i + 1];
        if (anchor >= a && anchor <= b) {
          // Нормализованный прогресс между центрами i -> i+1
          let t = (anchor - a) / (b - a);

          // Держим текущее изображение до 30% пути,
          // перелистываем и заканчиваем к 80% пути.
          const start = 0.30;
          const end = 0.80;
          let p;
          if (t <= start) p = 0;
          else if (t >= end) p = 1;
          else p = (t - start) / (end - start);

          setBaseIdx(i);
          setBlend(Math.max(0, Math.min(1, p)));
          break;
        }
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const images = useMemo(() => ["/image1.png", ...servicesData.map((s) => s.image)], []);
  const nextIdx = Math.min(baseIdx + 1, images.length - 1);
  const clipTopPct = baseIdx === images.length - 1 ? 100 : (1 - blend) * 100; // 100% = скрыто, 0% = видно

  return (
    <section className="bg-white text-black">
      {/* ===== DESKTOP/TABLET ===== */}
      <div className="hidden md:grid grid-cols-[35%_65%] w-full">
        {/* LEFT: герой + услуги (каждая по центру, больше расстояния) */}
        <div className="flex flex-col">
          {/* Герой слева */}
          <article ref={heroRef} className="min-h-[85vh] flex items-center">
            <div className="w-full pl-6 pr-8 lg:pl-16 lg:pr-12">
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Инженерные системы под ключ
              </h1>
              <div className="mt-10">
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, "", "/contact");
                    const el = document.getElementById("contact");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90"
                >
                  Получить консультацию <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </article>

          {/* Услуги — БОЛЬШЕ расстояния между блоками */}
          {servicesData.map((s, idx) => (
            <article key={s.id} ref={serviceRefs.current[idx]} className="min-h-[120vh] flex items-center">
              <div className="w-full pl-6 pr-8 lg:pl-16 lg:pr-12 -mt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200">{s.icon}</div>
                  <h3 className="text-4xl font-extrabold leading-tight tracking-tight">{s.title}</h3>
                </div>
                <p className="mt-3 text-neutral-700 text-lg">{s.blurb}</p>
                <ul className="mt-6 space-y-2 text-neutral-800">
                  {s.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-base">
                      <CheckCircle2 className="w-4 h-4 mt-1" /> {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, "", "/contact");
                      const el = document.getElementById("contact");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90"
                  >
                    Получить консультацию <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* RIGHT: sticky 65% ширины; «вайп» сверху-вниз; СДВИГ вправо */}
        <div className="relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            {/* базовое изображение */}
            <img
              key={`base-${baseIdx}`}
              src={images[baseIdx]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: IMG_POS }}
            />
            {/* следующее — открываем сверху вниз по clip-path */}
            <img
              key={`next-${nextIdx}`}
              src={images[nextIdx]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: IMG_POS,
                clipPath: `inset(${clipTopPct}% 0% 0% 0%)`,
                willChange: "clip-path",
              }}
            />
          </div>
        </div>

        {/* Заголовок «Услуги»: ВВЕРХУ по центру, шрифт и размер как у hero */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              key="services-title"
              className="pointer-events-none fixed left-0 right-0 top-6 md:top-8 z-20 hidden md:flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">Услуги</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== MOBILE (простая версия) ===== */}
      <div className="md:hidden">
        <div className="px-5 pt-6">
          <h1 className="text-3xl font-extrabold leading-tight text-center">Инженерные системы под ключ</h1>
          <div className="mt-6">
            <img src="/image1.png" alt="" className="w-full h-64 object-cover" style={{ objectPosition: IMG_POS }} />
          </div>
          <div className="mt-6 flex justify-center">
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/contact");
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium"
            >
              Получить консультацию <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        <h2 id="services" className="mt-10 px-5 text-3xl font-semibold text-center">
          Услуги
        </h2>

        <div className="mt-6 px-5">
          {servicesData.map((s) => (
            <div key={s.id} className="mb-10">
              <img src={s.image} alt={s.title} className="w-full h-56 object-cover" style={{ objectPosition: IMG_POS }} />
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200">{s.icon}</div>
                  <h3 className="text-2xl font-extrabold leading-tight">{s.title}</h3>
                </div>
                <p className="mt-2 text-neutral-700">{s.blurb}</p>
                <ul className="mt-3 space-y-2 text-neutral-800 text-sm">
                  {s.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5" /> {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, "", "/contact");
                      const el = document.getElementById("contact");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium"
                  >
                    Получить консультацию <ArrowRight className="w-5 h-5" />
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

/* ===== PROJECTS ===== */
const projects = [
  {
    title: "Учебный центр «Газпромнефть» в Ноябрьске",
    tag: "СКС + ОПС + Электроснабжение",
    images: ["/objects/RMM/1.jpeg", "/objects/RMM/2.jpeg", "/objects/RMM/3.jpeg"],
  },
  { title: "Ресторан «FRANK by БАСТА» в Тюмени", tag: "ОПС + ВПВ", images: ["/objects/Frank/1.jpg", "/objects/Frank/2.jpg"] },
  {
    title: "АБК «Газпром инвест» в Ноябрьске",
    tag: "Обследование инженерных систем",
    images: ["/objects/Lenina/1.jpg", "/objects/Lenina/2.jpg", "/objects/Lenina/3.jpg", "/objects/Lenina/4.jpg", "/objects/Lenina/5.jpg"],
  },
  { title: "Газпром инвест в Ноябрьске", tag: "Восстановление СКС, ОПС", images: ["/objects/Invest/1.jpg", "/objects/Invest/2.jpg"] },
];

function ProjectCard({ project }) {
  const [i, setI] = useState(0);
  const many = project.images.length > 1;
  const next = () => setI((i + 1) % project.images.length);
  const prev = () => setI((i - 1 + project.images.length) % project.images.length);
  return (
    <div className="group relative rounded-3xl overflow-hidden border border-neutral-200 bg-white">
      <div className="relative h-56">
        <AnimatePresence mode="wait">
          <motion.img
            key={project.images[i]}
            src={project.images[i]}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        </AnimatePresence>
        {many && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-neutral-900" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-neutral-900" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {project.images.map((_, di) => (
                <button key={di} onClick={() => setI(di)} className={`w-2.5 h-2.5 rounded-full ring-1 ring-black/20 ${i === di ? "bg-white" : "bg-white/60"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-wider text-neutral-500">{project.tag}</div>
        <div className="mt-1 text-neutral-900 font-medium">{project.title}</div>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-semibold text-neutral-900">Проекты</h2>
        <p className="mt-3 text-neutral-600 max-w-3xl">Часть реализованных объектов. Больше кейсов — по запросу.</p>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p, idx) => (
            <ProjectCard key={idx} project={p} />
          ))}
        </div>

        <div className="mt-10">
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/contact");
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90"
          >
            Обсудить ваш объект <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ===== ABOUT ===== */
function About() {
  const facts = useMemo(
    () => [
      { value: "10+", label: "лет на рынке" },
      { value: "120+", label: "проектов" },
      { value: "24/7", label: "сервисная поддержка" },
      { value: "100%", label: "соответствие НТД" },
    ],
    []
  );
  return (
    <section id="about" className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-semibold text-neutral-900">О компании</h2>
          <p className="mt-4 text-neutral-600">
            Проектируем, строим и обслуживаем инженерные системы любой сложности. Сфокусированы на качестве, прозрачности и сроках.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f, i) => (
            <div key={i} className="rounded-3xl border border-neutral-200 bg-white p-6 text-center">
              <div className="text-3xl font-semibold text-neutral-900">{f.value}</div>
              <div className="mt-2 text-neutral-500 text-sm">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== CONTACT ===== */
function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-semibold text-neutral-900">Контакты</h2>
        <p className="mt-3 text-neutral-600 max-w-2xl">
          Оставьте заявку — ответим в течение рабочего дня и предложим решение под задачи вашего объекта.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {/* Форма */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-600">Имя</label>
                <input
                  required
                  className="mt-1 w-full rounded-xl bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500"
                  placeholder="Как к вам обращаться"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600">Телефон или e-mail</label>
                <input
                  required
                  className="mt-1 w-full rounded-xl bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500"
                  placeholder="+7••• или ваша@комания.ru"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-neutral-600">Сообщение</label>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-xl bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500"
                placeholder="Коротко о задаче, сроках и объекте"
              />
            </div>
            <button type="submit" className="mt-6 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90">
              Отправить заявку <ArrowRight className="w-5 h-5" />
            </button>
            {sent && <div className="mt-4 text-sm text-green-600">Спасибо! Заявка отправлена. Мы свяжемся с вами.</div>}
          </form>

          {/* Контакты */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-start gap-3 text-neutral-800">
              <Phone className="w-5 h-5 text-neutral-500" /> <a href="tel:+79129112000" className="hover:underline">+7 (912) 911-20-00</a>
            </div>
            <div className="flex items-start gap-3 text-neutral-800">
              <Mail className="w-5 h-5 text-neutral-500" /> <a href="mailto:info@cube-tech.ru" className="hover:underline">info@cube-tech.ru</a>
            </div>
            <div className="flex items-start gap-3 text-neutral-800">
              <MapPin className="w-5 h-5 text-neutral-500" /> Россия, Ноябрьск (ЯНАО)
            </div>
            <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 h-64 flex items-center justify-center text-neutral-500">
              Карта вашего офиса
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== FOOTER (чёрный, низ страницы чёрный) ===== */
function SiteFooter() {
  return (
    <footer className="bg-black text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="КУБ" className="h-6 w-auto" />
          <span className="text-sm text-neutral-400">© 2025 КУБ</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-neutral-300 hover:text-amber-400 transition-colors cursor-default">ИНН: 7700000000</span>
          <span className="text-neutral-300 hover:text-amber-400 transition-colors cursor-default">ОГРН: 1207700000000</span>
        </div>
        <button
          onClick={() => {
            window.history.pushState({}, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="relative group inline-flex items-center gap-2 text-neutral-300 hover:text-amber-400 transition-colors"
          aria-label="Наверх"
        >
          <ArrowUp className="w-5 h-5" />
          <span>Наверх</span>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 h-[3px] w-0 rounded bg-amber-400 transition-all duration-300 group-hover:w-12" />
        </button>
      </div>
    </footer>
  );
}

/* ===== ROOT ===== */
export default function App() {
  const navigate = useSectionRouter();
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Nav navigate={navigate} />
      <main className="flex-1 bg-white">
        <Showcase />
        <Projects />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
