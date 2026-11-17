import React, { useState, useEffect } from 'react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import { docsSections, DocSection } from '../data/docsContent';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectSection }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = docsSections.filter((sec) => {
    const q = query.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.category.toLowerCase().includes(q) ||
      sec.description.toLowerCase().includes(q) ||
      sec.content.some((c) => c.text?.toLowerCase().includes(q) || c.heading?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={18} color="var(--muted)" />
          <input
            type="text"
            className="search-modal-input"
            placeholder="Search documentation, API, recipes, futures..."
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="search-results-list">
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
              No documentation articles found matching "{query}"
            </div>
          ) : (
            filtered.map((sec, idx) => (
              <div
                key={sec.id}
                className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  onSelectSection(sec.id);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="search-result-title">{sec.title}</span>
                  <span className="search-result-section">{sec.category}</span>
                </div>
                <div className="search-result-snippet">{sec.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
