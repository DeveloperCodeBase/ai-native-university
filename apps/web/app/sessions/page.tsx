'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Video, Calendar, Users, PlayCircle, Film,
  RadioTower, ClipboardCheck, Link2,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, apiPost, getUser } from '../lib/api';
import styles from './sessions.module.css';

interface ClassSession {
  id: string;
  title: string;
  description?: string;
  scheduledStart: string;
  status: string;
  joinUrl?: string | null;
  course?: { id: string; title: string; slug: string };
  _count?: { attendances: number; recordings: number };
}

const STATUS: Record<string, { label: string; badge: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }> = {
  scheduled: { label: 'برنامه‌ریزی شده', badge: 'badge-primary', Icon: Calendar },
  live:      { label: 'در حال برگزاری',  badge: 'badge-accent',  Icon: RadioTower },
  ended:     { label: 'پایان یافته',     badge: 'badge-success', Icon: Film },
  cancelled: { label: 'لغو شده',         badge: 'badge-danger',  Icon: Video },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function ClassSessionsPage() {
  const router  = useRouter();
  const user    = getUser();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [joining, setJoining]   = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    apiGet('/class-sessions')
      .then((d) => setSessions(Array.isArray(d) ? d : d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const join = async (id: string) => {
    setJoining(id);
    try {
      await apiPost(`/class-sessions/${id}/join`, {});
      const d = await apiGet('/class-sessions');
      setSessions(Array.isArray(d) ? d : d.sessions ?? []);
    } catch (err: any) {
      alert(err.message || 'خطا در پیوستن');
    } finally {
      setJoining(null);
    }
  };

  return (
    <DashboardLayout title="جلسات کلاس">
      <motion.div variants={stagger} initial="initial" animate="animate">
        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(4)].map((_, i) => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Video size={28} strokeWidth={1.5} /></div>
            <h3 className="empty-title">جلسه‌ای یافت نشد</h3>
            <p className="empty-desc">هنوز جلسه کلاسی برنامه‌ریزی نشده است.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {sessions.map((session) => {
              const st = STATUS[session.status] ?? STATUS.scheduled;
              const { Icon } = st;
              return (
                <motion.div
                  key={session.id}
                  className={`glass-card ${styles.card}`}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                >
                  <div className={styles.cardLeft}>
                    <div className={`card-icon ${session.status === 'live' ? 'card-icon-accent' : 'card-icon-brand'}`}>
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    {session.status === 'live' && <div className={styles.livePulse} />}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span className={`badge ${st.badge}`}>
                        {st.label}
                      </span>
                      {session.course && (
                        <span className="tag">
                          <Video size={10} />
                          {session.course.title}
                        </span>
                      )}
                    </div>

                    <h3 className={styles.cardTitle}>{session.title}</h3>

                    {session.description && (
                      <p className={styles.cardDesc}>{session.description}</p>
                    )}

                    <div className={styles.cardStats}>
                      <span className={styles.stat}>
                        <Calendar size={13} />
                        {formatDate(session.scheduledStart)}
                      </span>
                      {session._count && (
                        <>
                          <span className={styles.stat}>
                            <Users size={13} />
                            {session._count.attendances} حاضر
                          </span>
                          {session._count.recordings > 0 && (
                            <span className={styles.stat}>
                              <Film size={13} />
                              {session._count.recordings} ضبط
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    {session.status === 'live' && (
                      <button
                        className="btn btn-accent"
                        onClick={() => join(session.id)}
                        disabled={joining === session.id}
                      >
                        {joining === session.id
                          ? <span className="spinner" style={{ width: 16, height: 16 }} />
                          : <><RadioTower size={15} /> پیوستن</>
                        }
                      </button>
                    )}
                    {session.status === 'scheduled' && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => join(session.id)}
                        disabled={joining === session.id}
                      >
                        <ClipboardCheck size={15} />
                        ثبت حضور
                      </button>
                    )}
                    {session.joinUrl && (
                      <a href={session.joinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        <Link2 size={14} />
                        لینک
                      </a>
                    )}
                    {session.status === 'ended' && session._count && session._count.recordings > 0 && (
                      <button className="btn btn-ghost btn-sm">
                        <PlayCircle size={14} />
                        ضبط
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
