'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, BookOpen, Users, Plus, X, Layers,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, apiPost, getUser } from '../lib/api';
import styles from './faculties.module.css';

interface Department {
  id: string;
  name: string;
  code?: string;
}

interface Faculty {
  id: string;
  name: string;
  code?: string;
  description?: string;
  departments?: Department[];
  _count?: { departments: number; programs: number };
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

export default function FacultiesPage() {
  const user = getUser();
  const canManage = user?.role === 'admin' || user?.role === 'super_admin';

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    apiGet('/faculties')
      .then((d) => setFaculties(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) { setError('نام دانشکده الزامی است'); return; }
    setCreating(true);
    setError('');
    try {
      await apiPost('/faculties', form);
      setShowModal(false);
      setForm({ name: '', code: '', description: '' });
      load();
    } catch (e: any) {
      setError(e?.message || 'خطا در ایجاد دانشکده');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="دانشکده‌ها و گروه‌های آموزشی">

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-2xl)' }} />
          ))}
        </div>
      ) : (
        <motion.div className={styles.grid} variants={stagger} initial="initial" animate="animate">

          {faculties.map((f) => (
            <motion.div key={f.id} className={styles.card} variants={fadeUp} transition={{ duration: 0.35 }}>
              <div className={styles.cardIcon}>
                <Building2 size={22} strokeWidth={1.7} />
              </div>
              <h3 className={styles.cardTitle}>{f.name}</h3>
              {f.code && (
                <span className="badge badge-default" style={{ alignSelf: 'flex-start' }}>{f.code}</span>
              )}
              {f.description && (
                <p className={styles.cardDesc}>{f.description}</p>
              )}

              <div className={styles.metaRow}>
                {f._count != null && (
                  <>
                    <span className={styles.metaItem}>
                      <Layers size={13} />
                      {f._count.departments} گروه
                    </span>
                    <span className={styles.metaItem}>
                      <BookOpen size={13} />
                      {f._count.programs} برنامه
                    </span>
                  </>
                )}
              </div>

              {f.departments && f.departments.length > 0 && (
                <div className={styles.deptList}>
                  {f.departments.map((d) => (
                    <span key={d.id} className={styles.deptChip}>
                      <Layers size={11} /> {d.name}
                      {d.code && ` (${d.code})`}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {canManage && (
            <motion.button
              className={styles.addBtn}
              variants={fadeUp}
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              <span>دانشکده جدید</span>
            </motion.button>
          )}

          {faculties.length === 0 && !canManage && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon"><Building2 size={28} strokeWidth={1.5} /></div>
              <h3 className="empty-title">دانشکده‌ای تعریف نشده</h3>
              <p className="empty-desc">هنوز هیچ دانشکده‌ای در این سازمان ثبت نشده است.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.modalTitle}>دانشکده جدید</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>نام دانشکده *</label>
              <input className={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: دانشکده مهندسی" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>کد (اختیاری)</label>
              <input className={styles.input} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: ENG" dir="ltr" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>توضیحات</label>
              <input className={styles.input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیح مختصر..." />
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>{error}</p>}

            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'در حال ایجاد...' : 'ایجاد'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
