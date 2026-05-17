'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, ChevronRight, ChevronLeft, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, apiPost } from '../lib/api';
import styles from './users.module.css';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface Pagination { users: User[]; total: number; page: number; pageSize: number }

const ROLES = [
  { value: '', label: 'همه نقش‌ها' },
  { value: 'student', label: 'دانشجو' },
  { value: 'instructor', label: 'استاد' },
  { value: 'admin', label: 'مدیر' },
  { value: 'teaching_assistant', label: 'دستیار آموزشی' },
];

const roleLabel = (r: string) =>
  ({ student: 'دانشجو', instructor: 'استاد', admin: 'مدیر', super_admin: 'مدیر ارشد', teaching_assistant: 'دستیار' }[r] ?? r);

const roleBadge = (r: string) =>
  r === 'student' ? 'badge-default' : r === 'instructor' ? 'badge-primary' : 'badge-warning';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function UsersPage() {
  const [data, setData] = useState<Pagination>({ users: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (roleFilter) params.set('role', roleFilter);
    apiGet(`/users?${params}`)
      .then((d) => setData(d.data || { users: [], total: 0, page, pageSize: 20 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = data.users.filter((u) =>
    !search || u.fullName.includes(search) || u.email.includes(search)
  );

  const totalPages = Math.ceil(data.total / data.pageSize);

  const handleCreate = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      setError('همه فیلدها الزامی است');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await apiPost('/users', newUser);
      setShowModal(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'student' });
      load();
    } catch (e: any) {
      setError(e?.message || 'خطا در ایجاد کاربر');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="مدیریت کاربران">

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            placeholder="جستجو بر اساس نام یا ایمیل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <UserPlus size={15} /> کاربر جدید
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-xl)' }} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={28} strokeWidth={1.5} /></div>
          <h3 className="empty-title">کاربری یافت نشد</h3>
          <p className="empty-desc">فیلتر را تغییر دهید یا کاربر جدید اضافه کنید.</p>
        </div>
      ) : (
        <motion.div {...fadeUp}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>کاربر</th>
                <th>نقش</th>
                <th>وضعیت</th>
                <th>تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.fullName.charAt(0)}</div>
                      <div>
                        <div className={styles.userName}>{u.fullName}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive !== false ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span>{data.total} کاربر</span>
              <div className={styles.pageButtons}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronRight size={15} />
                </button>
                <span style={{ padding: '0 var(--space-3)' }}>{page} / {totalPages}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Create user modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.modalTitle}>کاربر جدید</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>نام کامل *</label>
              <input className={styles.input} value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} placeholder="نام و نام خانوادگی" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>ایمیل *</label>
              <input className={styles.input} type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@example.com" dir="ltr" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>رمز عبور *</label>
              <input className={styles.input} type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="حداقل ۸ کاراکتر" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>نقش</label>
              <select className={styles.select} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                {ROLES.filter((r) => r.value).map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>{error}</p>}

            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'در حال ایجاد...' : 'ایجاد کاربر'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
