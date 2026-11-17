import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const Tabs: React.FC<{
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ defaultValue, value: controlledValue, onValueChange, className = '', children }) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v);
    setUncontrolledValue(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={`shadcn-tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`tabs-list ${className}`}>{children}</div>;

export const TabsTrigger: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ value: triggerValue, className = '', children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const isActive = context.value === triggerValue;

  return (
    <button
      type="button"
      className={`tabs-trigger ${isActive ? 'active' : ''} ${className}`}
      onClick={() => context.setValue(triggerValue)}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ value: contentValue, className = '', children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  if (context.value !== contentValue) return null;

  return <div className={`tabs-content ${className}`}>{children}</div>;
};
