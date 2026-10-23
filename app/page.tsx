import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, GraduationCap, Microscope, Users } from 'lucide-react';
import { HeroSearch } from '@/components/search';
import { EventList } from '@/components/events';
import { dateLabel, eventWeek, hrefFor, pageBySlug, readContent, type MathEvent } from '@/lib/content';

const paths = [
  { title: 'Undergraduate', subtitle: 'Build your foundation.', href: '/undergraduate/', icon: BookOpen, links: [['Majors & minors', 'majors-minors-specializations'], ['Courses & enrollment', 'courses'], ['Academic advising', 'academic-advising']] },
  { title: 'Graduate', subtitle: 'Push the boundaries.', href: '/graduate/', icon: GraduationCap, links: [['Our graduate program', 'overview-2'], ['Admissions & funding', 'admissions'], ['Graduate handbook', 'graduate-handbook']] },
  { title: 'Research', subtitle: 'Explore what’s possible.', href: '/research/', icon: Microscope, links: [['Research areas', 'research-areas'], ['Centers & collaborations', 'ucla-math-ai-center'], ['Publications & reports', 'cam-reports-2021-current']] },
  { title: 'Our people', subtitle: 'Meet your community.', href: '/people/', icon: Users, links: [['Faculty directory', 'directory-ladder'], ['Graduate students', 'directory-grad'], ['Staff & support', 'directory-staff']] },
];

export default function Home() {
  const events = readContent<MathEvent[]>('events');
  const stories = [
    { page: pageBySlug('former-ucla-professor-hong-wang-makes-history-with-2026-fields-medal'), image: '/images/hong-wang.jpg', category: 'A remarkable achievement', alt: 'Mathematician Hong Wang', title: 'Hong Wang makes history with the 2026 Fields Medal' },
    { page: pageBySlug('patty-morrisons-planned-5-million-gift-to-ucla-mathematics'), image: '/images/math-sciences.jpg', category: 'Supporting our future', alt: 'UCLA Mathematical Sciences Building', title: 'A $5 million gift. A lasting legacy for mathematics.' },
    { page: pageBySlug('graduate-student-spotlight-ariana-chin'), image: '/images/ariana-chin.jpg', category: 'Meet our community', alt: 'UCLA graduate student Ariana Chin', title: 'Graduate student spotlight: Ariana Chin' },
  ];
  return <>
    <section className="alumni-hero" aria-labelledby="home-heading">
      <img className="alumni-hero-image" src="/images/math-sciences.jpg" alt="The UCLA Mathematical Sciences Building, framed by trees on the south campus" fetchPriority="high"/>
      <div className="alumni-hero-overlay"/>
      <div className="site-container alumni-hero-content">
        <p className="hero-kicker">UCLA DEPARTMENT OF MATHEMATICS</p>
        <h1 id="home-heading">big questions.<br/>boundless possibilities.</h1>
        <div className="hero-bottom-row"><p>A community of curious minds, exploring the beauty of mathematics and its power to change the world.</p><div className="hero-actions"><Link href="/undergraduate/" className="solid-button">Explore our programs<ArrowRight size={20}/></Link><Link href="/people/" className="blue-button">Meet our people<ArrowRight size={20}/></Link></div></div>
      </div>
      <span className="hero-photo-credit">MATHEMATICAL SCIENCES BUILDING · UCLA</span>
    </section>
    <div className="site-container search-strip"><HeroSearch/><div className="quick-search-links"><span>QUICK LINKS</span><Link href="/content/academic-advising/">Advising<ArrowUpRight size={12}/></Link><Link href="/content/courses/">Courses<ArrowUpRight size={12}/></Link><Link href="/events/">Calendar<ArrowUpRight size={12}/></Link></div></div>
    <section className="chapter-section"><div className="site-container chapter-grid"><h2>your next<br/> chapter<br/> starts here.</h2>{paths.slice(0, 3).map(item => <div className="chapter-card" key={item.title}><Link href={item.href}><h3>{item.title}</h3></Link><p>{item.title === 'Undergraduate' ? 'Find your direction. Explore our majors, connect with an advisor, and make your next move.' : item.title === 'Graduate' ? 'Go deeper. Join a community advancing the frontiers of pure and applied mathematics.' : 'Think beyond. Discover the ideas and collaborations opening up new possibilities.'}</p><div className="chapter-links">{item.links.map(([label, slug]) => <Link href={hrefFor(slug)} key={slug}>{label}<ArrowRight size={20}/></Link>)}</div></div>)}</div></section>
    <section className="news-section site-container"><div className="section-heading"><div><p className="eyebrow">THE LATEST FROM OUR COMMUNITY</p><h2>mathematics in motion.</h2></div><Link href="/news/" className="text-link">All news & stories<ArrowUpRight size={16}/></Link></div><div className="news-grid">{stories.map(story => story.page && <Link href={hrefFor(story.page.slug)} className="news-card group" key={story.page.slug}><div className="news-image"><img src={story.image} alt={story.alt} loading="lazy"/><span className="image-arrow"><ArrowUpRight size={19}/></span></div><div className="news-meta"><span>{story.category}</span><span>{dateLabel(story.page.date, true)}</span></div><h3>{story.title}</h3><span className="read-story">Read the story<ArrowRight size={14}/></span></Link>)}</div></section>
    <section className="events-section"><div className="site-container events-layout"><div className="events-intro"><p className="eyebrow">COME FOR THE CONVERSATION</p><h2>fresh ideas.<br/>shared discoveries.</h2><p>From a new perspective to your next collaboration, it starts with showing up.</p><Link href="/events/" className="outline-button">Explore all events<ArrowUpRight size={16}/></Link><div className="week-label"><span className="status-dot"/>Week of {eventWeek}</div><span className="schedule-note">Schedule snapshot · Pacific time</span></div><EventList events={events} compact/></div></section>
    <section className="research-section site-container"><div className="research-panel"><div className="research-copy"><p className="eyebrow">PURE CURIOSITY. REAL-WORLD IMPACT.</p><h2>ideas that move<br/>the world forward.</h2><p>From the deepest questions in pure mathematics to new possibilities in computing, medicine, and beyond—our research opens doors.</p><Link href="/research/" className="light-button">Explore our research<ArrowUpRight size={17}/></Link></div><div className="research-art"><img src="/images/research-lab.jpg" alt="A UCLA researcher studying scientific images in the Marcus Roper laboratory" loading="lazy"/></div></div></section>
    <section className="community-section site-container"><div className="community-image"><img src="/images/community.jpg" alt="UCLA applied mathematics research students gathered on campus" loading="lazy"/></div><div className="community-copy"><p className="eyebrow">MORE THAN MATHEMATICS</p><h2>great minds.<br/>greater together.</h2><p>We believe the best ideas come from a community where everyone belongs. Find your people, share your perspective, and help us see what comes next.</p><div className="community-links"><Link href="/people/">Meet our mathematics community<ArrowUpRight size={17}/></Link><Link href="/content/diversity-inclusion/">Diversity & inclusion<ArrowUpRight size={17}/></Link><Link href="/content/student-groups/">Student groups & communities<ArrowUpRight size={17}/></Link><Link href="/content/women-in-math/">Women in Mathematics<ArrowUpRight size={17}/></Link></div></div></section>
    <section className="support-strip"><div className="site-container flex items-center justify-between gap-6"><div><p className="eyebrow">HELP SHAPE WHAT COMES NEXT</p><h2>Support the next generation of discovery.</h2></div><Link href="/content/giving/" className="outline-button">Give to UCLA Mathematics<ArrowUpRight size={17}/></Link></div></section>
  </>;
}
