import React, { useState } from 'react';
import { Cookie, Plus, Trash2, List } from 'lucide-react';

interface CookieItem {
  key: string;
  value: string;
}

export const InteractiveCookieSimulator: React.FC = () => {
  const [cookies, setCookies] = useState<CookieItem[]>([
    { key: 'session_token', value: 's$9a8b7c6d5e' },
    { key: 'theme', value: 'dark' }
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddOrSet = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const existingIndex = cookies.findIndex((c) => c.key === newKey.trim());
    if (existingIndex !== -1) {
      // res.setCookie behavior
      const updated = [...cookies];
      updated[existingIndex].value = newValue.trim();
      setCookies(updated);
    } else {
      // res.addCookie behavior
      setCookies([...cookies, { key: newKey.trim(), value: newValue.trim() }]);
    }
    setNewKey('');
    setNewValue('');
  };

  const handleDelete = (key: string) => {
    setCookies(cookies.filter((c) => c.key !== key));
  };

  const allCookiesString = cookies.map((c) => `${c.key}=${c.value};`);

  return (
    <div className="playground-box">
      <div className="playground-title">
        <Cookie size={18} color="var(--accent)" />
        <span>Cookie State Simulator</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
        Simulate response cookie mutation with <code>res.addCookie()</code>, <code>res.setCookie()</code>, and <code>res.getAllCookies()</code>.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="playground-input"
          style={{ flex: 1, minWidth: '140px' }}
          placeholder="Cookie Key (e.g. auth)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <input
          type="text"
          className="playground-input"
          style={{ flex: 1, minWidth: '140px' }}
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <button
          onClick={handleAddOrSet}
          className="syntax-copy-btn"
          style={{ padding: '0.6rem 0.9rem', background: 'var(--surface-hover)', color: 'var(--white)' }}
        >
          <Plus size={15} />
          <span>Add / Update</span>
        </button>
      </div>

      <div className="playground-result-card">
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          CURRENT COOKIES ARRAY ({cookies.length})
        </div>

        {cookies.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No cookies set</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            {cookies.map((c) => (
              <div
                key={c.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface-card)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span>
                  <strong style={{ color: 'var(--light-green)' }}>{c.key}</strong> = <span style={{ color: 'var(--accent)' }}>"{c.value}"</span>
                </span>
                <button
                  onClick={() => handleDelete(c.key)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          res.getAllCookies() Output:
        </div>
        <pre style={{
          background: 'var(--code-bg)',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-mono)',
          color: '#D1D5DB'
        }}>
          {JSON.stringify(allCookiesString, null, 2)}
        </pre>
      </div>
    </div>
  );
};
