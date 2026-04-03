import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Users, Activity, ShieldAlert, Search, Database, Trash2, Lock, Unlock, CreditCard, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const sidebarItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'User Control' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'security', label: 'Security' }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const loadAdminData = async ({ silent = false } = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');
    try {
      const [usersRes, txRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/admin/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const txData = await txRes.json();

      if (!usersRes.ok) {
        throw new Error(usersData.message || 'Failed to load users');
      }
      if (!txRes.ok) {
        throw new Error(txData.message || 'Failed to load transactions');
      }

      setUsers(usersData.data || []);
      setTransactions(txData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem('adminUser') || 'null');
    setAdminUser(storedAdmin);
    loadAdminData();
  }, [router]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.name, user.email, user.phone, user.accountType, user.accountStatus]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search, users]);

  const filteredTransactions = useMemo(() => {
    const query = transactionSearch.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((tx) =>
      [
        tx.transaction_type,
        tx.sender_name,
        tx.receiver_name,
        tx.beneficiary_name,
        tx.reference_id,
        tx.description
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [transactionSearch, transactions]);

  const activeCount = users.filter((user) => user.is_active).length;
  const inactiveCount = users.filter((user) => !user.is_active).length;
  const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const latestUsers = users.slice(0, 5);

  const updateUserState = async (userId, isActive) => {
    setBusyUserId(userId);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to update user');
      }

      setMessage(data.message || `User ${isActive ? 'activated' : 'deactivated'} successfully`);
      await loadAdminData({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm('This will permanently delete the user and related account data. Continue?');
    if (!confirmed) return;

    setBusyUserId(userId);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to delete user');
      }

      setMessage(data.message || 'User deleted successfully');
      await loadAdminData({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyUserId(null);
    }
  };

  const signOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const cardStyle = {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '22px 24px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', display: 'flex' }}>
      <Head>
        <title>Admin Dashboard | LuxBank</title>
      </Head>

      <aside
        style={{
          width: '280px',
          borderRight: '1px solid #1e293b',
          background: 'linear-gradient(180deg, #111827 0%, #020617 100%)',
          padding: '30px 20px'
        }}
      >
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '18px' }}>LuxBank Admin</div>
        <div style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>
          Primary administrator only.
          <div style={{ color: '#e2e8f0', marginTop: '8px', fontWeight: 700 }}>{adminUser?.email || 'Configured via .env'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: activeSection === item.id ? 'rgba(220,38,38,0.12)' : 'transparent',
                color: activeSection === item.id ? '#f87171' : '#cbd5e1',
                border: activeSection === item.id ? '1px solid rgba(220,38,38,0.2)' : '1px solid transparent',
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, padding: '34px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', color: 'white', fontWeight: 800, marginBottom: '8px' }}>Administrator Control Panel</h1>
            <p style={{ color: '#94a3b8' }}>Manage users directly from the primary admin account.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadAdminData({ silent: true })}
              disabled={refreshing}
              style={{ height: '46px', padding: '0 18px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: refreshing ? 0.7 : 1 }}
            >
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Syncing...' : 'Sync All'}
            </button>
            <button
              onClick={signOut}
              style={{ height: '46px', padding: '0 18px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {message && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', color: '#86efac' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {activeSection === 'overview' && (
          <section style={{ display: 'grid', gap: '20px' }}>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '18px' }}>
              {[
                { icon: Users, label: 'Total Users', value: String(users.length) },
                { icon: Unlock, label: 'Active Users', value: String(activeCount) },
                { icon: Lock, label: 'Inactive Users', value: String(inactiveCount) },
                { icon: Activity, label: 'Transaction Volume', value: `₹${totalVolume.toLocaleString()}` }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ ...cardStyle, padding: '22px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Icon size={22} color="#60a5fa" />
                    </div>
                    <div style={{ color: '#94a3b8', marginBottom: '6px' }}>{item.label}</div>
                    <div style={{ fontSize: '1.7rem', color: 'white', fontWeight: 800 }}>{item.value}</div>
                  </div>
                );
              })}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px' }}>Latest Users</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {latestUsers.map((user) => (
                    <div key={user.id} style={{ padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ color: 'white', fontWeight: 700 }}>{user.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>{user.email}</div>
                      <div style={{ color: user.is_active ? '#4ade80' : '#f87171', fontSize: '0.82rem', marginTop: '8px', textTransform: 'uppercase', fontWeight: 800 }}>
                        {user.is_active ? 'active' : 'inactive'}
                      </div>
                    </div>
                  ))}
                  {!latestUsers.length && <div style={{ color: '#94a3b8' }}>No users yet.</div>}
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px' }}>Recent Transactions</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} style={{ padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ color: 'white', fontWeight: 700, textTransform: 'capitalize' }}>{tx.transaction_type}</div>
                        <div style={{ color: '#93c5fd', fontWeight: 800 }}>₹{Number(tx.amount).toLocaleString()}</div>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
                        {tx.sender_name || 'External'} to {tx.receiver_name || tx.beneficiary_name || 'External'}
                      </div>
                    </div>
                  ))}
                  {!transactions.length && (
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={16} />
                      No transactions available yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </section>
        )}

        {activeSection === 'users' && (
          <section style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>User Management</h2>
                <p style={{ color: '#94a3b8' }}>Search, activate, deactivate, or delete customers.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user..."
                  style={{ width: '240px', height: '42px', padding: '0 14px 0 38px', borderRadius: '10px', border: '1px solid #334155', background: '#020617', color: 'white' }}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '28px 24px', color: '#94a3b8' }}>Loading admin data...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(15,23,42,0.75)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.74rem' }}>
                      <th style={{ textAlign: 'left', padding: '14px 24px' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '14px 24px' }}>Contact</th>
                      <th style={{ textAlign: 'left', padding: '14px 24px' }}>Account</th>
                      <th style={{ textAlign: 'left', padding: '14px 24px' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '14px 24px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                        <td style={{ padding: '18px 24px', color: 'white', fontWeight: 700 }}>
                          <div>{user.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px' }}>Joined {new Date(user.created_at).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '18px 24px', color: '#cbd5e1' }}>
                          <div>{user.email}</div>
                          <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px' }}>{user.phone || 'No phone'}</div>
                        </td>
                        <td style={{ padding: '18px 24px', color: '#cbd5e1', textTransform: 'capitalize' }}>{user.accountType || 'domestic'}</td>
                        <td style={{ padding: '18px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '7px 10px', borderRadius: '999px', background: user.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: user.is_active ? '#4ade80' : '#f87171', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                            {user.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              disabled={busyUserId === user.id || user.is_active}
                              onClick={() => updateUserState(user.id, true)}
                              style={{ height: '34px', padding: '0 12px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(34,197,94,0.08)', color: '#86efac', fontWeight: 700, cursor: 'pointer', opacity: busyUserId === user.id || user.is_active ? 0.55 : 1 }}
                            >
                              Activate
                            </button>
                            <button
                              disabled={busyUserId === user.id || !user.is_active}
                              onClick={() => updateUserState(user.id, false)}
                              style={{ height: '34px', padding: '0 12px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.18)', background: 'rgba(245,158,11,0.08)', color: '#fbbf24', fontWeight: 700, cursor: 'pointer', opacity: busyUserId === user.id || !user.is_active ? 0.55 : 1 }}
                            >
                              Deactivate
                            </button>
                            <button
                              disabled={busyUserId === user.id}
                              onClick={() => deleteUser(user.id)}
                              style={{ height: '34px', padding: '0 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontWeight: 700, cursor: 'pointer', opacity: busyUserId === user.id ? 0.55 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredUsers.length && (
                      <tr>
                        <td colSpan="5" style={{ padding: '28px 24px', color: '#94a3b8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Database size={18} />
                            No users match the current search.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === 'transactions' && (
          <section style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Transaction Monitor</h2>
                <p style={{ color: '#94a3b8' }}>Search recent transfers, deposits, and service charges.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  placeholder="Search transaction..."
                  style={{ width: '260px', height: '42px', padding: '0 14px 0 38px', borderRadius: '10px', border: '1px solid #334155', background: '#020617', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.75)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.74rem' }}>
                    <th style={{ textAlign: 'left', padding: '14px 24px' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px' }}>From / To</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px' }}>Reference</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '14px 24px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                      <td style={{ padding: '18px 24px', color: 'white', fontWeight: 700, textTransform: 'capitalize' }}>{tx.transaction_type}</td>
                      <td style={{ padding: '18px 24px', color: '#cbd5e1' }}>{tx.sender_name || 'External'} to {tx.receiver_name || tx.beneficiary_name || 'External'}</td>
                      <td style={{ padding: '18px 24px', color: '#94a3b8' }}>{tx.reference_id || 'N/A'}</td>
                      <td style={{ padding: '18px 24px', color: '#93c5fd', fontWeight: 800 }}>₹{Number(tx.amount).toLocaleString()}</td>
                      <td style={{ padding: '18px 24px', color: '#94a3b8' }}>{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!filteredTransactions.length && (
                    <tr>
                      <td colSpan="5" style={{ padding: '28px 24px', color: '#94a3b8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CreditCard size={16} />
                          No transactions match the current search.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === 'security' && (
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <section style={cardStyle}>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Admin Access</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '18px' }}>
                This portal is locked to the primary administrator configured in the backend environment.
              </p>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.16)' }}>
                <div style={{ color: '#f87171', fontWeight: 800, marginBottom: '6px' }}>Primary Admin Email</div>
                <div style={{ color: '#fecaca', lineHeight: 1.6 }}>{adminUser?.email || 'Configured via .env'}</div>
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>System Status</h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#86efac', fontWeight: 700 }}>
                  <ShieldAlert size={18} />
                  Primary admin control active
                </div>
                <div style={{ color: '#94a3b8' }}>Users synced: {users.length}</div>
                <div style={{ color: '#94a3b8' }}>Transactions synced: {transactions.length}</div>
                <button
                  onClick={() => loadAdminData({ silent: true })}
                  disabled={refreshing}
                  style={{ height: '44px', borderRadius: '12px', border: '1px solid #334155', background: '#020617', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: refreshing ? 0.7 : 1 }}
                >
                  {refreshing ? 'Syncing Data...' : 'Sync Admin Data'}
                </button>
              </div>
            </section>
          </section>
        )}

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
