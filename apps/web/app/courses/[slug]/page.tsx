'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    department: {
      name: string;
      faculty: { id: string; name: string };
    };
  };
  _count: { enrollments: number; classSessions: number; assessments: number };
}

const levelLabels: Record<string, string> = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

const contentTypeIcons: Record<string, string> = {
  text: '📄',
  video: '🎥',
  interactive: '🎮',
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = getUser();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (slug) fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      let data: Course;
      if (user) {
        // Authenticated — find by slug via course list then by ID
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
      // Open first module by default
      if (data.modules?.[0]) {
        setOpenModules(new Set([data.modules[0].id]));
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری درس');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setEnrolling(true);
    try {
      await apiPost('/enrollments', { courseId: course!.id });
      setEnrolled(true);
    } catch (err: any) {
      if (err.message?.includes('قبلاً')) {
        setEnrolled(true);
      } else {
        alert(err.message || 'خطا در ثبت‌نام');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const totalLessons = course?.modules?.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0,
  ) || 0;

  const totalDuration = course?.modules?.reduce(
    (sum, mod) =>
      sum + mod.lessons.reduce((s, l) => s + (l.durationMin || 0), 0),
    0,
  ) || 0;

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>⏳ در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.error}>
        <p>❌ {error || 'درس یافت نشد'}</p>
        <a href="/courses" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          بازگشت به کاتالوگ
        </a>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <a href="/">🏠 خانه</a>
            <span>/</span>
            <a href="/courses">دروس</a>
            <span>/</span>
            <span>{course.title}</span>
          </div>

          <div className={styles.heroContent}>
            <div>
              <div className={styles.metaTags}>
                {course.level && (
                  <span className={`badge badge-${course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'primary' : 'accent'}`}>
                    {levelLabels[course.level] || course.level}
                  </span>
                )}
                <span className="badge badge-primary">
                  📦 {course.modules?.length || 0} ماژول
                </span>
                <span className="badge badge-primary">
                  📝 {totalLessons} درس
                </span>
              </div>

              <h1 className={styles.courseTitle}>{course.title}</h1>
              <p className={styles.courseDesc}>{course.description}</p>

              {course.instructors?.[0] && (
                <div className={styles.instructorInfo}>
                  <div className={styles.instructorAvatar}>👨‍🏫</div>
                  <div>
                    <div className={styles.instructorName}>
                      {course.instructors[0].user.fullName}
                    </div>
                    <div className={styles.instructorRole}>استاد درس</div>
                  </div>
                </div>
              )}
            </div>

            {/* Side Card */}
            <div className={`glass-card ${styles.sideCard}`}>
              <div className={styles.sideCardStat}>
                <span>👥</span>
                <span>{course._count?.enrollments || 0} دانشجو</span>
              </div>
              <div className={styles.sideCardStat}>
                <span>📦</span>
                <span>{course.modules?.length || 0} ماژول</span>
              </div>
              <div className={styles.sideCardStat}>
                <span>📝</span>
                <span>{totalLessons} درس</span>
              </div>
              <div className={styles.sideCardStat}>
                <span>⏱️</span>
                <span>{totalDuration} دقیقه</span>
              </div>
              <div className={styles.sideCardStat}>
                <span>🎥</span>
                <span>{course._count?.classSessions || 0} جلسه کلاس</span>
              </div>
              <div className={styles.sideCardStat}>
                <span>📋</span>
                <span>{course._count?.assessments || 0} آزمون</span>
              </div>

              {enrolled ? (
                <div className={styles.enrolledBadge}>
                  ✅ ثبت‌نام شده
                </div>
              ) : (
                <button
                  className={`btn btn-primary ${styles.enrollBtn}`}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? '⏳ در حال ثبت‌نام...' : '📝 ثبت‌نام در درس'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modules & Lessons */}
      <div className="container">
        <div className={styles.mainContent}>
          <section>
            <h2 className={styles.sectionTitle}>
              📚 سرفصل‌های درس
            </h2>

            {course.modules?.map((mod, i) => (
              <div key={mod.id} className={styles.moduleCard}>
                <div
                  className={styles.moduleHeader}
                  onClick={() => toggleModule(mod.id)}
                >
                  <div>
                    <span className={styles.moduleTitle}>
                      {i + 1}. {mod.title}
                    </span>
                    <span className={styles.moduleMeta}>
                      {' '}— {mod.lessons.length} درس
                    </span>
                  </div>
                  <span className={`${styles.moduleArrow} ${openModules.has(mod.id) ? styles.moduleArrowOpen : ''}`}>
                    ◀
                  </span>
                </div>

                {openModules.has(mod.id) && (
                  <div className={styles.lessonList}>
                    {mod.lessons.map((lesson) => (
                      <div key={lesson.id} className={styles.lessonItem}>
                        <span className={styles.lessonIcon}>
                          {contentTypeIcons[lesson.contentType] || '📄'}
                        </span>
                        <span>{lesson.title}</span>
                        {lesson.durationMin && (
                          <span className={styles.lessonDuration}>
                            {lesson.durationMin} دقیقه
                          </span>
                        )}
                      </div>
                    ))}
                    {mod.lessons.length === 0 && (
                      <div className={styles.lessonItem} style={{ color: 'var(--color-text-muted)' }}>
                        درسی هنوز اضافه نشده
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(!course.modules || course.modules.length === 0) && (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                هنوز ماژولی تعریف نشده است
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
