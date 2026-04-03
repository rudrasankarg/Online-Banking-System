import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { Landmark, Lock, User, ArrowRight, Mail, Phone, Globe } from 'lucide-react';
import { useRouter } from 'next/router';
import { API_BASE_URL } from '../utils/apiConfig';

export default function Register() {
  const [formData, setFormData] = useState({
     firstName: '', lastName: '', email: '', password: '', phone: '', country: 'India'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  
  const router = useRouter();

  const validateEmail = (email) => {
    const validDomains = ['gmail.com', 'yahoo.com', 'proton.me', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1];
    return validDomains && validDomains.includes(domain);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(formData.email)) {
      setError('Please use a real email provider (gmail, yahoo, proton, outlook, hotmail).');
      return;
    }
    if (formData.country === 'India' && !/^\d{10}$/.test(formData.phone)) {
      setError('Indian mobile numbers must be exactly 10 digits.');
      return;
    } else if (formData.phone.length < 7) {
      setError('Please enter a valid mobile number.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be 8-20 characters, containing at least one uppercase letter, one number, and one special character.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          country: formData.country,
          accountType: formData.country === 'India' ? 'domestic' : 'nri'
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'OTP dispatch failed');
      }

      setTempToken(data.data.tempToken);
      setShowOtp(true);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please start the backend API.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/user/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp: enteredOtp })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store token and redirect
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server is offline. Please start the backend API.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Create Account | LuxBank</title>
      </Head>
      
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '130px 24px 48px', margin: '0 auto', maxWidth: '1000px', width: '100%' }}>
        <div style={{ width: '100%', background: 'var(--card-bg)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
          
          <div style={{ flex: '40%', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', color: 'white', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
             <div style={{ zIndex: 10, position: 'relative' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                   <Landmark color="white" size={32} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Join LuxBank Today</h1>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>
                   Experience premium banking features tailored for modern, global citizens.
                </p>
             </div>
             
             <ul style={{ zIndex: 10, position: 'relative', marginTop: '48px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#bfdbfe' }}>
                   <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '50%' }}><Lock size={14} /></div>
                   Bank Level Security & Encryption
                </li>
             </ul>

             <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '256px', height: '256px', background: 'rgba(59,130,246,0.15)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
          </div>

          <div style={{ flex: '60%', padding: '48px' }}>
             {!showOtp ? (
               <form onSubmit={handleRequestOtp} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 'bold' }}>Create Your Account</h2>
                 
                 {error && (
                   <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
                     {error}
                   </div>
                 )}

                 <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>First Name</label>
                      <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }} placeholder="John" required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Last Name</label>
                      <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }} placeholder="Doe" required />
                    </div>
                 </div>

                 <div>
                   <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                   <div style={{ position: 'relative' }}>
                     <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                     <input name="email" value={formData.email} onChange={handleChange} type="email" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }} placeholder="Real emails only (gmail, yahoo)" required />
                   </div>
                 </div>

                 <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: '40%' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Country</label>
                      <div style={{ position: 'relative' }}>
                        <Globe style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={16} />
                        <select name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }}>
                          <option value="India">India</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="UAE">UAE</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ flex: '60%' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={16} />
                        <input name="phone" value={formData.phone} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }} placeholder="Mobile Number" required />
                      </div>
                    </div>
                 </div>

                 <div>
                   <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Password</label>
                   <div style={{ position: 'relative' }}>
                     <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                     <input name="password" value={formData.password} onChange={handleChange} type="password" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '4px', fontSize: '1rem', background: '#0f172a', border: '1px solid var(--card-border)', color: 'white' }} placeholder="••••••••" required />
                   </div>
                 </div>

                 <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                   {loading ? 'SENDING OTP...' : 'SEND OTP'} {!loading && <ArrowRight size={18} />}
                 </button>
               </form>
             ) : (
               <form onSubmit={handleRegister} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 'bold' }}>Verify Authentication</h2>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We validated your request and sent a secure 6-digit One-Time Password to {formData.email}. Please check your inbox.</p>
                 
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
                   {loading ? 'CREATING ACCOUNT...' : 'VERIFY & CREATE'} {!loading && <ArrowRight size={18} />}
                 </button>
                 <button type="button" onClick={() => setShowOtp(false)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', marginTop: '8px' }}>
                   Go Back
                 </button>
               </form>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
