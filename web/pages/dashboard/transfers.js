import { useEffect, useState } from 'react';
import Head from 'next/head';
import { ArrowRight, CheckCircle2, Landmark, Upload, User, Hash } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

function downloadReceipt(transaction, accountNumber) {
  const content = [
    'LuxBank Transaction Receipt',
    `Reference: ${transaction.reference_id}`,
    `Beneficiary: ${transaction.beneficiary_name || 'N/A'}`,
    `Amount: Rs ${Number(transaction.amount).toLocaleString()}`,
    `Type: ${transaction.transaction_type}`,
    `Description: ${transaction.description || 'N/A'}`,
    `Account: ${accountNumber}`,
    `Created: ${new Date(transaction.created_at).toLocaleString()}`
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${transaction.reference_id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Transfers() {
  const [formData, setFormData] = useState({ recipient: '', accountNum: '', amount: '', note: '', receiptName: '', receiptData: '' });
  const [account, setAccount] = useState(null);
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');
  const [transferResult, setTransferResult] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/users/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load account');
        setAccount(data.data.account);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        receiptName: file.name,
        receiptData: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const requestTransferOtp = async () => {
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/transfers/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start transfer');
      setTempToken(data.data.tempToken);
      setStep(2);
      setMessage('OTP sent to your registered email.');
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyTransfer = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/transfers/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tempToken, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify transfer');

      setTransferResult(data.data);
      setAccount(data.data.account);
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Head>
        <title>Fund Transfer | LuxBank</title>
      </Head>

      <Sidebar />

      <main style={{ marginLeft: '260px', padding: '34px' }}>
        <header style={{ marginBottom: '28px' }}>
          <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Transfer Funds</h1>
          <p style={{ color: 'var(--text-muted)' }}>Transfer amount must stay within your available balance, then confirm with OTP before money is debited.</p>
          <p style={{ color: '#93c5fd', marginTop: '8px' }}>Available balance: Rs {Number(account?.balance || 0).toLocaleString()}</p>
        </header>

        {message && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>{message}</div>}
        {error && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}

        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {step === 1 && (
            <section style={{ borderRadius: '24px', border: '1px solid var(--card-border)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '28px' }}>
              <div style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}><User size={16} style={{ display: 'inline', marginRight: '8px' }} />Recipient Name</label>
                  <input value={formData.recipient} onChange={(e) => setFormData((current) => ({ ...current, recipient: e.target.value }))} placeholder="e.g. Sarah Jenkins" style={{ width: '100%', height: '50px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}><Hash size={16} style={{ display: 'inline', marginRight: '8px' }} />Account Number</label>
                    <input value={formData.accountNum} onChange={(e) => setFormData((current) => ({ ...current, accountNum: e.target.value }))} placeholder="0000 1111 2222" style={{ width: '100%', height: '50px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}><Landmark size={16} style={{ display: 'inline', marginRight: '8px' }} />Description</label>
                    <input value={formData.note} onChange={(e) => setFormData((current) => ({ ...current, note: e.target.value }))} placeholder="Transfer note" style={{ width: '100%', height: '50px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>Amount to Send</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData((current) => ({ ...current, amount: e.target.value }))} placeholder="0.00" style={{ width: '100%', height: '58px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#0f172a', color: 'white', padding: '0 14px', fontSize: '1.3rem', fontWeight: 800 }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>Upload Existing Receipt</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '50px', borderRadius: '12px', border: '1px dashed #334155', background: '#111827', color: '#cbd5e1', padding: '0 14px', cursor: 'pointer' }}>
                    <Upload size={16} />
                    {formData.receiptName || 'Choose file'}
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <button onClick={requestTransferOtp} className="btn-primary" style={{ marginTop: '22px', width: '100%', height: '52px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem' }}>
                Request OTP <ArrowRight size={18} style={{ display: 'inline', marginLeft: '8px' }} />
              </button>
            </section>
          )}

          {step === 2 && (
            <section style={{ borderRadius: '24px', border: '1px solid rgba(59,130,246,0.22)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '28px' }}>
              <h2 style={{ color: 'white', fontSize: '1.7rem', fontWeight: 800, marginBottom: '12px' }}>Transfer OTP Verification</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Enter the OTP sent to your email to debit the amount and create the receipt.</p>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" style={{ width: '100%', height: '50px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#020617', color: 'white', padding: '0 14px', letterSpacing: '8px', textAlign: 'center' }} />
              <button onClick={verifyTransfer} className="btn-primary" style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: 800 }}>
                Verify and Send
              </button>
            </section>
          )}

          {step === 3 && transferResult && (
            <section style={{ borderRadius: '24px', border: '1px solid rgba(34,197,94,0.18)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '78px', height: '78px', borderRadius: '50%', margin: '0 auto 18px', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={40} color="#4ade80" />
              </div>
              <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Transfer Successful</h2>

              <div style={{ borderRadius: '18px', background: '#111827', padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                  <span style={{ color: '#94a3b8' }}>Total Sent</span>
                  <strong style={{ color: 'white' }}>Rs {Number(transferResult.transaction.amount).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                  <span style={{ color: '#94a3b8' }}>Transaction ID</span>
                  <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{transferResult.transaction.reference_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: '#94a3b8' }}>Remaining Balance</span>
                  <strong style={{ color: '#4ade80' }}>Rs {Number(transferResult.account.balance).toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button onClick={() => downloadReceipt(transferResult.transaction, transferResult.account.account_number)} style={{ flex: 1, height: '48px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'transparent', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                  Download Receipt
                </button>
                <button onClick={() => { setStep(1); setTransferResult(null); setOtp(''); setTempToken(''); setFormData({ recipient: '', accountNum: '', amount: '', note: '', receiptName: '', receiptData: '' }); }} className="btn-primary" style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: 800 }}>
                  New Transfer
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
