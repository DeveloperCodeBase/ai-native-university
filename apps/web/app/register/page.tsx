'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, User, Mail, Lock, Phone, Building2,
  AlertCircle, CheckCircle2, BrainCircuit, Video, BarChart3, Award,
} from 'lucide-react';
import styles from './register.module.css';

const BRAND_FEATURES = [
  { Icon: BrainCircuit, text: 'تیوتر هوشمند RAG شخصی‌سازی‌شده' },
  { Icon: Video,        text: 'کلاس‌های زنده با تحلیل خودکار AI' },
  { Icon: BarChart3,    text: 'تحلیل پیشرفت و پروفایل یادگیری' },
  { Icon: Award,        text: 'گواهینامه‌های معتبر دیجیتال' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    phone: '', tenantSlug: 'demo-university',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('رمز عبور و تکرار آن یکسان نیستند'); return; }
    if (form.password.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone || undefined, tenantSlug: form.tenantSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'خطا در ثبت‌نام'); return; }

      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user',         JSON.stringify(data.data.user));
      router.push('/dashboard/student');
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.orbs} aria-hidden>
        <div className={styles.orb1} /><div className={styles.orb2} /><div className={styles.orb3} />
      </div>

      <div className={styles.layout}>
        {/* Brand Panel */}
        <motion.div
          className={styles.brandPanel}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <a href="/" className={styles.logo}>
            <GraduationCap size={28} strokeWidth={1.7} style={{ color: 'var(--brand-400)' }} />
            <span className="gradient-text" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>دانشگاه هوشمند</span>
          </a>
          <div className={styles.brandContent}>
            <h1 className={styles.brandTitle}>
              آموزش هوشمند<br />
              <span className="gradient-text">برای نسل جدید</span>
            </h1>
            <p className={styles.brandDesc}>
              به جمع دانشجویان دانشگاه آنلاین هوشمند بپیوندید و از تیوتر هوشمند AI،
              کلاس‌های زنده و ارزیابی تطبیقی بهره‌مند شوید.
            </p>
            <ul className={styles.featureList}>
              {BRAND_FEATURES.map(({ Icon, text }, i) => (
                <motion.li
                  key={i}
                  className={styles.featureItem}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                >
                  <div className={styles.featureIconWrap}>
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Form Panel */}
        <motion.div
          className={styles.formPanel}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className={`glass-card ${styles.card}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>ثبت‌نام رایگان</h2>
              <p className={styles.cardSub}>حساب دانشجویی ایجاد کنید</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="alert alert-danger"
                  style={{ marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className="label">
                    <User size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                    نام کامل
                  </label>
                  <input className="input" type="text" value={form.fullName} onChange={update('fullName')} placeholder="علی احمدی" required autoComplete="name" />
                </div>
                <div className={styles.field}>
                  <label className="label">
                    <Phone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                    شماره موبایل (اختیاری)
                  </label>
                  <input className="input" type="tel" value={form.phone} onChange={update('phone')} placeholder="۰۹۱۲..." autoComplete="tel" />
                </div>
              </div>

              <div className={styles.field}>
                <label className="label">
                  <Mail size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                  ایمیل
                </label>
                <input className="input" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required autoComplete="email" dir="ltr" />
              </div>

              <div className={styles.field}>
                <label className="label">
                  <Building2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                  شناسه دانشگاه
                </label>
                <input className="input" type="text" value={form.tenantSlug} onChange={update('tenantSlug')} placeholder="demo-university" required dir="ltr" />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className="label">
                    <Lock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                    رمز عبور
                  </label>
                  <input className="input" type="password" value={form.password} onChange={update('password')} placeholder="حداقل ۶ کاراکتر" required minLength={6} autoComplete="new-password" />
                </div>
                <div className={styles.field}>
                  <label className="label">
                    <CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                    تکرار رمز
                  </label>
                  <input className="input" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="تکرار رمز عبور" required minLength={6} autoComplete="new-password" />
                </div>
              </div>

              <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 18, height: 18 }} /> در حال ثبت‌نام...</>
                  : 'ایجاد حساب کاربری'
                }
              </button>
            </form>

            <p className={styles.loginLink}>
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <a href="/login" style={{ color: 'var(--brand-400)', fontWeight: 600 }}>وارد شوید</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
