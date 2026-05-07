'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import { apiGet, getUser, logout } from '../../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  _count: { modules: number; enrollments: number; classSessions: number; assessments: number };
}

const toPersianNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

export default function InstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'instructor') { router.push('/login'); return; }
    setUser(u);
    fetchCourses();
  }, [router]);

  const fetchCourses = async () => {
    try {
      const data = await apiGet('/courses');
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const totalStudents = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalSessions = courses.reduce((sum, c) => sum + (c._count?.classSessions || 0), 0);
  const totalAssessments = courses.reduce((sum, c) => sum + (c._count?.assessments || 0), 0);

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🎓</span>
          <span className="gradient-text">دانشگاه هوشمند</span>
        </div>
        <nav className={styles.nav}>
          <a href="/dashboard/instructor" className={`${styles.navItem} ${styles.navItemActive}`}>📊 داشبورد</a>
          <a href="/courses" className={styles.navItem}>📚 کاتالوگ دروس</a>
          <a href="/tutor" className={styles.navItem}>🤖 تیوتر هوشمند</a>
          <a href="/courses" className={styles.navItem}>🎥 کلاس‌ها</a>
          <a href="/courses" className={styles.navItem}>📝 آزمون‌ها و تکالیف</a>
        </nav>
        <button onClick={logout} className={styles.logoutBtn}>🚪 خروج</button>
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
            <span className={styles.statValue}>{toPersianNum(courses.length)}</span>
            <span className={styles.statLabel}>درس فعال</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>{toPersianNum(totalStudents)}</span>
            <span className={styles.statLabel}>دانشجو</span>
          </div>
          <div className={`glass-card ${styles.statCard}`}>
            <span className={styles.statIcon}>🎥</span>
            <span className={styles.statValue}>{toPersianNum(totalSessions)}</span>
            <span className={styles.statLabel}>جلسات کلاس</span>
          </div>
          <div className={`glass-card ${styles.statCard}`} style={{ cursor: 'pointer' }} onClick={() => router.push('/tutor')}>
            <span className={styles.statIcon}>🤖</span>
            <span className={styles.statValue}>AI</span>
            <span className={styles.statLabel}>دستیار هوشمند</span>
          </div>
        </div>

        <div className={`glass-card ${styles.sectionCard}`}>
          <h2 className={styles.sectionTitle}>📚 درس‌های من</h2>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
              ⏳ در حال بارگذاری...
            </p>
          ) : courses.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
              هنوز درسی تعریف نشده است
            </p>
          ) : (
            <div className={styles.courseList}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={styles.courseItem}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/courses/${course.slug}`)}
                >
                  <div className={styles.courseInfo}>
                    <h3>{course.title}</h3>
                    <p>
                      {toPersianNum(course._count?.enrollments || 0)} دانشجو ·{' '}
                      {toPersianNum(course._count?.modules || 0)} ماژول ·{' '}
                      {toPersianNum(course._count?.assessments || 0)} آزمون
                    </p>
                  </div>
                  <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-primary'}`}>
                    {course.status === 'published' ? 'منتشرشده' : course.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
