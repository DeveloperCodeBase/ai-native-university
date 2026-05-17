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
  tenantId: string;
  tenantSlug: string;
}

interface Enrollment {
  id: string;
  progress: number;
  status: string;
  course: {
    id: string;
    title: string;
    slug: string;
    level: string;
    thumbnailUrl?: string;
    instructors?: { user: { id: string; fullName: string } }[];
  };
}

interface ProgressItem {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  enrollmentStatus: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  eventSummary: Record<string, number>;
}

const toPersianNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [enrollData, progressData] = await Promise.all([
        apiGet('/enrollments/my').catch(() => []),
        apiGet('/analytics/progress/my').catch(() => []),
      ]);
      setEnrollments(Array.isArray(enrollData) ? enrollData : []);
      setProgress(Array.isArray(progressData) ? progressData : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const avgProgress =
    activeEnrollments.length > 0
      ? Math.round(
          activeEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            activeEnrollments.length,
        )
      : 0;

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🎓</span>
          <span className="gradient-text">دانشگاه هوشمند</span>
        </div>
        <nav className={styles.nav}>
          <a href="/dashboard/student" className={`${styles.navItem} ${styles.navItemActive}`}>📊 داشبورد</a>
          <a href="/courses" className={styles.navItem}>📚 کاتالوگ دروس</a>
          <a href="/tutor" className={styles.navItem}>🤖 تیوتر هوشمند</a>
          <a href="/sessions" className={styles.navItem}>🎥 جلسات کلاس</a>
          <a href="/courses" className={styles.navItem}>📝 آزمون‌ها</a>
        </nav>
        <button onClick={logout} className={styles.logoutBtn}>🚪 خروج</button>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>سلام، {user.fullName} 👋</h1>
            <p className={styles.headerSub}>خوش آمدید به پنل دانشجویی</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <span className="badge badge-primary">🎓 دانشجو</span>
          </div>
        </header>

        <div className={styles.grid}>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statValue}>{toPersianNum(activeEnrollments.length)}</span>
            <span className={styles.statLabel}>درس فعال</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statValue}>{toPersianNum(avgProgress)}٪</span>
            <span className={styles.statLabel}>پیشرفت کلی</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>✅</span>
            <span className={styles.statValue}>
              {toPersianNum(enrollments.filter((e) => e.status === 'completed').length)}
            </span>
            <span className={styles.statLabel}>تکمیل شده</span>
          </div>
          <div className={`glass-card ${styles.statCard}`} style={{ cursor: 'pointer' }} onClick={() => router.push('/tutor')}>
            <span className={styles.statIcon}>🤖</span>
            <span className={styles.statValue}>AI</span>
            <span className={styles.statLabel}>تیوتر هوشمند</span>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className={`glass-card ${styles.sectionCard}`}>
          <h2 className={styles.sectionTitle}>📚 درس‌های من</h2>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
              ⏳ در حال بارگذاری...
            </p>
          ) : activeEnrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
              <p>هنوز در درسی ثبت‌نام نکرده‌اید</p>
              <a href="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                مشاهده کاتالوگ دروس
              </a>
            </div>
          ) : (
            <div className={styles.courseList}>
              {activeEnrollments.map((enrollment) => {
                const instructor = enrollment.course.instructors?.[0]?.user;
                return (
                  <div
                    key={enrollment.id}
                    className={styles.courseItem}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/courses/${enrollment.course.slug}`)}
                  >
                    <div className={styles.courseInfo}>
                      <h3>{enrollment.course.title}</h3>
                      <p>
                        {instructor ? `${instructor.fullName} · ` : ''}
                        پیشرفت: {toPersianNum(enrollment.progress || 0)}٪
                      </p>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Learning Progress from Analytics */}
        {progress.length > 0 && (
          <div className={`glass-card ${styles.sectionCard}`}>
            <h2 className={styles.sectionTitle}>📈 تحلیل یادگیری</h2>
            <div className={styles.courseList}>
              {progress.map((p) => (
                <div key={p.courseId} className={styles.courseItem}>
                  <div className={styles.courseInfo}>
                    <h3>{p.courseTitle}</h3>
                    <p>
                      {toPersianNum(p.completedLessons)} از {toPersianNum(p.totalLessons)} درس تکمیل شده
                      {p.eventSummary.ai_tutor_asked
                        ? ` · ${toPersianNum(p.eventSummary.ai_tutor_asked)} سوال از AI`
                        : ''}
                    </p>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
