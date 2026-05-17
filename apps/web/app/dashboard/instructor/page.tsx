'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Users, Video, BrainCircuit, ArrowLeft, ChevronLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiGet, getUser } from '../../lib/api';
import styles from '../student/student.module.css';

const toPersian = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  _count: { modules: number; enrollments: number; classSessions: number; assessments: number };
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function InstructorDashboard() {
  const router = useRouter();
  const user   = getUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'instructor') {
      router.push(user.role === 'student' ? '/dashboard/student' : '/dashboard/admin');
      return;
    }
    apiGet('/courses').then((d) => {
      setCourses(d.courses ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const totalStudents    = courses.reduce((s, c) => s + (c._count?.enrollments   ?? 0), 0);
  const totalSessions    = courses.reduce((s, c) => s + (c._count?.classSessions ?? 0), 0);
  const totalAssessments = courses.reduce((s, c) => s + (c._count?.assessments   ?? 0), 0);

  const metrics = [
    { label: 'درس‌ها',     value: toPersian(courses.length),    Icon: BookOpen,   color: 'brand' },
    { label: 'دانشجویان',  value: toPersian(totalStudents),     Icon: Users,      color: 'accent' },
    { label: 'جلسات',      value: toPersian(totalSessions),     Icon: Video,      color: 'gold' },
    { label: 'تیوتر AI',   value: 'AI',                          Icon: BrainCircuit, color: 'success', href: '/tutor' },
  ];

  return (
    <DashboardLayout title={`سلام، ${user?.fullName ?? ''}`}>
      <motion.div variants={stagger} initial="initial" animate="animate">

        <motion.div className={styles.metricsGrid} variants={fadeUp} transition={{ duration: 0.45 }}>
          {metrics.map(({ label, value, Icon, color, href }) => (
            <div
              key={label}
              className={`glass-card ${styles.metricCard}`}
              onClick={() => href && router.push(href)}
              style={{ cursor: href ? 'pointer' : 'default' }}
            >
              <div className={`card-icon card-icon-${color}`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div className={styles.metricValue}>{loading ? '—' : value}</div>
              <div className={styles.metricLabel}>{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div className={`glass-card ${styles.section}`} variants={fadeUp} transition={{ duration: 0.45 }}>
          <div className="card-header">
            <h2 className="card-title">
              <div className="card-icon card-icon-brand"><BookOpen size={16} /></div>
              درس‌های من
            </h2>
            <a href="/courses" className="btn btn-ghost btn-sm">
              مشاهده همه <ArrowLeft size={14} />
            </a>
          </div>

          {loading ? (
            <div className={styles.loadingList}>
              {[...Array(3)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonRow}`} />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10) 0' }}>
              <div className="empty-icon"><BookOpen size={24} strokeWidth={1.5} /></div>
              <h3 className="empty-title">هنوز درسی اضافه نشده</h3>
            </div>
          ) : (
            <div className={styles.courseList}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={styles.courseRow}
                  onClick={() => router.push(`/courses/${course.slug}`)}
                >
                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-primary'}`}>
                        {course.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
                      </span>
                      <span className={styles.courseProgress}>
                        {toPersian(course._count?.enrollments ?? 0)} دانشجو ·{' '}
                        {toPersian(course._count?.modules ?? 0)} ماژول
                      </span>
                    </div>
                  </div>
                  <ChevronLeft size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
