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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (!['admin', 'super_admin'].includes(u.role)) { router.push('/login'); return; }
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
          <a href="/dashboard/admin" className={`${styles.navItem} ${styles.navItemActive}`}>📊 داشبورد</a>
          <a href="/dashboard/admin" className={styles.navItem}>🏛️ دانشکده‌ها</a>
          <a href="/dashboard/admin" className={styles.navItem}>📚 دروس</a>
          <a href="/dashboard/admin" className={styles.navItem}>👥 کاربران</a>
          <a href="/dashboard/admin" className={styles.navItem}>📈 تحلیل‌ها</a>
          <a href="/dashboard/admin" className={styles.navItem}>⚙️ تنظیمات</a>
          <a href="/dashboard/admin" className={styles.navItem}>📋 لاگ عملیات</a>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>🚪 خروج</button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>پنل مدیریت 🛡️</h1>
            <p className={styles.headerSub}>خوش آمدید، {user.fullName}</p>
          </div>
          <span className="badge badge-primary">🛡️ {user.role === 'super_admin' ? 'مدیر کل' : 'مدیر'}</span>
        </header>

        <div className={styles.grid}>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>۵</span>
            <span className={styles.statLabel}>کاربران</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>۳</span>
            <span className={styles.statLabel}>دروس</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>🏛️</span>
            <span className={styles.statValue}>۱</span>
            <span className={styles.statLabel}>دانشکده</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statValue}>۳</span>
            <span className={styles.statLabel}>ثبت‌نام فعال</span>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <div className={`glass-card ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>کاربران اخیر</h2>
            <div className={styles.userList}>
              <div className={styles.userItem}><span>🛡️</span><div><strong>مدیر کل سیستم</strong><br/><small>superadmin@demo.university.ir</small></div></div>
              <div className={styles.userItem}><span>👨‍🏫</span><div><strong>دکتر احمدی</strong><br/><small>instructor@demo.university.ir</small></div></div>
              <div className={styles.userItem}><span>🎓</span><div><strong>علی محمدی</strong><br/><small>student@demo.university.ir</small></div></div>
              <div className={styles.userItem}><span>🎓</span><div><strong>فاطمه رضایی</strong><br/><small>student2@demo.university.ir</small></div></div>
            </div>
          </div>

          <div className={`glass-card ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>وضعیت سیستم</h2>
            <div className={styles.statusList}>
              <div className={styles.statusItem}><span className={styles.statusDot} /> API <span className={styles.statusOk}>سالم</span></div>
              <div className={styles.statusItem}><span className={styles.statusDot} /> AI Gateway <span className={styles.statusOk}>Mock Mode</span></div>
              <div className={styles.statusItem}><span className={styles.statusDot} /> Database <span className={styles.statusOk}>سالم</span></div>
              <div className={styles.statusItem}><span className={styles.statusDot} /> Storage <span className={styles.statusOk}>سالم</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
