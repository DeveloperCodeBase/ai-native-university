'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, TrendingUp, Activity,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiGet, getUser } from '../../lib/api';
import styles from './admin.module.css';
import metStyles from '../student/student.module.css';

const toPersian = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface TenantAnalytics {
  summary: { totalUsers: number; totalCourses: number; totalEnrollments: number; totalEvents: number };
  eventBreakdown: Record<string, number>;
  recentEvents: { eventType: string; actor?: { fullName: string } }[];
}

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

const services = [
  { name: 'API Server',   status: 'ok' },
  { name: 'AI Gateway',   status: 'ok' },
  { name: 'Database',     status: 'ok' },
  { name: 'File Storage', status: 'ok' },
];

export default function AdminDashboard() {
  const router    = useRouter();
  const user      = getUser();
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!['admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard/student'); return;
    }
    apiGet('/analytics/tenant').then(setAnalytics).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const stats = analytics?.summary ?? { totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalEvents: 0 };

  const metrics = [
    { label: 'کاربران',         value: toPersian(stats.totalUsers),       Icon: Users,      color: 'brand' },
    { label: 'دروس',            value: toPersian(stats.totalCourses),     Icon: BookOpen,   color: 'accent' },
    { label: 'ثبت‌نام‌ها',      value: toPersian(stats.totalEnrollments), Icon: TrendingUp, color: 'gold' },
    { label: 'رویداد یادگیری',  value: toPersian(stats.totalEvents),      Icon: Activity,   color: 'success' },
  ];

  return (
    <DashboardLayout title="پنل مدیریت">
      <motion.div variants={stagger} initial="initial" animate="animate">

        {/* Metrics */}
        <motion.div className={metStyles.metricsGrid} variants={fadeUp} transition={{ duration: 0.45 }}>
          {metrics.map(({ label, value, Icon, color }) => (
            <div key={label} className={`glass-card ${metStyles.metricCard}`}>
              <div className={`card-icon card-icon-${color}`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div className={metStyles.metricValue}>{loading ? '—' : value}</div>
              <div className={metStyles.metricLabel}>{label}</div>
            </div>
          ))}
        </motion.div>

        <div className={styles.twoCol}>
          {/* Recent Events */}
          <motion.div className={`glass-card ${metStyles.section}`} variants={fadeUp} transition={{ duration: 0.45 }}>
            <div className="card-header">
              <h2 className="card-title">
                <div className="card-icon card-icon-brand"><Activity size={16} /></div>
                فعالیت‌های اخیر
              </h2>
            </div>

            {loading ? (
              <div className={metStyles.loadingList}>
                {[...Array(5)].map((_, i) => <div key={i} className={`skeleton ${metStyles.skeletonRow}`} />)}
              </div>
            ) : analytics?.recentEvents?.length ? (
              <div className={styles.eventList}>
                {analytics.recentEvents.slice(0, 8).map((ev, i) => (
                  <div key={i} className={styles.eventRow}>
                    <div className={styles.eventDot} />
                    <div className={styles.eventInfo}>
                      <span className={styles.eventActor}>{ev.actor?.fullName ?? 'ناشناس'}</span>
                      <span className={styles.eventType}>{ev.eventType}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <div className="empty-icon"><Activity size={22} strokeWidth={1.5} /></div>
                <p className="empty-desc">هنوز فعالیتی ثبت نشده</p>
              </div>
            )}
          </motion.div>

          {/* System status + event breakdown */}
          <motion.div className={`glass-card ${metStyles.section}`} variants={fadeUp} transition={{ duration: 0.45 }}>
            <div className="card-header">
              <h2 className="card-title">
                <div className="card-icon card-icon-success"><CheckCircle2 size={16} /></div>
                وضعیت سیستم
              </h2>
            </div>

            <div className={styles.statusList}>
              {services.map(({ name, status }) => (
                <div key={name} className={styles.statusRow}>
                  <span className={styles.statusName}>{name}</span>
                  <span className={`badge badge-success ${styles.statusBadge}`}>
                    <CheckCircle2 size={10} />
                    سالم
                  </span>
                </div>
              ))}
            </div>

            {analytics?.eventBreakdown && Object.keys(analytics.eventBreakdown).length > 0 && (
              <>
                <div className="divider" style={{ margin: 'var(--space-5) 0' }}>
                  <span style={{ fontSize: 'var(--text-xs)' }}>تفکیک رویدادها</span>
                </div>
                <div className={styles.breakdownList}>
                  {Object.entries(analytics.eventBreakdown).slice(0, 6).map(([type, count]) => (
                    <div key={type} className={styles.breakdownRow}>
                      <span className={styles.breakdownType}>{type}</span>
                      <span className={styles.breakdownCount}>{toPersian(count)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
