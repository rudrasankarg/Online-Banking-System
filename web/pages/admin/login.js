import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../utils/apiConfig';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      setTempToken(data.data.tempToken);
      setShowOtp(true);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please start the backend API.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.data.user));
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please start the backend API.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #1e293b 0%, #020617 60%)', padding: '40px 24px' }}>
      <Head>
        <title>Admin Portal | LuxBank</title>
      </Head>

      <div style={{ maxWidth: '1100px', margin: '0 auto', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '920px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            overflow: 'hidden',
            borderRadius: '24px',
            border: '1px solid rgba(239,68,68,0.18)',
            background: 'rgba(15, 23, 42, 0.96)',
            boxShadow: '0 30px 80px rgba(2, 6, 23, 0.6)'
          }}
        >
          <div style={{ padding: '44px', background: 'linear-gradient(160deg, #450a0a 0%, #111827 65%, #020617 100%)', borderRight: '1px solid rgba(239,68,68,0.12)' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}
            >
              <ShieldCheck size={34} color="#f87171" />
            </div>

            <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>LuxBank Admin Portal</h1>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, maxWidth: '360px' }}>
              Separate administrator access for approvals, user monitoring, audit oversight, and system-level control.
            </p>

            <div style={{ marginTop: '40px', padding: '18px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.16)' }}>
              <div style={{ color: '#f87171', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '10px' }}>
                Restricted Access
              </div>
              <p style={{ color: '#fecaca', lineHeight: 1.6, fontSize: '0.94rem' }}>
                Admin sign-in is isolated from customer sign-in and uses a separate database-backed admin record.
              </p>
            </div>
          </div>

          <div style={{ padding: '44px' }}>
            {!showOtp ? (
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Admin Login</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Use your administrator credentials to receive a verification OTP.</p>
                </div>

                {error && (
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontWeight: 700 }}>Admin Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@luxbank.com"
                      style={{ width: '100%', height: '52px', padding: '0 16px 0 42px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontWeight: 700 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter secure password"
                      style={{ width: '100%', height: '52px', padding: '0 16px 0 42px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ height: '52px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {loading ? 'Checking Credentials...' : 'Verify Credentials'} {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Admin OTP Verification</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>A one-time code has been sent to the admin email address.</p>
                </div>

                {error && (
                  <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontWeight: 700 }}>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="------"
                    style={{ width: '100%', height: '52px', textAlign: 'center', letterSpacing: '10px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', fontSize: '1.1rem' }}
                  />
                </div>

                <button type="submit" disabled={loading} style={{ height: '52px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.75 : 1 }}>
                  {loading ? 'Verifying OTP...' : 'Enter Admin Console'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px' }}>
              <Link href="/" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Return to public site</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
