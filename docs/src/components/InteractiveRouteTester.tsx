import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export const InteractiveRouteTester: React.FC = () => {
  const [routePattern, setRoutePattern] = useState('/api/users/:userId/posts/:slug');
  const [testUrl, setTestUrl] = useState('/api/users/42/posts/hello-tinny');

  // Exact Tinny Backend regex compiler logic
  const paramNames: string[] = [];
  const cleanRoute = routePattern.replace(/(?<=.)\/+$/, '');
  const parsedPath = cleanRoute.replace(/:([^\/]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  
  let regexString = '';
  let isMatch = false;
  const extractedParams: Record<string, string> = {};

  try {
    const regex = new RegExp(`^${parsedPath}$`);
    regexString = regex.toString();
    
    // Normalize incoming test URL
    const cleanTest = testUrl.split('?')[0]?.replace(/(?<=.)\/+$/, '') || '';
    const match = cleanTest.match(regex);

    if (match) {
      isMatch = true;
      paramNames.forEach((name, idx) => {
        extractedParams[name] = match[idx + 1] || '';
      });
    }
  } catch (e) {
    regexString = 'Invalid regular expression';
  }

  return (
    <div className="playground-box">
      <div className="playground-title">
        <Sparkles size={18} color="var(--accent)" />
        <span>Live Route Matcher & Parameter Extractor</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
        Test how Tinny Backend's internal regex engine analyzes route paths and extracts dynamic URL parameters.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="playground-input-group">
          <label className="playground-label">Route Definition (server.add path)</label>
          <input
            type="text"
            className="playground-input"
            value={routePattern}
            onChange={(e) => setRoutePattern(e.target.value)}
            placeholder="/api/resource/:id"
          />
        </div>

        <div className="playground-input-group">
          <label className="playground-label">Incoming Request URL</label>
          <input
            type="text"
            className="playground-input"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="/api/resource/123"
          />
        </div>
      </div>

      <div className="playground-result-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>MATCH STATUS</span>
          {isMatch ? (
            <span className="status-badge match">
              <CheckCircle2 size={14} /> 200 Route Matched
            </span>
          ) : (
            <span className="status-badge no-match">
              <XCircle size={14} /> 404 No Match
            </span>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Compiled Regex: </span>
          <code style={{ fontSize: '0.85rem' }}>{regexString}</code>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
            Extracted req.params:
          </span>
          <pre style={{
            background: 'var(--code-bg)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: Object.keys(extractedParams).length > 0 ? 'var(--light-green)' : 'var(--muted)'
          }}>
            {JSON.stringify(extractedParams, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
