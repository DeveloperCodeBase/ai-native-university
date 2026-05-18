'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Shield, BookOpen, ClipboardList,
  Save, Award, LogOut,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, apiPatch, getUser, logout } from '../lib/api';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  _count?: { enrollments: number; submissions: number };
}

const roleLabel = (r: string) =>
  ({ student: 'دانشجو', instructor: 'استاد', admin: 'مدیر', super_admin: 'مدیر ارشد', teaching_assistant: 'دستیار آموزشی' }[r] ?? r);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const localUser = getUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localUser) return;
    apiGet(`/users/${localUser.id}`)
      .then((d) => {
        setProfile(d);
        setForm({ fullName: d.fullName, phone: d.phone || '' });
      })
      .catch(() => {
        // Fallback to local user data
        setProfile({ ...localUser, _count: { enrollments: 0, submissions: 0 } });
        setForm({ fullName: localUser.fullName, phone: '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError('نام نمی‌تواند خالی باشد'); return; }
    setSaving(true);
    setError('');
    try {
      const updated = await apiPatch('/auth/profile', {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
      });
      setProfile((prev) => prev ? { ...prev, ...updated } : null);
      // Update local storage
      const u = getUser();
      if (u) localStorage.setItem('user', JSON.stringify({ ...u, fullName: form.fullName.trim() }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'خطا در ذخیره تغییرات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="پروفایل">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-2xl)' }} />)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="پروفایل و تنظیمات">
      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        {/* Avatar + Summary */}
        <motion.div className="glass-card" style={{ padding: 'var(--space-6)' }} {...fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
              color: '#fff', fontSize: 'var(--text-2xl)', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {profile?.fullName?.charAt(0) ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {profile?.fullName}
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 'var(--space-1) 0 0' }}>
                {profile?.email}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{roleLabel(profile?.role ?? '')}</span>
                {profile?.createdAt && (
                  <span className="badge badge-default">
                    عضو از {formatDate(profile.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {profile?._count && (
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <BookOpen size={15} style={{ color: 'var(--brand-400)' }} />
                <strong style={{ color: 'var(--text-primary)' }}>{profile._count.enrollments}</strong>
                &nbsp;ثبت‌نام
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <ClipboardList size={15} style={{ color: 'var(--accent-500)' }} />
                <strong style={{ color: 'var(--text-primary)' }}>{profile._count.submissions}</strong>
                &nbsp;آزمون ارسالی
              </div>
            </div>
          )}
        </motion.div>

        {/* Edit form */}
        <motion.div className="glass-card" style={{ padding: 'var(--space-6)' }} {...fadeUp} transition={{ delay: 0.08 }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 var(--space-5)' }}>
            ویرایش اطلاعات
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <User size={13} /> نام کامل
              </label>
              <input
                style={{ width: '100%', padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', boxSizing: 'border-box' }}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <Mail size={13} /> ایمیل
              </label>
              <input
                style={{ width: '100%', padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-level2)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', boxSizing: 'border-box' }}
                value={profile?.email ?? ''}
                disabled
                dir="ltr"
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <Phone size={13} /> شماره تلفن
              </label>
              <input
                style={{ width: '100%', padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', boxSizing: 'border-box' }}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="09xxxxxxxxx"
                dir="ltr"
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <Shield size={13} /> نقش
              </label>
              <div style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-level2)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                {roleLabel(profile?.role ?? '')}
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>}
            {saved && <p style={{ color: 'var(--accent-500)', fontSize: 'var(--text-sm)', margin: 0 }}>تغییرات با موفقیت ذخیره شد.</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15} />
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div className="glass-card" style={{ padding: 'var(--space-5)' }} {...fadeUp} transition={{ delay: 0.14 }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <a href="/certificates" className="btn btn-ghost btn-sm">
              <Award size={14} /> گواهینامه‌هایم
            </a>
            <a href="/courses" className="btn btn-ghost btn-sm">
              <BookOpen size={14} /> دروسم
            </a>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={logout}>
              <LogOut size={14} /> خروج از حساب
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
