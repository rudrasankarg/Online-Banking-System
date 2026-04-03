import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Cards() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Credit & Debit Cards | LuxBank</title>
      </Head>

      <Navbar />

      <main style={{ flex: 1 }} className="container main-content">
        <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '16px', marginTop: '40px' }}>Cards designed for your lifestyle</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '1.1rem' }}>Earn unlimited rewards, lounge access, and exclusive privileges.</p>
        
        <div className="grid-3" style={{ paddingBottom: '80px' }}>
           {['Premium Travel Card', 'Cashback Credit Card', 'Lifetime Free Debit Card', 'Business Forex Card'].map(card => (
             <div key={card} className="card-dark" style={{ borderTop: '4px solid var(--primary)' }}>
                <CreditCard size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>{card}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Enjoy 5x reward points on online spends and comprehensive travel insurance.</p>
                <button onClick={() => router.push('/login')} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                   Apply Now <ArrowRight size={16} />
                </button>
             </div>
           ))}
        </div>
      </main>

      <ChatBot />
    </div>
  );
}
