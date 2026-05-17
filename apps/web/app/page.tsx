'use client';

import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Video,
  BarChart3,
  FileCheck2,
  Building2,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
  BookOpen,
  Clock3,
  Users,
  Cpu,
  CheckCircle2,
  ChevronLeft,
  Star,
  Globe2,
  Layers,
} from 'lucide-react';
import styles from './page.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const features = [
  {
    Icon: BrainCircuit,
    title: 'دستیار هوشمند AI',
    desc: 'تیوتر شخصی مبتنی بر RAG که از روی منابع درسی به سوالات دانشجو پاسخ می‌دهد',
    color: 'brand',
  },
  {
    Icon: Video,
    title: 'کلاس آنلاین زنده',
    desc: 'کلاس‌های تعاملی با قابلیت ضبط، رونویسی خودکار و تحلیل محتوا توسط AI',
    color: 'accent',
  },
  {
    Icon: BarChart3,
    title: 'تحلیل یادگیری',
    desc: 'داشبوردهای تحلیلی پیشرفته با شناسایی ریسک و توصیه‌های هوشمند بهبود',
    color: 'gold',
  },
  {
    Icon: FileCheck2,
    title: 'ارزیابی هوشمند',
    desc: 'آزمون‌ها و تکالیف با نمره‌دهی اولیه AI و بازبینی نهایی استاد',
    color: 'success',
  },
  {
    Icon: Building2,
    title: 'مدیریت دانشگاه',
    desc: 'مدیریت کامل دانشکده، گروه، رشته، درس و کلیه دانشجویان',
    color: 'info',
  },
  {
    Icon: ShieldCheck,
    title: 'امنیت و حریم خصوصی',
    desc: 'احراز هویت چندلایه، جداسازی داده‌ها و حاکمیت کامل هوش مصنوعی',
    color: 'danger',
  },
];

const stats = [
  { value: '۱۰+', label: 'رشته تحصیلی', Icon: BookOpen },
  { value: '۵۰+', label: 'درس فعال', Icon: Layers },
  { value: '۲۴/۷', label: 'دسترسی آنلاین', Icon: Clock3 },
  { value: 'AI', label: 'یادگیری هوشمند', Icon: Cpu },
];

const aiCapabilities = [
  'تیوتر هوشمند مبتنی بر RAG',
  'تحلیل خودکار کلاس آنلاین',
  'تولید آزمون از محتوا',
  'پروفایل شناختی تطبیقی',
  'شناسایی ریسک تحصیلی',
  'رونویسی صوتی به متن',
];

const colorMap: Record<string, string> = {
  brand: 'var(--brand-400)',
  accent: 'var(--accent-500)',
  gold: 'var(--gold-400)',
  success: 'var(--success)',
  info: 'var(--info)',
  danger: 'var(--danger)',
};
const bgMap: Record<string, string> = {
  brand: 'var(--brand-glow-soft)',
  accent: 'var(--accent-glow-soft)',
  gold: 'var(--gold-glow)',
  success: 'var(--success-glow)',
  info: 'rgba(77,166,255,0.10)',
  danger: 'var(--danger-glow)',
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Animated Background */}
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* ── Navigation ── */}
      <motion.nav
        className={styles.nav}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container">
          <div className={styles.navInner}>
            <a href="/" className={styles.logo}>
              <GraduationCap size={24} strokeWidth={1.8} className={styles.logoSvg} />
              <span className="gradient-text">دانشگاه هوشمند</span>
            </a>
            <div className={styles.navLinks}>
              <a href="/courses" className={styles.navLink}>دروس</a>
              <a href="#features" className={styles.navLink}>امکانات</a>
              <a href="#ai" className={styles.navLink}>هوش مصنوعی</a>
              <a href="/register" className="btn btn-ghost btn-sm">ثبت‌نام</a>
              <a href="/login" className="btn btn-primary btn-sm">ورود</a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="badge badge-primary">نسل جدید آموزش عالی آنلاین</span>
            </motion.div>

            <motion.h1 className={styles.heroTitle} variants={fadeUp} transition={{ duration: 0.55 }}>
              دانشگاه آنلاین
              <br />
              <span className="gradient-text">مبتنی بر هوش مصنوعی</span>
            </motion.h1>

            <motion.p className={styles.heroDesc} variants={fadeUp} transition={{ duration: 0.55 }}>
              یادگیری تطبیقی با هوش مصنوعی، کلاس‌های آنلاین تعاملی،
              ارزیابی هوشمند و تحلیل پیشرفته یادگیری — همه در یک پلتفرم یکپارچه
            </motion.p>

            <motion.div className={styles.heroCta} variants={fadeUp} transition={{ duration: 0.5 }}>
              <a href="/courses" className="btn btn-primary btn-lg">
                مشاهده دروس
                <ArrowLeft size={18} />
              </a>
              <a href="/login" className="btn btn-secondary btn-lg">
                ورود به پنل
              </a>
            </motion.div>

            <motion.div className={styles.heroTrust} variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className={styles.trustStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="var(--gold-400)" color="var(--gold-400)" />
                ))}
              </div>
              <span className={styles.trustText}>مورد اعتماد هزاران دانشجو و استاد</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.stats}>
        <div className="container">
          <motion.div
            className={styles.statsGrid}
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
          >
            {stats.map(({ value, label, Icon }, i) => (
              <motion.div
                key={i}
                className={`glass-card ${styles.statCard}`}
                variants={fadeUp}
                transition={{ duration: 0.45 }}
              >
                <div className={styles.statIconWrap}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.features}>
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="gradient-text">امکانات پلتفرم</span>
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            هر آنچه برای یک دانشگاه آنلاین کامل نیاز دارید، در یک پلتفرم یکپارچه
          </motion.p>

          <motion.div
            className={styles.featuresGrid}
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
          >
            {features.map(({ Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                className={`glass-card ${styles.featureCard}`}
                variants={fadeUp}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
              >
                <div
                  className={styles.featureIconWrap}
                  style={{ background: bgMap[color], color: colorMap[color] }}
                >
                  <Icon size={22} strokeWidth={1.7} />
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI Section ── */}
      <section id="ai" className={styles.aiSection}>
        <div className="container">
          <div className={styles.aiGrid}>
            <motion.div
              className={styles.aiText}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="badge badge-accent">هوش مصنوعی بومی</span>
              <h2 className={styles.aiTitle}>
                AI زیرساخت اصلی،
                <br />
                <span className="gradient-text">نه یک افزونه</span>
              </h2>
              <p className={styles.aiDesc}>
                در دانشگاه هوشمند، هوش مصنوعی فقط یک ابزار کمکی نیست.
                AI هسته اصلی سیستم آموزشی است — از تحلیل پروفایل شناختی دانشجو
                تا تولید محتوا، نمره‌دهی و پیش‌بینی ریسک تحصیلی.
              </p>

              <ul className={styles.aiList}>
                {aiCapabilities.map((item, i) => (
                  <motion.li
                    key={i}
                    className={styles.aiListItem}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                  >
                    <CheckCircle2 size={16} className={styles.aiCheck} />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              <a href="/login" className="btn btn-accent" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>
                <BrainCircuit size={18} />
                تجربه هوش مصنوعی
              </a>
            </motion.div>

            <motion.div
              className={styles.aiVisual}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className={styles.aiCard}>
                <div className={styles.aiCardHeader}>
                  <div className={styles.aiCardDot} style={{ background: 'var(--danger)' }} />
                  <div className={styles.aiCardDot} style={{ background: 'var(--warning)' }} />
                  <div className={styles.aiCardDot} style={{ background: 'var(--success)' }} />
                  <span className={styles.aiCardLabel}>
                    <BrainCircuit size={14} />
                    دستیار هوشمند
                  </span>
                </div>
                <div className={styles.aiCardBody}>
                  <div className="chat-bubble chat-bubble-ai" style={{ marginBottom: 'var(--space-4)', maxWidth: '100%' }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--brand-400)' }}>
                      دستیار AI
                    </strong>
                    مفهوم یادگیری ماشین شامل الگوریتم‌هایی است که از داده یاد می‌گیرند...
                    <div className={styles.aiSource}>
                      <Globe2 size={12} />
                      منبع: فصل ۳ — مبانی ML
                    </div>
                  </div>
                  <div className={styles.aiMetrics}>
                    <span className="tag">اطمینان: ۹۲٪</span>
                    <span className="tag">بازبینی: نه</span>
                    <span className="tag">مدل: Claude</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={`glass-card ${styles.ctaCard}`}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>همین حالا شروع کنید</h2>
              <p className={styles.ctaDesc}>
                به جامعه دانشگاه هوشمند بپیوندید و تجربه یادگیری متفاوتی داشته باشید
              </p>
              <div className={styles.ctaButtons}>
                <a href="/register" className="btn btn-primary btn-lg">
                  ثبت‌نام رایگان
                  <ChevronLeft size={18} />
                </a>
                <a href="/courses" className="btn btn-secondary btn-lg">
                  <BookOpen size={18} />
                  مشاهده دروس
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <a href="/" className={styles.logo}>
                <GraduationCap size={20} strokeWidth={1.8} className={styles.logoSvg} />
                <span className="gradient-text">دانشگاه آنلاین هوشمند</span>
              </a>
              <p className={styles.footerTagline}>
                نسل جدید آموزش عالی مبتنی بر هوش مصنوعی
              </p>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerGroup}>
                <h4 className={styles.footerGroupTitle}>پلتفرم</h4>
                <a href="/courses" className={styles.footerLink}>دروس</a>
                <a href="/login" className={styles.footerLink}>ورود</a>
                <a href="/register" className={styles.footerLink}>ثبت‌نام</a>
              </div>
              <div className={styles.footerGroup}>
                <h4 className={styles.footerGroupTitle}>امکانات</h4>
                <a href="/tutor" className={styles.footerLink}>تیوتر AI</a>
                <a href="/sessions" className={styles.footerLink}>کلاس‌های زنده</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© ۱۴۰۴ دانشگاه آنلاین هوشمند — تمامی حقوق محفوظ است</span>
            <span className={styles.footerVersion}>v3.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
