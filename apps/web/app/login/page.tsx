'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import styles from './login.module.css';

const demoCredentials = [
  { role: 'admin',      label: 'مدیر',      email: 'admin@demo.university.ir' },
  { role: 'instructor', label: 'استاد',     email: 'instructor@demo.university.ir' },
  { role: 'student',    label: 'دانشجو',    email: 'student@demo.university.ir' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [tenantSlug, setTenantSlug] = useState('demo-university');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, tenantSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'خطا در ورود'); return; }

      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user',         JSON.stringify(data.data.user));

      const role = data.data.user.role;
      if (role === 'super_admin' || role === 'admin') router.push('/dashboard/admin');
      else if (role === 'instructor') router.push('/dashboard/instructor');
      else router.push('/dashboard/student');
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setTenantSlug('demo-university');
    setPassword('Demo@1234');
    setEmail(email);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      {/* Brand header */}
      <motion.a
        href="/"
        className={styles.brand}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GraduationCap size={26} strokeWidth={1.7} className={styles.brandIcon} />
        <span className="gradient-text" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
          دانشگاه هوشمند
        </span>
      </motion.a>

      <motion.div
        className={styles.wrapper}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={`glass-card ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>ورود به حساب</h1>
            <p className={styles.subtitle}>به دانشگاه آنلاین هوشمند خوش آمدید</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className={`alert alert-danger ${styles.errorBox}`}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 'var(--space-5)' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="tenant" className="label">
                <Building2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                شناسه سازمان
              </label>
              <input
                id="tenant"
                type="text"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                placeholder="demo-university"
                className="input"
                required
                dir="ltr"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className="label">
                <Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.ir"
                className="input"
                required
                dir="ltr"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className="label">
                <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                رمز عبور
              </label>
              <div className={styles.passWrap}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  required
                  minLength={6}
                  dir="ltr"
                  style={{ paddingLeft: '2.8rem' }}
                />
                <button
                  type="button"
                  className={styles.showPassBtn}
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingDots}>در حال ورود</span>
              ) : 'ورود به پنل'}
            </button>
          </form>

          <div className="divider">ورود سریع با حساب آزمایشی</div>

          <div className={styles.demoGrid}>
            {demoCredentials.map(({ role, label, email: dEmail }) => (
              <button
                key={role}
                className={styles.demoBtn}
                onClick={() => fillDemo(dEmail)}
                type="button"
              >
                <span className={styles.demoBtnLabel}>{label}</span>
              </button>
            ))}
          </div>

          <p className={styles.registerLink}>
            حساب کاربری ندارید؟{' '}
            <a href="/register" style={{ color: 'var(--brand-400)', fontWeight: 600 }}>
              ثبت‌نام کنید
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
