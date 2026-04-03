import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { Phone, Mail, MapPin, ArrowRight, Clock, MessageCircle } from 'lucide-react';

export default function Support() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Support & Contact | LuxBank</title>
      </Head>

      <Navbar />

      <main className="container main-content" style={{ paddingBottom: '80px', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
           <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>How can we help you?</h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              We're here to help and answer any question you might have. We look forward to hearing from you.
           </p>
        </div>

        <div className="grid-3" style={{ marginBottom: '60px' }}>
           <div className="card-dark" style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                 <Phone size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Call Now</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Toll Free 24/7 Support</p>
              <a href="tel:+18001234567" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '24px' }}>1-800-123-4567</a>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Clock size={14} /> Average wait time: 2 mins</p>
           </div>

           <div className="card-dark" style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                 <Mail size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Email Us</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>For general inquiries</p>
              <a href="mailto:support@luxbank.com" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '24px' }}>support@luxbank.com</a>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Clock size={14} /> Response within 24 hours</p>
           </div>

           <div className="card-dark" style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                 <MapPin size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Visit Us</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Visit your nearest LuxBank ATM/Bank</p>
              <button 
                onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        window.open(`https://www.google.com/maps/search/bank/@${latitude},${longitude},14z/data=!3m1!4b1`, '_blank');
                      },
                      (error) => {
                        alert("Geolocation access denied. Opening generic map.");
                        window.open(`https://www.google.com/maps/search/bank`, '_blank');
                      }
                    );
                  } else {
                    window.open(`https://www.google.com/maps/search/bank`, '_blank');
                  }
                }}
                className="btn-primary" 
                style={{ padding: '8px 16px', fontSize: '14px', marginTop: '16px' }}
              >
                 Find Nearest Branch
              </button>
           </div>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '40px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
           <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Prefer to type?</h2>
              <p style={{ color: 'var(--text-muted)' }}>Luxie, our virtual assistant, is available 24/7 to solve your queries instantly.</p>
           </div>
           <button 
             onClick={() => document.getElementById('luxie-chatbot-toggle')?.click()} 
             className="btn-primary" 
             style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', padding: '16px 32px' }}
           >
              Chat With Luxie <MessageCircle size={20} />
           </button>
        </div>
      </main>
      
      <ChatBot />

      <footer style={{ background: '#020617', color: 'white', padding: '40px 0', borderTop: '2px solid var(--card-border)', textAlign: 'center' }}>
         <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>© 2024 LuxBank International.</p>
      </footer>
    </div>
  );
}
