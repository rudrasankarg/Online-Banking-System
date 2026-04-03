import Link from 'next/link';
import { LayoutDashboard, CreditCard, Send, History, Settings, LogOut, Landmark, UserCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const [userName, setUserName] = useState('Customer');
  const [userType, setUserType] = useState('Member');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: CreditCard, label: 'My Cards', href: '/dashboard/cards' },
    { icon: Send, label: 'Transfers', href: '/dashboard/transfers' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.name) {
        setUserName(parsedUser.name);
      }
      if (parsedUser?.accountType) {
        setUserType(parsedUser.accountType === 'nri' ? 'NRI Member' : 'Domestic Member');
      }
    } catch (err) {
      console.error('Unable to parse stored user', err);
    }
  }, []);

  return (
    <aside
      style={{
        width: '260px',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
        borderRight: '1px solid var(--card-border)',
        padding: '28px 18px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '20px 0 40px rgba(2, 6, 23, 0.28)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', padding: '0 10px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Landmark color="#60a5fa" size={22} />
        </div>
        <div>
          <div style={{ color: 'white', fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.1 }}>LuxBank</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>User Portal</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '14px',
                color: isActive ? 'white' : '#cbd5e1',
                background: isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                border: isActive ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid transparent',
                fontWeight: 700,
                transition: '0.2s ease'
              }}
            >
              <Icon size={19} color={isActive ? 'white' : '#94a3b8'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          padding: '18px 12px 8px',
          borderTop: '1px solid rgba(148,163,184,0.18)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <UserCircle size={42} color="#64748b" />
          <div>
            <div style={{ color: 'white', fontWeight: 700 }}>{userName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{userType}</div>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }}
          style={{
            width: '100%',
            height: '46px',
            borderRadius: '12px',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.08)',
            color: '#fca5a5',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
