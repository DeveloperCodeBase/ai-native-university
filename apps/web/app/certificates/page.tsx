'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, ExternalLink, BookOpen, Calendar, ShieldCheck,
  GraduationCap, Copy, CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { apiGet, getUser } from '../lib/api';
import styles from './certificates.module.css';

interface Certificate {
  id: string;
  title: string;
  description?: string;
  issuedAt: string;
  expiresAt?: string;
  verificationUrl?: string;
  revokedAt?: string;
  course?: { id: string; title: string; slug: string };
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function CertificatesPage() {
  const user = getUser();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    apiGet('/certificates/my')
      .then((d) => setCerts(d.data || []))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const extractCode = (url?: string) => {
    if (!url) return null;
    return url.split('/').pop();
  };

  return (
    <DashboardLayout title="گواهینامه‌ها">
      <motion.div variants={stagger} initial="initial" animate="animate">

        {/* Stats bar */}
        {!loading && certs.length > 0 && (
          <motion.div className={styles.statsBar} variants={fadeUp} transition={{ duration: 0.4 }}>
            <div className={styles.statItem}>
              <Award size={18} style={{ color: 'var(--gold-500)' }} />
              <span className={styles.statValue}>{certs.length}</span>
              <span className={styles.statLabel}>گواهینامه کسب شده</span>
            </div>
            <div className={styles.statItem}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-500)' }} />
              <span className={styles.statValue}>{certs.filter(c => !c.revokedAt).length}</span>
              <span className={styles.statLabel}>معتبر</span>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonCard}`} />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Award size={28} strokeWidth={1.5} /></div>
            <h3 className="empty-title">هنوز گواهینامه‌ای ندارید</h3>
            <p className="empty-desc">با اتمام موفق دوره‌ها، گواهینامه‌های دیجیتال معتبر دریافت کنید.</p>
            <a href="/courses" className="btn btn-primary" style={{ marginTop: 'var(--space-5)' }}>
              <BookOpen size={16} /> مشاهده دوره‌ها
            </a>
          </div>
        ) : (
          <div className={styles.grid}>
            {certs.map((cert) => (
              <motion.div
                key={cert.id}
                className={`${styles.certCard} ${cert.revokedAt ? styles.certRevoked : ''}`}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
              >
                {/* Card header */}
                <div className={styles.cardTop}>
                  <div className={styles.awardIcon}>
                    <Award size={28} strokeWidth={1.5} />
                  </div>
                  {cert.revokedAt ? (
                    <span className="badge badge-danger">باطل شده</span>
                  ) : (
                    <span className="badge badge-success" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <ShieldCheck size={11} /> معتبر
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className={styles.certTitle}>{cert.title}</h3>

                {/* Course link */}
                {cert.course && (
                  <a href={`/courses/${cert.course.slug}`} className={styles.courseLink}>
                    <BookOpen size={13} />
                    {cert.course.title}
                  </a>
                )}

                {cert.description && (
                  <p className={styles.certDesc}>{cert.description}</p>
                )}

                {/* Dates */}
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={13} />
                    صدور: {formatDate(cert.issuedAt)}
                  </span>
                  {cert.expiresAt && (
                    <span className={styles.metaItem}>
                      <Calendar size={13} />
                      انقضا: {formatDate(cert.expiresAt)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {cert.verificationUrl && !cert.revokedAt && (
                  <div className={styles.actions}>
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <ExternalLink size={14} /> مشاهده
                    </a>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => copyLink(cert.verificationUrl!, cert.id)}
                    >
                      {copied === cert.id
                        ? <><CheckCircle2 size={14} /> کپی شد</>
                        : <><Copy size={14} /> کپی لینک</>
                      }
                    </button>
                  </div>
                )}

                {/* Verification code */}
                {cert.verificationUrl && !cert.revokedAt && (
                  <div className={styles.codeBox}>
                    <span className={styles.codeLabel}>کد تأیید</span>
                    <code className={styles.code}>{extractCode(cert.verificationUrl)}</code>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
