'use client';

import { motion } from 'framer-motion';
import styles from './page.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

const features = [
  { icon: '🤖', title: 'دستیار هوشمند AI', desc: 'تیوتر شخصی مبتنی بر RAG که به سوالات شما از روی منابع درسی پاسخ می‌دهد' },
  { icon: '🎥', title: 'کلاس آنلاین زنده', desc: 'کلاس‌های تعاملی با قابلیت ضبط، رونویسی و تحلیل خودکار توسط AI' },
  { icon: '📊', title: 'تحلیل یادگیری', desc: 'داشبوردهای تحلیلی پیشرفته با شناسایی ریسک و توصیه‌های بهبود' },
  { icon: '📝', title: 'ارزیابی هوشمند', desc: 'آزمون‌ها و تکالیف با نمره‌دهی اولیه AI و بازبینی استاد' },
  { icon: '🏛️', title: 'مدیریت دانشگاه', desc: 'مدیریت کامل دانشکده، گروه، رشته، درس و دانشجو' },
  { icon: '🔒', title: 'امنیت و حریم خصوصی', desc: 'احراز هویت امن، جداسازی داده‌ها و حاکمیت هوش مصنوعی' },
];

const stats = [
  { value: '۱۰+', label: 'رشته تحصیلی', icon: '📚' },
  { value: '۵۰+', label: 'درس فعال', icon: '🎯' },
  { value: '۲۴/۷', label: 'دسترسی', icon: '⏰' },
  { value: 'AI', label: 'یادگیری هوشمند', icon: '🤖' },
];

const aiFeaturesList = [
  'تیوتر هوشمند RAG',
  'تحلیل خودکار کلاس',
  'تولید آزمون از محتوا',
  'پروفایل شناختی تطبیقی',
  'شناسایی ریسک تحصیلی',
  'رونویسی صوتی به متن',
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Animated Background */}
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* Navigation */}
      <motion.nav
        className={styles.nav}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className={styles.navInner}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎓</span>
              <span className="gradient-text">دانشگاه هوشمند</span>
            </div>
            <div className={styles.navLinks}>
              <a href="/courses" className={styles.navLink}>📚 دروس</a>
              <a href="#features" className={styles.navLink}>امکانات</a>
              <a href="#ai" className={styles.navLink}>هوش مصنوعی</a>
              <a href="/register" className="btn btn-ghost">ثبت‌نام</a>
              <a href="/login" className="btn btn-primary">ورود</a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.span variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="badge badge-primary">✨ نسل جدید آموزش آنلاین</span>
            </motion.span>
            <motion.h1
              className={styles.heroTitle}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              دانشگاه آنلاین
              <br />
              <span className="gradient-text">مبتنی بر هوش مصنوعی</span>
            </motion.h1>
            <motion.p
              className={styles.heroDesc}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              یادگیری تطبیقی با هوش مصنوعی، کلاس‌های آنلاین تعاملی،
              ارزیابی هوشمند و تحلیل پیشرفته یادگیری — همه در یک پلتفرم
            </motion.p>
            <motion.div
              className={styles.heroCta}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              <a href="/courses" className="btn btn-primary btn-lg">
                مشاهده دروس ←
              </a>
              <a href="/login" className="btn btn-secondary btn-lg">
                ورود به پنل
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <motion.div
            className={styles.statsGrid}
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className={`glass-card ${styles.statCard}`}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <span className={styles.statIcon}>{stat.icon}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className="container">
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="gradient-text">امکانات پلتفرم</span>
          </motion.h2>
          <motion.div
            className={styles.featuresGrid}
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                className={`glass-card ${styles.featureCard}`}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className={styles.aiSection}>
        <div className="container">
          <motion.div
            className={styles.aiContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.aiText}>
              <span className="badge badge-accent">🧠 هوش مصنوعی بومی</span>
              <h2 className={styles.sectionTitle} style={{ textAlign: 'right' }}>
                AI زیرساخت اصلی، نه یک افزونه
              </h2>
              <p className={styles.aiDesc}>
                در دانشگاه هوشمند، هوش مصنوعی فقط یک ابزار کمکی نیست.
                AI هسته اصلی سیستم آموزشی است — از تحلیل پروفایل شناختی
                دانشجو تا تولید محتوا، نمره‌دهی و پیش‌بینی ریسک تحصیلی.
              </p>
              <motion.div
                className={styles.aiFeatures}
                variants={stagger}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {aiFeaturesList.map((f, i) => (
                  <motion.div
                    key={i}
                    className={styles.aiFeatureItem}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                  >
                    <span className={styles.aiCheckmark}>✓</span>
                    <span>{f}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: 'var(--space-3xl) 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.div
            className="glass-card"
            style={{ textAlign: 'center', padding: 'var(--space-3xl) var(--space-2xl)' }}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              همین حالا شروع کنید
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-lg)' }}>
              به جامعه دانشگاه هوشمند بپیوندید و تجربه یادگیری متفاوتی داشته باشید
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" className="btn btn-primary btn-lg">🚀 ثبت‌نام رایگان</a>
              <a href="/courses" className="btn btn-secondary btn-lg">📚 مشاهده دروس</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <span className={styles.logoIcon}>🎓</span>
              <span className="gradient-text">دانشگاه آنلاین هوشمند</span>
              <p className={styles.footerTagline}>نسل جدید آموزش عالی مبتنی بر هوش مصنوعی</p>
            </div>
            <div className={styles.footerMeta}>
              <span className={styles.footerVersion}>v2.0.0</span>
              <span>AI-Native University Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
