import React from 'react';
import { ArrowDown, Check, Shield, Layers, Radio, Send } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '1.5rem',
      margin: '1.5rem 0 2rem'
    }}>
      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--white)' }}>
        <Layers size={18} color="var(--accent)" />
        <span>Tinny Backend Request-Response Pipeline</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '640px', margin: '0 auto' }}>
        {/* Step 1 */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>Incoming HTTP / WS Connection</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Socket connection event, IP extraction, reqCount incremented</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}><ArrowDown size={18} /></div>

        {/* Step 2 */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(134, 239, 172, 0.15)', color: 'var(--light-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>2</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>Request & Response Parsers</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>RequestParser: URL, query params, IP, RawBody stream. ResponseParser: cookies & send() methods</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}><ArrowDown size={18} /></div>

        {/* Step 3 */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>3</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>Route Matcher (Method + Regex)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Matches method (GET/POST/PUT/DELETE) and extracts dynamic route parameters (req.params)</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}><ArrowDown size={18} /></div>

        {/* Step 4 */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.25)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>4</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.95rem' }}>Route Middlewares & Handler Execution</div>
            <div style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>
              1. <code>middelWares[]</code> in sequence (short-circuit on res.writableEnded)<br/>
              2. Route <code>handler(req, res)</code><br/>
              3. Route <code>next(req, res)</code> post-handler callback
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}><ArrowDown size={18} /></div>

        {/* Step 5 */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>5</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>Global Middlewares (server.use)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Executes any registered fallback or global handlers</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}><ArrowDown size={18} /></div>

        {/* Step 6 */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>6</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>Default 404 Fallback</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>If !res.writableEnded, DefaultHandler sends 404 JSON ("Page not found")</div>
          </div>
        </div>
      </div>
    </div>
  );
};
