import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { HeroSearch } from '@/components/search';
import { EventList } from '@/components/events';
import { dateLabel, eventWeek, hrefFor, pageBySlug, readContent, type MathEvent } from '@/lib/content';

const paths = [
  { title: 'Undergraduate', href: '/undergraduate/', description: 'Build your foundation, find your direction, and make mathematics your own.', links: [['Majors & minors', 'majors-minors-specializations'], ['Courses & enrollment', 'courses'], ['Academic advising', 'academic-advising']] },
  { title: 'Graduate', href: '/graduate/', description: 'Go deeper in a community advancing pure and applied mathematics.', links: [['Our graduate program', 'overview-2'], ['Admissions & funding', 'admissions'], ['Graduate handbook', 'graduate-handbook']] },
  { title: 'Research', href: '/research/', description: 'Explore the questions, ideas, and collaborations expanding our understanding.', links: [['Research areas', 'research-areas'], ['Centers & collaborations', 'ucla-math-ai-center'], ['Publications & reports', 'cam-reports-2021-current']] },
];

export default function Home() {
  const events = readContent<MathEvent[]>('events');
  const stories = [
    { page: pageBySlug('former-ucla-professor-hong-wang-makes-history-with-2026-fields-medal'), image: '/images/hong-wang.jpg', category: 'A remarkable achievement', alt: 'Mathematician Hong Wang', title: 'Hong Wang makes history with the 2026 Fields Medal' },
    { page: pageBySlug('patty-morrisons-planned-5-million-gift-to-ucla-mathematics'), image: '/images/math-sciences.jpg', category: 'Supporting our future', alt: 'UCLA Mathematical Sciences Building', title: 'A $5 million gift. A lasting legacy for mathematics.' },
    { page: pageBySlug('graduate-student-spotlight-ariana-chin'), image: '/images/ariana-chin.jpg', category: 'Meet our community', alt: 'UCLA graduate student Ariana Chin', title: 'Graduate student spotlight: Ariana Chin' },
  ];

  return <>
    <section className="home-intro site-container" aria-labelledby="home-heading">
      <p className="eyebrow">UCLA Department of Mathematics</p>
      <div className="intro-grid">
        <h1 id="home-heading">Where curiosity<br/>becomes discovery.</h1>
        <div className="intro-aside"><p>Pure and applied mathematics. A shared pursuit of new knowledge, and a community built around big questions.</p><Link className="editorial-link" href="/about/">Discover the department<ArrowRight size={20}/></Link></div>
      </div>
    </section>

    <figure className="campus-feature site-container">
      <img src="/images/math-sciences.jpg" alt="The Mathematical Sciences Building on UCLA’s south campus" fetchPriority="high"/>
      <figcaption>Mathematical Sciences Building, Los Angeles</figcaption>
    </figure>

    <div className="site-container search-strip">
      <HeroSearch/>
      <div className="quick-search-links"><Link href="/content/academic-advising/">Advising</Link><Link href="/content/courses/">Courses</Link><Link href="/events/">Calendar</Link></div>
    </div>

    <section className="chapter-section"><div className="site-container">
      <div className="chapter-heading"><p className="eyebrow">Learning and discovery</p><h2>Find your path in mathematics.</h2></div>
      <div className="chapter-grid">{paths.map(item => <div className="chapter-card" key={item.title}>
        <Link href={item.href}><h3>{item.title}</h3></Link><p>{item.description}</p>
        <div className="chapter-links">{item.links.map(([label, slug]) => <Link href={hrefFor(slug)} key={slug}>{label}<ArrowRight size={17}/></Link>)}</div>
      </div>)}</div>
    </div></section>

    <section className="news-section site-container">
      <div className="section-heading"><div><p className="eyebrow">From our community</p><h2>Mathematics in motion.</h2></div><Link href="/news/" className="text-link">All news & stories<ArrowRight size={18}/></Link></div>
      <div className="news-grid">{stories.map(story => story.page && <Link href={hrefFor(story.page.slug)} className="news-card" key={story.page.slug}>
        <div className="news-image"><img src={story.image} alt={story.alt} loading="lazy"/></div>
        <div className="news-story-copy"><div className="news-meta"><span>{story.category}</span><span>{dateLabel(story.page.date, true)}</span></div><h3>{story.title}</h3><span className="read-story">Read the story<ArrowRight size={16}/></span></div>
      </Link>)}</div>
    </section>

    <section className="events-section"><div className="site-container events-layout">
      <div className="events-intro"><p className="eyebrow">Conversations in mathematics</p><h2>Fresh ideas.<br/>Shared discoveries.</h2><p>Seminars, colloquia, and the conversations that bring our community together.</p><Link href="/events/" className="editorial-link">Explore all events<ArrowRight size={19}/></Link><div className="week-label">Week of {eventWeek}</div><span className="schedule-note">Schedule snapshot · Pacific time</span></div>
      <EventList events={events} compact/>
    </div></section>

    <section className="research-section site-container"><div className="research-panel">
      <div className="research-art"><img src="/images/research-lab.jpg" alt="A UCLA researcher studying scientific images in the Marcus Roper laboratory" loading="lazy"/></div>
      <div className="research-copy"><p className="eyebrow">Research at UCLA</p><h2>Ideas that move<br/>the world forward.</h2><p>From the deepest questions in pure mathematics to new possibilities in computing, medicine, and beyond, our research opens doors.</p><Link href="/research/" className="editorial-link">Explore our research<ArrowRight size={20}/></Link></div>
    </div></section>

    <section className="community-section site-container">
      <div className="community-copy"><p className="eyebrow">The people behind the ideas</p><h2>Great minds.<br/>Greater together.</h2><p>Mathematics grows through the people who do it. Meet our faculty and students, find a community, and share your perspective.</p><div className="community-links"><Link href="/people/">Meet our community<ArrowRight size={17}/></Link><Link href="/content/diversity-inclusion/">Diversity & inclusion<ArrowRight size={17}/></Link><Link href="/content/student-groups/">Student groups<ArrowRight size={17}/></Link><Link href="/content/women-in-math/">Women in Mathematics<ArrowRight size={17}/></Link></div></div>
      <div className="community-image"><img src="/images/community.jpg" alt="UCLA applied mathematics research students gathered on campus" loading="lazy"/></div>
    </section>

    <section className="support-strip"><div className="site-container flex items-center justify-between gap-6"><div><p className="eyebrow">Invest in what comes next</p><h2>Support the next generation of discovery.</h2></div><Link href="/content/giving/" className="editorial-link">Give to UCLA Mathematics<ArrowUpRight size={18}/></Link></div></section>
  </>;
}
