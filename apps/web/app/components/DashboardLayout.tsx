'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  Video,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  Building2,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';
import { getUser, logout } from '../lib/api';
import styles from './DashboardLayout.module.css';

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: '/dashboard/student',    label: 'داشبورد',        Icon: LayoutDashboard, roles: ['student'] },
  { href: '/dashboard/instructor', label: 'داشبورد',        Icon: LayoutDashboard, roles: ['instructor'] },
  { href: '/dashboard/admin',      label: 'داشبورد',        Icon: LayoutDashboard, roles: ['admin', 'super_admin'] },
  { href: '/courses',              label: 'دروس',           Icon: BookOpen },
  { href: '/tutor',                label: 'تیوتر AI',       Icon: BrainCircuit },
  { href: '/sessions',             label: 'کلاس‌های زنده',  Icon: Video },
  { href: '/assessments',          label: 'آزمون‌ها',       Icon: ClipboardList, roles: ['student'] },
  { href: '/users',                label: 'کاربران',        Icon: Users, roles: ['admin', 'super_admin'] },
  { href: '/faculties',            label: 'دانشکده‌ها',     Icon: Building2, roles: ['admin', 'super_admin', 'instructor'] },
  { href: '/analytics',            label: 'تحلیل',          Icon: BarChart3, roles: ['admin', 'super_admin', 'instructor'] },
  { href: '/forum',                label: 'انجمن',          Icon: MessageSquare },
  { href: '/notifications',        label: 'اعلان‌ها',       Icon: Bell },
];

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);

    // Fetch notification count
    fetch('/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then((r) => r.json())
      .then((d) => setNotifCount(d?.count ?? 0))
      .catch(() => {});
  }, [router]);

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((r) => r === user?.role);
  });

  const dashboardHref =
    !user ? '/login'
    : user.role === 'student' ? '/dashboard/student'
    : user.role === 'instructor' ? '/dashboard/instructor'
    : '/dashboard/admin';

  const uniqueNav = filteredNav.filter(
    (item, idx, arr) =>
      arr.findIndex((x) => x.href === item.href) === idx
  );

  if (!user) return null;

  const roleLabel =
    user.role === 'student' ? 'دانشجو'
    : user.role === 'instructor' ? 'استاد'
    : user.role === 'admin' ? 'مدیر'
    : 'مدیر ارشد';

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className={styles.sidebarTop}>
          <a href={dashboardHref} className={styles.brand}>
            <GraduationCap size={22} strokeWidth={1.7} className={styles.brandIcon} />
            <span className="gradient-text" style={{ fontSize: 'var(--text-sm)', fontWeight: 800 }}>
              دانشگاه هوشمند
            </span>
          </a>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user.fullName.charAt(0)}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.fullName}</div>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{roleLabel}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {uniqueNav.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/' && pathname?.startsWith(href) && href.length > 10);
            return (
              <a
                key={href}
                href={href}
                className={`nav-item${active ? ' active' : ''}`}
              >
                <Icon size={17} strokeWidth={1.8} className="nav-item-icon" />
                <span>{label}</span>
                {href === '/notifications' && notifCount > 0 && (
                  <span className={styles.notifBadge}>{notifCount}</span>
                )}
              </a>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <button onClick={logout} className="nav-item" style={{ color: 'var(--danger)', width: '100%' }}>
            <LogOut size={17} strokeWidth={1.8} className="nav-item-icon" />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        {/* Topbar */}
        {title && (
          <header className={styles.topbar}>
            <h1 className={styles.topbarTitle}>{title}</h1>
            <div className={styles.topbarActions}>
              <a href="/notifications" className="icon-btn" style={{ position: 'relative' }}>
                <Bell size={18} strokeWidth={1.8} />
                {notifCount > 0 && <span className={styles.topbarNotif}>{notifCount}</span>}
              </a>
              <a href="/profile" className="icon-btn">
                <Settings size={18} strokeWidth={1.8} />
              </a>
            </div>
          </header>
        )}

        {children}
      </div>
    </div>
  );
}
