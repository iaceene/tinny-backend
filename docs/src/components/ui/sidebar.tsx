import React, { createContext, useContext, useState, useEffect } from 'react';
import { PanelLeft, ChevronDown } from 'lucide-react';

interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className = '',
  style,
  children
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    setUncontrolledOpen(value);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (isMobile) {
          setOpenMobile((prev) => !prev);
        } else {
          setOpen(!open);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  const state = open ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar
      }}
    >
      <div
        className={`sidebar-provider-root ${state} ${isMobile ? 'is-mobile' : ''} ${className}`}
        style={style}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

interface SidebarProps {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  className?: string;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  side = 'left',
  variant = 'inset',
  collapsible = 'icon',
  className = '',
  children
}) => {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && openMobile && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`shadcn-sidebar ${variant} side-${side} collapsible-${collapsible} ${
          open ? 'open' : 'collapsed'
        } ${openMobile ? 'mobile-open' : ''} ${className}`}
        data-state={open ? 'expanded' : 'collapsed'}
        data-collapsible={collapsible}
      >
        <div className="sidebar-inner">{children}</div>
      </aside>
    </>
  );
};

export const SidebarHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`sidebar-header ${className}`}>{children}</div>;

export const SidebarContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`sidebar-content ${className}`}>{children}</div>;

export const SidebarFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`sidebar-footer ${className}`}>{children}</div>;

export const SidebarGroup: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`sidebar-group ${className}`}>{children}</div>;

export const SidebarGroupLabel: React.FC<{
  className?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}> = ({ className = '', children, collapsible, isOpen = true, onToggle }) => (
  <div
    className={`sidebar-group-label ${collapsible ? 'cursor-pointer' : ''} ${className}`}
    onClick={collapsible ? onToggle : undefined}
  >
    <span className="label-text">{children}</span>
    {collapsible && (
      <ChevronDown
        size={14}
        className={`label-chevron ${isOpen ? 'rotate-0' : '-rotate-90'}`}
      />
    )}
  </div>
);

export const SidebarGroupContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`sidebar-group-content ${className}`}>{children}</div>;

export const SidebarMenu: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <ul className={`sidebar-menu ${className}`}>{children}</ul>;

export const SidebarMenuItem: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <li className={`sidebar-menu-item ${className}`}>{children}</li>;

interface SidebarMenuButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
  children: React.ReactNode;
}

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({
  isActive = false,
  onClick,
  className = '',
  tooltip,
  children
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`sidebar-menu-button ${isActive ? 'active' : ''} ${className}`}
    title={tooltip}
  >
    {children}
  </button>
);

export const SidebarMenuBadge: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <span className={`sidebar-menu-badge ${className}`}>{children}</span>;

export const SidebarRail: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <div
      className={`sidebar-rail ${className}`}
      onClick={toggleSidebar}
      title="Toggle Sidebar (Cmd+B)"
    />
  );
};

export const SidebarTrigger: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`sidebar-trigger-btn ${className}`}
      aria-label="Toggle Sidebar"
      title="Toggle Sidebar (Cmd+B)"
    >
      <PanelLeft size={18} />
    </button>
  );
};

export const SidebarInset: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children
}) => <div className={`sidebar-inset ${className}`}>{children}</div>;
