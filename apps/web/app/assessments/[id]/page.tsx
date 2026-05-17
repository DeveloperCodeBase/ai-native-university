'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost, getUser, logout } from '../../lib/api';
import styles from './assessment.module.css';

interface Question {
  id: string;
  type: string;
  stem: string;
  choices?: { id: string; text: string; isCorrect?: boolean }[];
  points: number;
  sortOrder: number;
}

interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: string;
  totalPoints: number;
  passingScore?: number;
  timeLimit?: number;
  questions: Question[];
  course: { id: string; title: string };
}

interface Answer {
  questionId: string;
  answer: string;
}

type Phase = 'loading' | 'intro' | 'taking' | 'submitting' | 'result' | 'error';

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    loadAssessment();
  }, [assessmentId]);

  /* countdown timer */
  useEffect(() => {
    if (phase !== 'taking' || timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft((n) => (n ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const loadAssessment = async () => {
    try {
      const data = await apiGet(`/assessments/${assessmentId}`);
      setAssessment(data);
      setPhase('intro');
    } catch (e: any) {
      setError(e.message || 'آزمون یافت نشد');
      setPhase('error');
    }
  };

  const startAssessment = () => {
    if (assessment?.timeLimit) {
      setTimeLeft(assessment.timeLimit * 60);
    }
    setCurrentQ(0);
    setAnswers({});
    setPhase('taking');
  };

  const setAnswer = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setPhase('submitting');
    try {
      const payload: Answer[] = assessment.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));
      const data = await apiPost(`/assessments/${assessmentId}/submit`, { answers: payload });
      setResult(data);
      setPhase('result');
    } catch (e: any) {
      setError(e.message || 'خطا در ارسال پاسخ‌نامه');
      setPhase('error');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answered = assessment ? Object.keys(answers).length : 0;
  const total = assessment?.questions.length ?? 0;

  /* ── Phases ── */
  if (phase === 'loading') return (
    <div className={styles.centered}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>در حال بارگذاری آزمون...</p>
    </div>
  );

  if (phase === 'error') return (
    <div className={styles.centered}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
      <p style={{ color: 'var(--danger)' }}>{error}</p>
      <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => router.back()}>
        بازگشت
      </button>
    </div>
  );

  if (phase === 'intro' && assessment) return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>
      <motion.div
        className={`glass-card ${styles.introCard}`}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <a href={`/courses/${assessment.course?.id}`} className={styles.backLink}>← بازگشت</a>
        <div className={styles.introIcon}>📝</div>
        <h1 className={styles.introTitle}>{assessment.title}</h1>
        {assessment.description && (
          <p className={styles.introDesc}>{assessment.description}</p>
        )}
        <div className={styles.introMeta}>
          {[
            { label: 'تعداد سوال', value: `${assessment.questions.length} سوال` },
            { label: 'امتیاز کل', value: `${assessment.totalPoints} امتیاز` },
            assessment.passingScore != null && { label: 'نمره قبولی', value: `${assessment.passingScore} امتیاز` },
            assessment.timeLimit != null && { label: 'زمان مجاز', value: `${assessment.timeLimit} دقیقه` },
          ].filter(Boolean).map((m: any, i) => (
            <div key={i} className={styles.metaItem}>
              <span className={styles.metaLabel}>{m.label}</span>
              <span className={styles.metaValue}>{m.value}</span>
            </div>
          ))}
        </div>
        <div className={`alert alert-warning ${styles.notice}`}>
          <span>⚠️</span>
          <span>پس از شروع آزمون نمی‌توانید صفحه را ترک کنید. پاسخ‌ها فقط یک‌بار ثبت می‌شوند.</span>
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={startAssessment}>
          🚀 شروع آزمون
        </button>
      </motion.div>
    </div>
  );

  if ((phase === 'taking' || phase === 'submitting') && assessment) {
    const q = assessment.questions[currentQ];
    const progressPct = ((currentQ) / total) * 100;
    const isLast = currentQ === total - 1;
    const isTimeLow = timeLeft !== null && timeLeft < 120;

    return (
      <div className={styles.takingPage}>
        {/* Header */}
        <header className={styles.takingHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.assessTitle}>{assessment.title}</span>
            <span className={styles.questionCounter}>
              سوال {currentQ + 1} از {total}
            </span>
          </div>
          <div className={styles.headerRight}>
            {timeLeft !== null && (
              <div className={`${styles.timer} ${isTimeLow ? styles.timerLow : ''}`}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
            <span className={styles.answerCount}>
              {answered}/{total} پاسخ داده شد
            </span>
          </div>
        </header>

        {/* Progress */}
        <div className={styles.progressWrapper}>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Question */}
        <main className={styles.questionArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              className={`glass-card ${styles.questionCard}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.qMeta}>
                <span className="badge badge-primary">
                  {q.type === 'multiple_choice' ? 'چندگزینه‌ای' :
                   q.type === 'true_false' ? 'صحیح/غلط' :
                   q.type === 'short_answer' ? 'پاسخ کوتاه' : 'تشریحی'}
                </span>
                <span className={styles.qPoints}>{q.points} امتیاز</span>
              </div>
              <p className={styles.qStem}>{q.stem}</p>

              {/* MCQ */}
              {(q.type === 'multiple_choice' || q.type === 'true_false') && q.choices && (
                <div className={styles.choices}>
                  {q.choices.map((c) => (
                    <button
                      key={c.id}
                      className={`${styles.choice} ${answers[q.id] === c.id ? styles.choiceSelected : ''}`}
                      onClick={() => setAnswer(q.id, c.id)}
                    >
                      <span className={styles.choiceMark} />
                      <span>{c.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Short answer */}
              {q.type === 'short_answer' && (
                <input
                  className="input"
                  style={{ marginTop: 16 }}
                  type="text"
                  placeholder="پاسخ خود را بنویسید..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}

              {/* Essay */}
              {q.type === 'essay' && (
                <textarea
                  className="input"
                  style={{ marginTop: 16, minHeight: 160, resize: 'vertical' }}
                  placeholder="پاسخ تشریحی خود را بنویسید..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className={styles.navRow}>
            <button
              className="btn btn-secondary"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((n) => n - 1)}
            >
              ← قبلی
            </button>

            {/* Question dots */}
            <div className={styles.dots}>
              {assessment.questions.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === currentQ ? styles.dotCurrent : ''} ${answers[assessment.questions[i].id] ? styles.dotAnswered : ''}`}
                  onClick={() => setCurrentQ(i)}
                  title={`سوال ${i + 1}`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                className="btn btn-accent"
                onClick={handleSubmit}
                disabled={phase === 'submitting'}
              >
                {phase === 'submitting' ? (
                  <><span className="spinner" style={{ width: 18, height: 18 }} /> ارسال...</>
                ) : '✅ ارسال پاسخ‌نامه'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQ((n) => n + 1)}
              >
                بعدی →
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const passed = result.score != null && assessment?.passingScore != null
      ? result.score >= assessment.passingScore
      : null;

    return (
      <div className={styles.page}>
        <div className={styles.orbs} aria-hidden>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
        </div>
        <motion.div
          className={`glass-card ${styles.resultCard}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className={styles.resultIcon}>
            {passed === true ? '🏆' : passed === false ? '📚' : '✅'}
          </div>
          <h2 className={styles.resultTitle}>
            {passed === true ? 'تبریک! قبول شدید' :
             passed === false ? 'ادامه تلاش کنید' :
             'پاسخ‌نامه ثبت شد'}
          </h2>

          {result.score != null && (
            <div className={styles.scoreDisplay}>
              <span className={styles.scoreNum}>{result.score}</span>
              <span className={styles.scoreMax}>از {assessment?.totalPoints}</span>
            </div>
          )}

          {result.humanReviewRequired && (
            <div className="alert alert-info" style={{ marginTop: 16 }}>
              <span>🔍</span>
              <span>پاسخ‌نامه شما برای بازبینی توسط استاد ارسال شده است.</span>
            </div>
          )}

          {result.aiFeedback && (
            <div className={styles.aiFeedback}>
              <span className={styles.aiLabel}>🤖 بازخورد AI</span>
              <p>{result.aiFeedback}</p>
            </div>
          )}

          <div className={styles.resultActions}>
            <button className="btn btn-primary" onClick={() => router.push('/courses')}>
              📚 بازگشت به دروس
            </button>
            <button className="btn btn-secondary" onClick={() => router.push('/dashboard/student')}>
              📊 داشبورد
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
