import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Bell, Shield, Landmark, MapPin, CheckCircle2, Globe, User } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

const API_BASE_URL = 'http://localhost:5000';

const branchOptions = [
  'Bangalore Central IT Park',
  'New Delhi Diplomatic Enclave',
  'Hyderabad Tech Zone'
];

export default function DashboardSettings() {
  const router = useRouter();
  const [branchRequest, setBranchRequest] = useState(false);
  const [loading, setLoading] = useState({
    profile: false,
    branch: false,
    notifications: false,
    twoFactor: false,
    pin: false,
    deactivate: false
  });
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'India',
    notificationsEnabled: true,
    twoFactorEnabled: true
  });
  const [targetBranch, setTargetBranch] = useState('Bangalore Central IT Park');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        const user = data.data;
        const nameParts = (user.name || '').split(' ');
        setProfile({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' '),
          email: user.email || '',
          country: user.country || 'India',
          notificationsEnabled: user.notificationsEnabled ?? true,
          twoFactorEnabled: user.twoFactorEnabled ?? true
        });

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...user }));
      })
      .catch((err) => setError(err.message));
  }, [router]);

  const updateProfile = async () => {
    if (!profile.firstName.trim() && !profile.lastName.trim()) {
      setError('Enter at least a first name or last name.');
      return;
    }

    setMessage('');
    setError('');
    setLoading((current) => ({ ...current, profile: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          country: profile.country
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      localStorage.setItem('user', JSON.stringify(data.data));
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((current) => ({ ...current, profile: false }));
    }
  };

  const updatePreference = async (field, value) => {
    const loadingKey = field === 'notificationsEnabled' ? 'notifications' : 'twoFactor';
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage('');
    setError('');
    setLoading((current) => ({ ...current, [loadingKey]: true }));
    try {
      const token = localStorage.getItem('token');
      const nextProfile = {
        notificationsEnabled: field === 'notificationsEnabled' ? value : profile.notificationsEnabled,
        twoFactorEnabled: field === 'twoFactorEnabled' ? value : profile.twoFactorEnabled
      };
      const res = await fetch(`${API_BASE_URL}/api/users/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nextProfile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update preferences');

      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existingUser, ...data.data }));
      setMessage('Preferences updated successfully.');
    } catch (err) {
      setProfile((current) => ({ ...current, [field]: !value }));
      setError(err.message);
    } finally {
      setLoading((current) => ({ ...current, [loadingKey]: false }));
    }
  };

  const submitBranchRequest = async () => {
    setMessage('');
    setError('');
    setLoading((current) => ({ ...current, branch: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/branch-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetBranch })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit branch request');
      setBranchRequest(true);
      setMessage('Branch request submitted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((current) => ({ ...current, branch: false }));
    }
  };

  const requestSecurityPinReset = async () => {
    setMessage('');
    setError('');
    setLoading((current) => ({ ...current, pin: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/security-pin/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit security pin reset request');
      setMessage('Security pin reset request submitted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((current) => ({ ...current, pin: false }));
    }
  };

  const deactivateAccount = async () => {
    const confirmed = window.confirm('This will permanently delete your account and remove you from the database. Continue?');
    if (!confirmed) return;

    setMessage('');
    setError('');
    setLoading((current) => ({ ...current, deactivate: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to deactivate account');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((current) => ({ ...current, deactivate: false }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Head>
        <title>Settings | LuxBank</title>
      </Head>

      <Sidebar />

      <main style={{ marginLeft: '260px', padding: '34px' }}>
        <header style={{ marginBottom: '28px' }}>
          <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Settings & Utilities</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your profile, security preferences, and branch requests.</p>
        </header>

        {message && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>{message}</div>}
        {error && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.85fr', gap: '22px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <section style={{ borderRadius: '22px', border: '1px solid var(--card-border)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={28} color="#60a5fa" />
                </div>
                <div>
                  <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Personal Information</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Update your saved profile details.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>First Name</label>
                  <input value={profile.firstName} onChange={(e) => setProfile((current) => ({ ...current, firstName: e.target.value }))} style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>Last Name</label>
                  <input value={profile.lastName} onChange={(e) => setProfile((current) => ({ ...current, lastName: e.target.value }))} style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>Email Address</label>
                  <input value={profile.email} disabled style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#111827', color: '#94a3b8', padding: '0 14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>Country</label>
                  <input value={profile.country} onChange={(e) => setProfile((current) => ({ ...current, country: e.target.value }))} style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px' }} />
                </div>
              </div>

              <button
                onClick={updateProfile}
                disabled={loading.profile}
                className="btn-primary"
                style={{ height: '46px', padding: '0 18px', borderRadius: '12px', fontWeight: 800, opacity: loading.profile ? 0.7 : 1 }}
              >
                {loading.profile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </section>

            <section style={{ borderRadius: '22px', border: '1px solid rgba(239,68,68,0.18)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={28} color="#f87171" />
                </div>
                <div>
                  <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Branch Change Request</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Move your primary branch to another supported location.</p>
                </div>
              </div>

              {!branchRequest ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>Current Branch</div>
                    <div style={{ color: 'white', fontWeight: 700 }}>Downtown Mumbai Corporate Office</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '14px', border: '1px dashed rgba(59,130,246,0.32)', background: 'rgba(59,130,246,0.04)', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {targetBranch}
                  </div>
                </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--card-border)', background: '#111827', marginBottom: '16px' }}>
                    <MapPin size={18} color="#64748b" />
                    <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white' }}>
                      {branchOptions.map((branch) => (
                        <option key={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={submitBranchRequest}
                    disabled={loading.branch}
                    style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontWeight: 800, cursor: 'pointer', opacity: loading.branch ? 0.7 : 1 }}
                  >
                    {loading.branch ? 'Submitting...' : 'Request Branch Relocation'}
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.22)', background: 'rgba(34,197,94,0.08)' }}>
                  <CheckCircle2 size={28} color="#4ade80" />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 800, marginBottom: '6px' }}>Request Submitted</div>
                    <div style={{ color: '#cbd5e1' }}>Your branch request for {targetBranch} is now stored.</div>
                  </div>
                  <button onClick={() => setBranchRequest(false)} style={{ border: 'none', background: 'transparent', color: '#4ade80', fontWeight: 700, cursor: 'pointer' }}>Reset</button>
                </div>
              )}
            </section>
          </div>

          <div style={{ display: 'grid', gap: '18px' }}>
            <section style={{ borderRadius: '22px', border: '1px solid var(--card-border)', background: '#111827', padding: '24px' }}>
              <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '18px' }}>Quick Preferences</h3>
              {[
                { icon: Bell, label: 'Push Notifications', field: 'notificationsEnabled', enabled: profile.notificationsEnabled, interactive: true },
                { icon: Shield, label: 'Two-Factor Auth', field: 'twoFactorEnabled', enabled: profile.twoFactorEnabled, interactive: true },
                { icon: Globe, label: 'Language: English', field: 'language', enabled: true, interactive: false }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < 2 ? '1px solid rgba(148,163,184,0.12)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                      <Icon size={18} color="#60a5fa" />
                      <span>{item.label}</span>
                    </div>
                    <button
                      disabled={!item.interactive}
                      onClick={() => item.interactive && updatePreference(item.field, !item.enabled)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '999px',
                        padding: '2px',
                        background: item.enabled ? '#22c55e' : '#334155',
                        border: 'none',
                        cursor: item.interactive ? 'pointer' : 'default',
                        opacity: item.interactive ? 1 : 0.7
                      }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', transform: item.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                  </div>
                );
              })}
            </section>

            <section style={{ borderRadius: '22px', border: '1px solid rgba(239,68,68,0.18)', background: '#111827', padding: '24px' }}>
              <h3 style={{ color: '#f87171', fontWeight: 800, marginBottom: '18px', textTransform: 'uppercase', fontSize: '0.82rem' }}>Security Zone</h3>
              <button
                onClick={requestSecurityPinReset}
                disabled={loading.pin}
                style={{ width: '100%', height: '46px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.16)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontWeight: 800, cursor: 'pointer', marginBottom: '12px', opacity: loading.pin ? 0.7 : 1 }}
              >
                {loading.pin ? 'Submitting...' : 'Reset Security Pin'}
              </button>
              <button
                onClick={deactivateAccount}
                disabled={loading.deactivate}
                style={{ width: '100%', height: '46px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.22)', background: '#dc2626', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: loading.deactivate ? 0.7 : 1 }}
              >
                {loading.deactivate ? 'Removing Account...' : 'Deactivate Account'}
              </button>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
