'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, ChevronDown, ChevronUp, Video, FileText,
  Layers, Save, Globe, EyeOff, X, Edit3, ClipboardList,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { apiGet, apiPost, apiPatch } from '../../lib/api';
import styles from './manage.module.css';

interface Lesson { id: string; title: string; type: string; order: number }
interface Module { id: string; title: string; order: number; lessons?: Lesson[] }
interface Course {
  id: string; title: string; slug: string; description?: string;
  level?: string; status: string; language: string;
}

const LEVELS = [
  { value: '', label: '—' },
  { value: 'beginner', label: 'مقدماتی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'پیشرفته' },
];

const statusBadge = (s: string) =>
  s === 'published' ? 'badge-success' : s === 'archived' ? 'badge-danger' : 'badge-default';
const statusLabel = (s: string) =>
  ({ published: 'منتشر', draft: 'پیش‌نویس', archived: 'بایگانی' }[s] ?? s);
const typeIcon = (t: string) =>
  t === 'video' ? <Video size={12} /> : t === 'quiz' ? <ClipboardList size={12} /> : <FileText size={12} />;

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function CourseManagePage() {
  const [courses, setCourses]               = useState<Course[]>([]);
  const [selected, setSelected]             = useState<Course | null>(null);
  const [modules, setModules]               = useState<Module[]>([]);
  const [openModuleId, setOpenModuleId]     = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [showNewModal, setShowNewModal]     = useState(false);
  const [newForm, setNewForm]               = useState({ title: '', slug: '', description: '', level: '', language: 'fa' });
  const [editForm, setEditForm]             = useState({ title: '', description: '', level: '', status: '' });
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessons, setNewLessons]         = useState<Record<string, string>>({});
  const [error, setError]                   = useState('');

  const loadCourses = useCallback(() => {
    setLoadingCourses(true);
    apiGet('/courses')
      .then((d) => setCourses(d.courses || []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const selectCourse = async (c: Course) => {
    setSelected(c);
    setEditForm({ title: c.title, description: c.description || '', level: c.level || '', status: c.status });
    setOpenModuleId(null);
    try {
      const mods = await apiGet(`/courses/${c.id}/modules`);
      setModules(Array.isArray(mods) ? mods : []);
    } catch { setModules([]); }
  };

  const toggleModule = async (mod: Module) => {
    if (openModuleId === mod.id) { setOpenModuleId(null); return; }
    setOpenModuleId(mod.id);
    if (mod.lessons) return;
    // modules don't have a separate lessons fetch — they're included in modules endpoint
  };

  const handleSaveCourse = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const updated = await apiPatch(`/courses/${selected.id}`, editForm);
      setCourses((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...editForm } : c)));
      setSelected((prev) => prev ? { ...prev, ...editForm } : null);
    } catch (e: any) {
      setError(e?.message || 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!selected) return;
    const newStatus = selected.status === 'published' ? 'draft' : 'published';
    try {
      await apiPatch(`/courses/${selected.id}`, { status: newStatus });
      const updated = { ...selected, status: newStatus };
      setSelected(updated);
      setEditForm((f) => ({ ...f, status: newStatus }));
      setCourses((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    } catch (e: any) {
      setError(e?.message || 'خطا');
    }
  };

  const handleCreateCourse = async () => {
    if (!newForm.title || !newForm.slug) { setError('عنوان و اسلاگ الزامی است'); return; }
    setSaving(true);
    setError('');
    try {
      await apiPost('/courses', newForm);
      setShowNewModal(false);
      setNewForm({ title: '', slug: '', description: '', level: '', language: 'fa' });
      loadCourses();
    } catch (e: any) {
      setError(e?.message || 'خطا در ایجاد');
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async () => {
    if (!selected || !newModuleTitle.trim()) return;
    try {
      const mod = await apiPost(`/courses/${selected.id}/modules`, {
        title: newModuleTitle.trim(),
        order: modules.length + 1,
      });
      setModules((prev) => [...prev, { ...mod, lessons: [] }]);
      setNewModuleTitle('');
    } catch (e: any) { setError(e?.message || 'خطا'); }
  };

  const handleAddLesson = async (moduleId: string) => {
    const title = newLessons[moduleId]?.trim();
    if (!selected || !title) return;
    try {
      const lesson = await apiPost(`/courses/${selected.id}/modules/${moduleId}/lessons`, {
        title, type: 'video', order: 1,
      });
      setModules((prev) => prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), lesson] } : m
      ));
      setNewLessons((prev) => ({ ...prev, [moduleId]: '' }));
    } catch (e: any) { setError(e?.message || 'خطا'); }
  };

  const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <DashboardLayout title="مدیریت دروس">

      <div className={styles.layout}>
        {/* Course sidebar */}
        <div className={styles.sidebar}>
          <button className={styles.newCourseBtn} onClick={() => { setShowNewModal(true); setError(''); }}>
            <Plus size={16} /> درس جدید
          </button>

          {loadingCourses
            ? [1, 2].map((i) => <div key={i} className={`skeleton ${styles.courseCard}`} style={{ height: 72 }} />)
            : courses.map((c) => (
              <button
                key={c.id}
                className={`${styles.courseCard} ${selected?.id === c.id ? styles.courseCardActive : ''}`}
                onClick={() => selectCourse(c)}
              >
                <div className={styles.courseTitle}>{c.title}</div>
                <div className={styles.courseMeta}>
                  <span className={`badge ${statusBadge(c.status)}`}>{statusLabel(c.status)}</span>
                  {c.level && <span className="badge badge-default">{LEVELS.find((l) => l.value === c.level)?.label}</span>}
                </div>
              </button>
            ))
          }
        </div>

        {/* Right panel */}
        {!selected ? (
          <div className={styles.selectPrompt}>
            <BookOpen size={40} strokeWidth={1.3} />
            <p>یک درس را از لیست انتخاب کنید یا درس جدید بسازید</p>
          </div>
        ) : (
          <motion.div className={styles.panel} {...fadeUp}>

            {/* Course details form */}
            <div className={styles.panelSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  <Edit3 size={16} style={{ color: 'var(--brand-400)' }} />
                  جزئیات درس
                </h2>
                <button
                  className={`btn btn-sm ${selected.status === 'published' ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={handlePublishToggle}
                  style={selected.status === 'published' ? { color: 'var(--warning-500,#f59e0b)' } : {}}
                >
                  {selected.status === 'published'
                    ? <><EyeOff size={14} /> لغو انتشار</>
                    : <><Globe size={14} /> انتشار</>
                  }
                </button>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>عنوان *</label>
                  <input className={styles.input} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>وضعیت</label>
                  <select className={styles.select} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="draft">پیش‌نویس</option>
                    <option value="published">منتشر</option>
                    <option value="archived">بایگانی</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>سطح</label>
                  <select className={styles.select} value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}>
                    {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>توضیحات</label>
                <textarea className={`${styles.input} ${styles.textarea}`} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-3)' }}>{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveCourse} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
              </div>
            </div>

            {/* Modules */}
            <div className={styles.panelSection}>
              <h2 className={styles.sectionTitle}>
                <Layers size={16} style={{ color: 'var(--brand-400)' }} />
                ماژول‌ها و درس‌ها
              </h2>

              <div className={styles.moduleList}>
                {modules.length === 0 && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-4)' }}>
                    هنوز ماژولی اضافه نشده است
                  </p>
                )}
                {modules.map((mod) => (
                  <div key={mod.id} className={styles.moduleRow}>
                    <div className={styles.moduleHeader} onClick={() => toggleModule(mod)}>
                      <span className={styles.moduleName}>
                        <Layers size={14} style={{ color: 'var(--brand-400)' }} />
                        {mod.title}
                        {mod.lessons && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>({mod.lessons.length} درس)</span>}
                      </span>
                      {openModuleId === mod.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>

                    <AnimatePresence>
                      {openModuleId === mod.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className={styles.lessonList}>
                            {(mod.lessons || []).map((lesson) => (
                              <div key={lesson.id} className={styles.lessonRow}>
                                {typeIcon(lesson.type)}
                                <span>{lesson.title}</span>
                              </div>
                            ))}
                            <div className={styles.addLessonRow}>
                              <input
                                className={styles.inlineInput}
                                placeholder="عنوان درس جدید..."
                                value={newLessons[mod.id] || ''}
                                onChange={(e) => setNewLessons((prev) => ({ ...prev, [mod.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(mod.id)}
                              />
                              <button className="btn btn-primary btn-sm" onClick={() => handleAddLesson(mod.id)}>
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Add module */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <input
                  className={styles.input}
                  style={{ flex: 1 }}
                  placeholder="عنوان ماژول جدید..."
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
                  <Plus size={14} /> ماژول
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create course modal */}
      {showNewModal && (
        <div className={styles.overlay} onClick={() => setShowNewModal(false)}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.modalTitle}>درس جدید</h2>
              <button className="icon-btn" onClick={() => setShowNewModal(false)}><X size={18} /></button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>عنوان *</label>
              <input className={styles.input} value={newForm.title} placeholder="مبانی هوش مصنوعی"
                onChange={(e) => {
                  const title = e.target.value;
                  setNewForm({ ...newForm, title, slug: toSlug(title) });
                }} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>اسلاگ (URL) *</label>
              <input className={styles.input} value={newForm.slug} dir="ltr" placeholder="intro-ai"
                onChange={(e) => setNewForm({ ...newForm, slug: toSlug(e.target.value) })} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>سطح</label>
                <select className={styles.select} value={newForm.level} onChange={(e) => setNewForm({ ...newForm, level: e.target.value })}>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>زبان</label>
                <select className={styles.select} value={newForm.language} onChange={(e) => setNewForm({ ...newForm, language: e.target.value })}>
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>توضیحات</label>
              <textarea className={`${styles.input} ${styles.textarea}`} value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>}

            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setShowNewModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleCreateCourse} disabled={saving}>
                {saving ? 'در حال ایجاد...' : 'ایجاد درس'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
