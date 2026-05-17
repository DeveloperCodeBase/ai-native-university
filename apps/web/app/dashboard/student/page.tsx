'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, TrendingUp, CheckCircle2, BrainCircuit,
  ArrowLeft, BarChart3,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiGet, getUser } from '../../lib/api';
import styles from './student.module.css';

const toPersian = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface Enrollment {
  id: string;
  progress: number;
  status: string;
  course: { id: string; title: string; slug: string; level: string };
}

interface ProgressItem {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  eventSummary: Record<string, number>;
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function StudentDashboard() {
  const router = useRouter();
  const user = getUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress]       = useState<ProgressItem[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'student') {
      router.push(user.role === 'instructor' ? '/dashboard/instructor' : '/dashboard/admin');
      return;
    }
    (async () => {
      const [enr, prog] = await Promise.all([
        apiGet('/enrollments/my').catch(() => []),
        apiGet('/analytics/progress/my').catch(() => []),
      ]);
      setEnrollments(Array.isArray(enr) ? enr : []);
      setProgress(Array.isArray(prog) ? prog : []);
      setLoading(false);
    })();
  }, [router]);

  const active    = enrollments.filter((e) => e.status === 'active');
  const completed = enrollments.filter((e) => e.status === 'completed');
  const avgProg   = active.length
    ? Math.round(active.reduce((s, e) => s + (e.progress || 0), 0) / active.length)
    : 0;

  const metrics = [
    { label: 'درس فعال',     value: toPersian(active.length),    Icon: BookOpen,    color: 'brand' },
    { label: 'پیشرفت کلی',   value: `${toPersian(avgProg)}٪`,   Icon: TrendingUp,  color: 'accent' },
    { label: 'تکمیل شده',    value: toPersian(completed.length), Icon: CheckCircle2,color: 'success' },
    { label: 'تیوتر AI',     value: 'AI',                         Icon: BrainCircuit,color: 'gold', href: '/tutor' },
  ];

  return (
    <DashboardLayout title={`سلام، ${user?.fullName ?? ''}`}>
      <motion.div variants={stagger} initial="initial" animate="animate">

        {/* Metrics */}
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

        {/* Enrolled Courses */}
        <motion.div className={`glass-card ${styles.section}`} variants={fadeUp} transition={{ duration: 0.45 }}>
          <div className="card-header">
            <h2 className="card-title">
              <div className="card-icon card-icon-brand"><BookOpen size={16} /></div>
              درس‌های من
            </h2>
            <a href="/courses" className="btn btn-ghost btn-sm">
              مشاهده کاتالوگ <ArrowLeft size={14} />
            </a>
          </div>

          {loading ? (
            <div className={styles.loadingList}>
              {[...Array(3)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonRow}`} />)}
            </div>
          ) : active.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10) 0' }}>
              <div className="empty-icon"><BookOpen size={24} strokeWidth={1.5} /></div>
              <h3 className="empty-title">هنوز در درسی ثبت‌نام نکرده‌اید</h3>
              <a href="/courses" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
                مشاهده دروس
              </a>
            </div>
          ) : (
            <div className={styles.courseList}>
              {active.map((e) => (
                <div
                  key={e.id}
                  className={styles.courseRow}
                  onClick={() => router.push(`/courses/${e.course.slug}`)}
                >
                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseTitle}>{e.course.title}</h3>
                    <span className={styles.courseProgress}>{toPersian(e.progress || 0)}٪ پیشرفت</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${e.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Analytics */}
        {progress.length > 0 && (
          <motion.div className={`glass-card ${styles.section}`} variants={fadeUp} transition={{ duration: 0.45 }}>
            <div className="card-header">
              <h2 className="card-title">
                <div className="card-icon card-icon-accent"><BarChart3 size={16} /></div>
                تحلیل یادگیری
              </h2>
            </div>
            <div className={styles.courseList}>
              {progress.map((p) => (
                <div key={p.courseId} className={styles.courseRow}>
                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseTitle}>{p.courseTitle}</h3>
                    <span className={styles.courseProgress}>
                      {toPersian(p.completedLessons)} از {toPersian(p.totalLessons)} درس
                      {p.eventSummary?.ai_tutor_asked
                        ? ` · ${toPersian(p.eventSummary.ai_tutor_asked)} سوال از AI`
                        : ''}
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
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
          </motion.div>
        )}

      </motion.div>
    </DashboardLayout>
  );
}
