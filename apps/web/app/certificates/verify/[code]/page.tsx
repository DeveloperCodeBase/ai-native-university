'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, User, BookOpen, Calendar, ExternalLink, AlertTriangle, GraduationCap } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description?: string;
  issuedAt: string;
  expiresAt?: string;
  user: { fullName: string };
  course?: { title: string };
  tenant: { name: string };
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

export default function CertVerifyPage({ params }: { params: { code: string } }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/certificates/verify/${params.code}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((d) => setCert(d.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.code]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      fontFamily: 'Vazirmatn, sans-serif',
    }}>
      {/* Topbar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <GraduationCap size={22} strokeWidth={1.7} style={{ color: 'var(--brand-400)' }} />
        <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }} className="gradient-text">دانشگاه هوشمند</span>
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-xl)', width: '60%', margin: '0 auto' }} />
            <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-2xl)' }} />
          </div>
        ) : notFound ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-level1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-10)',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)',
            }}
          >
            <div style={{ color: 'var(--danger)' }}><AlertTriangle size={48} strokeWidth={1.3} /></div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              گواهینامه معتبر نیست
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
              کد تأیید وارد شده در سیستم یافت نشد یا این گواهینامه باطل شده است.
            </p>
            <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-base)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              {params.code}
            </code>
          </motion.div>
        ) : cert && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Valid badge */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
              <span className="badge badge-success" style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-5)', display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <ShieldCheck size={14} /> گواهینامه معتبر
              </span>
            </div>

            {/* Certificate card */}
            <div style={{
              background: 'var(--bg-level1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Gold top bar */}
              <div style={{ height: 4, background: 'linear-gradient(90deg, var(--gold-500), var(--brand-400))' }} />

              <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', textAlign: 'center' }}>
                {/* Award icon */}
                <div style={{
                  width: 80, height: 80,
                  borderRadius: 'var(--radius-2xl)',
                  background: 'linear-gradient(135deg, rgba(201,171,92,0.2), rgba(201,171,92,0.05))',
                  border: '1px solid rgba(201,171,92,0.3)',
                  color: 'var(--gold-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award size={40} strokeWidth={1.3} />
                </div>

                <div>
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>
                    {cert.title}
                  </h1>
                  {cert.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
                      {cert.description}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div style={{ width: '100%', height: 1, background: 'var(--border-subtle)' }} />

                {/* Details */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center' }}>
                    <User size={16} style={{ color: 'var(--brand-400)' }} />
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cert.user.fullName}
                    </span>
                  </div>
                  {cert.course && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center' }}>
                      <BookOpen size={16} style={{ color: 'var(--accent-500)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{cert.course.title}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center' }}>
                    <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                      صادر شده در {formatDate(cert.issuedAt)} توسط {cert.tenant.name}
                    </span>
                  </div>
                </div>

                {/* Code */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)',
                  width: '100%', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>کد تأیید:</span>
                  <code style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-400)', fontFamily: 'monospace', direction: 'ltr' }}>
                    {params.code}
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
