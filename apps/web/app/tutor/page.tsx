'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './tutor.module.css';
import { apiGet, apiPost, getUser, logout } from '../lib/api';

interface Source {
  type: string;
  id: string;
  title: string;
  snippet: string;
  relevance_score: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  confidence?: number;
  model?: string;
  provider?: string;
  human_review_required?: boolean;
  sources?: Source[];
  timestamp: Date;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

const hints = [
  'یادگیری ماشین چیست؟',
  'Overfitting را توضیح بده',
  'تفاوت supervised و unsupervised چیست؟',
  'بهترین منابع برای یادگیری پایتون کدامند؟',
  'الگوریتم مرتب‌سازی سریع را توضیح بده',
];

export default function TutorPage() {
  const router = useRouter();
  const user = getUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCourses = async () => {
    try {
      const data = await apiGet('/courses?status=published');
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const sendMessage = async (text?: string) => {
    const query = text || input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiPost('/ai/tutor/ask', {
        query,
        courseId: selectedCourseId || undefined,
      });

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'bot',
        content: response.answer || 'پاسخی دریافت نشد.',
        confidence: response.confidence,
        model: response.model,
        provider: response.provider,
        human_review_required: response.human_review_required,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'bot',
        content: `❌ خطا: ${err.message || 'مشکل در اتصال به سرویس AI'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className={styles.tutorPage}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>🤖</span>
          <span className="gradient-text">تیوتر هوشمند</span>
        </div>

        {/* Course Context */}
        <div className={styles.contextSection}>
          <div className={styles.contextTitle}>📚 زمینه درس</div>
          <select
            className={styles.contextSelect}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">بدون محدودیت درس</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            با انتخاب درس، پاسخ‌ها از منابع آن درس استخراج می‌شوند.
          </p>
        </div>

        <div className={styles.navLinks}>
          <a href="/courses" className={styles.navLink}>📚 کاتالوگ دروس</a>
          <a
            href={`/dashboard/${user.role === 'super_admin' || user.role === 'admin' ? 'admin' : user.role}`}
            className={styles.navLink}
          >
            📊 داشبورد
          </a>
          <button
            onClick={logout}
            className={styles.navLink}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'right' }}
          >
            🚪 خروج
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatAvatar}>🧠</div>
          <div>
            <div className={styles.chatTitle}>دستیار هوشمند RAG</div>
            <div className={styles.chatSubtitle}>
              پاسخ‌گویی بر اساس منابع درسی • AI-Native
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <span className={styles.welcomeIcon}>🤖</span>
              <h2 className={styles.welcomeTitle}>سلام! من دستیار هوشمند شما هستم</h2>
              <p>
                هر سوالی درباره دروس دارید بپرسید. من از منابع درسی برای پاسخ‌گویی استفاده می‌کنم.
              </p>
              <div className={styles.welcomeHints}>
                {hints.map((hint, i) => (
                  <button
                    key={i}
                    className={styles.hintBtn}
                    onClick={() => sendMessage(hint)}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}
            >
              <div
                className={`${styles.messageAvatar} ${msg.role === 'user' ? styles.messageAvatarUser : styles.messageAvatarBot}`}
              >
                {msg.role === 'user' ? '👤' : '🧠'}
              </div>
              <div>
                <div
                  className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot}`}
                >
                  {msg.content}

                  {/* AI Governance metadata */}
                  {msg.role === 'bot' && msg.confidence !== undefined && (
                    <div className={styles.messageGovernance}>
                      <span className={styles.confidenceBadge}>
                        دقت: {Math.round(msg.confidence * 100)}%
                      </span>
                      {msg.model && (
                        <span className={styles.modelBadge}>
                          {msg.model}
                        </span>
                      )}
                      {msg.human_review_required && (
                        <span className={styles.reviewBadge}>
                          ⚠️ نیاز به بازبینی
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={styles.sources}>
                      <div className={styles.sourcesTitle}>📎 منابع:</div>
                      {msg.sources.map((src, i) => (
                        <div key={i} className={styles.sourceItem}>
                          {src.title || src.type}
                          {src.relevance_score && ` (${Math.round(src.relevance_score * 100)}%)`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.message} ${styles.messageBot}`}>
              <div className={`${styles.messageAvatar} ${styles.messageAvatarBot}`}>
                🧠
              </div>
              <div className={styles.typing}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <form className={styles.inputForm} onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="سوال خود را بنویسید..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={loading || !input.trim()}
            >
              ←
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
