'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Phone, Search, X } from 'lucide-react';
import type { Person } from '@/lib/content';

const groups = [['All', 'Everyone'], ['ladder', 'Faculty'], ['visiting', 'Visiting faculty'], ['grad', 'Graduate students'], ['staff', 'Staff']];
export function PeopleDirectory({ people }: { people: Person[] }) {
  const [group, setGroup] = useState('All');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(24);
  useEffect(() => { const params = new URLSearchParams(window.location.search); const requested = params.get('group'); if (groups.some(([key]) => key === requested)) setGroup(requested!); setQuery(params.get('q') || ''); }, []);
  function update(nextGroup: string, nextQuery: string) { setGroup(nextGroup); setQuery(nextQuery); setVisible(24); const params = new URLSearchParams(); if (nextGroup !== 'All') params.set('group', nextGroup); if (nextQuery) params.set('q', nextQuery); window.history.replaceState(null, '', `/people/${params.size ? `?${params}` : ''}`); }
  const filtered = people.filter(person => (group === 'All' || person.group === group) && `${person.name} ${person.title} ${person.office}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="directory-controls"><div className="filter-tabs">{groups.map(([key, label]) => <button key={key} aria-pressed={group === key} onClick={() => update(key, query)} className={group === key ? 'selected' : ''}>{label}</button>)}</div><div className="browse-search"><Search size={18}/><input aria-label="Search people by name, title or office" placeholder="Find a person…" value={query} onChange={event => update(group, event.target.value)}/>{query && <button onClick={() => update(group, '')} aria-label="Clear people search"><X size={16}/></button>}</div></div><p className="results-count">{filtered.length} people{query && ` matching “${query}”`}</p><div className="people-grid">{filtered.slice(0, visible).map((person, index) => <Link className="person-card" href={person.url} key={`${person.group}-${person.name}-${index}`} target={person.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><div className="flex items-start justify-between"><div className="person-avatar">{person.name.split(',')[0].trim()[0]}{(person.name.split(',')[1] || '').trim()[0]}</div><ArrowUpRight size={17}/></div><h3>{person.name.includes(',') ? person.name.split(',').reverse().join(' ').trim() : person.name}</h3><p>{person.title || groups.find(([key]) => key === person.group)?.[1]}</p><div className="person-contact">{person.office && <span><MapPin size={13}/>{person.office}</span>}{person.phone && <span><Phone size={12}/>(310) {person.phone}</span>}</div></Link>)}</div>{!filtered.length && <div className="empty-state"><h2>No matching people</h2><p>Try another name or browse everyone.</p><button className="text-link" onClick={() => update('All', '')}>Clear filters</button></div>}{filtered.length > visible && <div className="load-more"><button className="outline-button" onClick={() => setVisible(visible + 24)}>Show more people<ArrowUpRight size={16}/></button><span>Showing {Math.min(visible, filtered.length)} of {filtered.length}</span></div>}</>;
}
