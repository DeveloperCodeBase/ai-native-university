'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const levelLabels: Record<string, string> = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

const levelIcons: Record<string, string> = {
  beginner: '🟢',
  intermediate: '🟡',
  advanced: '🔴',
};

const courseIcons = ['📐', '🧠', '💻', '📊', '🔬', '🎯', '📚', '🏗️'];

export default function CoursesPage() {
  const router = useRouter();
  const user = getUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [levelFilter, search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter) params.set('level', levelFilter);
      if (search) params.set('search', search);
      params.set('status', 'published');

      let data: any;
      if (user) {
        data = await apiGet(`/courses?${params}`);
      } else {
        // Public catalog
        params.set('tenantId', '');
        data = await apiGet(`/courses/catalog?${params}`);
      }
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses;

  return (
    <div className={styles.catalogPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <a href="/" className={styles.logo}>
                <span className={styles.logoIcon}>🎓</span>
                <span className="gradient-text">دانشگاه هوشمند</span>
              </a>
            </div>
            <div className={styles.headerRight}>
              {user ? (
                <>
                  <a href={`/dashboard/${user.role === 'super_admin' || user.role === 'admin' ? 'admin' : user.role}`} className="btn btn-secondary">
                    📊 داشبورد
                  </a>
                  <a href="/tutor" className="btn btn-accent">
                    🤖 تیوتر هوشمند
                  </a>
                </>
              ) : (
                <a href="/login" className="btn btn-primary">ورود</a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Page Title */}
        <h1 className={styles.pageTitle}>
          <span className="gradient-text">کاتالوگ دروس</span>
        </h1>
        <p className={styles.pageSubtitle}>
          دروس دانشگاه آنلاین هوشمند — یادگیری با پشتیبانی هوش مصنوعی
        </p>

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="🔍 جستجوی درس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button
            className={`${styles.filterBtn} ${!levelFilter ? styles.filterBtnActive : ''}`}
            onClick={() => setLevelFilter('')}
          >
            همه سطوح
          </button>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              className={`${styles.filterBtn} ${levelFilter === level ? styles.filterBtnActive : ''}`}
              onClick={() => setLevelFilter(level === levelFilter ? '' : level)}
            >
              {levelIcons[level]} {levelLabels[level]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <p>در حال بارگذاری دروس...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3 className={styles.emptyTitle}>درسی یافت نشد</h3>
            <p className={styles.emptyDesc}>
              {search ? 'عبارت جستجوی خود را تغییر دهید' : 'هنوز درسی منتشر نشده است'}
            </p>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {filteredCourses.map((course, i) => (
              <div
                key={course.id}
                className={`glass-card ${styles.courseCard}`}
                onClick={() => router.push(`/courses/${course.slug}`)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={styles.courseThumb}>
                  {courseIcons[i % courseIcons.length]}
                </div>
                <div className={styles.courseBody}>
                  {course.level && (
                    <span className={`${styles.courseLevel} ${styles[`level${course.level.charAt(0).toUpperCase() + course.level.slice(1)}`]}`}>
                      {levelIcons[course.level]} {levelLabels[course.level] || course.level}
                    </span>
                  )}
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseDesc}>{course.description}</p>
                  <div className={styles.courseMeta}>
                    <span className={styles.courseMetaItem}>
                      📦 {course._count?.modules || 0} ماژول
                    </span>
                    <span className={styles.courseMetaItem}>
                      👥 {course._count?.enrollments || 0} دانشجو
                    </span>
                    {course.instructors?.[0] && (
                      <span className={styles.instructorName}>
                        👨‍🏫 {course.instructors[0].user.fullName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
