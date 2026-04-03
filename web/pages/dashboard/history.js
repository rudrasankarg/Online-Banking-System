import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, FileText, Filter, Search } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

function downloadReceiptFile(transaction) {
  const content = transaction.receipt_data
    ? transaction.receipt_data
    : [
        'LuxBank Transaction Receipt',
        `Reference: ${transaction.reference_id}`,
        `Beneficiary: ${transaction.beneficiary_name || 'N/A'}`,
        `Amount: Rs ${Number(transaction.amount).toLocaleString()}`,
        `Type: ${transaction.transaction_type}`,
        `Description: ${transaction.description || 'N/A'}`,
        `Created: ${new Date(transaction.created_at).toLocaleString()}`
      ].join('\n');

  const isDataUrl = typeof content === 'string' && content.startsWith('data:');
  const link = document.createElement('a');
  if (isDataUrl) {
    link.href = content;
    link.download = transaction.receipt_name || `${transaction.reference_id}.png`;
  } else {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${transaction.reference_id}.txt`;
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  link.click();
}

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/users/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load transactions');
        setTransactions(data.data || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const text = [transaction.beneficiary_name, transaction.description, transaction.reference_id].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesType = type === 'all' || transaction.transaction_type === type;
      return matchesQuery && matchesType;
    });
  }, [transactions, query, type]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Head>
        <title>Transaction History | LuxBank</title>
      </Head>

      <Sidebar />

      <main style={{ marginLeft: '260px', padding: '34px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Transaction History</h1>
            <p style={{ color: 'var(--text-muted)' }}>Search, filter, and download uploaded or generated receipts.</p>
          </div>
          <button style={{ height: '46px', padding: '0 18px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#111827', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <Download size={18} />
            Export Summary
          </button>
        </header>

        {error && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}

        <section style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by beneficiary, note, or reference..." style={{ width: '100%', height: '46px', padding: '0 14px 0 42px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#111827', color: 'white' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#111827', color: '#cbd5e1', height: '46px' }}>
            <Filter size={16} />
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white' }}>
              <option value="all">All</option>
              <option value="transfer">Transfers</option>
              <option value="service">Services</option>
            </select>
          </div>
        </section>

        <section style={{ borderRadius: '24px', border: '1px solid var(--card-border)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.6)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.74rem' }}>
                  <th style={{ textAlign: 'left', padding: '16px 20px' }}>Movement</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px' }}>Reference</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const positive = false;
                  return (
                    <tr key={transaction.id} style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: positive ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)' }}>
                            {positive ? <ArrowDownLeft size={18} color="#22c55e" /> : <ArrowUpRight size={18} color="#60a5fa" />}
                          </div>
                          <div>
                            <div style={{ color: 'white', fontWeight: 700 }}>{transaction.beneficiary_name || transaction.description || 'LuxBank Transaction'}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.84rem', textTransform: 'capitalize' }}>{transaction.transaction_type}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px', color: '#cbd5e1', fontFamily: 'monospace' }}>{transaction.reference_id}</td>
                      <td style={{ padding: '18px 20px', color: '#94a3b8' }}>{new Date(transaction.created_at).toLocaleString()}</td>
                      <td style={{ padding: '18px 20px', color: 'white', fontWeight: 800 }}>- Rs {Number(transaction.amount).toLocaleString()}</td>
                      <td style={{ padding: '18px 20px' }}>
                        <button onClick={() => downloadReceiptFile(transaction)} style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'transparent', color: '#93c5fd', cursor: 'pointer' }}>
                          <FileText size={18} style={{ verticalAlign: 'middle' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!filteredTransactions.length && (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', color: '#94a3b8' }}>No transactions match your current search/filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
