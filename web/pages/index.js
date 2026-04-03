import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { ArrowRight, Landmark } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [selectionType, setSelectionType] = useState('products');
  const [category, setCategory] = useState('');
  
  const productOptions = {
    'Accounts': ['Savings Account', 'Salary Account', 'Current Account'],
    'Cards': ['Premium Credit Card', 'Travel Credit Card', 'Debit Card'],
    'Loans': ['Personal Loan', 'Home Loan', 'Instant Car Loan']
  };

  const serviceOptions = {
    'Accounts': ['Open New Account', 'Account Statement', 'Upgrade Account'],
    'Payments': ['Utility Bill Payment', 'Credit Card Bill', 'Tax Payment'],
    'Requests': ['Order Cheque Book', 'Stop Payment', 'Update KYC']
  };

  const optionsMap = selectionType === 'products' ? productOptions : serviceOptions;

  const handleApply = () => {
    if (selectionType === 'products') {
      if (category === 'Accounts') router.push('/accounts');
      else if (category === 'Cards') router.push('/cards');
      else if (category === 'Loans') router.push('/loans');
      else router.push('/features');
    } else {
       router.push('/login'); // Services go to login/dashboard
    }
  };

  return (
    <div>
      <Head><title>Banking Solutions | LuxBank</title></Head>
      <Navbar />

      <main className="main-content">
        <section style={{ background: '#020617', height: '540px', position: 'relative', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }}></div>
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #020617 30%, transparent 100%)' }}></div>
           
           <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ maxWidth: '500px' }}>
                 <h1 style={{ fontSize: '3rem', color: 'white', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem' }}>
                    Experience <span style={{ color: 'var(--primary)'}}>LuxBank</span> Differently
                 </h1>
                 <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2rem' }}>
                    Introducing the New<br/>LuxBank App | NetBanking | Website
                 </p>
                 <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => router.push('/login')} style={{ background: 'var(--card-bg)', color: 'white', border: '1px solid var(--card-border)', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}>
                       User NetBanking <ArrowRight size={16} color="var(--secondary)" />
                    </button>
                    <button
                      onClick={() => router.push('/admin/login')}
                      style={{
                        background: 'rgba(239,68,68,0.12)',
                        color: '#fecaca',
                        border: '1px solid rgba(239,68,68,0.24)',
                        padding: '12px 24px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                       Admin Portal <ArrowRight size={16} color="#f87171" />
                    </button>
                 </div>
              </div>

              {/* Selection Box Dark Theme - Dynamic */}
              <div style={{ width: '420px', background: 'var(--card-bg)', borderRadius: '12px', padding: '24px', borderTop: '4px solid var(--primary)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', borderLeft: '1px solid var(--card-border)', borderRight: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
                 <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: selectionType === 'products' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
                       <input type="radio" name="selection" checked={selectionType === 'products'} onChange={() => { setSelectionType('products'); setCategory(''); }} /> Products
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: selectionType === 'services' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
                       <input type="radio" name="selection" checked={selectionType === 'services'} onChange={() => { setSelectionType('services'); setCategory(''); }} /> Services
                    </label>
                 </div>
                 <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--card-border)' }}>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '12px', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'white' }}>
                       <option value="">Select Type...</option>
                       {Object.keys(optionsMap).map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                    <select style={{ padding: '12px', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'white' }}>
                       <option>Select Option...</option>
                       {category && optionsMap[category].map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                       <button onClick={handleApply} className="btn-primary" style={{ padding: '10px 24px' }}>{selectionType === 'products' ? 'Apply Now' : 'Access Now'}</button>
                       <span onClick={() => router.push('/features')} style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Know More</span>
                    </div>
                 </div>
              </div>
           </div>

           <div style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: '800px', background: 'var(--card-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid var(--card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 20 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '16px' }}>L</div>
              <input type="text" placeholder="What are you looking for today?" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', background: 'transparent', color: 'white' }} />
              <ArrowRight color="var(--text-muted)" />
           </div>
        </section>

        {/* Tailored Solutions Dark Theme */}
        <section style={{ padding: '100px 0 60px 0' }}>
           <div className="container" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>Banking Solutions tailor-made for you</h2>
              
              <div style={{ display: 'inline-flex', gap: '3rem', borderBottom: '1px solid var(--card-border)', marginBottom: '3rem', fontWeight: '600' }}>
                 <span onClick={() => router.push('/features')} style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '12px', cursor: 'pointer' }}>Trending</span>
                 <span onClick={() => router.push('/accounts')} style={{ color: 'var(--text-muted)', paddingBottom: '12px', cursor: 'pointer' }}>Accounts</span>
                 <span onClick={() => router.push('/deposits')} style={{ color: 'var(--text-muted)', paddingBottom: '12px', cursor: 'pointer' }}>Deposits</span>
                 <span onClick={() => router.push('/cards')} style={{ color: 'var(--text-muted)', paddingBottom: '12px', cursor: 'pointer' }}>Cards</span>
                 <span onClick={() => router.push('/loans')} style={{ color: 'var(--text-muted)', paddingBottom: '12px', cursor: 'pointer' }}>Loans</span>
              </div>

              <div className="grid-3">
                 <div className="card-dark" style={{ textAlign: 'left', background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Cardless EASYEMI</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>A little magic for your summer upgrades!</p>
                    <button onClick={() => router.push('/loans')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Check Offer</button>
                    <div style={{ height: '120px' }}></div>
                 </div>
                 
                 <div className="card-dark" style={{ textAlign: 'left', background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Salary Account</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Manage your earnings, your way.</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                       <button
                         onClick={() => router.push('/register')}
                         className="btn-primary"
                         style={{
                           minWidth: '156px',
                           height: '44px',
                           padding: '0 18px',
                           fontSize: '14px',
                           borderRadius: '10px',
                           fontWeight: 800,
                           background: 'linear-gradient(135deg, #64748b, #475569)',
                           boxShadow: '0 10px 22px rgba(71, 85, 105, 0.28)'
                         }}
                       >
                         Open Instantly
                       </button>
                       <button
                         onClick={() => router.push('/accounts')}
                         style={{
                           minWidth: '128px',
                           height: '44px',
                           padding: '0 18px',
                           background: 'rgba(15, 23, 42, 0.55)',
                           color: 'white',
                           border: '1px solid #334155',
                           borderRadius: '10px',
                           cursor: 'pointer',
                           fontWeight: 700
                         }}
                       >
                         Know More
                       </button>
                    </div>
                    <div style={{ height: '120px' }}></div>
                 </div>

                 <div className="card-dark" style={{ textAlign: 'left', background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Personal Loan</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Get funds in 10 seconds. No documentation.</p>
                    <button onClick={() => router.push('/loans')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Apply Now</button>
                    <div style={{ height: '120px' }}></div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <ChatBot />

      <footer style={{ background: '#020617', color: 'white', padding: '40px 0', borderTop: '2px solid var(--card-border)' }}>
         <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ background: 'var(--secondary)', padding: '4px', borderRadius: '4px' }}><Landmark color="white" size={24} /></div>
               <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LuxBank</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
               <span style={{ cursor: 'pointer' }}>Security</span>
               <span style={{ cursor: 'pointer' }}>Privacy</span>
               <span style={{ cursor: 'pointer' }}>Terms</span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>© 2024 LuxBank International.</p>
         </div>
      </footer>
    </div>
  );
}
