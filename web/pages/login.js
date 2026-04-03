import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { Landmark, Lock, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  
  const router = useRouter();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (email.trim() === '' || password.trim() === '') {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setTempToken(data.data.tempToken);
      setShowOtp(true);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please check backend.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/user/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp: enteredOtp })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'OTP Verification failed');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      router.push('/dashboard');
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please check backend.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>NetBanking Login | LuxBank</title>
      </Head>
      
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '130px 24px 48px', margin: '0 auto', maxWidth: '1000px', width: '100%' }}>
        <div style={{ width: '100%', background: 'var(--card-bg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
          
          <div style={{ flex: '40%', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', color: 'white', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
             <div style={{ zIndex: 10, position: 'relative' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                   <Landmark color="white" size={32} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Welcome to LuxBank NetBanking</h1>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>
                   A secure and convenient way to bank from anywhere. Access your accounts, transfer funds, and pay bills instantly.
                </p>
             </div>
             <div style={{ zIndex: 10, position: 'relative', marginTop: '48px', background: 'rgba(0,0,0,0.2)', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                 <h3 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Lock size={16} /> Security Guarantee</h3>
                 <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>Your connection is 256-bit encrypted. We will never ask for your password or PIN via email.</p>
             </div>
             <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '256px', height: '256px', background: 'rgba(59,130,246,0.15)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
          </div>

          <div style={{ flex: '60%', padding: '48px' }}>
             {!showOtp ? (
               <form onSubmit={handleRequestOtp} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div>
                   <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 'bold' }}>User Login</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                     This page is only for customer login. Admins should use the separate admin portal.
                   </p>
                 </div>
                 
                 {error && (
                   <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
                     {error}
                   </div>
                 )}

                 <div>
                   <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                   <div style={{ position: 'relative' }}>
                     <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }}
                       placeholder="Enter your registered email"
                       required
                     />
                   </div>
                 </div>

                 <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                     <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Password</label>
                     <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                       Forgot Password?
                     </Link>
                   </div>
                   <div style={{ position: 'relative' }}>
                     <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }}
                       placeholder="••••••••"
                       required
                     />
                   </div>
                 </div>

                 <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                   {loading ? 'AUTHENTICATING...' : 'LOGIN VIA OTP'} {!loading && <ArrowRight size={18} />}
                 </button>

                 <Link
                   href="/admin/login"
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     height: '48px',
                     borderRadius: '10px',
                     border: '1px solid rgba(239,68,68,0.22)',
                     background: 'rgba(239,68,68,0.08)',
                     color: '#fca5a5',
                     fontWeight: 'bold'
                   }}
                 >
                   Go To Admin Login
                 </Link>
                 
                 <div style={{ paddingTop: '24px', marginTop: '24px', borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>New to NetBanking?</p>
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                       Register Here
                    </Link>
                 </div>
               </form>
             ) : (
               <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 'bold' }}>2-Step Verification</h2>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We successfully matched your credentials and sent a secure 6-digit One-Time Password to {email}. Check your inbox.</p>
                 
                 {error && (
                   <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
                     {error}
                   </div>
                 )}

                 <div>
                   <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Enter OTP</label>
                   <input type="text" value={enteredOtp} onChange={(e)=>setEnteredOtp(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '4px', fontSize: '1.2rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white', textAlign: 'center', letterSpacing: '8px' }} placeholder="------" required />
                 </div>

                 <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                   {loading ? 'VERIFYING...' : 'SECURE LOGIN'} {!loading && <ArrowRight size={18} />}
                 </button>
                 <button type="button" onClick={() => setShowOtp(false)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', marginTop: '8px' }}>
                   Cancel & Go Back
                 </button>
               </form>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
