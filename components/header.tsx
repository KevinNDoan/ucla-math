'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, Search, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSearch } from './search';

type Group = { label: string; href: string; links: string[][] };

export function Header({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { openSearch } = useSearch();
  useEffect(() => { setActive(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setActive(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setActive(null); setMobile(false); } };
    document.addEventListener('click', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <header ref={ref} className="site-header">
    <div className="utility-bar"><div className="site-container flex items-center justify-between gap-4">
      <Link href="/undergraduate/" className="announcement-link">Your next chapter at UCLA Mathematics starts here.</Link>
      <div className="flex items-center gap-6"><Link href="/resources/">Department resources</Link><a href="https://www.ucla.edu/" target="_blank" rel="noreferrer">UCLA Home <ArrowUpRight size={11} /></a></div>
    </div></div>
    <div className="site-container main-nav">
      <Link href="/" aria-label="UCLA Mathematics home" className="brand"><img src="/brand/ucla-mathematics-white.png" alt="UCLA Mathematics" width={1246} height={322} className="department-logo" fetchPriority="high"/></Link>
      <nav aria-label="Main navigation" className="desktop-nav">
        {groups.map(group => <div className="nav-group" key={group.label}>
          <button className={active === group.label ? 'nav-button active' : 'nav-button'} aria-expanded={active === group.label} aria-controls={`menu-${group.label.replaceAll(' ', '-')}`} onClick={() => setActive(active === group.label ? null : group.label)}>{group.label}<ChevronDown size={12} /></button>
          {active === group.label && <div className="nav-dropdown" id={`menu-${group.label.replaceAll(' ', '-')}`}>
            <p className="eyebrow">Explore {group.label}</p>
            {group.links.map(([label, href]) => <Link onClick={() => setActive(null)} href={href} key={href}>{label}<ArrowUpRight size={14}/></Link>)}
          </div>}
        </div>)}
      </nav>
      <div className="nav-actions"><button onClick={openSearch} className="header-search" aria-label="Search the website"><span>I’m looking for…</span><Search size={19}/></button><Link href="/content/giving/" className="give-link">Give <ArrowUpRight size={16}/></Link><button className="mobile-menu-button" aria-label={mobile ? 'Close navigation' : 'Open navigation'} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>{mobile ? <X/> : <Menu/>}</button></div>
    </div>
    {mobile && <nav className="mobile-nav" aria-label="Mobile navigation">{groups.map(group => <details key={group.label}><summary>{group.label}<ChevronDown size={16}/></summary>{group.links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobile(false)}>{label}<ArrowUpRight size={14}/></Link>)}</details>)}<Link href="/resources/" onClick={() => setMobile(false)}>Department resources</Link></nav>}
  </header>;
}
