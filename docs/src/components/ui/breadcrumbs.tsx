import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="shadcn-breadcrumbs" aria-label="Breadcrumbs">
      <ol className="breadcrumbs-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="breadcrumbs-item">
              {item.onClick && !isLast ? (
                <button type="button" className="breadcrumb-link" onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <span className={`breadcrumb-current ${isLast ? 'active' : ''}`}>{item.label}</span>
              )}
              {!isLast && <ChevronRight size={14} className="breadcrumb-separator" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
