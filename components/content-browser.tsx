'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';

export type BrowseEntry = { id: number | string; slug: string; title: string; category: string; type: string; description: string; date: string | null };
export function ContentBrowser({ entries, categories = false, initial = 18 }: { entries: BrowseEntry[]; categories?: boolean; initial?: number }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [visible, setVisible] = useState(initial);
  const filtered = useMemo(() => entries.filter(entry => (category === 'All' || entry.category === category) && `${entry.title} ${entry.description}`.toLowerCase().includes(query.toLowerCase())), [entries, query, category]);
  return <><div className="browse-toolbar"><div className="browse-search"><Search size={17}/><input aria-label="Filter this collection" value={query} placeholder="Find a topic…" onChange={event => { setQuery(event.target.value); setVisible(initial); }}/>{query && <button aria-label="Clear filter" onClick={() => setQuery('')}><X size={16}/></button>}</div><span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></div>{categories && <div className="filter-tabs">{['All', ...new Set(entries.map(entry => entry.category))].map(item => <button key={item} aria-pressed={category === item} className={category === item ? 'selected' : ''} onClick={() => { setCategory(item); setVisible(initial); }}>{item}</button>)}</div>}<div className="browse-grid">{filtered.slice(0, visible).map(entry => <Link href={`/content/${entry.slug}/`} className="browse-card" key={entry.id}><div className="flex justify-between gap-4"><span className="eyebrow">{entry.category}{entry.date && entry.type !== 'page' ? ` · ${new Date(entry.date.slice(0, 10) + 'T12:00:00').getFullYear()}` : ''}</span><ArrowUpRight size={18}/></div><h3>{entry.title}</h3><p>{entry.description.replace(/\[.*?\]/g, '').slice(0, 150)}{entry.description.length > 150 ? '…' : ''}</p><span className="card-read">Explore<ArrowRight size={14}/></span></Link>)}</div>{!filtered.length && <div className="empty-state"><Search size={30}/><h3>No matching topics</h3><p>Try a different word or clear your filters.</p><button className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button></div>}{filtered.length > visible && <div className="load-more"><button className="outline-button" onClick={() => setVisible(visible + initial)}>Show more<ArrowRight size={16}/></button><span>Showing {Math.min(visible, filtered.length)} of {filtered.length}</span></div>}</>;
}
