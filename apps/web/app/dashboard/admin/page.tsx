'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import { apiGet, getUser, logout } from '../../lib/api';
import NotificationBell from '../../components/NotificationBell';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface TenantAnalytics {
  summary: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalEvents: number;
  };
  eventBreakdown: Record<string, number>;
  recentEvents: any[];
}

const toPersianNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (!['admin', 'super_admin'].includes(u.role)) { router.push('/login'); return; }
    setUser(u);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const data = await apiGet('/analytics/tenant');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const stats = analytics?.summary || { totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalEvents: 0 };

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🎓</span>
          <span className="gradient-text">دانشگاه هوشمند</span>
        </div>
        <nav className={styles.nav}>
          <a href="/dashboard/admin" className={`${styles.navItem} ${styles.navItemActive}`}>📊 داشبورد</a>
          <a href="/courses" className={styles.navItem}>📚 دروس</a>
          <a href="/tutor" className={styles.navItem}>🤖 تیوتر هوشمند</a>
          <a href="/sessions" className={styles.navItem}>🎥 جلسات کلاس</a>
          <a href="/dashboard/admin" className={styles.navItem}>🏛️ دانشکده‌ها</a>
          <a href="/dashboard/admin" className={styles.navItem}>👥 کاربران</a>
          <a href="/dashboard/admin" className={styles.navItem}>📈 تحلیل‌ها</a>
          <a href="/dashboard/admin" className={styles.navItem}>⚙️ تنظیمات</a>
          <a href="/dashboard/admin" className={styles.navItem}>📋 لاگ AI</a>
        </nav>
        <button onClick={logout} className={styles.logoutBtn}>🚪 خروج</button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>پنل مدیریت 🛡️</h1>
            <p className={styles.headerSub}>خوش آمدید، {user.fullName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <span className="badge badge-primary">🛡️ {user.role === 'super_admin' ? 'مدیر کل' : 'مدیر'}</span>
          </div>
        </header>

        <div className={styles.grid}>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>{toPersianNum(stats.totalUsers)}</span>
            <span className={styles.statLabel}>کاربران</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>{toPersianNum(stats.totalCourses)}</span>
            <span className={styles.statLabel}>دروس</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statValue}>{toPersianNum(stats.totalEnrollments)}</span>
            <span className={styles.statLabel}>ثبت‌نام فعال</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📈</span>
            <span className={styles.statValue}>{toPersianNum(stats.totalEvents)}</span>
            <span className={styles.statLabel}>رویداد یادگیری</span>
          </div>
        </div>

        <div className={styles.gridTwo}>
          {/* Recent Activity */}
          <div className={`glass-card ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>📈 فعالیت‌های اخیر</h2>
            {loading ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>⏳ در حال بارگذاری...</p>
            ) : analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
              <div className={styles.userList}>
                {analytics.recentEvents.slice(0, 8).map((event: any, i: number) => (
                  <div key={i} className={styles.userItem}>
                    <span>📌</span>
                    <div>
                      <strong>{event.actor?.fullName || 'ناشناس'}</strong><br/>
                      <small>{event.eventType}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                هنوز فعالیتی ثبت نشده
              </p>
            )}
          </div>

          {/* System Status */}
          <div className={`glass-card ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>وضعیت سیستم</h2>
            <div className={styles.statusList}>
              <div className={styles.statusItem}><span className={styles.statusDot} /> API <span className={styles.statusOk}>سالم</span></div>
              <div className={styles.statusItem}><span className={styles.statusDot} /> AI Gateway <span className={styles.statusOk}>Mock Mode</span></div>
              <div className={styles.statusItem}><span className={styles.statusDot} /> Database <span className={styles.statusOk}>سالم</span></div>
              <div className={styles.statusItem}><span className={styles.statusDot} /> Storage <span className={styles.statusOk}>سالم</span></div>
            </div>

            {/* Event Breakdown */}
            {analytics?.eventBreakdown && Object.keys(analytics.eventBreakdown).length > 0 && (
              <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>تفکیک رویدادها</h3>
                {Object.entries(analytics.eventBreakdown).map(([type, count]) => (
                  <div key={type} className={styles.statusItem}>
                    <span style={{ fontSize: '0.85rem' }}>{type}</span>
                    <span className={styles.statusOk}>{toPersianNum(count as number)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
