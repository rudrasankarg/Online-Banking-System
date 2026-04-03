import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Filter, Plus, Search, Wallet, Wrench } from 'lucide-react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Sidebar';
import { API_BASE_URL } from '@/utils/apiConfig';

export default function Dashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState({ user: null, account: null, cards: [], services: [], transactions: [] });
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [serviceMessage, setServiceMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async (tokenValue) => {
    const headers = { Authorization: `Bearer ${tokenValue}` };

    const [dashboardRes, catalogRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/users/dashboard`, { headers }),
      fetch(`${API_BASE_URL}/api/users/services/catalog`, { headers })
    ]);

    const dashboardData = await dashboardRes.json();
    const catalogData = await catalogRes.json();
    if (!dashboardRes.ok) throw new Error(dashboardData.message || 'Failed to load dashboard');
    if (!catalogRes.ok) throw new Error(catalogData.message || 'Failed to load service catalog');
    setDashboard(dashboardData.data);
    setCatalog(catalogData.data);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    loadDashboard(token)
      .catch((err) => setError(err.message));
  }, [router]);

  const filteredTransactions = useMemo(() => {
    return (dashboard.transactions || []).filter((transaction) => {
      const matchesQuery = !query || [transaction.beneficiary_name, transaction.description, transaction.reference_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [dashboard.transactions, query, typeFilter]);

  const groupedCatalog = useMemo(() => {
    return {
      products: catalog.filter((item) => item.group === 'products'),
      services: catalog.filter((item) => item.group === 'services')
    };
  }, [catalog]);

  const createServiceRequest = async (serviceCode) => {
    setServiceMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ serviceCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request service');

      setServiceMessage(`${data.data.title} completed successfully.`);
      await loadDashboard(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const makeDeposit = async () => {
    const amount = window.prompt('Enter deposit amount');
    if (!amount) return;

    setServiceMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, note: 'Dashboard deposit' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to deposit amount');

      setServiceMessage(`Deposit successful. New balance: Rs ${Number(data.data.account.balance).toLocaleString()}`);
      await loadDashboard(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const userName = dashboard.user?.name || 'Customer';
  const account = dashboard.account;
  const hasInactiveCard = dashboard.cards.some((card) => card.status !== 'active');

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Head>
        <title>Dashboard | LuxBank</title>
      </Head>

      <Sidebar />

      <main style={{ marginLeft: '260px', padding: '34px 34px 40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', color: 'white', fontWeight: 800, marginBottom: '8px' }}>Good Morning, {userName}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Here&apos;s what&apos;s happening with your accounts today.</p>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions"
                style={{ width: '260px', height: '46px', padding: '0 16px 0 42px', borderRadius: '12px', border: '1px solid var(--card-border)', background: '#111827', color: 'white' }}
              />
            </div>
            <button className="btn-primary" onClick={() => router.push('/dashboard/transfers')} style={{ height: '46px', padding: '0 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
              <Plus size={18} />
              New Transaction
            </button>
          </div>
        </header>

        {error && <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}
        {serviceMessage && <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>{serviceMessage}</div>}

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '22px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 42%, #0f172a 100%)', padding: '30px', color: 'white', minHeight: '270px', boxShadow: '0 24px 50px rgba(37, 99, 235, 0.25)' }}>
            <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '999px', right: '-80px', top: '-40px', background: 'rgba(255,255,255,0.12)', filter: 'blur(10px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Wallet size={20} color="rgba(255,255,255,0.88)" />
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontWeight: 700 }}>Total Balance</span>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.16)', fontSize: '0.78rem', fontWeight: 700 }}>
                  {dashboard.user?.accountStatus || 'active'}
                </div>
              </div>

              <div style={{ fontSize: '3.1rem', fontWeight: 800, marginBottom: '28px' }}>Rs {Number(account?.balance || 0).toLocaleString()}</div>

              <div style={{ display: 'flex', gap: '34px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.83rem', marginBottom: '6px' }}>Account Number</div>
                  <div style={{ fontWeight: 700, letterSpacing: '0.1em' }}>{account?.account_number || 'Pending'}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.83rem', marginBottom: '6px' }}>Card Holder</div>
                  <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{userName}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.83rem', marginBottom: '6px' }}>Account Type</div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{dashboard.user?.accountType || 'domestic'}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: '24px', border: '1px solid var(--card-border)', background: 'linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 800, marginBottom: '10px' }}>Card Control Snapshot</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {dashboard.cards.length ? `${dashboard.cards.length} card(s) linked to your account.` : 'No cards linked yet.'}
              </p>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: '16px', background: '#111827', border: '1px solid var(--card-border)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>Primary Card Status</div>
              <div style={{ color: 'white', fontWeight: 800, textTransform: 'capitalize' }}>{dashboard.cards[0]?.status || 'No Card'}</div>
            </div>
            <Link href="/dashboard/cards" style={{ height: '46px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'transparent', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Manage Cards
            </Link>
            <button onClick={makeDeposit} style={{ height: '46px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.22)', background: 'rgba(34,197,94,0.08)', color: '#86efac', fontWeight: 800, cursor: 'pointer' }}>
              Deposit Money
            </button>
            {hasInactiveCard && (
              <button onClick={() => router.push('/dashboard/cards')} className="btn-primary" style={{ height: '46px', borderRadius: '12px', fontWeight: 800 }}>
                Apply for New Card
              </button>
            )}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '22px', marginBottom: '28px' }}>
          <div style={{ borderRadius: '24px', border: '1px solid var(--card-border)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 800 }}>Recent Transactions</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ height: '40px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--card-border)', background: '#111827', color: 'white' }}>
                  <option value="all">All</option>
                  <option value="transfer">Transfers</option>
                  <option value="service">Services</option>
                </select>
                <Link href="/dashboard/history" style={{ color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={16} />
                  View All
                </Link>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.18)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ textAlign: 'left', padding: '14px 12px' }}>Transaction</th>
                    <th style={{ textAlign: 'left', padding: '14px 12px' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '14px 12px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '14px 12px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 5).map((transaction) => {
                    const positive = false;
                    const Icon = positive ? ArrowDownLeft : ArrowUpRight;
                    return (
                      <tr key={transaction.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                        <td style={{ padding: '18px 12px', color: 'white', fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.12)' }}>
                              <Icon size={18} color="#60a5fa" />
                            </div>
                            <span>{transaction.beneficiary_name || transaction.description || 'LuxBank Transaction'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '18px 12px', color: '#cbd5e1', textTransform: 'capitalize' }}>{transaction.transaction_type}</td>
                        <td style={{ padding: '18px 12px', color: '#94a3b8' }}>{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '18px 12px', color: 'white', fontWeight: 800 }}>- Rs {Number(transaction.amount).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {!filteredTransactions.length && (
                    <tr>
                      <td colSpan="4" style={{ padding: '18px 12px', color: '#94a3b8' }}>No transactions match your filters yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ borderRadius: '24px', border: '1px solid var(--card-border)', background: 'linear-gradient(180deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))', padding: '24px' }}>
            <h3 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wrench size={18} color="#60a5fa" />
              Products & Services
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              The same products and services from the home-page selector are available directly inside the dashboard.
            </p>
            <div style={{ display: 'grid', gap: '18px', maxHeight: '620px', overflowY: 'auto', paddingRight: '4px' }}>
              {['products', 'services'].map((group) => (
                <div key={group}>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px' }}>
                    {group}
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {groupedCatalog[group].map((service) => (
                      <div key={service.code} style={{ border: '1px solid var(--card-border)', borderRadius: '14px', padding: '14px', background: '#111827' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                          <strong style={{ color: 'white' }}>{service.title}</strong>
                          <span style={{ color: '#93c5fd', fontWeight: 700 }}>{service.amount > 0 ? `Rs ${service.amount}` : 'Free'}</span>
                        </div>
                        <button onClick={() => createServiceRequest(service.code)} style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.22)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontWeight: 700, cursor: 'pointer' }}>
                          Request
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
