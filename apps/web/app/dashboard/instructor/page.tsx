'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'instructor') { router.push('/login'); return; }
    setUser(u);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
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
          <a href="/dashboard/instructor" className={`${styles.navItem} ${styles.navItemActive}`}>📊 داشبورد</a>
          <a href="/dashboard/instructor" className={styles.navItem}>📚 درس‌های من</a>
          <a href="/dashboard/instructor" className={styles.navItem}>🎥 کلاس‌ها</a>
          <a href="/dashboard/instructor" className={styles.navItem}>📝 آزمون‌ها و تکالیف</a>
          <a href="/dashboard/instructor" className={styles.navItem}>👥 دانشجویان</a>
          <a href="/dashboard/instructor" className={styles.navItem}>🤖 دستیار AI</a>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>🚪 خروج</button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>سلام، {user.fullName} 👋</h1>
            <p className={styles.headerSub}>پنل مدیریت استاد</p>
          </div>
          <span className="badge badge-accent">👨‍🏫 استاد</span>
        </header>

        <div className={styles.grid}>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>۳</span>
            <span className={styles.statLabel}>درس فعال</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>۲</span>
            <span className={styles.statLabel}>دانشجو</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>🎥</span>
            <span className={styles.statValue}>۰</span>
            <span className={styles.statLabel}>کلاس‌ آینده</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📝</span>
            <span className={styles.statValue}>۰</span>
            <span className={styles.statLabel}>تکلیف بررسی‌نشده</span>
          </div>
        </div>

        <div className={`glass-card ${styles.sectionCard}`}>
          <h2 className={styles.sectionTitle}>درس‌های من</h2>
          <div className={styles.courseList}>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}><h3>مبانی هوش مصنوعی</h3><p>۲ دانشجو · منتشرشده</p></div>
              <span className="badge badge-success">فعال</span>
            </div>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}><h3>ساختمان داده</h3><p>۰ دانشجو · منتشرشده</p></div>
              <span className="badge badge-success">فعال</span>
            </div>
            <div className={styles.courseItem}>
              <div className={styles.courseInfo}><h3>توسعه وب پیشرفته</h3><p>۰ دانشجو · منتشرشده</p></div>
              <span className="badge badge-success">فعال</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
