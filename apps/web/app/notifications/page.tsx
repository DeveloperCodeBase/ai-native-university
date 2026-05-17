'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Info, AlertTriangle, Trophy, BookOpen } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, apiPatch } from '../lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const typeIcon = (t: string) => {
  switch (t) {
    case 'certificate_issued': return <Trophy size={16} style={{ color: 'var(--gold-500)' }} />;
    case 'course_enrollment':  return <BookOpen size={16} style={{ color: 'var(--brand-400)' }} />;
    case 'assessment_graded':  return <CheckCheck size={16} style={{ color: 'var(--accent-500)' }} />;
    case 'warning':            return <AlertTriangle size={16} style={{ color: 'var(--warning-500, #f59e0b)' }} />;
    default:                   return <Info size={16} style={{ color: 'var(--text-tertiary)' }} />;
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    setLoading(true);
    apiGet('/notifications')
      .then((d) => setNotifications(d.data?.notifications || d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await apiPatch(`/notifications/${id}/read`, {}).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await apiPatch('/notifications/read-all', {}).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DashboardLayout title="اعلان‌ها">

      {/* Header actions */}
      {unreadCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
          <button className="btn btn-ghost btn-sm" onClick={markAllRead} disabled={markingAll}>
            <CheckCheck size={15} />
            {markingAll ? 'در حال پردازش...' : `علامت خوانده شده (${unreadCount})`}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bell size={28} strokeWidth={1.5} /></div>
          <h3 className="empty-title">اعلانی ندارید</h3>
          <p className="empty-desc">وقتی رویداد جدیدی رخ دهد اینجا نمایش داده می‌شود.</p>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
        >
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              variants={fadeUp}
              transition={{ duration: 0.3 }}
              onClick={() => !n.isRead && markRead(n.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) var(--space-5)',
                background: n.isRead ? 'var(--bg-level1)' : 'rgba(99,102,241,0.05)',
                border: `1px solid ${n.isRead ? 'var(--border-subtle)' : 'var(--brand-500)'}`,
                borderRadius: 'var(--radius-xl)',
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'background var(--transition-fast)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {typeIcon(n.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: 'var(--space-3)',
                }}>
                  <p style={{
                    fontWeight: n.isRead ? 400 : 600,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}>
                    {n.title}
                  </p>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                {n.body && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0 0', lineHeight: 1.6 }}>
                    {n.body}
                  </p>
                )}
              </div>

              {!n.isRead && (
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--brand-500)', flexShrink: 0, marginTop: 6,
                }} />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
