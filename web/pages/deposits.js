import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Landmark, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Deposits() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Fixed Deposits & Investments | LuxBank</title>
      </Head>

      <Navbar />

      <main style={{ flex: 1 }} className="container main-content">
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '16px', marginTop: '40px' }}>Secure your future</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '1.1rem' }}>High-yield deposits with assured returns and flexible tenures.</p>
        
        <div className="grid-3" style={{ paddingBottom: '80px' }}>
           {['Fixed Deposit (FD)', 'Recurring Deposit (RD)', 'Tax Saver FD (5 Years)'].map(deposit => (
             <div key={deposit} className="card-dark" style={{ borderTop: '4px solid var(--primary)' }}>
                <Landmark size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>{deposit}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 7.5% p.a. interest rates for senior citizens. Premature withdrawal allowed.</p>
                <button onClick={() => router.push('/login')} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                   Invest Now <ArrowRight size={16} />
                </button>
             </div>
           ))}
        </div>
      </main>

      <ChatBot />
    </div>
  );
}
