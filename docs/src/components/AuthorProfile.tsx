import React from 'react';
import { ExternalLink, Mail, Code2, Sparkles, Star, GitFork, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export const AuthorProfile: React.FC = () => {
  return (
    <div className="author-page-wrapper">
      {/* Hero Profile Banner */}
      <div className="author-hero-card">
        <div className="author-avatar-wrapper">
          <img
            src="./imgs/logo-icon-no-bg.png"
            alt="Yassine Ajagrou"
            className="author-avatar-img"
          />
          <div className="author-status-dot" title="Active Core Maintainer" />
        </div>

        <div className="author-hero-details">
          <div className="author-badge-row">
            <span className="author-tag primary">Creator & Core Maintainer</span>
            <span className="author-tag accent">@iaceene</span>
          </div>

          <h1 className="author-name">Yassine Ajagrou</h1>
          <p className="author-headline">
            Software Engineer & Creator of <strong>tinny-backend</strong>. Focused on high-performance backend systems, minimalist runtime architectures, and developer tooling.
          </p>

          <div className="author-social-buttons">
            <a
              href="https://github.com/iaceene"
              target="_blank"
              rel="noopener noreferrer"
              className="author-btn github"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span>GitHub (@iaceene)</span>
              <ExternalLink size={14} />
            </a>

            <a
              href="https://www.linkedin.com/in/iaceene"
              target="_blank"
              rel="noopener noreferrer"
              className="author-btn linkedin"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37z" />
              </svg>
              <span>LinkedIn (iaceene)</span>
              <ExternalLink size={14} />
            </a>

            <a
              href="mailto:yassineajagrou8@gmail.com"
              className="author-btn email"
            >
              <Mail size={16} />
              <span>Contact Email</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="author-grid">
        <div className="author-card">
          <div className="author-card-header">
            <Code2 size={20} className="text-primary" />
            <h3 className="author-card-title">Creator & Vision</h3>
          </div>
          <p className="author-card-text">
            Yassine created <strong>tinny-backend</strong> to solve a persistent frustration in the JavaScript backend ecosystem: heavyweight abstractions with dozens of transitive dependencies that compromise transparency and performance.
          </p>
          <p className="author-card-text">
            With tinny-backend, everything you need—routing, WebSockets, static file recursive hosting, and cookie sessions—lives in a lightweight, single-package architecture designed for modern Node.js and Bun.
          </p>
        </div>

        <div className="author-card">
          <div className="author-card-header">
            <ShieldCheck size={20} className="text-accent" />
            <h3 className="author-card-title">Open Source Philosophy</h3>
          </div>
          <p className="author-card-text">
            Believer in zero-bloat software, transparent codebases, and strong developer ergonomics. Tinny-backend is maintained under the MIT License and remains free and open for developers worldwide.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="author-skill-pill">TypeScript</span>
            <span className="author-skill-pill">Node.js</span>
            <span className="author-skill-pill">Bun</span>
            <span className="author-skill-pill">WebSockets</span>
            <span className="author-skill-pill">System Architecture</span>
          </div>
        </div>
      </div>

      {/* Repository Callout */}
      <div className="author-repo-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Star size={24} className="text-primary" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--white)' }}>
              Support the Project on GitHub
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Star the repository, open feature requests, or contribute to upcoming RFCs.
            </div>
          </div>
        </div>

        <a
          href="https://github.com/iaceene/tinny-backend"
          target="_blank"
          rel="noopener noreferrer"
          className="author-star-btn"
        >
          <Star size={16} />
          <span>Star on GitHub</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
