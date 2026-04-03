import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../utils/apiConfig';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be 8-20 characters, with at least one uppercase letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token || typeof token !== 'string') {
      setError('Reset link is invalid or missing.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to reset password');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please start the backend API.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Set New Password | LuxBank</title>
      </Head>

      <div
        style={{
          minHeight: 'calc(100vh - 180px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
            border: '1px solid var(--card-border)',
            borderRadius: '18px',
            padding: '40px 32px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 18px',
                borderRadius: '20px',
                background: success ? 'rgba(34, 197, 94, 0.14)' : 'rgba(59, 130, 246, 0.14)',
                color: success ? '#22c55e' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: success ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)'
              }}
            >
              {success ? <CheckCircle2 size={34} /> : <Lock size={34} />}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
              Set New Password
            </h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {success
                ? 'Your password has been changed successfully. You can sign in now.'
                : 'Enter your new password below to complete recovery.'}
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.24)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    color: '#fca5a5'
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontWeight: 700 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  style={{
                    width: '100%',
                    height: '54px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    background: '#0f172a',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'white', fontWeight: 700 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  style={{
                    width: '100%',
                    height: '54px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    background: '#0f172a',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  opacity: loading ? 0.75 : 1
                }}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '54px',
                borderRadius: '12px',
                fontWeight: 800
              }}
            >
              Go To Login
            </Link>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <ArrowLeft size={18} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
