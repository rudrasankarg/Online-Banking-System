import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Eye, Lock, Plus, Shield, Unlock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function CardManagement() {
  const [cards, setCards] = useState([]);
  const [otpState, setOtpState] = useState({ cardId: null, action: '', tempToken: '', otp: '' });
  const [cvv, setCvv] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load cards');
      setCards(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const startCardAction = async (cardId, action) => {
    setMessage('');
    setError('');
    setCvv('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/cards/${cardId}/action/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start card action');
      setOtpState({ cardId, action, tempToken: data.data.tempToken, otp: '' });
      setMessage(`OTP sent for ${action.replace('_', ' ')} action.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyCardAction = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/cards/${otpState.cardId}/action/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tempToken: otpState.tempToken, otp: otpState.otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify card action');

      if (otpState.action === 'view_cvv') {
        setCvv(data.data.cvv);
      } else {
        setMessage(`Card ${data.data.status === 'inactive' ? 'locked' : 'unlocked'} successfully.`);
        await loadCards();
      }

      setOtpState({ cardId: null, action: '', tempToken: '', otp: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const applyNewCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/cards/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cardType: 'Visa Signature' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to apply for card');
      setMessage('New card created successfully.');
      await loadCards();
    } catch (err) {
      setError(err.message);
    }
  };

  const hasInactiveCard = cards.some((card) => card.status !== 'active');

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Head>
        <title>Card Management | LuxBank</title>
      </Head>

      <Sidebar />

      <main style={{ marginLeft: '260px', padding: '34px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>My Cards</h1>
            <p style={{ color: 'var(--text-muted)' }}>Lock, unlock, inspect CVV, and apply for replacement cards with OTP verification.</p>
          </div>
          <button className="btn-primary" onClick={applyNewCard} style={{ height: '46px', padding: '0 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
            <Plus size={18} />
            Apply for New Card
          </button>
        </header>

        {message && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>{message}</div>}
        {error && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr', gap: '22px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            {cards.map((card) => (
              <div key={card.id} style={{ borderRadius: '24px', padding: '28px', minHeight: '220px', color: 'white', background: 'linear-gradient(135deg, #2563eb, #1d4ed8, #0f172a)', boxShadow: '0 20px 45px rgba(15,23,42,0.28)', opacity: card.status === 'active' ? 1 : 0.75 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <strong>{card.card_type}</strong>
                  <span style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.16)', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800 }}>{card.status}</span>
                </div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '0.18em', fontSize: '1.5rem', marginBottom: '18px' }}>{card.card_number}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '6px' }}>Expiry</div>
                    <strong>{new Date(card.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' })}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '6px' }}>Account</div>
                    <strong>{card.account_number}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '18px' }}>
            <section style={{ borderRadius: '22px', border: '1px solid var(--card-border)', background: '#111827', padding: '24px' }}>
              <h2 style={{ color: 'white', fontWeight: 800, marginBottom: '14px' }}>OTP Card Controls</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>Every sensitive card action sends an OTP to the registered user email before changing card state.</p>
              {cards.map((card) => (
                <div key={card.id} style={{ borderTop: '1px solid rgba(148,163,184,0.12)', padding: '14px 0' }}>
                  <div style={{ color: 'white', fontWeight: 700, marginBottom: '10px' }}>{card.card_type}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => startCardAction(card.id, card.status === 'active' ? 'lock' : 'unlock')} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {card.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                      {card.status === 'active' ? 'Lock Card' : 'Unlock Card'}
                    </button>
                    <button onClick={() => startCardAction(card.id, 'view_cvv')} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.22)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={16} />
                      View CVV
                    </button>
                  </div>
                </div>
              ))}
              {hasInactiveCard && (
                <button onClick={applyNewCard} className="btn-primary" style={{ width: '100%', marginTop: '12px', height: '44px', borderRadius: '12px', fontWeight: 800 }}>
                  Apply for Replacement Card
                </button>
              )}
            </section>

            {otpState.tempToken && (
              <section style={{ borderRadius: '22px', border: '1px solid rgba(59,130,246,0.22)', background: 'rgba(59,130,246,0.08)', padding: '24px' }}>
                <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '12px' }}>Verify OTP</h3>
                <input value={otpState.otp} onChange={(e) => setOtpState((current) => ({ ...current, otp: e.target.value }))} placeholder="Enter OTP" style={{ width: '100%', height: '46px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#020617', color: 'white', padding: '0 14px', letterSpacing: '6px', textAlign: 'center' }} />
                <button onClick={verifyCardAction} className="btn-primary" style={{ width: '100%', height: '44px', borderRadius: '12px', fontWeight: 800 }}>
                  Confirm Action
                </button>
              </section>
            )}

            {cvv && (
              <section style={{ borderRadius: '22px', border: '1px solid rgba(34,197,94,0.22)', background: 'rgba(34,197,94,0.08)', padding: '24px' }}>
                <div style={{ color: '#86efac', fontWeight: 800, marginBottom: '8px' }}>CVV Unlocked</div>
                <div style={{ color: 'white', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.2em' }}>{cvv}</div>
                <p style={{ color: '#cbd5e1', marginTop: '8px' }}>Treat this as sensitive information.</p>
              </section>
            )}

            <section style={{ borderRadius: '22px', border: '1px solid var(--card-border)', background: '#111827', padding: '24px' }}>
              <h3 style={{ color: 'white', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#60a5fa" />
                Security Advice
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>Locking a card makes it inactive immediately. Once inactive, a replacement card can be requested right away from this page.</p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
