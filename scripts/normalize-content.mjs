import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';

const acronyms = new Set(['UCLA', 'UC', 'USA', 'US', 'UK', 'NSF', 'REU', 'PIC', 'CAM', 'IPAM', 'MSRI', 'GPA', 'GRE', 'TOEFL', 'IELTS', 'AP', 'IB', 'SAT', 'ACT', 'STEM', 'PDE', 'AI', 'ML', 'SIAM', 'AMS', 'MAA', 'BIPOC', 'LGBTQ', 'LGBTQIA', 'RSVP', 'FAQ', 'TA', 'TAs', 'MS', 'BA', 'BS', 'MA', 'PhD', 'UCB', 'UCSD', 'UCSB', 'UCI', 'UCSC', 'UCR', 'USC', 'NYU', 'MIT', 'HBCU', 'HBCUs']);

export function cleanPunctuation(value) {
  return value.replace(/\s*\u2014\s*/g, ', ');
}

export function readableHeading(value) {
  const text = cleanPunctuation(value);
  if (text !== text.toUpperCase() || !/[A-Z]{4,}/.test(text)) return text;
  let first = true;
  return text.replace(/[A-Za-z][A-Za-z’'-]*/g, word => {
    if (acronyms.has(word)) return word;
    const normal = word.toLowerCase();
    if (first) { first = false; return normal.charAt(0).toUpperCase() + normal.slice(1); }
    return normal;
  });
}

export function normalizeCollection(pages) {
  for (const page of pages) {
    const $ = load(page.html);
    $('*').contents().each((_, node) => {
      if (node.type === 'text') {
        const parentTag = node.parent?.name;
        if (!['code', 'pre', 'math'].includes(parentTag)) {
          const original = cleanPunctuation(node.data);
          const isAuthorList = original === original.toUpperCase() && original.includes(',') && /\bAND\b/.test(original) && !/\b(OF|FOR|THE|UNIVERSITY|MATH|SCIENCE)\b/.test(original);
          node.data = isAuthorList
            ? original.toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase()).replace(/\bAnd\b/g, 'and')
            : readableHeading(original).replace(/\bUniversity of california\b/g, 'University of California').replace(/\blos angeles\b/g, 'Los Angeles');
        } else node.data = cleanPunctuation(node.data);
      }
    });
    $('h1,h2,h3,h4,h5,h6,th').each((_, node) => {
      if ($(node).text() === $(node).text().toUpperCase()) {
        let first = true;
        const descendants = [];
        const visit = parent => { for (const child of parent.children || []) { if (child.type === 'text') descendants.push(child); else visit(child); } };
        visit(node);
        for (const textNode of descendants) {
          textNode.data = textNode.data.replace(/[A-Za-z][A-Za-z’'-]*/g, word => {
            if (acronyms.has(word)) return word;
            const lower = word.toLowerCase();
            if (first) { first = false; return lower.charAt(0).toUpperCase() + lower.slice(1); }
            return lower;
          });
        }
      }
    });
    page.title = readableHeading(page.title);
    page.description = cleanPunctuation(page.description);
    page.html = $('body').html() || '';
    const $text = load(page.html);
    $text('p,div,td,th,li,h1,h2,h3,h4,br').append(' ');
    page.text = $text.text().replace(/\s+/g, ' ').trim();
    page.headings = page.headings.map(heading => ({ ...heading, label: readableHeading(heading.label) }));
    page.links = page.links.map(link => ({ ...link, label: cleanPunctuation(link.label) }));
  }
  return pages;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pages = normalizeCollection(JSON.parse(fs.readFileSync('content/pages.json', 'utf8')));
  fs.writeFileSync('content/pages.json', JSON.stringify(pages));
  fs.writeFileSync('public/search-index.json', JSON.stringify(pages.map(({ id, slug, title, category, type, description, text, source }) => ({ id, slug, title, category, type, description: description.slice(0, 240), text, source }))));
  for (const name of ['people', 'events']) {
    const entries = JSON.parse(fs.readFileSync(`content/${name}.json`, 'utf8'));
    for (const entry of entries) for (const [key, value] of Object.entries(entry)) if (typeof value === 'string' && !['url', 'href'].includes(key)) entry[key] = cleanPunctuation(value);
    fs.writeFileSync(`content/${name}.json`, JSON.stringify(entries));
  }
  console.log(`Updated presentation text in ${pages.length} content entries and rebuilt the search index.`);
}
