import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Landmark, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Accounts() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Bank Accounts | LuxBank</title>
      </Head>

      <Navbar />

      <main style={{ flex: 1 }} className="container main-content">
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '16px', marginTop: '40px' }}>Accounts that work for you</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '1.1rem' }}>From high-yield savings to premium current accounts, we've got you covered.</p>
        
        <div className="grid-3" style={{ paddingBottom: '80px' }}>
           {['Premium Savings', 'Salary Account', 'Current Account', 'Student Account'].map(acc => (
             <div key={acc} className="card-dark" style={{ borderTop: '4px solid var(--primary)' }}>
                <Landmark size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>{acc}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Enjoy industry-leading interest rates and exclusive lifestyle benefits.</p>
                <button onClick={() => router.push('/register')} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                   Open Account <ArrowRight size={16} />
                </button>
             </div>
           ))}
        </div>
      </main>

      <ChatBot />
    </div>
  );
}
