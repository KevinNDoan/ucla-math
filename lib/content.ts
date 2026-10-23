import fs from 'node:fs';
import path from 'node:path';

export interface ContentPage {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  type: string;
  source: string;
  date: string | null;
  modified: string | null;
  description: string;
  html: string;
  text: string;
  headings: { id: string; label: string }[];
  links: { label: string; href: string }[];
  image: string | null;
}
export interface Person { name: string; group: string; title: string; office: string; phone: string; url: string }
export interface MathEvent { day: string; time: string; seminar: string; location: string; speaker: string; title: string; href: string; abstract: string }
export const readContent = <T,>(name: string): T => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', `${name}.json`), 'utf8'));
export const pages = readContent<ContentPage[]>('pages');
export const importReport = readContent<{ importedAt: string; total: number; profiles: number; wordpressPages: number; newsArticles: number; directories: number; seminars: number; failures: { url: string; error: string }[] }>('import-report');
export const snapshotDate = new Date(importReport.importedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
const importedWeek = pages.find(page => page.slug === 'seminar-weekly')?.text.match(/EVENTS FOR THE WEEK OF ([A-Z]+ \d+, \d+)/)?.[1];
export const eventWeek = importedWeek ? importedWeek.charAt(0) + importedWeek.slice(1).toLowerCase() : snapshotDate;
export const pageBySlug = (slug: string) => pages.find(page => page.slug === slug);
export const hrefFor = (slug: string) => `/content/${slug}/`;
export const dateLabel = (date: string | null, short = false) => date ? new Date(date.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', { month: short ? 'short' : 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }) : '';

export const sections: Record<string, { title: string; eyebrow: string; description: string; category: string; featured: string[] }> = {
  undergraduate: { title: 'Find your path in mathematics.', eyebrow: 'Undergraduate', description: 'From your first class to your next big step. Explore our majors, get advice, and find the opportunities that make a UCLA education your own.', category: 'Undergraduate', featured: ['majors-minors-specializations', 'academic-advising', 'courses', 'enrollment-into-math-and-programming-in-computing-pic-courses', 'take-the-placement-test', 'petitions', 'research-for-undergraduates', 'opportunities', 'student-groups', 'tutoring', 'ucla-math-undergraduate-merit-scholarship', 'faq'] },
  graduate: { title: 'Go further. Ask deeper.', eyebrow: 'Graduate', description: 'Join a community advancing the frontiers of pure and applied mathematics. Find everything you need to apply, study, and grow as a researcher.', category: 'Graduate', featured: ['overview-2', 'admissions', 'courses-2', 'graduate-handbook', 'financial-support', 'qualifying-exam-dates', 'past-qualifying-exams', 'formatting-your-ucla-thesis', 'graduate-student-travel-stipends'] },
  research: { title: 'Ideas without boundaries.', eyebrow: 'Research', description: 'Discover the people, questions, and collaborations shaping pure and applied mathematics at UCLA.', category: 'Research', featured: ['research-areas', 'algebra', 'elementor-1671', 'combinatorics', 'computational-applied-mathematics-cam', 'functional-analysis', 'geometry', 'mathematical-logic', 'number-theory', 'probability-mathematical-physics', 'topology', 'mathematical-and-statistical-finance-msf', 'ucla-math-ai-center', 'cam-reports-2021-current', 'workforce-programs'] },
  about: { title: 'Many minds. Infinite possibility.', eyebrow: 'About the department', description: 'A home for mathematical discovery, exceptional teaching, and a community of people who see the world a little differently.', category: 'About', featured: ['about', 'welcome-from-the-chair', 'diversity-inclusion', 'women-in-math', 'curtis-center', 'departmental-awards', 'faculty-honors-awards', 'statement-on-collegiality', 'dept-magazine', 'alumni-donors', 'giving', 'contact'] },
  resources: { title: 'A little less searching.', eyebrow: 'Department resources', description: 'The practical things, all in one place. Computing, forms, policies, spaces, and support for our department community.', category: 'Resources', featured: ['ucla-mathematics-computing', 'knowledge-base', 'mathematics-reading-room', 'student-math-center', 'policy-on-grading', 'merchandise-order-form', 'feedback', 'contact'] },
  news: { title: 'What’s happening in mathematics.', eyebrow: 'News & stories', description: 'Discoveries, achievements, and the people moving our department forward. Explore the latest from UCLA Mathematics and our complete news archive.', category: 'News', featured: [] },
  events: { title: 'Good ideas bring us together.', eyebrow: 'Seminars & events', description: 'Find your next conversation. Explore department seminars, colloquia, distinguished lectures, and our weekly events schedule.', category: 'Events', featured: ['seminar-weekly', 'thursday-colloquium', 'distinguished-lecture-series', 'inclusive-exclusive-events'] },
};

export const navGroups = [
  { label: 'About', href: '/about/', links: [['Our department', '/about/'], ['Welcome from the chair', hrefFor('welcome-from-the-chair')], ['Diversity & inclusion', hrefFor('diversity-inclusion')], ['Alumni & giving', hrefFor('alumni-donors')], ['Visit & contact', hrefFor('contact')]] },
  { label: 'People', href: '/people/', links: [['Faculty', '/people/?group=ladder'], ['Visiting faculty', '/people/?group=visiting'], ['Graduate students', '/people/?group=grad'], ['Staff', '/people/?group=staff'], ['All people', '/people/']] },
  { label: 'Academics', href: '/undergraduate/', links: [['Undergraduate program', '/undergraduate/'], ['Graduate program', '/graduate/'], ['Courses & enrollment', hrefFor('courses')], ['Academic advising', hrefFor('academic-advising')], ['Summer sessions', hrefFor('summer')]] },
  { label: 'Research', href: '/research/', links: [['Research areas', '/research/'], ['UCLA Math AI Center', hrefFor('ucla-math-ai-center')], ['CAM reports', hrefFor('cam-reports-2021-current')], ['Honors & awards', hrefFor('faculty-honors-awards')], ['Research for undergraduates', hrefFor('research-for-undergraduates')]] },
  { label: 'News & Events', href: '/news/', links: [['News & stories', '/news/'], ['Seminars & events', '/events/'], ['Weekly calendar', hrefFor('seminar-weekly')], ['Distinguished lectures', hrefFor('distinguished-lecture-series')], ['Department magazine', hrefFor('dept-magazine')]] },
];
