'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, getUser } from '../lib/api';

interface ClassSession {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  endedAt: string | null;
  status: string;
  meetingUrl: string | null;
  course?: { id: string; title: string; slug: string };
  _count?: { attendances: number; recordings: number };
}

const toPersianNum = (n: number) =>
  n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

const statusLabels: Record<string, { label: string; color: string }> = {
  scheduled: { label: '📅 برنامه‌ریزی شده', color: 'badge-primary' },
  live: { label: '🔴 در حال برگزاری', color: 'badge-accent' },
  ended: { label: '✅ پایان یافته', color: 'badge-success' },
  cancelled: { label: '❌ لغو شده', color: '' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (sessionId: string) => {
    setJoining(sessionId);
    try {
      await apiPost(`/class-sessions/${sessionId}/join`, {});
      // Refresh to get updated attendance
      await fetchSessions();
    } catch (err: any) {
      alert(err.message || 'خطا در پیوستن به جلسه');
    } finally {
      setJoining(null);
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 'var(--space-xl) 0' }}>
      {/* Header */}
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
              🎥 جلسات کلاس
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
              مشاهده و شرکت در جلسات آنلاین
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <a href="/courses" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>📚 دروس</a>
            <a href="/tutor" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>🤖 تیوتر</a>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>⏳ در حال بارگذاری...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📭</div>
            <h3 style={{ color: 'var(--color-text)', marginBottom: 'var(--space-sm)' }}>جلسه‌ای یافت نشد</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>هنوز جلسه کلاسی تعریف نشده است</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {sessions.map((session) => {
              const st = statusLabels[session.status] || statusLabels.scheduled;
              return (
                <div key={session.id} className="glass-card" style={{ padding: 'var(--space-lg)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                        <span className={`badge ${st.color}`}>{st.label}</span>
                        {session.course && (
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                            📚 {session.course.title}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-xs)' }}>
                        {session.title}
                      </h3>

                      {session.description && (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
                          {session.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <span>📅 {formatDate(session.scheduledAt)}</span>
                        {session._count && (
                          <>
                            <span>👥 {toPersianNum(session._count.attendances)} حاضر</span>
                            <span>🎬 {toPersianNum(session._count.recordings)} ضبط</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', minWidth: '120px' }}>
                      {session.status === 'live' && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.85rem' }}
                          onClick={() => handleJoin(session.id)}
                          disabled={joining === session.id}
                        >
                          {joining === session.id ? '⏳...' : '🔴 پیوستن'}
                        </button>
                      )}
                      {session.status === 'scheduled' && (
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.85rem' }}
                          onClick={() => handleJoin(session.id)}
                          disabled={joining === session.id}
                        >
                          {joining === session.id ? '⏳...' : '📝 ثبت حضور'}
                        </button>
                      )}
                      {session.status === 'ended' && session._count && session._count.recordings > 0 && (
                        <span className="badge badge-success" style={{ textAlign: 'center' }}>🎬 ضبط موجود</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
