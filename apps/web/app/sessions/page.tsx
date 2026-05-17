'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost, getUser } from '../lib/api';
import styles from './sessions.module.css';

interface ClassSession {
  id: string;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string | null;
  actualEnd?: string | null;
  status: string;
  joinUrl: string | null;
  course?: { id: string; title: string; slug: string };
  _count?: { attendances: number; recordings: number };
}

const toPersianNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

const statusConfig: Record<string, { label: string; badge: string }> = {
  scheduled: { label: '📅 برنامه‌ریزی شده', badge: 'badge-primary' },
  live:       { label: '🔴 در حال برگزاری',  badge: 'badge-accent'  },
  ended:      { label: '✅ پایان یافته',      badge: 'badge-success' },
  cancelled:  { label: '❌ لغو شده',          badge: ''              },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ClassSessionsPage() {
  const router = useRouter();
  const user = getUser();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await apiGet('/class-sessions');
      setSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (sessionId: string) => {
    setJoining(sessionId);
    try {
      await apiPost(`/class-sessions/${sessionId}/join`, {});
      await fetchSessions();
    } catch (err: any) {
      alert(err.message || 'خطا در پیوستن به جلسه');
    } finally {
      setJoining(null);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h1 className={styles.pageTitle}>🎥 جلسات کلاس</h1>
            <p className={styles.pageSub}>مشاهده و شرکت در جلسات آنلاین</p>
          </div>
          <div className={styles.navActions}>
            <a href="/courses" className="btn btn-ghost">📚 دروس</a>
            <a href="/tutor" className="btn btn-secondary">🤖 تیوتر</a>
            <a
              href={`/dashboard/${user.role === 'instructor' ? 'instructor' : user.role === 'admin' || user.role === 'super_admin' ? 'admin' : 'student'}`}
              className="btn btn-primary"
            >
              📊 داشبورد
            </a>
          </div>
        </motion.header>

        {loading ? (
          <div className={styles.center}>
            <div className="spinner spinner-lg" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            className={styles.empty}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className={styles.emptyIcon}>📭</span>
            <h3>جلسه‌ای یافت نشد</h3>
            <p>هنوز جلسه کلاسی برنامه‌ریزی نشده است.</p>
          </motion.div>
        ) : (
          <div className={styles.list}>
            <AnimatePresence>
              {sessions.map((session, i) => {
                const st = statusConfig[session.status] || statusConfig.scheduled;
                return (
                  <motion.div
                    key={session.id}
                    className={`glass-card ${styles.card}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.cardTop}>
                      <div style={{ flex: 1 }}>
                        <div className={styles.cardMeta}>
                          <span className={`badge ${st.badge}`}>
                            {session.status === 'live' ? (
                              <span className={styles.livePulse}>
                                <span className={styles.liveDot} />
                                در حال برگزاری
                              </span>
                            ) : st.label}
                          </span>
                          {session.course && (
                            <span className="badge badge-primary">📚 {session.course.title}</span>
                          )}
                        </div>
                        <h3 className={styles.cardTitle}>{session.title}</h3>
                        {session.description && (
                          <p className={styles.cardDesc}>{session.description}</p>
                        )}
                        <div className={styles.cardStats}>
                          <span>📅 {formatDate(session.scheduledStart)}</span>
                          {session._count && (
                            <>
                              <span>👥 {toPersianNum(session._count.attendances)} حاضر</span>
                              <span>🎬 {toPersianNum(session._count.recordings)} ضبط</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        {session.status === 'live' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleJoin(session.id)}
                            disabled={joining === session.id}
                          >
                            {joining === session.id
                              ? <span className="spinner" style={{ width: 16, height: 16 }} />
                              : '🔴 پیوستن'}
                          </button>
                        )}
                        {session.status === 'scheduled' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleJoin(session.id)}
                            disabled={joining === session.id}
                          >
                            {joining === session.id
                              ? <span className="spinner" style={{ width: 16, height: 16 }} />
                              : '📝 ثبت حضور'}
                          </button>
                        )}
                        {session.status === 'ended' && session._count && session._count.recordings > 0 && (
                          <span className="badge badge-success" style={{ textAlign: 'center', padding: '8px 12px' }}>
                            🎬 ضبط موجود
                          </span>
                        )}
                        {session.joinUrl && session.status === 'live' && (
                          <a
                            href={session.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                          >
                            🔗 لینک جلسه
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
