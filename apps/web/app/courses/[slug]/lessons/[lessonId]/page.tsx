'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight, Clock, Video, Play, FileText, CheckCircle2,
  BrainCircuit, Send, AlertTriangle,
} from 'lucide-react';
import { apiGet, apiPost, getUser } from '../../../../lib/api';
import styles from './lesson.module.css';

interface Lesson {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  videoUrl?: string;
  transcriptUrl?: string;
  aiSummary?: string;
  durationMin?: number;
  module: {
    id: string;
    title: string;
    courseId: string;
    course: { id: string; title: string; slug: string };
  };
}

interface AiResponse {
  answer: string;
  confidence: number;
  model: string;
  provider: string;
  human_review_required: boolean;
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const slug = params.slug as string;

  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    load();
  }, [lessonId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/courses/lessons/${lessonId}`);
      setLesson(data);
      /* emit lesson_opened analytics event */
      apiPost('/analytics/events', {
        eventType: 'lesson_opened',
        objectId: lessonId,
        objectType: 'lesson',
        courseId: data.module?.course?.id,
        lessonId,
      }).catch(() => {});
    } catch {
      router.push(`/courses/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    if (!lesson) return;
    setCompleted(true);
    apiPost('/analytics/events', {
      eventType: 'lesson_completed',
      objectId: lesson.id,
      objectType: 'lesson',
      courseId: lesson.module?.course?.id,
      lessonId: lesson.id,
    }).catch(() => {});
  };

  const askAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !lesson) return;
    setAiLoading(true);
    try {
      const data = await apiPost('/ai/tutor/ask', {
        query: aiQuestion,
        courseId: lesson.module?.course?.id,
        lessonId: lesson.id,
      });
      setAiResponse(data);
      apiPost('/analytics/events', {
        eventType: 'ai_tutor_asked',
        objectId: lesson.module?.course?.id,
        objectType: 'course',
        courseId: lesson.module?.course?.id,
        lessonId: lesson.id,
        context: { query: aiQuestion },
      }).catch(() => {});
    } catch (e: any) {
      setAiResponse({ answer: e.message || 'خطا در دریافت پاسخ', confidence: 0, model: '', provider: '', human_review_required: false });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className={styles.centered}><div className="spinner spinner-lg" /></div>
  );

  if (!lesson) return null;

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <a href={`/courses/${slug}`} className={styles.backBtn}>
          <ArrowRight size={14} /> بازگشت به درس
        </a>
        <div className={styles.moduleLabel}>{lesson.module?.title}</div>
        <h2 className={styles.lessonTitle}>{lesson.title}</h2>
        {lesson.durationMin && (
          <div className={styles.meta}>
            <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            {lesson.durationMin} دقیقه
          </div>
        )}
        <div className={styles.contentTypeBadge}>
          <span className={`badge ${lesson.contentType === 'video' ? 'badge-accent' : 'badge-primary'}`}>
            {lesson.contentType === 'video'
              ? <><Video size={11} /> ویدئو</>
              : lesson.contentType === 'interactive'
              ? <><Play size={11} /> تعاملی</>
              : <><FileText size={11} /> متنی</>
            }
          </span>
        </div>

        {!completed && (
          <button className={`btn btn-accent ${styles.completeBtn}`} onClick={markComplete}>
            <CheckCircle2 size={16} /> تکمیل شد
          </button>
        )}
        {completed && (
          <div className="badge badge-success" style={{ padding: '10px 16px', fontSize: '0.9rem', display: 'flex', gap: 6, alignItems: 'center' }}>
            <CheckCircle2 size={14} /> این درس تکمیل شده است
          </div>
        )}

        {lesson.aiSummary && (
          <div className={styles.aiSummaryBox}>
            <div className={styles.aiSummaryLabel}>
              <BrainCircuit size={12} style={{ display: 'inline', marginLeft: 4 }} />
              خلاصه AI
            </div>
            <p className={styles.aiSummaryText}>{lesson.aiSummary}</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Video */}
        {lesson.contentType === 'video' && lesson.videoUrl && (
          <div className={styles.videoContainer}>
            <video
              controls
              className={styles.video}
              src={lesson.videoUrl}
              onEnded={markComplete}
            />
          </div>
        )}

        {/* Text content */}
        {lesson.content && (
          <motion.div
            className={`glass-card ${styles.contentCard}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={styles.markdownContent}
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </motion.div>
        )}

        {/* AI Tutor */}
        <motion.div
          className={`glass-card ${styles.tutorCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.tutorHeader}>
            <div className="card-icon card-icon-brand" style={{ width: 40, height: 40, flexShrink: 0 }}>
              <BrainCircuit size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className={styles.tutorTitle}>تیوتر هوشمند</h3>
              <p className={styles.tutorSub}>سوال خود را از محتوای این درس بپرسید</p>
            </div>
          </div>

          <form onSubmit={askAI} className={styles.tutorForm}>
            <input
              className="input"
              type="text"
              placeholder="سوال خود را بنویسید..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              disabled={aiLoading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={aiLoading || !aiQuestion.trim()}
            >
              {aiLoading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><Send size={15} /> پرسیدن</>}
            </button>
          </form>

          {aiResponse && (
            <motion.div
              className={styles.aiAnswer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className={styles.answerText}>{aiResponse.answer}</p>
              <div className={styles.aiMeta}>
                {aiResponse.model && (
                  <span className="badge badge-primary" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <BrainCircuit size={11} /> {aiResponse.model}
                  </span>
                )}
                {aiResponse.confidence > 0 && (
                  <span className="badge badge-accent">
                    اطمینان: {Math.round(aiResponse.confidence * 100)}٪
                  </span>
                )}
                {aiResponse.human_review_required && (
                  <span className="badge badge-warning" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <AlertTriangle size={11} /> نیاز به بازبینی استاد
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
