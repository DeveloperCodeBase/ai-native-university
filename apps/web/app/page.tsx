import styles from './page.module.css';

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
      <nav className={styles.nav}>
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
              <a href="/login" className="btn btn-primary">ورود</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className="badge badge-primary">✨ نسل جدید آموزش آنلاین</span>
            <h1 className={styles.heroTitle}>
              دانشگاه آنلاین
              <br />
              <span className="gradient-text">مبتنی بر هوش مصنوعی</span>
            </h1>
            <p className={styles.heroDesc}>
              یادگیری تطبیقی با هوش مصنوعی، کلاس‌های آنلاین تعاملی،
              ارزیابی هوشمند و تحلیل پیشرفته یادگیری — همه در یک پلتفرم
            </p>
            <div className={styles.heroCta}>
              <a href="/courses" className="btn btn-primary btn-lg">
                مشاهده دروس ←
              </a>
              <a href="/login" className="btn btn-secondary btn-lg">
                ورود به پنل
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            {[
              { value: '۱۰+', label: 'رشته تحصیلی', icon: '📚' },
              { value: '۵۰+', label: 'درس فعال', icon: '🎯' },
              { value: '۲۴/۷', label: 'دسترسی', icon: '⏰' },
              { value: 'AI', label: 'یادگیری هوشمند', icon: '🤖' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`glass-card ${styles.statCard}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className={styles.statIcon}>{stat.icon}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            <span className="gradient-text">امکانات پلتفرم</span>
          </h2>
          <div className={styles.featuresGrid}>
            {[
              { icon: '🤖', title: 'دستیار هوشمند AI', desc: 'تیوتر شخصی مبتنی بر RAG که به سوالات شما از روی منابع درسی پاسخ می‌دهد' },
              { icon: '🎥', title: 'کلاس آنلاین زنده', desc: 'کلاس‌های تعاملی با قابلیت ضبط، رونویسی و تحلیل خودکار توسط AI' },
              { icon: '📊', title: 'تحلیل یادگیری', desc: 'داشبوردهای تحلیلی پیشرفته با شناسایی ریسک و توصیه‌های بهبود' },
              { icon: '📝', title: 'ارزیابی هوشمند', desc: 'آزمون‌ها و تکالیف با نمره‌دهی اولیه AI و بازبینی استاد' },
              { icon: '🏛️', title: 'مدیریت دانشگاه', desc: 'مدیریت کامل دانشکده، گروه، رشته، درس و دانشجو' },
              { icon: '🔒', title: 'امنیت و حریم خصوصی', desc: 'احراز هویت امن، جداسازی داده‌ها و حاکمیت هوش مصنوعی' },
            ].map((f, i) => (
              <div
                key={i}
                className={`glass-card ${styles.featureCard}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className={styles.aiSection}>
        <div className="container">
          <div className={styles.aiContent}>
            <div className={styles.aiText}>
              <span className="badge badge-accent">🧠 هوش مصنوعی بومی</span>
              <h2 className={styles.sectionTitle}>
                AI زیرساخت اصلی، نه یک افزونه
              </h2>
              <p className={styles.aiDesc}>
                در دانشگاه هوشمند، هوش مصنوعی فقط یک ابزار کمکی نیست.
                AI هسته اصلی سیستم آموزشی است — از تحلیل پروفایل شناختی
                دانشجو تا تولید محتوا، نمره‌دهی و پیش‌بینی ریسک تحصیلی.
              </p>
              <div className={styles.aiFeatures}>
                {['تیوتر هوشمند RAG', 'تحلیل خودکار کلاس', 'تولید آزمون از محتوا', 'پروفایل شناختی تطبیقی', 'شناسایی ریسک تحصیلی', 'رونویسی صوتی به متن'].map((f, i) => (
                  <div key={i} className={styles.aiFeatureItem}>
                    <span className={styles.aiCheckmark}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
