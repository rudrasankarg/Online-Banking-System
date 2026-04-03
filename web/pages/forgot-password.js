import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to send recovery email');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please start the backend API.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Reset Password | LuxBank</title>
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
                background: submitted ? 'rgba(34, 197, 94, 0.14)' : 'rgba(59, 130, 246, 0.14)',
                color: submitted ? '#22c55e' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: submitted ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)'
              }}
            >
              {submitted ? <CheckCircle2 size={34} /> : <KeyRound size={34} />}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '10px' }}>
              Password Reset
            </h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1rem' }}>
              {submitted
                ? `If an account exists for ${email}, recovery instructions will arrive shortly.`
                : "Enter your registered email address and we'll help you recover access."}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
                <label
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    color: 'var(--foreground)',
                    fontSize: '0.95rem',
                    fontWeight: 700
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      height: '54px',
                      padding: '0 16px 0 46px',
                      borderRadius: '12px',
                      border: '1px solid var(--card-border)',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
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
                {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
              </button>
            </form>
          ) : (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.22)',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '20px',
                color: '#d1fae5',
                lineHeight: 1.6
              }}
            >
              For privacy, LuxBank shows the same confirmation whether or not the email exists.
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {submitted && (
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '12px',
                  border: '1px solid var(--card-border)',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Try Another Email
              </button>
            )}

            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
