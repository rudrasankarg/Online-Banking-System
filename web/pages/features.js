import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Landmark, CreditCard, Home, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Features() {
  const products = [
    { title: 'Personal Loans', desc: 'Quick approval, low interest rates.', icon: <Home size={32} /> },
    { title: 'Credit Cards', desc: 'Earn rewards on every spend.', icon: <CreditCard size={32} /> },
    { title: 'Savings Accounts', desc: 'Secure your future with high ROI.', icon: <Landmark size={32} /> },
    { title: 'Instant Car Loans', desc: 'Drive home your dream car today.', icon: <Zap size={32} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Features & Products | LuxBank</title>
      </Head>

      <Navbar />

      <main className="container main-content" style={{ paddingBottom: '80px', flex: 1 }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '60px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
          <div>
             <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Discover Better Money Choices</h1>
             <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
               Whether you want to save for the future, finance a new home, or find the perfect credit card, 
               LuxBank has tailor-made solutions to fit your lifestyle.
             </p>
             <button style={{ background: 'var(--secondary)', color: 'white', padding: '12px 32px', borderRadius: '4px', fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               Explore Offers <ArrowRight size={18} />
             </button>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '40px', borderRadius: '50%', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
             <Shield size={120} color="var(--primary)" />
          </div>
        </div>

        <div style={{ marginTop: '80px' }}>
           <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '32px' }}>Featured Products</h2>
           <div className="grid-4">
              {products.map((p, i) => (
                 <div key={i} className="card-dark">
                    <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                       {p.icon}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>{p.title}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{p.desc}</p>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>Apply Now <ArrowRight size={14} /></span>
                 </div>
              ))}
           </div>
        </div>
      </main>
      
      <ChatBot />

      <footer style={{ background: '#020617', color: 'white', padding: '40px 0', borderTop: '2px solid var(--card-border)', textAlign: 'center' }}>
         <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>© 2024 LuxBank International.</p>
      </footer>
    </div>
  );
}
