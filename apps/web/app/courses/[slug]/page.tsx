'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Users, Clock, Video, Package,
  ChevronDown, ChevronLeft, CheckCircle2, FileText, BarChart3,
  User, ArrowRight, Play, Layers, ClipboardList, AlertCircle,
} from 'lucide-react';
import styles from './detail.module.css';
import { apiGet, apiPost, getUser } from '../../lib/api';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  durationMin: number | null;
  isPublished: boolean;
  sortOrder: number;
}

interface CourseModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  language: string;
  status: string;
  version: number;
  modules: CourseModule[];
  instructors: { user: { id: string; fullName: string; email: string } }[];
  program?: {
    id: string;
    name: string;
    department: { name: string; faculty: { id: string; name: string } };
  };
  _count: { enrollments: number; classSessions: number; assessments: number };
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'badge-success',
  intermediate: 'badge-primary',
  advanced: 'badge-accent',
};

const ContentIcon = ({ type }: { type: string }) => {
  if (type === 'video') return <Video size={13} />;
  if (type === 'interactive') return <Play size={13} />;
  return <FileText size={13} />;
};

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = getUser();
  const slug = params?.slug as string;

  const [course, setCourse]       = useState<Course | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled]   = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => { if (slug) fetchCourse(); }, [slug]);

  const fetchCourse = async () => {
    try {
      let data: Course;
      if (user) {
        const list = await apiGet(`/courses?search=${slug}&status=published`);
        const found = list.courses?.find((c: Course) => c.slug === slug);
        if (found) {
          data = await apiGet(`/courses/${found.id}`);
        } else {
          throw new Error('درس یافت نشد');
        }
      } else {
        data = await apiGet(`/courses/catalog/${slug}?tenantId=`);
      }
      setCourse(data);
      if (data.modules?.[0]) setOpenModules(new Set([data.modules[0].id]));
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری درس');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) { router.push('/login'); return; }
    setEnrolling(true);
    try {
      await apiPost('/enrollments', { courseId: course!.id });
      setEnrolled(true);
    } catch (err: any) {
      if (err.message?.includes('قبلاً')) setEnrolled(true);
      else alert(err.message || 'خطا در ثبت‌نام');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  const totalLessons  = course?.modules?.reduce((s, m) => s + m.lessons.length, 0) || 0;
  const totalDuration = course?.modules?.reduce(
    (s, m) => s + m.lessons.reduce((ss, l) => ss + (l.durationMin || 0), 0), 0,
  ) || 0;

  if (loading) return (
    <div className={styles.centered}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (error || !course) return (
    <div className={styles.centered}>
      <AlertCircle size={32} style={{ color: 'var(--danger)' }} />
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{error || 'درس یافت نشد'}</p>
      <a href="/courses" className="btn btn-secondary" style={{ marginTop: 16 }}>
        <ArrowRight size={16} /> بازگشت به کاتالوگ
      </a>
    </div>
  );

  return (
    <div className={styles.detailPage}>
      {/* Nav */}
      <nav className={styles.topNav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navLogo}>
            <GraduationCap size={22} strokeWidth={1.7} style={{ color: 'var(--brand-400)' }} />
            <span className="gradient-text" style={{ fontWeight: 800 }}>دانشگاه هوشمند</span>
          </a>
          <div className={styles.navBread}>
            <a href="/courses" className={styles.navLink}>دروس</a>
            <ChevronLeft size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span className={styles.navCurrent}>{course.title}</span>
          </div>
          <div className={styles.navActions}>
            {user ? (
              <a href="/dashboard/student" className="btn btn-ghost btn-sm">داشبورد</a>
            ) : (
              <a href="/login" className="btn btn-primary btn-sm">ورود</a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroMain}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.metaTags}>
              {course.level && (
                <span className={`badge ${LEVEL_BADGE[course.level] || 'badge-primary'}`}>
                  {LEVEL_LABELS[course.level] || course.level}
                </span>
              )}
              <span className="tag"><Package size={11} /> {course.modules?.length || 0} ماژول</span>
              <span className="tag"><FileText size={11} /> {totalLessons} درس</span>
            </div>

            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDesc}>{course.description}</p>

            {course.instructors?.[0] && (
              <div className={styles.instructorInfo}>
                <div className={styles.instructorAvatar}>
                  {course.instructors[0].user.fullName.charAt(0)}
                </div>
                <div>
                  <div className={styles.instructorName}>{course.instructors[0].user.fullName}</div>
                  <div className={styles.instructorRole}>استاد درس</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Side Card */}
          <motion.div
            className={`glass-card ${styles.sideCard}`}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              { Icon: Users,        label: `${course._count?.enrollments || 0} دانشجو` },
              { Icon: Package,      label: `${course.modules?.length || 0} ماژول` },
              { Icon: FileText,     label: `${totalLessons} درس` },
              { Icon: Clock,        label: `${totalDuration} دقیقه` },
              { Icon: Video,        label: `${course._count?.classSessions || 0} جلسه کلاس` },
              { Icon: ClipboardList,label: `${course._count?.assessments || 0} آزمون` },
            ].map(({ Icon, label }, i) => (
              <div key={i} className={styles.sideCardStat}>
                <Icon size={15} style={{ color: 'var(--brand-400)', flexShrink: 0 }} />
                <span>{label}</span>
              </div>
            ))}

            {enrolled ? (
              <div className={styles.enrolledBadge}>
                <CheckCircle2 size={16} />
                ثبت‌نام شده
              </div>
            ) : (
              <button
                className={`btn btn-primary ${styles.enrollBtn}`}
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling
                  ? <><span className="spinner" style={{ width: 18, height: 18 }} /> در حال ثبت‌نام...</>
                  : <><FileText size={16} /> ثبت‌نام در درس</>
                }
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <div className={styles.contentWrap}>
        <div className={styles.contentInner}>
          <h2 className={styles.sectionTitle}>
            <BookOpen size={20} style={{ color: 'var(--brand-400)' }} />
            سرفصل‌های درس
          </h2>

          <motion.div variants={stagger} initial="initial" animate="animate">
            {course.modules?.map((mod, i) => (
              <motion.div key={mod.id} className={styles.moduleCard} variants={fadeUp} transition={{ duration: 0.35 }}>
                <button
                  className={styles.moduleHeader}
                  onClick={() => toggleModule(mod.id)}
                  aria-expanded={openModules.has(mod.id)}
                >
                  <div className={styles.moduleHeaderLeft}>
                    <span className={styles.moduleNum}>{i + 1}</span>
                    <div>
                      <span className={styles.moduleTitle}>{mod.title}</span>
                      <span className={styles.moduleMeta}> — {mod.lessons.length} درس</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: openModules.has(mod.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openModules.has(mod.id) && (
                    <motion.div
                      className={styles.lessonList}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {mod.lessons.length === 0 ? (
                        <div className={styles.lessonEmpty}>درسی هنوز اضافه نشده</div>
                      ) : mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={styles.lessonItem}
                          onClick={() => user && router.push(`/courses/${slug}/lessons/${lesson.id}`)}
                          role={user ? 'button' : undefined}
                        >
                          <span className={styles.lessonIcon}><ContentIcon type={lesson.contentType} /></span>
                          <span className={styles.lessonName}>{lesson.title}</span>
                          {lesson.durationMin && (
                            <span className={styles.lessonDuration}>
                              <Clock size={11} /> {lesson.durationMin} دقیقه
                            </span>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {(!course.modules || course.modules.length === 0) && (
              <div className="empty-state">
                <div className="empty-icon"><Layers size={26} strokeWidth={1.5} /></div>
                <h3 className="empty-title">ماژولی تعریف نشده</h3>
                <p className="empty-desc">هنوز ماژولی برای این درس ایجاد نشده است.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
