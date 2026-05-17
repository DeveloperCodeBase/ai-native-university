'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, BookOpen, FileText, Video, Clock, Settings, Bot } from 'lucide-react';
import { apiGet, apiPatch } from '../lib/api';
import styles from './NotificationBell.module.css';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

const TypeIconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  enrollment:    BookOpen,
  grade:         FileText,
  class_starting:Video,
  assignment_due:Clock,
  system:        Settings,
  ai_review:     Bot,
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCount();
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCount = async () => {
    try {
      const data = await apiGet('/notifications/unread-count');
      setUnread(data.unreadCount ?? 0);
    } catch {}
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/notifications?pageSize=10');
      setNotifications(data.notifications || []);
    } catch {}
    finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    try {
      await apiPatch(`/notifications/${id}/read`, {});
      setNotifications((n) => n.map((x) => x.id === id ? { ...x, isRead: true } : x));
      setUnread((n) => Math.max(0, n - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await apiPatch('/notifications/read-all', {});
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={`icon-btn ${styles.bell}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="اعلان‌ها"
      >
        <Bell size={18} strokeWidth={1.8} />
        {unread > 0 && (
          <motion.span
            className={styles.badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.dropHead}>
              <span className={styles.dropTitle}>اعلان‌ها</span>
              {unread > 0 && (
                <button className={`btn btn-ghost btn-sm ${styles.readAll}`} onClick={markAllRead}>
                  همه خواندم
                </button>
              )}
            </div>

            <div className={styles.list}>
              {loading && (
                <div className={styles.center}>
                  <div className="spinner" />
                </div>
              )}
              {!loading && notifications.length === 0 && (
                <div className={styles.empty}>
                  <BellOff size={22} style={{ color: 'var(--text-tertiary)' }} />
                  <p>اعلانی وجود ندارد</p>
                </div>
              )}
              {!loading && notifications.map((n) => {
                const NIcon = TypeIconMap[n.type] ?? Bell;
                return (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
                  onClick={() => !n.isRead && markRead(n.id)}
                >
                  <span className={styles.itemIcon}><NIcon size={14} /></span>
                  <div className={styles.itemContent}>
                    <p className={styles.itemTitle}>{n.title}</p>
                    {n.body && <p className={styles.itemBody}>{n.body}</p>}
                    <p className={styles.itemDate}>{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className={styles.unreadDot} />}
                </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
