import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Cable, Fan, Wrench, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react'

const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#ffd335'

const navItems = [
  { id: 'home', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'projects', label: 'Проекты' },
  { id: 'about', label: 'О нас' },
  { id: 'contact', label: 'Контакты' },
]

const services = [
  {
    icon: <Cable className="w-6 h-6" />,
    title: 'Слаботочные системы',
    blurb: 'СКС, видеонаблюдение, СКУД, ОПС, связь',
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1920&auto=format&fit=crop',
    points: [
      'Проектирование и обследование',
      'Монтаж и пусконаладка',
      'Интеграция с IT‑инфраструктурой',
      'Сервис и регламентные работы',
    ],
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: 'Электросети',
    blurb: 'Внутренние/наружные сети, щиты, заземление, освещение',
    image: 'https://images.unsplash.com/photo-1518779574904-5f7f8e8e3b5d?q=80&w=1920&auto=format&fit=crop',
    points: [
      'Расчёт нагрузок, подбор автоматики',
      'Монтаж кабельных линий',
      'Проверки ПУЭ / ПТЭЭП / ГОСТ',
      'Исполнительная документация',
    ],
  },
  {
    icon: <Fan className="w-6 h-6" />,
    title: 'Вентиляция и кондиционирование',
    blurb: 'ПВУ, дымоудаление, чиллер‑фанкойлы, автоматика',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1920&auto=format&fit=crop',
    points: [
      'Аэродинамические расчёты',
      'Монтаж воздуховодов и агрегатов',
      'Автоматика и диспетчеризация',
      'Паспортные испытания',
    ],
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Общестрой под ключ',
    blurb: 'Комплекс СМР: от демонтажа до чистовой отделки',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1920&auto=format&fit=crop',
    points: [
      'Генподряд и управление проектом',
      'Координация субподрядчиков',
      'Технадзор и охрана труда',
      'Сроки и бюджет под контролем',
    ],
  },
]

const projects = [
  { title: 'Бизнес‑центр ARK', tag: 'СКС + Электроснабжение', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop' },
  { title: 'Производство NORD', tag: 'Вентиляция + Дымоудаление', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1600&auto=format&fit=crop' },
  { title: 'Data‑центр X', tag: 'СКУД + Видеонаблюдение', image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop' },
  { title: 'Офис GROW', tag: 'Электрика + Освещение', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop' },
]

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 rounded-[6px] bg-neutral-900 border border-neutral-700" />
        <div className="absolute inset-[3px] rounded-[4px]" style={{ background: `linear-gradient(135deg, var(--accent) 0%, #111 100%)` }} />
      </div>
      <span className="tracking-wide font-semibold text-white">КУБ</span>
    </div>
  )
}

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-black/70 backdrop-blur border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="text-sm text-neutral-300 hover:text-white transition">
              {item.label}
            </a>
          ))}
          <a href="#contact" className="inline-flex items-center gap-2 bg-[var(--accent)] text-black font-medium px-4 py-2 rounded-xl hover:opacity-90">
            Связаться <ArrowRight className="w-4 h-4" />
          </a>
        </nav>
        <button className="md:hidden text-neutral-200" onClick={() => setOpen((s) => !s)} aria-label="Открыть меню">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-neutral-900 bg-black/90">
          <div className="px-4 py-3 flex flex-col">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="py-2 text-neutral-300 hover:text-white" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="#contact" className="mt-2 inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-medium px-4 py-2 rounded-xl hover:opacity-90" onClick={() => setOpen(false)}>
              Связаться <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] pt-24 pb-20 bg-black">
      <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(600px 200px at 10% 10%, #fff, transparent 60%), radial-gradient(600px 200px at 90% 90%, #fff, transparent 60%)' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
            Инженерные системы <span className="text-[var(--accent)]">под ключ</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300">
            Проектирование, монтаж и обслуживание: слаботочные сети, электроснабжение, вентиляция и общестрой. Сроки, качество и безопасность — на уровне.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a href="#contact" className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-medium px-6 py-3 rounded-2xl hover:opacity-90">
              Рассчитать проект <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#projects" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-neutral-800 text-white hover:bg-neutral-900">
              Портфолио
            </a>
          </div>
        </motion.div>
      </div>

      <div className="relative mt-16">
        <div className="grid md:grid-cols-2 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.slice(0, 2).map((s, i) => (
            <motion.a key={i} href="#services" variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950">
              <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105" />
              <div className="relative p-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">{s.icon}</div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                </div>
                <p className="mt-3 text-neutral-300 max-w-md">{s.blurb}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-black bg-[var(--accent)] px-4 py-2 rounded-xl font-medium">
                  Смотреть услуги <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.a>
          ))}
          {services.slice(2, 4).map((s, i) => (
            <motion.a key={i} href="#services" variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950">
              <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105" />
              <div className="relative p-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">{s.icon}</div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                </div>
                <p className="mt-3 text-neutral-300 max-w-md">{s.blurb}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-black bg-[var(--accent)] px-4 py-2 rounded-xl font-medium">
                  Смотреть услуги <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Services() {
  const [expanded, setExpanded] = useState(null)
  return (
    <section id="services" className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-3xl sm:text-4xl font-semibold text-white">
          Услуги
        </motion.h2>
        <p className="mt-3 text-neutral-300 max-w-3xl">Проектирование, монтаж, пусконаладка, сервис. Работаем по нормативам и закрываем полный цикл.</p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, idx) => (
            <motion.div key={idx} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="group relative rounded-3xl border border-neutral-800 bg-neutral-950 overflow-hidden">
              <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition" />
              <div className="relative p-6 min-h-[260px] flex flex-col">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">{s.icon}</div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                </div>
                <p className="mt-3 text-neutral-300 text-sm">{s.blurb}</p>
                <button onClick={() => setExpanded(expanded === idx ? null : idx)} className="mt-auto inline-flex items-center gap-2 text-black self-start bg-[var(--accent)] px-4 py-2 rounded-xl font-medium hover:opacity-90">
                  Подробнее <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {expanded === idx && (
                <div className="relative border-t border-neutral-800 p-5 bg-black/60">
                  <ul className="space-y-2 text-neutral-200 text-sm">
                    {s.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5" style={{ color: 'var(--accent)' }} /> {p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Projects() {
  return (
    <section id="projects" className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-3xl sm:text-4xl font-semibold text-white">Проекты</motion.h2>
        <p className="mt-3 text-neutral-300 max-w-3xl">Часть реализованных объектов. Больше кейсов — по запросу.</p>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p, idx) => (
            <motion.div key={idx} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="group relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950">
              <img src={p.image} alt="" className="w-full h-56 object-cover opacity-70 group-hover:opacity-90 transition-transform duration-500 group-hover:scale-105" />
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">{p.tag}</div>
                <div className="mt-1 text-white font-medium">{p.title}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <a href="#contact" className="inline-flex items-center gap-2 text-black bg-[var(--accent)] px-6 py-3 rounded-2xl font-medium hover:opacity-90">
            Обсудить ваш объект <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}

function About() {
  const facts = useMemo(() => [
    { value: '10+', label: 'лет на рынке' },
    { value: '120+', label: 'проектов' },
    { value: '24/7', label: 'сервисная поддержка' },
    { value: '100%', label: 'соответствие НТД' },
  ], [])

  return (
    <section id="about" className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white">О компании</h2>
          <p className="mt-4 text-neutral-300">Мы проектируем, строим и обслуживаем инженерные системы любой сложности. Сосредоточены на качестве, прозрачности и соблюдении сроков.</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f, i) => (
            <motion.div key={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 text-center">
              <div className="text-3xl font-semibold text-white">{f.value}</div>
              <div className="mt-2 text-neutral-400 text-sm">{f.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-10">
          <h3 className="text-xl text-white font-semibold">Как мы работаем</h3>
          <ol className="mt-6 grid md:grid-cols-4 gap-6 text-neutral-300">
            {['Обследование', 'Проектирование', 'Монтаж', 'ПНР и сервис'].map((step, idx) => (
              <li key={idx} className="rounded-2xl bg-black/50 border border-neutral-800 p-5">
                <div className="text-neutral-400 text-xs">Шаг {idx + 1}</div>
                <div className="mt-1 text-white font-medium">{step}</div>
                <p className="mt-2 text-sm">{[
                  'Выезд, аудит текущего состояния, сбор исходных данных',
                  'Расчёты, спецификации, графики работ',
                  'Организация СМР, техника безопасности, контроль качества',
                  'Пусконаладка, актирование, обучение, регламентный сервис',
                ][idx]}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <section id="contact" className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-3xl sm:text-4xl font-semibold text-white">Контакты</motion.h2>
        <p className="mt-3 text-neutral-300 max-w-2xl">Оставьте заявку — ответим в течение рабочего дня и предложим решение под задачи вашего объекта.</p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400">Имя</label>
                <input required className="mt-1 w-full rounded-xl bg-black border border-neutral-800 px-4 py-2 text-white outline-none focus:border-neutral-600" placeholder="Как к вам обращаться" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400">Телефон или e‑mail</label>
                <input required className="mt-1 w-full rounded-xl bg-black border border-neutral-800 px-4 py-2 text-white outline-none focus:border-neutral-600" placeholder="+7••• или you@company.ru" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-neutral-400">Сообщение</label>
              <textarea rows="5" className="mt-1 w-full rounded-xl bg-black border border-neutral-800 px-4 py-2 text-white outline-none focus:border-neutral-600" placeholder="Коротко о задаче, сроках и объекте" />
            </div>
            <button type="submit" className="mt-6 inline-flex items-center gap-2 text-black bg-[var(--accent)] px-6 py-3 rounded-2xl font-medium hover:opacity-90">
              Отправить заявку <ArrowRight className="w-5 h-5" />
            </button>
            {sent && (<div className="mt-4 text-sm text-green-400">Спасибо! Заявка отправлена (демо). Мы свяжемся с вами.</div>)}
          </form>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-start gap-3 text-neutral-300"><Phone className="w-5 h-5 text-neutral-400" /> +7 (000) 000‑00‑00</div>
            <div className="flex items-start gap-3 text-neutral-300"><Mail className="w-5 h-5 text-neutral-400" /> info@kub-company.ru</div>
            <div className="flex items-start gap-3 text-neutral-300"><MapPin className="w-5 h-5 text-neutral-400" /> Россия, Ноябрьск (ЯНАО)</div>
            <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black h-64 flex items-center justify-center text-neutral-600">
              Карта вашего офиса
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 border-top border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="text-neutral-500 text-sm">© 2025 КУБ. Все права защищены.</div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#services" className="text-neutral-400 hover:text-white">Услуги</a>
            <a href="#projects" className="text-neutral-400 hover:text-white">Проекты</a>
            <a href="#contact" className="text-neutral-400 hover:text-white">Связаться</a>
          </div>
        </div>
      </footer>
    </section>
  )
}

export default function App() {
  return (
    <div className="bg-black text-white">
      <Nav />
      <main>
        <Hero />
        <Services />
        <Projects />
        <About />
        <Contact />
      </main>
    </div>
  )
}
