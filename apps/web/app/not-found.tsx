import { BookOpen, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-5)',
      background: 'var(--bg-base)',
      fontFamily: 'Vazirmatn, sans-serif',
      textAlign: 'center',
      padding: 'var(--space-8)',
    }}>
      <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--border-default)', lineHeight: 1 }}>۴۰۴</div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        صفحه پیدا نشد
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, maxWidth: 360, lineHeight: 1.8 }}>
        صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا جابجا شده است.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-5)',
            background: 'var(--brand-500)', color: '#fff',
            borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)',
            fontWeight: 600, textDecoration: 'none',
          }}
        >
          <Home size={16} /> صفحه اصلی
        </a>
        <a
          href="/courses"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-5)',
            background: 'var(--bg-level1)', color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)',
            fontWeight: 600, textDecoration: 'none',
          }}
        >
          <BookOpen size={16} /> مشاهده دروس
        </a>
      </div>
    </div>
  );
}
