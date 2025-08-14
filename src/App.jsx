import React, { useMemo, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
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

// логотип (из public/)
import logo from "/logo-cube.png";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ───────── NAV ───────── */
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-black">
      {/* вернули компактнее: 80px */}
      <div className="h-20 w-full grid grid-cols-[auto,1fr,auto] items-center px-0 gap-2">
        <a href="#home" className="flex items-center pl-3 sm:pl-4">
          {/* крупный логотип */}
          <img src={logo} alt="КУБ" className="block h-16 w-auto" />
        </a>

        <nav className="hidden md:flex items-center justify-center gap-8 text-sm">
          <a href="#services" className="text-neutral-200 hover:text-white">Услуги</a>
          <a href="#projects" className="text-neutral-200 hover:text-white">Проекты</a>
          <a href="#about" className="text-neutral-200 hover:text-white">О нас</a>
          <a href="#contact" className="text-neutral-200 hover:text-white">Контакты</a>
        </nav>

        <div className="hidden md:flex items-center gap-5 text-neutral-200 justify-self-end pr-3 sm:pr-4">
          <svg viewBox="0 0 24 24" className="w-5 h-5 hover:text-white cursor-pointer" fill="none"><path d="M11 19a8 8 0 1 0-5.657-2.343A8 8 0 0 0 11 19Zm10 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <svg viewBox="0 0 24 24" className="w-5 h-5 hover:text-white cursor-pointer" fill="none"><path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
          <svg viewBox="0 0 24 24" className="w-5 h-5 hover:text-white cursor-pointer" fill="none"><path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="18" cy="20" r="1.5" fill="currentColor"/></svg>
        </div>

        <button className="md:hidden justify-self-end text-neutral-200 pr-3" onClick={() => setOpen(s=>!s)} aria-label="Меню">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-black/95 border-t border-black">
          <div className="px-4 py-3 flex flex-col">
            {["home","services","projects","about","contact"].map(id=>(
              <a key={id} href={`#${id}`} className="py-2 text-neutral-200 hover:text-white" onClick={()=>setOpen(false)}>
                {({home:"Главная",services:"Услуги",projects:"Проекты",about:"О нас",contact:"Контакты"})[id]}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ───────── HERO ───────── */
function Hero() {
  const ref = useRef(null);
  // общий прогресс скролла секции
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start","end start"] });

  // ПРАВО: картинка сереет и исчезает
  const imgOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0]);
  const imgGray = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const imgFilter = useMotionTemplate`grayscale(${imgGray}%)`;

  // ЛЕВО: заголовок и кнопка тоже сереют и растворяются
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.7, 0]);
  const textColor = useTransform(scrollYProgress, [0, 1], ["#000000", "#9CA3AF"]); // black -> neutral-400
  const btnBg = useTransform(scrollYProgress, [0, 1], ["#000000", "#E5E7EB"]);    // black -> neutral-200
  const btnColor = useTransform(scrollYProgress, [0, 1], ["#FFFFFF", "#374151"]); // white -> neutral-700
  const btnBorder = useTransform(scrollYProgress, [0, 1], ["transparent", "#D1D5DB"]);

  return (
    <section ref={ref} id="home" className="pt-20 bg-white text-black">
      {/* 35% / 65%; высота = 100vh - 80px (высота шапки) */}
      <div className="grid grid-cols-1 md:grid-cols-[35%_65%] min-h-[calc(100vh-80px)]">
        {/* ЛЕВО: текст */}
        <div className="bg-white flex items-center">
          <div className="w-full px-6 sm:px-10 lg:px-24 py-16 md:py-24">
            <motion.h1
              style={{ color: textColor, opacity: textOpacity }}
              variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight"
            >
              Инженерные системы под ключ
            </motion.h1>

            <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10">
              <motion.a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
                style={{ backgroundColor: btnBg, color: btnColor, borderColor: btnBorder, borderWidth: 1, opacity: textOpacity }}
                whileHover={{ scale: 1.02 }}
              >
                Получить консультацию
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </motion.div>
          </div>
        </div>

        {/* ПРАВО: изображение */}
        <div className="relative bg-white">
          <motion.img
            src="/image1.png"
            alt="Визуал проекта"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: imgOpacity, filter: imgFilter }}
          />
        </div>
      </div>
    </section>
  );
}

/* ───────── SERVICES ───────── */
const services = [
  {
    icon: <Cable className="w-6 h-6" />,
    title: "Слаботочные системы",
    blurb: "СКС, видеонаблюдение, СКУД, ОПС, связь",
    image: "/low_current_systems.png",
    points: ["Проектирование и обследование","Монтаж и пусконаладка","Интеграция с IT-инфраструктурой","Сервис и регламентные работы"],
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Электросети",
    blurb: "Внутренние/наружные сети, щиты, заземление, освещение",
    image: "/electrical.png",
    points: ["Расчёт нагрузок, подбор автоматики","Монтаж кабельных линий","Проверки ПУЭ / ПТЭЭП / ГОСТ","Исполнительная документация"],
  },
  {
    icon: <Fan className="w-6 h-6" />,
    title: "Вентиляция и кондиционирование",
    blurb: "ПВУ, дымоудаление, чиллер-фанкойлы, автоматика",
    image: "/ventilation.png",
    points: ["Аэродинамические расчёты","Монтаж воздуховодов и агрегатов","Автоматика и диспетчеризация","Паспортные испытания"],
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Общестрой под ключ",
    blurb: "Комплекс СМР: от демонтажа до чистовой отделки",
    image: "/construction.png",
    points: ["Генподряд и управление проектом","Координация субподрядчиков","Технадзор и охрана труда","Сроки и бюджет под контролем"],
  },
];

function Services() {
  const [expanded, setExpanded] = useState(null);
  return (
    <section id="services" className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-4xl font-semibold text-neutral-900">Услуги</motion.h2>
        <p className="mt-3 text-neutral-600 max-w-3xl">Проектирование, монтаж, пусконаладка, сервис. Закрываем полный цикл работ по НТД.</p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, idx) => (
            <motion.div key={idx} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="group relative rounded-3xl border border-neutral-200 bg-white overflow-hidden">
              <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition" />
              <div className="relative p-6 min-h-[260px] flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-200">{s.icon}</div>
                  <h3 className="text-lg font-semibold text-neutral-900">{s.title}</h3>
                </div>
                <p className="mt-3 text-neutral-700 text-sm">{s.blurb}</p>
                <button onClick={() => setExpanded(expanded === idx ? null : idx)} className="mt-auto inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-medium hover:opacity-90">
                  Подробнее <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* плавное раскрытие */}
              <AnimatePresence initial={false}>
                {expanded === idx && (
                  <motion.div
                    key="details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden border-top border-neutral-200 bg-neutral-50"
                  >
                    <div className="p-5 border-t border-neutral-200">
                      <ul className="space-y-2 text-neutral-800 text-sm">
                        {s.points.map((p, i) => (
                          <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5" /> {p}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── PROJECTS ───────── */
const projects = [
  {
    title: "Учебный центр «Газпромнефть» в Ноябрьске",
    tag: "СКС + ОПС + Электроснабжение",
    images: ["/objects/RMM/1.jpeg", "/objects/RMM/2.jpeg", "/objects/RMM/3.jpeg"],
  },
  {
    title: "Ресторан «FRANK by БАСТА» в Тюмени",
    tag: "ОПС + ВПВ",
    images: ["/objects/Frank/1.jpg", "/objects/Frank/2.jpg"],
  },
  {
    title: "АБК «Газпром инвест» в Ноябрьске",
    tag: "Обследование инженерных систем",
    images: [
      "/objects/Lenina/1.jpg",
      "/objects/Lenina/2.jpg",
      "/objects/Lenina/3.jpg",
      "/objects/Lenina/4.jpg",
      "/objects/Lenina/5.jpg",
    ],
  },
  {
    title: "Газпром инвест в Ноябрьске",
    tag: "Восстановление СКС, ОПС",
    images: [
      "/objects/Invest/1.jpg",
      "/objects/Invest/2.jpg",
    ],
  },
];

function ProjectCard({ project, idx }) {
  const [i, setI] = useState(0);
  const hasMany = project.images.length > 1;
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

        {hasMany && (
          <>
            {/* кнопки перелистывания — белые кружки */}
            <button onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-neutral-900" />
            </button>
            <button onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-neutral-900" />
            </button>

            {/* точки-индикаторы */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {project.images.map((_, di) => (
                <button key={di} onClick={() => setI(di)}
                  className={`w-2.5 h-2.5 rounded-full ring-1 ring-black/20 ${i===di ? "bg-white" : "bg-white/60"}`} />
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
        <motion.h2 variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-4xl font-semibold text-neutral-900">Проекты</motion.h2>
        <p className="mt-3 text-neutral-600 max-w-3xl">Часть реализованных объектов. Больше кейсов — по запросу.</p>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p, idx) => <ProjectCard key={idx} project={p} idx={idx} />)}
        </div>

        <div className="mt-10">
          <a href="#contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90">
            Обсудить ваш объект <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── ABOUT ───────── */
function About() {
  const facts = useMemo(() => [
    { value: "10+", label: "лет на рынке" },
    { value: "120+", label: "проектов" },
    { value: "24/7", label: "сервисная поддержка" },
    { value: "100%", label: "соответствие НТД" },
  ], []);
  return (
    <section id="about" className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl">
          <h2 className="text-4xl font-semibold text-neutral-900">О компании</h2>
          <p className="mt-4 text-neutral-600">Проектируем, строим и обслуживаем инженерные системы любой сложности. Сфокусированы на качестве, прозрачности и сроках.</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f,i)=>(
            <motion.div key={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-3xl border border-neutral-200 bg-white p-6 text-center">
              <div className="text-3xl font-semibold text-neutral-900">{f.value}</div>
              <div className="mt-2 text-neutral-500 text-sm">{f.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CONTACT ───────── */
function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="scroll-mt-20 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl font-semibold text-neutral-900"
        >
          Контакты
        </motion.h2>
        <p className="mt-3 text-neutral-600 max-w-2xl">
          Оставьте заявку — ответим в течение рабочего дня и предложим решение под задачи
          вашего объекта.
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
                <label className="block text-sm text-neutral-600">
                  Телефон или e-mail
                </label>
                <input
                  required
                  className="mt-1 w-full rounded-xl bg-white border border-neutral-300 px-4 py-2 text-neutral-900 outline-none focus:border-neutral-500"
                  placeholder="+7••• или you@company.ru"
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

            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90"
            >
              Отправить заявку <ArrowRight className="w-5 h-5" />
            </button>

            {sent && (
              <div className="mt-4 text-sm text-green-600">
                Спасибо! Заявка отправлена (демо). Мы свяжемся с вами.
              </div>
            )}
          </form>

          {/* Контакты */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-start gap-3 text-neutral-800">
              <Phone className="w-5 h-5 text-neutral-500" />
              <a href="tel:+79129112000" className="hover:underline">
                +7 (912) 911-20-00
              </a>
            </div>
            <div className="flex items-start gap-3 text-neutral-800">
              <Mail className="w-5 h-5 text-neutral-500" />
              <a href="mailto:info@cube-tech.ru" className="hover:underline">
                info@cube-tech.ru
              </a>
            </div>
            <div className="flex items-start gap-3 text-neutral-800">
              <MapPin className="w-5 h-5 text-neutral-500" />
              Россия, Ноябрьск (ЯНАО)
            </div>
            <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 h-64 flex items-center justify-center text-neutral-500">
              Карта вашего офиса
            </div>
          </div>
        </div>
      </div>

      {/* Подвал страницы */}
      <footer className="mt-16 border-t border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-6 w-auto" />
            <span className="text-sm text-neutral-500">© 2025 КУБ</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#services" className="text-neutral-600 hover:text-neutral-900">Услуги</a>
            <a href="#projects" className="text-neutral-600 hover:text-neutral-900">Проекты</a>
            <a href="#contact" className="text-neutral-600 hover:text-neutral-900">Связаться</a>
          </div>
        </div>
      </footer>
    </section>
  );
}


/* ───────── ROOT ───────── */
export default function App() {
  return (
    <div className="bg-white text-black">
      <Nav />
      <main>
        <Hero />
        <Services />
        <Projects />
        <About />
        <Contact />
      </main>
    </div>
  );
}
