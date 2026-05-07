'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(stored);
    if (u.role !== 'student') {
      router.push(`/dashboard/${u.role === 'instructor' ? 'instructor' : 'admin'}`);
      return;
    }
    setUser(u);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🎓</span>
          <span className="gradient-text">دانشگاه هوشمند</span>
        </div>
        <nav className={styles.nav}>
          <a href="/dashboard/student" className={`${styles.navItem} ${styles.navItemActive}`}>📊 داشبورد</a>
          <a href="/dashboard/student" className={styles.navItem}>📚 درس‌های من</a>
          <a href="/dashboard/student" className={styles.navItem}>🎥 کلاس‌ها</a>
          <a href="/dashboard/student" className={styles.navItem}>📝 آزمون‌ها</a>
          <a href="/dashboard/student" className={styles.navItem}>🤖 تیوتر AI</a>
          <a href="/dashboard/student" className={styles.navItem}>📈 پیشرفت</a>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>🚪 خروج</button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>سلام، {user.fullName} 👋</h1>
            <p className={styles.headerSub}>خوش آمدید به پنل دانشجویی</p>
          </div>
          <span className="badge badge-primary">🎓 دانشجو</span>
        </header>

        <div className={styles.grid}>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>۲</span>
            <span className={styles.statLabel}>درس فعال</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statValue}>۲۵٪</span>
            <span className={styles.statLabel}>پیشرفت کلی</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>🎥</span>
            <span className={styles.statValue}>۰</span>
            <span className={styles.statLabel}>کلاس آینده</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📝</span>
            <span className={styles.statValue}>۰</span>
            <span className={styles.statLabel}>آزمون باقیمانده</span>
          </div>
        </div>

        <div className={`glass-card ${styles.sectionCard}`}>
          <h2 className={styles.sectionTitle}>درس‌های اخیر</h2>
          <div className={styles.courseList}>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}>
                <h3>مبانی هوش مصنوعی</h3>
                <p>دکتر احمدی · پیشرفت: ۲۵٪</p>
              </div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '25%' }} /></div>
            </div>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}>
                <h3>ساختمان داده</h3>
                <p>دکتر احمدی · پیشرفت: ۰٪</p>
              </div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '0%' }} /></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
