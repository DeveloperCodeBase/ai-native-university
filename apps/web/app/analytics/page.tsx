'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, BookOpen, Users, ClipboardList, ChevronDown,
  ChevronUp, Trophy, AlertTriangle, TrendingUp, GraduationCap,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, getUser } from '../lib/api';
import styles from './analytics.module.css';

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
  totalPoints: number;
  passingScore?: number;
}

interface Submission {
  id: string;
  userId: string;
  status: string;
  score?: number;
  totalPoints?: number;
  submittedAt: string;
  gradedAt?: string;
  user: { id: string; fullName: string; email: string };
}

interface CourseStats {
  enrollmentStats: Record<string, number>;
  eventCounts: Record<string, number>;
}

const scoreColor = (score: number, total: number, styles: any) => {
  const pct = (score / total) * 100;
  if (pct >= 70) return styles.scoreHigh;
  if (pct >= 50) return styles.scoreMid;
  return styles.scoreLow;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [openAssessId, setOpenAssessId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [tenantStats, setTenantStats] = useState<any>(null);

  // Load courses
  useEffect(() => {
    apiGet('/courses')
      .then((d) => {
        const list: Course[] = d.courses || d || [];
        setCourses(list.filter((c) => c.status === 'published'));
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false));

    if (isAdmin) {
      apiGet('/analytics/tenant').then((d) => setTenantStats(d)).catch(() => {});
    }
  }, [isAdmin]);

  // Load course panel when course selected
  useEffect(() => {
    if (!selectedCourse) return;
    setLoadingPanel(true);
    setAssessments([]);
    setOpenAssessId(null);
    setCourseStats(null);

    Promise.all([
      apiGet(`/assessments/course/${selectedCourse.id}`).then((d) => setAssessments(Array.isArray(d) ? d : [])),
      apiGet(`/analytics/course/${selectedCourse.id}`).then((d) => setCourseStats(d)),
    ])
      .catch(() => {})
      .finally(() => setLoadingPanel(false));
  }, [selectedCourse]);

  // Load submissions when assessment expanded
  const toggleAssessment = async (assess: Assessment) => {
    if (openAssessId === assess.id) {
      setOpenAssessId(null);
      return;
    }
    setOpenAssessId(assess.id);
    if (submissions[assess.id]) return;

    try {
      const d = await apiGet(`/assessments/${assess.id}/submissions`);
      setSubmissions((prev) => ({ ...prev, [assess.id]: Array.isArray(d) ? d : [] }));
    } catch {
      setSubmissions((prev) => ({ ...prev, [assess.id]: [] }));
    }
  };

  const typeLabel = (t: string) =>
    t === 'quiz' ? 'آزمون' : t === 'assignment' ? 'تکلیف' : t === 'exam' ? 'امتحان' : t;

  return (
    <DashboardLayout title="تحلیل و دفتر نمرات">

      {/* Tenant-wide stats for admins */}
      {isAdmin && tenantStats && (
        <motion.div className={styles.statsRow} variants={fadeUp} initial="initial" animate="animate">
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--brand-400)' }}>
              <GraduationCap size={18} />
            </div>
            <span className={styles.statValue}>{tenantStats.summary?.totalUsers ?? '--'}</span>
            <span className={styles.statLabel}>کاربران</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent-500)' }}>
              <BookOpen size={18} />
            </div>
            <span className={styles.statValue}>{tenantStats.summary?.totalCourses ?? '--'}</span>
            <span className={styles.statLabel}>دروس</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--gold-500)' }}>
              <TrendingUp size={18} />
            </div>
            <span className={styles.statValue}>{tenantStats.summary?.totalEnrollments ?? '--'}</span>
            <span className={styles.statLabel}>ثبت‌نام‌ها</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
              <AlertTriangle size={18} />
            </div>
            <span className={styles.statValue}>{tenantStats.summary?.totalEvents ?? '--'}</span>
            <span className={styles.statLabel}>رویداد یادگیری</span>
          </div>
        </motion.div>
      )}

      {/* Gradebook layout */}
      <div className={styles.gradebookLayout}>

        {/* Course sidebar */}
        <div className={styles.courseList}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>
            دروس
          </p>
          {loadingCourses
            ? [1, 2, 3].map((i) => <div key={i} className={`skeleton ${styles.courseItem}`} style={{ height: 56 }} />)
            : courses.length === 0
              ? <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>درسی یافت نشد</p>
              : courses.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.courseItem} ${selectedCourse?.id === c.id ? styles.courseItemActive : ''}`}
                  onClick={() => setSelectedCourse(c)}
                >
                  <div className={styles.courseName}>{c.title}</div>
                  <div className={styles.courseMeta}>{c.slug}</div>
                </button>
              ))
          }
        </div>

        {/* Right panel */}
        <div className={styles.gradePanel}>
          {!selectedCourse ? (
            <div className={styles.selectPrompt}>
              <BarChart3 size={36} strokeWidth={1.4} />
              <p>یک درس را از لیست سمت راست انتخاب کنید</p>
            </div>
          ) : loadingPanel ? (
            <>
              <div className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-xl)' }} />
              <div className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-xl)' }} />
              <div className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-xl)' }} />
            </>
          ) : (
            <>
              {/* Course stats bar */}
              {courseStats && (
                <motion.div className={styles.courseStat} {...fadeUp}>
                  <div className={styles.courseStatItem}>
                    <span className={styles.courseStatValue}>
                      {Object.values(courseStats.enrollmentStats || {}).reduce((a, b) => a + b, 0)}
                    </span>
                    <span className={styles.courseStatLabel}>ثبت‌نام‌ها</span>
                  </div>
                  <div className={styles.courseStatItem}>
                    <span className={styles.courseStatValue}>{courseStats.enrollmentStats?.active ?? 0}</span>
                    <span className={styles.courseStatLabel}>فعال</span>
                  </div>
                  <div className={styles.courseStatItem}>
                    <span className={styles.courseStatValue}>{courseStats.enrollmentStats?.completed ?? 0}</span>
                    <span className={styles.courseStatLabel}>تکمیل شده</span>
                  </div>
                  <div className={styles.courseStatItem}>
                    <span className={styles.courseStatValue}>
                      {Object.values(courseStats.eventCounts || {}).reduce((a, b) => a + b, 0)}
                    </span>
                    <span className={styles.courseStatLabel}>رویداد یادگیری</span>
                  </div>
                </motion.div>
              )}

              {/* Assessments */}
              {assessments.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
                  <div className="empty-icon"><ClipboardList size={28} strokeWidth={1.5} /></div>
                  <h3 className="empty-title">آزمونی تعریف نشده</h3>
                  <p className="empty-desc">برای این درس هنوز آزمون یا تکلیفی ایجاد نشده است.</p>
                </div>
              ) : (
                assessments.map((assess) => (
                  <motion.div key={assess.id} className={styles.assessCard} {...fadeUp}>
                    <div className={styles.assessHeader} onClick={() => toggleAssessment(assess)}>
                      <div className={styles.assessTitle}>
                        <ClipboardList size={16} strokeWidth={1.8} style={{ color: 'var(--brand-400)' }} />
                        {assess.title}
                        <span className="badge badge-default">{typeLabel(assess.type)}</span>
                      </div>
                      <div className={styles.assessMeta}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Trophy size={13} /> {assess.totalPoints} امتیاز
                        </span>
                        {openAssessId === assess.id
                          ? <ChevronUp size={16} />
                          : <ChevronDown size={16} />
                        }
                      </div>
                    </div>

                    <AnimatePresence>
                      {openAssessId === assess.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          {!submissions[assess.id] ? (
                            <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                              در حال بارگذاری...
                            </div>
                          ) : submissions[assess.id].length === 0 ? (
                            <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                              <Users size={20} style={{ margin: '0 auto var(--space-2)' }} />
                              <p>هنوز هیچ دانشجویی پاسخ ارسال نکرده است.</p>
                            </div>
                          ) : (
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>نام دانشجو</th>
                                  <th>نمره</th>
                                  <th>وضعیت</th>
                                  <th>تاریخ ارسال</th>
                                </tr>
                              </thead>
                              <tbody>
                                {submissions[assess.id].map((sub) => (
                                  <tr key={sub.id}>
                                    <td>{sub.user.fullName}</td>
                                    <td>
                                      {sub.score != null ? (
                                        <span className={`${styles.scoreCell} ${scoreColor(sub.score, assess.totalPoints, styles)}`}>
                                          {sub.score}/{assess.totalPoints}
                                        </span>
                                      ) : (
                                        <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                                      )}
                                    </td>
                                    <td>
                                      <span className={`badge ${
                                        sub.status === 'graded' ? 'badge-success' :
                                        sub.status === 'submitted' ? 'badge-warning' :
                                        'badge-default'
                                      }`}>
                                        {sub.status === 'graded' ? 'نمره‌دهی شده' :
                                         sub.status === 'submitted' ? 'در انتظار' :
                                         sub.status}
                                      </span>
                                    </td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                                      {formatDate(sub.submittedAt)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
