import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { ContentBrowser } from '@/components/content-browser';
import { EventList } from '@/components/events';
import { eventWeek, pages, readContent, sections, type MathEvent } from '@/lib/content';

export function generateStaticParams() { return Object.keys(sections).map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; return { title: sections[section]?.eyebrow || 'Explore' }; }

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const config = sections[section];
  if (!config) notFound();
  const featured = config.featured.map(slug => pages.find(page => page.slug === slug)).filter(page => !!page);
  const collection = pages.filter(page => page.category === config.category && !['home', 'all'].includes(page.slug));
  const events = section === 'events' ? readContent<MathEvent[]>('events') : [];
  return <><section className="page-hero"><div className="site-container"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>{config.eyebrow}</span></div><p className="eyebrow">{config.eyebrow}</p><h1>{config.title}</h1><p className="page-hero-description">{config.description}</p></div></section><div className="site-container section-content">{featured.length > 0 && <div className="featured-links">{featured.map(page => <Link className="featured-link" key={page.slug} href={`/content/${page.slug}/`}>{page.title.replace(' Research Page', '')}<ArrowUpRight/></Link>)}</div>}{events.length > 0 && <div className="mb-14"><div className="section-heading"><div><p className="eyebrow">Pacific time · Schedule snapshot</p><h2>Week of {eventWeek}</h2></div><a href="https://secure.math.ucla.edu/seminars/weekly_list.php" className="text-link" target="_blank" rel="noreferrer">Live UCLA calendar<ArrowUpRight size={16}/></a></div><EventList events={events}/></div>}<h2 className="collection-label">{section === 'news' ? 'The news archive' : section === 'events' ? 'Explore every seminar & series' : 'Explore more'}</h2><ContentBrowser entries={collection.map(({ id, slug, title, category, type, description, date }) => ({ id, slug, title, category, type, description, date }))}/></div></>;
}
