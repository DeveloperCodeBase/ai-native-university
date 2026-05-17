'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost, getUser } from '../../lib/api';
import styles from './forum.module.css';

interface Thread {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  createdAt: string;
  author: { id: string; fullName: string; role: string };
  _count: { replies: number };
}

interface Reply {
  id: string;
  body: string;
  isAnswer: boolean;
  likeCount: number;
  createdAt: string;
  author: { id: string; fullName: string; role: string };
}

interface ThreadDetail extends Thread {
  replies: Reply[];
  course: { id: string; title: string; slug: string };
}

type View = 'list' | 'thread';

const roleLabel = (role: string) => ({
  instructor: '👨‍🏫 استاد',
  admin: '🛡️ مدیر',
  teaching_assistant: '🎓 دستیار',
  student: '🎓',
}[role] || '');

export default function ForumPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [user, setUser] = useState<any>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null);
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [newReply, setNewReply] = useState('');
  const [composing, setComposing] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    loadThreads();
  }, [courseId]);

  const loadThreads = async (q = '') => {
    setLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const data = await apiGet(`/courses/${courseId}/threads${params}`);
      setThreads(data.threads || []);
    } catch { setThreads([]); }
    finally { setLoading(false); }
  };

  const openThread = async (id: string) => {
    setThreadLoading(true);
    setView('thread');
    try {
      const data = await apiGet(`/threads/${id}`);
      setActiveThread(data);
    } catch { setView('list'); }
    finally { setThreadLoading(false); }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadBody.trim()) return;
    setSubmitting(true);
    try {
      await apiPost(`/courses/${courseId}/threads`, { title: newThreadTitle, body: newThreadBody });
      setNewThreadTitle(''); setNewThreadBody(''); setComposing(false);
      await loadThreads();
    } finally { setSubmitting(false); }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !activeThread) return;
    setSubmitting(true);
    try {
      await apiPost(`/threads/${activeThread.id}/replies`, { body: newReply });
      setNewReply('');
      const data = await apiGet(`/threads/${activeThread.id}`);
      setActiveThread(data);
    } finally { setSubmitting(false); }
  };

  const toggleLike = async (replyId: string) => {
    await apiPost(`/replies/${replyId}/like`, {});
    if (activeThread) {
      const data = await apiGet(`/threads/${activeThread.id}`);
      setActiveThread(data);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadThreads(search);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

  /* ── Thread List ── */
  if (view === 'list') return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>💬 انجمن گفتگو</h1>
            <p className={styles.pageSub}>سوالات و بحث‌های درس</p>
          </div>
          <button className="btn btn-primary" onClick={() => setComposing(true)}>
            ✏️ موضوع جدید
          </button>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className={styles.searchRow}>
          <input
            className="input"
            placeholder="🔍 جستجو در موضوعات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">جستجو</button>
        </form>

        {/* New Thread Modal */}
        <AnimatePresence>
          {composing && (
            <motion.div
              className={`glass-card ${styles.compose}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className={styles.composeTitle}>موضوع جدید</h3>
              <form onSubmit={createThread}>
                <div className="field">
                  <label className="label">عنوان موضوع</label>
                  <input className="input" value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="عنوان سوال یا بحث..." required />
                </div>
                <div className="field">
                  <label className="label">متن</label>
                  <textarea className="input" value={newThreadBody}
                    onChange={(e) => setNewThreadBody(e.target.value)}
                    placeholder="توضیحات کامل‌تر..." rows={4} required
                    style={{ resize: 'vertical' }} />
                </div>
                <div className={styles.composeActions}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '📤 ارسال'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setComposing(false)}>
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thread List */}
        {loading ? (
          <div className={styles.loadingState}>
            {[1,2,3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 12 }} />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize: '3rem' }}>💬</span>
            <p>هنوز موضوعی ایجاد نشده. اولین نفر باشید!</p>
          </div>
        ) : (
          <div className={styles.threadList}>
            {threads.map((t, i) => (
              <motion.div
                key={t.id}
                className={`glass-card ${styles.threadCard} ${t.isPinned ? styles.threadPinned : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => openThread(t.id)}
              >
                <div className={styles.threadMeta}>
                  {t.isPinned && <span className="badge badge-gold">📌 سنجاق شده</span>}
                  {t.isLocked && <span className="badge badge-warning">🔒 قفل</span>}
                  <span className={styles.threadRole}>{roleLabel(t.author.role)}</span>
                  <span className={styles.threadAuthor}>{t.author.fullName}</span>
                  <span className={styles.threadDate}>{formatDate(t.createdAt)}</span>
                </div>
                <h3 className={styles.threadTitle}>{t.title}</h3>
                <p className={styles.threadBody}>{t.body.slice(0, 120)}{t.body.length > 120 ? '...' : ''}</p>
                <div className={styles.threadStats}>
                  <span>💬 {t.replyCount} پاسخ</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── Thread Detail ── */
  return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden>
        <div className={styles.orb1} /><div className={styles.orb2} />
      </div>
      <div className={styles.inner}>
        <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => { setView('list'); setActiveThread(null); }}>
          ← بازگشت به لیست
        </button>

        {threadLoading || !activeThread ? (
          <div className={styles.loadingState}>
            <div className="skeleton" style={{ height: 200, borderRadius: 12, marginBottom: 12 }} />
          </div>
        ) : (
          <>
            {/* Original thread */}
            <motion.div
              className={`glass-card ${styles.threadDetail}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.threadMeta}>
                {activeThread.isPinned && <span className="badge badge-gold">📌 سنجاق</span>}
                {activeThread.isLocked && <span className="badge badge-warning">🔒 قفل</span>}
                <span className={styles.threadRole}>{roleLabel(activeThread.author.role)}</span>
                <span className={styles.threadAuthor}>{activeThread.author.fullName}</span>
                <span className={styles.threadDate}>{formatDate(activeThread.createdAt)}</span>
              </div>
              <h2 className={styles.threadDetailTitle}>{activeThread.title}</h2>
              <p className={styles.threadDetailBody}>{activeThread.body}</p>
            </motion.div>

            {/* Replies */}
            <div className={styles.replies}>
              <h3 className={styles.repliesTitle}>💬 پاسخ‌ها ({activeThread.replies.length})</h3>
              {activeThread.replies.map((r, i) => (
                <motion.div
                  key={r.id}
                  className={`glass-card ${styles.replyCard} ${r.isAnswer ? styles.replyAnswer : ''}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {r.isAnswer && <div className={styles.answerMark}>✅ پاسخ برتر</div>}
                  <div className={styles.replyMeta}>
                    <span className={styles.threadRole}>{roleLabel(r.author.role)}</span>
                    <span className={styles.threadAuthor}>{r.author.fullName}</span>
                    <span className={styles.threadDate}>{formatDate(r.createdAt)}</span>
                  </div>
                  <p className={styles.replyBody}>{r.body}</p>
                  <div className={styles.replyActions}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleLike(r.id)}>
                      👍 {r.likeCount}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reply form */}
            {!activeThread.isLocked && (
              <motion.div
                className={`glass-card ${styles.replyForm}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className={styles.replyFormTitle}>✍️ پاسخ دهید</h3>
                <form onSubmit={sendReply}>
                  <textarea
                    className="input"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    rows={4}
                    style={{ resize: 'vertical', marginBottom: 12 }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '📤 ارسال پاسخ'}
                  </button>
                </form>
              </motion.div>
            )}
            {activeThread.isLocked && (
              <div className="alert alert-warning">
                <span>🔒</span>
                <span>این موضوع توسط مدیر قفل شده و امکان ارسال پاسخ وجود ندارد.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
