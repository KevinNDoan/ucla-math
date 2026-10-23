'use client';

import { createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { ArrowRight, ArrowUpRight, BookOpen, LoaderCircle, Search, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export type SearchEntry = { id: string | number; slug: string; title: string; category: string; type: string; description: string; text: string; source: string; href?: string };
const SearchContext = createContext({ openSearch: () => {} });
export const useSearch = () => useContext(SearchContext);
let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex() {
  if (!indexPromise) indexPromise = fetch('/search-index.json').then(response => { if (!response.ok) throw new Error('Unable to load search'); return response.json(); }).catch(error => { indexPromise = null; throw error; });
  return indexPromise;
}
export function useContentSearch(query: string, category = 'All') {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const retry = useCallback(() => { setError(false); setLoading(true); loadIndex().then(setEntries).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  useEffect(() => { retry(); }, [retry]);
  const deferredQuery = useDeferredValue(query);
  const prepared = useMemo(() => entries.map(entry => ({ ...entry, searchableTitle: entry.title.toLowerCase(), searchableText: entry.text.toLowerCase() })), [entries]);
  const fuse = useMemo(() => new Fuse(prepared, { keys: [{ name: 'title', weight: 0.65 }, { name: 'description', weight: 0.2 }, { name: 'text', weight: 0.15 }], threshold: 0.3, ignoreLocation: true, minMatchCharLength: 2, includeScore: true }), [prepared]);
  const results = useMemo(() => {
    const normalized = deferredQuery.toLowerCase().trim();
    if (!normalized) return [];
    const terms = normalized.split(/\s+/);
    const found = fuse.search(deferredQuery);
    const scores = new Map(found.map(result => [result.item.id, result.score || 0]));
    const candidates = prepared.filter(entry => scores.has(entry.id) || terms.every(term => entry.searchableText.includes(term)));
    const rank = (entry: typeof prepared[number]) => {
      let score = scores.get(entry.id) ?? 0.5;
      if (entry.searchableTitle.includes(normalized)) score -= 10;
      else if (terms.every(term => entry.searchableTitle.includes(term))) score -= 7;
      if (terms.every(term => entry.searchableText.includes(term))) score -= 2;
      if (entry.searchableText.includes(normalized)) score -= 0.5;
      if (entry.type === 'page') score -= 0.15;
      return score;
    };
    const ordered = candidates.sort((a, b) => rank(a) - rank(b));
    return category === 'All' ? ordered : ordered.filter(entry => entry.category === category);
  }, [deferredQuery, category, fuse, prepared]);
  return { results, loading, error, retry, count: entries.length };
}

function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.trim().split(/\s+/).filter(word => word.length > 1).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!tokens.length) return <>{text}</>;
  const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
  return <>{text.split(pattern).map((part, index) => index % 2 ? <mark key={index}>{part}</mark> : part)}</>;
}

function excerpt(entry: SearchEntry, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const position = Math.min(...terms.map(term => entry.text.toLowerCase().indexOf(term)).filter(i => i >= 0));
  if (!Number.isFinite(position)) return entry.description.slice(0, 180);
  const start = Math.max(0, position - 55);
  return `${start ? '…' : ''}${entry.text.slice(start, start + 200)}${entry.text.length > start + 200 ? '…' : ''}`;
}

export function SearchResult({ entry, query, onSelect }: { entry: SearchEntry; query: string; onSelect?: () => void }) {
  return <Link href={entry.href || `/content/${entry.slug}/`} className="search-result group" onClick={onSelect}>
    <div className="result-icon"><BookOpen size={18}/></div><div className="min-w-0 flex-1"><span className="result-category">{entry.category}</span><h3><Highlight text={entry.title} query={query}/></h3><p><Highlight text={excerpt(entry, query)} query={query}/></p></div><ArrowUpRight className="result-arrow" size={18}/>
  </Link>;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const openSearch = useCallback(() => setOpen(true), []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(value => !value); } };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, []);
  useEffect(() => {
    if (open) { dialog.current?.showModal(); input.current?.focus(); document.body.style.overflow = 'hidden'; }
    else { dialog.current?.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return <SearchContext.Provider value={{ openSearch }}>{children}<dialog ref={dialog} className="search-dialog" aria-label="Search UCLA Mathematics" onCancel={() => setOpen(false)} onClick={event => { if (event.target === dialog.current) setOpen(false); }}>
    <div className="search-modal-inner"><form action="/search/" className="modal-search-field"><Search size={24}/><input ref={input} name="q" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); dialog.current?.querySelector<HTMLAnchorElement>('.search-result')?.focus(); } }} placeholder="What are you looking for?" aria-label="Search all department content" autoComplete="off"/><button type="button" onClick={() => setOpen(false)} aria-label="Close search"><X size={20}/></button></form>
    {open && <SearchModalResults query={query} onSelect={() => setOpen(false)} />}
    <div className="search-modal-footer"><span>Search pages, people, courses & more</span><span><kbd>esc</kbd> to close</span></div></div>
  </dialog></SearchContext.Provider>;
}

function SearchModalResults({ query, onSelect }: { query: string; onSelect: () => void }) {
  const { results, loading, error, retry } = useContentSearch(query);
  return <div className="modal-results">{!query.trim() ? <><p className="eyebrow">Popular destinations</p>{[['Majors, minors & specializations', 'majors-minors-specializations'], ['Academic advising', 'academic-advising'], ['Graduate admissions', 'admissions'], ['Weekly events calendar', 'seminar-weekly']].map(([title, slug]) => <Link key={slug} href={`/content/${slug}/`} className="popular-result" onClick={onSelect}>{title}<ArrowUpRight size={17}/></Link>)}<p className="search-tip">Try a name, a course number, or a topic like “financial support.”</p></> : loading ? <p className="search-state"><LoaderCircle className="animate-spin" size={20}/> Preparing search…</p> : error ? <div className="search-state">Search couldn’t load. <button onClick={retry} className="text-link">Try again</button></div> : results.length ? <><p className="eyebrow">{results.length} results</p>{results.slice(0, 6).map(entry => <SearchResult key={entry.id} entry={entry} query={query} onSelect={onSelect}/>)}<Link href={`/search/?q=${encodeURIComponent(query)}`} className="all-results" onClick={onSelect}>View all results<ArrowRight size={17}/></Link></> : <div className="empty-state"><Search size={28}/><h3>No results for “{query}”</h3><p>Try fewer words, a name, or a related topic.</p></div>}</div>;
}

export function HeroSearch() {
  const { openSearch } = useSearch();
  return <button className="hero-search" onClick={openSearch}><Search size={23}/><span>Find your next step.<small>Search courses, people, programs, and more</small></span><span className="hero-search-shortcut"><kbd>⌘</kbd><kbd>K</kbd></span><span className="search-circle"><ArrowRight size={22}/></span></button>;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [visible, setVisible] = useState(15);
  useEffect(() => { const params = new URLSearchParams(window.location.search); setQuery(params.get('q') || ''); }, []);
  const { results, loading, error, retry, count } = useContentSearch(query, category);
  function updateQuery(value: string) { setQuery(value); setVisible(15); window.history.replaceState(null, '', `/search/${value ? `?q=${encodeURIComponent(value)}` : ''}`); }
  return <div className="site-container search-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Search</span></div><p className="eyebrow">A little clarity goes a long way</p><h1>Find what you’re looking for.</h1><div className="full-search-field"><Search size={24}/><input aria-label="Search all UCLA Math content" placeholder="A course, a person, a possibility…" value={query} onChange={event => updateQuery(event.target.value)}/>{query && <button onClick={() => updateQuery('')} aria-label="Clear search"><X size={20}/></button>}</div><div className="filter-tabs" aria-label="Filter results by category">{['All', 'Undergraduate', 'Graduate', 'People', 'Research', 'Events', 'News', 'Resources', 'About'].map(item => <button key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => { setCategory(item); setVisible(15); }}>{item}</button>)}</div>
    <div aria-live="polite">{loading ? <p className="search-state"><LoaderCircle className="animate-spin" size={20}/> Preparing search…</p> : error ? <div className="search-state">Search couldn’t load. <button className="text-link" onClick={retry}>Try again</button></div> : !query.trim() ? <div className="empty-state"><Search size={32}/><h2>All of mathematics. One search.</h2><p>Search {count} pages, articles, directories, and seminar schedules.</p><div className="suggestion-chips">{['Academic advising', 'Number theory', 'Graduate admissions', 'Tao'].map(term => <button key={term} onClick={() => updateQuery(term)}>{term}<ArrowUpRight size={14}/></button>)}</div></div> : <><p className="results-count">{results.length} {results.length === 1 ? 'result' : 'results'} for <strong>“{query}”</strong>{category !== 'All' && ` in ${category}`}</p>{results.slice(0, visible).map(entry => <SearchResult key={entry.id} entry={entry} query={query}/>)}{!results.length && <div className="empty-state"><h2>Let’s try another approach.</h2><p>Try a shorter search or choose a different category.</p></div>}{results.length > visible && <button className="outline-button mt-8" onClick={() => setVisible(visible + 15)}>Show more results<ArrowRight size={16}/></button>}</>}</div>
  </div>;
}
