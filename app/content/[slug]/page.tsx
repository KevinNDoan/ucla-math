import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { dateLabel, pages, pageBySlug, snapshotDate } from '@/lib/content';

export function generateStaticParams() { return pages.map(page => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const page = pageBySlug(slug); return { title: page?.title, description: page?.description.slice(0, 160) }; }

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pageBySlug(slug);
  if (!page) notFound();
  const section = page.category.toLowerCase();
  const related = pages.filter(entry => entry.category === page.category && entry.slug !== slug && entry.type === 'page').slice(0, 4);
  const headings = page.headings.filter(heading => !/navigation|jump to/i.test(heading.label)).slice(0, 18);
  return <><section className="page-hero"><div className="site-container"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/${section}/`}>{page.category}</Link><span>/</span><span>{page.title.length > 50 ? page.title.slice(0, 50) + '…' : page.title}</span></div><p className="eyebrow">{page.category}</p><h1>{page.title}</h1><div className="reading-meta">{page.date && page.type !== 'page' && <time dateTime={page.date}>{dateLabel(page.date)}</time>}<span>UCLA Department of Mathematics</span></div></div></section><div className="site-container reading-layout"><aside className="reading-sidebar"><div className="sidebar-inner"><p className="eyebrow">{headings.length ? 'On this page' : 'Explore mathematics'}</p><nav aria-label="On this page">{headings.length ? headings.map(heading => <a href={`#${heading.id}`} key={heading.id}>{heading.label}</a>) : <><Link href={`/${section}/`}>More in {page.category}</Link><Link href="/search/">Search the department</Link><Link href="/content/contact/">Get in touch</Link></>}</nav><a href={page.source} className="source-link" target="_blank" rel="noreferrer">View original UCLA page<ArrowUpRight size={13}/></a></div></aside><article className="reading-main"><div className="reading-content" dangerouslySetInnerHTML={{ __html: page.html }}/><p className="source-note">This content was collected from the UCLA Mathematics website on {snapshotDate}. For time-sensitive information, check the <a href={page.source} target="_blank" rel="noreferrer">original UCLA page</a>. Linked documents and external services open at their original addresses.</p>{related.length > 0 && <div className="related-pages"><h2>Keep exploring.</h2>{related.map(entry => <Link key={entry.id} href={`/content/${entry.slug}/`}>{entry.title}<ArrowUpRight size={16}/></Link>)}</div>}</article></div></>;
}
