import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Home, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Loans() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Loans & Financing | LuxBank</title>
      </Head>

      <Navbar />

      <main style={{ flex: 1 }} className="container main-content">
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '16px', marginTop: '40px' }}>Explore Our Loan Products</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '1.1rem' }}>Get instant approvals and competitive rates, with zero documentation for pre-approved customers.</p>
        
        <div className="grid-3" style={{ paddingBottom: '80px' }}>
           {['Personal Loan', 'Home Loan', 'Auto Loan', 'Education Loan', 'Business Loan'].map(loan => (
             <div key={loan} className="card-dark" style={{ borderTop: '4px solid var(--primary)' }}>
                <Home size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>{loan}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Flexible tenures tailored exactly to your needs. Zero prepay penalty.</p>
                <button onClick={() => router.push('/login')} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                   Login to Apply <ArrowRight size={16} />
                </button>
             </div>
           ))}
        </div>
      </main>

      <ChatBot />
    </div>
  );
}
