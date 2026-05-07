'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('demo-university');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'خطا در ورود');
        return;
      }

      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect based on role
      const role = data.data.user.role;
      if (role === 'super_admin' || role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'instructor') {
        router.push('/dashboard/instructor');
      } else {
        router.push('/dashboard/student');
      }
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: string) => {
    setTenantSlug('demo-university');
    setPassword('Demo@1234');
    switch (role) {
      case 'admin':
        setEmail('admin@demo.university.ir');
        break;
      case 'instructor':
        setEmail('instructor@demo.university.ir');
        break;
      case 'student':
        setEmail('student@demo.university.ir');
        break;
    }
  };

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.container}>
        {/* Branding */}
        <div className={styles.branding}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🎓</span>
            <span className="gradient-text">دانشگاه هوشمند</span>
          </a>
        </div>

        {/* Login Card */}
        <div className={`glass-card ${styles.card}`}>
          <h1 className={styles.title}>ورود به پنل</h1>
          <p className={styles.subtitle}>به دانشگاه آنلاین هوشمند خوش آمدید</p>

          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="tenantSlug" className={styles.label}>شناسه سازمان</label>
              <input
                id="tenantSlug"
                type="text"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                placeholder="demo-university"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>ایمیل</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.ir"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>رمز عبور</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? '⏳ در حال ورود...' : '🔐 ورود'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>ورود سریع با حساب آزمایشی</span>
          </div>

          <div className={styles.demoButtons}>
            <button onClick={() => fillDemoCredentials('admin')} className={styles.demoBtn}>
              <span className={styles.demoBtnIcon}>🛡️</span>
              <span>مدیر</span>
            </button>
            <button onClick={() => fillDemoCredentials('instructor')} className={styles.demoBtn}>
              <span className={styles.demoBtnIcon}>👨‍🏫</span>
              <span>استاد</span>
            </button>
            <button onClick={() => fillDemoCredentials('student')} className={styles.demoBtn}>
              <span className={styles.demoBtnIcon}>🎓</span>
              <span>دانشجو</span>
            </button>
          </div>

          <p className={styles.registerLink}>
            حساب کاربری ندارید؟{' '}
            <a href="/register">ثبت‌نام کنید</a>
          </p>
        </div>
      </div>
    </div>
  );
}
