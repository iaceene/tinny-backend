import React from 'react';
import { Info, Lightbulb, AlertTriangle, AlertCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'note' | 'tip' | 'important' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({ type = 'note', title, children }) => {
  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb size={20} color="var(--accent-emerald)" />;
      case 'important':
        return <AlertCircle size={20} color="var(--accent-indigo)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--accent-amber)" />;
      default:
        return <Info size={20} color="var(--accent-cyan)" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'tip':
        return 'Tip';
      case 'important':
        return 'Important';
      case 'warning':
        return 'Warning';
      default:
        return 'Note';
    }
  };

  return (
    <div className={`callout ${type}`}>
      <div className="callout-icon">{getIcon()}</div>
      <div className="callout-body">
        <div className="callout-title">{title || getDefaultTitle()}</div>
        <div>{children}</div>
      </div>
    </div>
  );
};
