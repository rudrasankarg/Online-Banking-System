import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Globe, RefreshCw, Landmark, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function NRI() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>NRI & International Banking | LuxBank</title>
      </Head>

      <Navbar />

      <main style={{ flex: 1 }}>
        <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #020617)', padding: '100px 0', borderBottom: '1px solid var(--card-border)', textAlign: 'center' }}>
           <div className="container" style={{ maxWidth: '800px' }}>
              <Globe size={64} color="var(--primary)" style={{ margin: '0 auto 24px', opacity: 0.8 }} />
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>Global Reach, Local Comfort</h1>
              <p style={{ fontSize: '1.2rem', color: '#bfdbfe', marginBottom: '32px' }}>
                 Manage your Indian accounts from anywhere in the world. Enjoy seamless currency conversions, premium NRE/NRO accounts, and dedicated international relationship managers.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                 <button onClick={() => router.push('/register')} className="btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Open NRI Account</button>
                 <button onClick={() => router.push('/login')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 32px', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer' }}>Login to NetBanking</button>
              </div>
           </div>
        </section>

        <section className="container" style={{ padding: '80px 0' }}>
           <h2 style={{ fontSize: '2rem', color: 'white', textAlign: 'center', marginBottom: '48px' }}>International Banking Solutions</h2>
           
           <div className="grid-3">
              <div className="card-dark" style={{ textAlign: 'center' }}>
                 <Landmark size={40} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                 <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>NRE & NRO Accounts</h3>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Tax-free repatriable accounts tailored for your savings in India.</p>
                 <button onClick={() => router.push('/register')} className="btn-primary" style={{ width: '100%' }}>Apply Now</button>
              </div>

              <div className="card-dark" style={{ textAlign: 'center' }}>
                 <RefreshCw size={40} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                 <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>Multi-Currency Accounts</h3>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Hold and manage funds in USD, GBP, EUR, and 12 other currencies effortlessly.</p>
                 <button onClick={() => router.push('/register')} className="btn-primary" style={{ width: '100%' }}>Apply Now</button>
              </div>

              <div className="card-dark" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}>
                 <ArrowRight size={40} color="white" style={{ margin: '0 auto 16px' }} />
                 <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>Premium Remittances</h3>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Enjoy zero-fee incoming wire transfers and priority clearing.</p>
                 <button onClick={() => router.push('/features')} style={{ width: '100%', background: 'transparent', color: 'white', border: '1px solid var(--card-border)', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>Learn More</button>
              </div>
           </div>

           <div style={{ background: '#0f172a', borderRadius: '12px', padding: '40px', marginTop: '60px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
             <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '16px' }}>Need help choosing the right account?</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Our dedicated NRI concierge team is available 24/7 to assist you.</p>
             <button onClick={() => router.push('/support')} className="btn-primary" style={{ padding: '12px 32px' }}>Contact NRI Support</button>
           </div>
        </section>
      </main>

      <ChatBot />

      <footer style={{ background: '#020617', color: 'white', padding: '40px 0', borderTop: '2px solid var(--card-border)', textAlign: 'center' }}>
         <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>© 2024 LuxBank International. Regulated by Global Financial Standard Authority.</p>
      </footer>
    </div>
  );
}
