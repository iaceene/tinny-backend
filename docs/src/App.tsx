import React, { useState, useEffect } from 'react';
import { 
  Compass, Terminal, Cpu, Route, ShieldCheck, FileCode,
  FolderTree, Cookie, Radio, Puzzle, TestTube, BookOpen,
  Sparkles, Play, Search, ExternalLink, ChevronRight,
  Layers, CheckCircle2, AlertTriangle, Info, Lightbulb, User
} from 'lucide-react';
import { docsSections, DocSection } from './data/docsContent';
import { 
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, 
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, 
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, 
  SidebarFooter, SidebarRail, SidebarInset, SidebarTrigger, useSidebar 
} from './components/ui/sidebar';
import { Breadcrumbs } from './components/ui/breadcrumbs';
import { CodeBlock } from './components/CodeBlock';
import { Callout } from './components/Callout';
import { InstallTabs } from './components/InstallTabs';
import { InteractiveRouteTester } from './components/InteractiveRouteTester';
import { InteractiveCookieSimulator } from './components/InteractiveCookieSimulator';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { SearchModal } from './components/SearchModal';
import { AuthorProfile } from './components/AuthorProfile';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Compass,
  Terminal,
  Cpu,
  Route,
  ShieldCheck,
  FileCode,
  FolderTree,
  Cookie,
  Radio,
  Puzzle,
  TestTube,
  BookOpen,
  Sparkles,
  Play,
  User
};

export const AppContent: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const { isMobile, setOpenMobile } = useSidebar();

  // Keyboard shortcut Ctrl+K / Cmd+K to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeSection = docsSections.find((s) => s.id === activeSectionId) || docsSections[0];
  const currentIndex = docsSections.findIndex((s) => s.id === activeSectionId);
  const prevSection = currentIndex > 0 ? docsSections[currentIndex - 1] : null;
  const nextSection = currentIndex < docsSections.length - 1 ? docsSections[currentIndex + 1] : null;

  // Group sections by category
  const categories = Array.from(new Set(docsSections.map((s) => s.category)));

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    if (isMobile) setOpenMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGroup = (category: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <>
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSection={handleSelectSection}
      />

      {/* shadcn UI Sidebar */}
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <a
            href="#"
            className="sidebar-brand-link"
            onClick={(e) => {
              e.preventDefault();
              handleSelectSection('overview');
            }}
          >
            <img
              src="./imgs/logo-icon-no-bg.png"
              alt="tinny-backend logo"
              className="sidebar-logo-img"
            />
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">tinny-backend</span>
              <span className="sidebar-brand-version">v1.1.2</span>
            </div>
          </a>
        </SidebarHeader>

        <SidebarContent>
          {categories.map((category) => {
            const isGroupOpen = !collapsedGroups[category];
            const groupSections = docsSections.filter((s) => s.category === category);

            return (
              <SidebarGroup key={category}>
                <SidebarGroupLabel
                  collapsible
                  isOpen={isGroupOpen}
                  onToggle={() => toggleGroup(category)}
                >
                  {category}
                </SidebarGroupLabel>

                {isGroupOpen && (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {groupSections.map((section) => {
                        const IconComponent = (section.iconName && iconMap[section.iconName]) || FileCode;
                        const isActive = section.id === activeSectionId;

                        return (
                          <SidebarMenuItem key={section.id}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => handleSelectSection(section.id)}
                              tooltip={section.title}
                            >
                              <span className="menu-icon">
                                <IconComponent size={16} />
                              </span>
                              <span>{section.title}</span>
                              {section.badge && (
                                <SidebarMenuBadge>{section.badge}</SidebarMenuBadge>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter>
          <button
            type="button"
            onClick={() => handleSelectSection('author')}
            className="sidebar-footer-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title="Author: Yassine Ajagrou (@iaceene)"
          >
            <User size={15} />
            <span className="sidebar-footer-text">Yassine Ajagrou</span>
          </button>

          <a
            href="https://github.com/iaceene/tinny-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-footer-link"
            title="GitHub Repository"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span className="sidebar-footer-text">GitHub</span>
          </a>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main Content Layout with Sticky Inset Header */}
      <SidebarInset>
        <header className="inset-header">
          <div className="inset-header-left">
            <SidebarTrigger />
            <Breadcrumbs
              items={[
                { label: 'Docs', onClick: () => handleSelectSection('overview') },
                { label: activeSection.category },
                { label: activeSection.title }
              ]}
            />
          </div>

          <div className="inset-header-right">
            <button
              className="search-command-trigger"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search documentation"
            >
              <Search size={14} />
              <span>Search docs...</span>
              <span className="search-kbd-pill">⌘K</span>
            </button>

            <a
              href="https://github.com/iaceene/tinny-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-action-btn"
              title="GitHub repository"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </header>

        <div className="inset-main-layout">
          <article className="docs-article-body">
            <header style={{ marginBottom: '1.5rem' }}>
              <div className="article-top-badge">
                <span>{activeSection.category}</span>
                {activeSection.badge && (
                  <span className="sidebar-menu-badge">{activeSection.badge}</span>
                )}
              </div>
              <h1 className="article-main-title">{activeSection.title}</h1>
              <p className="article-lead">{activeSection.description}</p>
            </header>

            {activeSection.id === 'quickstart' && <InstallTabs />}

            <div className="article-rendered-content">
              {activeSection.content.map((block, idx) => (
                <section key={idx} className="doc-section-block">
                  {block.heading && (
                    <h2 id={`section-${idx}`} className="doc-h2">
                      {block.heading}
                    </h2>
                  )}
                  {block.subheading && <h3 className="doc-h3">{block.subheading}</h3>}
                  {block.text && <p className="doc-p" style={{ whiteSpace: 'pre-line' }}>{block.text}</p>}

                  {block.callout && (
                    <Callout type={block.callout.type} title={block.callout.title}>
                      {block.callout.text}
                    </Callout>
                  )}

                  {block.code && (
                    <CodeBlock
                      code={block.code}
                      language={block.codeLang}
                      filename={block.codeFilename}
                    />
                  )}

                  {block.table && (
                    <div className="api-table-wrapper">
                      <table className="api-table">
                        <thead>
                          <tr>
                            {block.table.headers.map((h, i) => (
                              <th key={i}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.table.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {block.customComponent === 'route-tester' && <InteractiveRouteTester />}
                  {block.customComponent === 'cookie-simulator' && <InteractiveCookieSimulator />}
                  {block.customComponent === 'architecture-diagram' && <ArchitectureDiagram />}
                  {block.customComponent === 'author-profile' && <AuthorProfile />}
                </section>
              ))}
            </div>

            {/* Bottom Next / Prev Article Navigation */}
            <div className="article-nav">
              {prevSection ? (
                <div
                  className="article-nav-btn prev"
                  onClick={() => handleSelectSection(prevSection.id)}
                >
                  <span className="article-nav-label">Previous Article</span>
                  <span className="article-nav-title">{prevSection.title}</span>
                </div>
              ) : <div />}

              {nextSection ? (
                <div
                  className="article-nav-btn next"
                  onClick={() => handleSelectSection(nextSection.id)}
                >
                  <span className="article-nav-label">Next Article</span>
                  <span className="article-nav-title">{nextSection.title}</span>
                </div>
              ) : <div />}
            </div>

            {/* Footer */}
            <footer style={{
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--muted)',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src="./imgs/logo-icon-no-bg.png"
                  alt="tinny-backend"
                  style={{ width: 20, height: 20, objectFit: 'contain' }}
                />
                <span>Released under MIT License. Author: </span>
                <button
                  type="button"
                  onClick={() => handleSelectSection('author')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'underline' }}
                >
                  Yassine Ajagrou (@iaceene)
                </button>
              </div>
              <div>
                <a
                  href="https://github.com/iaceene/tinny-backend"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  GitHub <ExternalLink size={13} />
                </a>
              </div>
            </footer>
          </article>

          {/* Right On-This-Page Table of Contents */}
          <aside className="docs-toc-panel">
            <div className="toc-heading">
              <Layers size={13} />
              <span>On This Page</span>
            </div>
            <ul className="toc-nav-list">
              {activeSection.content
                .filter((b) => b.heading)
                .map((b, idx) => (
                  <li key={idx}>
                    <a href={`#section-${idx}`} className="toc-nav-link">
                      {b.heading}
                    </a>
                  </li>
                ))}
            </ul>
          </aside>
        </div>
      </SidebarInset>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  );
};
