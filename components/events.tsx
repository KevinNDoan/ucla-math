'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import type { MathEvent } from '@/lib/content';

const clockLabel = (time: string) => time.split('-').map(part => { const [h, m] = part.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }).join(' – ');

export function EventList({ events, compact = false }: { events: MathEvent[]; compact?: boolean }) {
  const [tab, setTab] = useState('All events');
  const tabs = ['All events', 'Seminars', 'Colloquia'];
  const filtered = events.filter(event => tab === 'All events' || (tab === 'Colloquia' ? /colloquium/i.test(event.seminar) : /seminar/i.test(event.seminar)));
  // Favor the remainder of the imported week on the homepage; keep every event in the full schedule.
  const showing = compact ? [...filtered.filter(event => /Thursday|Friday/.test(event.day)), ...filtered.filter(event => !/Thursday|Friday/.test(event.day))].slice(0, 3) : filtered;
  return <div><div className="event-tabs" role="group" aria-label="Event categories">{tabs.map(item => <button key={item} onClick={() => setTab(item)} aria-pressed={tab === item} className={tab === item ? 'selected' : ''}>{item}</button>)}</div><div className="event-list">{showing.map((event, index) => <a href={event.href} key={`${event.href}-${index}`} className="event-row" target="_blank" rel="noreferrer"><div className="event-date"><span>{event.day.split(', ')[1]?.split(' ')[0]?.toUpperCase()}</span><strong>{event.day.split(' ').at(-1)}</strong></div><div className="event-info"><span className="eyebrow">{event.seminar}</span><h3>{event.title || event.seminar}</h3><p>{event.speaker}</p><div className="event-details"><span><Clock3 size={12}/>{clockLabel(event.time)}</span><span><MapPin size={12}/>{event.location}</span></div></div><ArrowUpRight size={21}/></a>)}{!showing.length && <div className="empty-state"><p>No {tab.toLowerCase()} in the imported weekly schedule.</p><Link className="text-link" href="/content/seminar-weekly/">Explore all seminar schedules<ArrowUpRight size={14}/></Link></div>}</div></div>;
}
