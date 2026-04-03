import Link from 'next/link';
import { Landmark, Search, Bell, ChevronDown, BellRing } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase();
    if (q.includes('loan')) router.push('/loans');
    else if (q.includes('card')) router.push('/cards');
    else if (q.includes('account')) router.push('/accounts');
    else if (q.includes('deposit') || q.includes('fd') || q.includes('rd')) router.push('/deposits');
    else if (q.includes('nri')) router.push('/nri');
    else router.push('/support');
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
      <div className="nav-top">
        <div className="nav-top-left">
          <span 
            onClick={() => router.push('/')}
            style={{ fontWeight: 'bold', borderBottom: '2px solid var(--primary)', paddingBottom: '2px', cursor: 'pointer', color: 'white' }}
          >Personal</span>
          <span 
            onClick={() => router.push('/nri')}
            style={{ opacity: 0.8, cursor: 'pointer', transition: '0.2s' }}
            onMouseOver={(e) => e.target.style.color = 'white'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
          >NRI (International)</span>
        </div>
        <div className="nav-top-right" style={{ position: 'relative' }}>
          <Link href="/support" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            About Us <ChevronDown size={14} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            English <ChevronDown size={14} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            {searchOpen ? (
               <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                 <input 
                   autoFocus
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search (e.g. loans)" 
                   style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '12px', width: '120px' }} 
                 />
                 <Search size={14} onClick={() => setSearchOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
               </form>
            ) : (
               <Search size={16} onClick={() => setSearchOpen(true)} style={{ cursor: 'pointer' }} />
            )}
          </div>

          <div style={{ position: 'relative' }}>
             <Bell size={16} onClick={() => setNotifOpen(!notifOpen)} style={{ cursor: 'pointer' }} />
             {notifOpen && (
               <div style={{ position: 'absolute', top: '24px', right: '0', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', width: '280px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 99, overflow: 'hidden' }}>
                  <div style={{ background: '#1e3a8a', padding: '12px', fontSize: '12px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellRing size={14} /> Marketing Alerts
                  </div>
                  <div style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--card-border)' }} onClick={() => router.push('/cards')} onMouseOver={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background='transparent'}>
                    <p style={{ color: 'white', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>🎉 5x Reward Points!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '4px 0 0' }}>Apply for the Premium Travel Card today and unlock exclusive airport lounges.</p>
                  </div>
                  <div style={{ padding: '12px', cursor: 'pointer' }} onClick={() => router.push('/loans')} onMouseOver={(e) => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background='transparent'}>
                    <p style={{ color: 'white', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>🏡 Instant Home Loans</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '4px 0 0' }}>Get pre-approved in 5 minutes with zero processing fee constraints.</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="nav-bottom">
        <Link href="/" className="logo">
          <div className="logo-icon"><Landmark color="white" size={24} /></div>
          LuxBank
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/features" className="nav-link">Discover Products <ChevronDown size={14} /></Link>
          <Link href="/support" className="nav-link">Need Help <ChevronDown size={14} /></Link>
          <Link href="/features" className="nav-link">Better Money Choices</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--card-border)' }}>
             <div style={{ width: '20px', height: '20px', background: 'var(--primary)', color: 'white', borderRadius: '50%', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', lineHeight: '20px' }}>L</div>
             <input type="text" placeholder="Ask Luxie..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '120px', color: 'white' }} />
          </div>
          <Link href="/login" className="btn-login" style={{ background: 'var(--primary)' }}>USER LOGIN</Link>
          <Link
            href="/admin/login"
            style={{
              background: 'rgba(239,68,68,0.12)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.22)',
              padding: '8px 18px',
              fontWeight: 'bold',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ADMIN LOGIN
          </Link>
        </div>
      </div>
    </nav>
  );
}
