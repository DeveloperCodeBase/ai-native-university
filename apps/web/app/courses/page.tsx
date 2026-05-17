'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap, Search, BookOpen, Users, Layers,
  BrainCircuit, ChevronLeft, Filter, ArrowLeft,
} from 'lucide-react';
import styles from './courses.module.css';
import { apiGet, getUser } from '../lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  status: string;
  _count: { modules: number; enrollments: number; classSessions: number };
  instructors: { user: { id: string; fullName: string } }[];
  program?: { id: string; name: string };
}

const LEVEL_LABEL: Record<string, string> = {
  beginner:     'مقدماتی',
  intermediate: 'متوسط',
  advanced:     'پیشرفته',
};

const LEVEL_CSS: Record<string, string> = {
  beginner:     'level-beginner',
  intermediate: 'level-intermediate',
  advanced:     'level-advanced',
};

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function CoursesPage() {
  const router = useRouter();
  const user = getUser();
  const [courses, setCourses]       = useState<Course[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [levelFilter, setLevel]     = useState('');

  useEffect(() => { fetchCourses(); }, [levelFilter, search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'published' });
      if (levelFilter) params.set('level', levelFilter);
      if (search)      params.set('search', search);

      const data = user
        ? await apiGet(`/courses?${params}`)
        : await apiGet(`/courses/catalog?${params}`);

      setCourses(data.courses ?? []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const dashHref = !user ? '/login'
    : user.role === 'student' ? '/dashboard/student'
    : user.role === 'instructor' ? '/dashboard/instructor'
    : '/dashboard/admin';

  return (
    <div className={styles.page}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className="container">
          <div className={styles.topbarInner}>
            <a href="/" className={styles.brand}>
              <GraduationCap size={22} strokeWidth={1.7} className={styles.brandIcon} />
              <span className="gradient-text">دانشگاه هوشمند</span>
            </a>
            <div className={styles.topbarActions}>
              {user ? (
                <>
                  <a href={dashHref} className="btn btn-secondary btn-sm">داشبورد</a>
                  <a href="/tutor" className="btn btn-accent btn-sm">
                    <BrainCircuit size={15} />
                    تیوتر AI
                  </a>
                </>
              ) : (
                <>
                  <a href="/login"    className="btn btn-ghost btn-sm">ورود</a>
                  <a href="/register" className="btn btn-primary btn-sm">ثبت‌نام</a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Page header */}
        <div className={styles.pageHeader}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className={styles.pageTitle}>
              <span className="gradient-text">کاتالوگ دروس</span>
            </h1>
            <p className={styles.pageSubtitle}>
              دروس دانشگاه آنلاین هوشمند — یادگیری با پشتیبانی هوش مصنوعی
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          className={styles.filters}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="جستجوی درس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.levelFilters}>
            <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
            {['', 'beginner', 'intermediate', 'advanced'].map((lv) => (
              <button
                key={lv}
                className={`${styles.filterChip}${levelFilter === lv ? ` ${styles.filterActive}` : ''}`}
                onClick={() => setLevel(lv)}
              >
                {lv ? LEVEL_LABEL[lv] : 'همه'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonCard}`} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={28} strokeWidth={1.5} /></div>
            <h3 className="empty-title">درسی یافت نشد</h3>
            <p className="empty-desc">
              {search ? 'عبارت جستجو را تغییر دهید' : 'هنوز درسی منتشر نشده است'}
            </p>
          </div>
        ) : (
          <>
            <p className={styles.resultCount}>
              {courses.length} درس یافت شد
            </p>
            <motion.div
              className={styles.grid}
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  className={`glass-card ${styles.card}`}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/courses/${course.slug}`)}
                >
                  {/* Course thumb */}
                  <div className={styles.thumb}>
                    <BookOpen size={32} strokeWidth={1.4} className={styles.thumbIcon} />
                  </div>

                  <div className={styles.cardBody}>
                    {course.level && (
                      <span className={`badge ${LEVEL_CSS[course.level] || 'badge-primary'} ${styles.levelBadge}`}>
                        {LEVEL_LABEL[course.level] || course.level}
                      </span>
                    )}

                    <h3 className={styles.cardTitle}>{course.title}</h3>
                    <p className={styles.cardDesc}>{course.description}</p>

                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        <Layers size={13} />
                        {course._count?.modules ?? 0} ماژول
                      </span>
                      <span className={styles.metaItem}>
                        <Users size={13} />
                        {course._count?.enrollments ?? 0} دانشجو
                      </span>
                    </div>

                    {course.instructors?.[0] && (
                      <div className={styles.instructor}>
                        <div className={styles.instructorAvatar}>
                          {course.instructors[0].user.fullName.charAt(0)}
                        </div>
                        <span className={styles.instructorName}>
                          {course.instructors[0].user.fullName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.viewBtn}>
                      مشاهده درس
                      <ChevronLeft size={14} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
