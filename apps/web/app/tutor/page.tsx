'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Send, BookOpen, AlertTriangle,
  Globe2, CheckCircle2, Cpu, RotateCcw,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, apiPost, getUser } from '../lib/api';
import styles from './tutor.module.css';

interface Source {
  type: string;
  id: string;
  title: string;
  snippet: string;
  relevance_score: number;
}

interface ChatMsg {
  id: string;
  role: 'user' | 'ai';
  content: string;
  confidence?: number;
  model?: string;
  provider?: string;
  human_review_required?: boolean;
  sources?: Source[];
  ts: Date;
}

interface Course { id: string; title: string; slug: string; }

const HINTS = [
  'یادگیری ماشین چیست؟',
  'Overfitting را توضیح بده',
  'تفاوت supervised و unsupervised؟',
  'الگوریتم مرتب‌سازی سریع',
  'شبکه عصبی چگونه یاد می‌گیرد؟',
];

export default function TutorPage() {
  const router = useRouter();
  const user   = getUser();
  const endRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages]       = useState<ChatMsg[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [courseId, setCourseId]       = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    apiGet('/courses?status=published').then((d) => setCourses(d.courses ?? [])).catch(() => {});
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', content: q, ts: new Date() }]);

    try {
      const res = await apiPost('/ai/tutor/ask', { query: q, courseId: courseId || undefined });
      setMessages((prev) => [...prev, {
        id: `ai_${Date.now()}`,
        role: 'ai',
        content: res.answer ?? 'پاسخی دریافت نشد.',
        confidence: res.confidence,
        model: res.model,
        provider: res.provider,
        human_review_required: res.human_review_required,
        sources: res.sources,
        ts: new Date(),
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `e_${Date.now()}`,
        role: 'ai',
        content: `خطا در دریافت پاسخ: ${err.message ?? 'خطای شبکه'}`,
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.layout}>
        {/* ── Settings Panel ── */}
        <aside className={styles.panel}>
          <div className="card-header" style={{ marginBottom: 'var(--space-5)' }}>
            <h2 className="card-title">
              <div className="card-icon card-icon-brand"><BrainCircuit size={16} /></div>
              دستیار هوشمند
            </h2>
          </div>

          <div className={styles.panelSection}>
            <label className="label">
              <BookOpen size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              زمینه درس
            </label>
            <select
              className="input"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <option value="">بدون محدودیت</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <p className={styles.panelNote}>
              پاسخ‌ها از منابع درس انتخاب‌شده استخراج می‌شوند
            </p>
          </div>

          <div className={styles.panelSection}>
            <p className={styles.panelLabel}>ویژگی‌های AI Governance</p>
            <ul className={styles.featureList}>
              {[
                { Icon: CheckCircle2, text: 'اطمینان پاسخ', color: 'var(--success)' },
                { Icon: Globe2,       text: 'منبع‌محوری',    color: 'var(--accent-500)' },
                { Icon: Cpu,          text: 'نام مدل',       color: 'var(--brand-400)' },
                { Icon: AlertTriangle,text: 'بازبینی انسانی', color: 'var(--warning)' },
              ].map(({ Icon, text, color }) => (
                <li key={text} className={styles.featureItem}>
                  <Icon size={14} style={{ color, flexShrink: 0 }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {messages.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => setMessages([])}
            >
              <RotateCcw size={14} />
              پاک‌کردن مکالمه
            </button>
          )}
        </aside>

        {/* ── Chat ── */}
        <div className={styles.chat}>
          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && (
              <motion.div
                className={styles.welcome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.welcomeIcon}>
                  <BrainCircuit size={36} strokeWidth={1.4} />
                </div>
                <h2 className={styles.welcomeTitle}>دستیار هوشمند RAG</h2>
                <p className={styles.welcomeDesc}>
                  هر سوالی درباره دروس دارید بپرسید. پاسخ‌ها از منابع درسی معتبر استخراج می‌شوند.
                </p>
                <div className={styles.hints}>
                  {HINTS.map((h) => (
                    <button key={h} className={styles.hintChip} onClick={() => send(h)}>
                      {h}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.role === 'ai' && (
                    <div className={styles.aiAvatar}>
                      <BrainCircuit size={16} strokeWidth={1.8} />
                    </div>
                  )}

                  <div className={styles.msgContent}>
                    <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                      {msg.content}
                    </div>

                    {/* AI Governance */}
                    {msg.role === 'ai' && msg.confidence !== undefined && (
                      <div className={styles.governance}>
                        <span className="tag">
                          <CheckCircle2 size={10} style={{ color: 'var(--success)' }} />
                          اطمینان: {Math.round(msg.confidence * 100)}٪
                        </span>
                        {msg.model && (
                          <span className="tag">
                            <Cpu size={10} />
                            {msg.model}
                          </span>
                        )}
                        {msg.human_review_required && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            <AlertTriangle size={10} />
                            بازبینی نیاز
                          </span>
                        )}
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className={styles.sources}>
                        <div className={styles.sourcesHeader}>
                          <Globe2 size={12} />
                          منابع:
                        </div>
                        {msg.sources.map((s, i) => (
                          <div key={i} className={styles.source}>
                            <span className={styles.sourceTitle}>{s.title || s.type}</span>
                            {s.relevance_score && (
                              <span className={styles.sourceScore}>
                                {Math.round(s.relevance_score * 100)}٪
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                className={styles.msgRow}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.aiAvatar}>
                  <BrainCircuit size={16} strokeWidth={1.8} />
                </div>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </motion.div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <form className={styles.inputBar} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              className={styles.inputField}
              placeholder="سوال خود را بنویسید..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className={`btn btn-primary ${styles.sendBtn}`}
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
