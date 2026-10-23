import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import Fuse from 'fuse.js';

const pages = JSON.parse(fs.readFileSync('content/pages.json', 'utf8'));
const index = JSON.parse(fs.readFileSync('public/search-index.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('content/import-report.json', 'utf8'));
const people = JSON.parse(fs.readFileSync('content/people.json', 'utf8'));
assert.equal(pages.length, report.total, 'Import report must match the content collection');
assert.equal(index.length, pages.length, 'Every content entry must be searchable');
const slugs = new Set(pages.map(page => page.slug));
assert.equal(slugs.size, pages.length, 'Every content route must be unique');
assert.equal(report.failures.length, 0, 'Resolve or document any import failures');
let checked = 0;
for (const page of pages) {
  const $ = load(page.html);
  assert.equal($('script,iframe,object,embed,form').length, 0, `Unsafe imported element in ${page.slug}`);
  $('*').each((_, node) => {
    assert(!Object.keys(node.attribs || {}).some(key => /^on/i.test(key)), `Inline handler in ${page.slug}`);
  });
  $('a[href]').each((_, node) => {
    const href = $(node).attr('href');
    assert(!/^javascript:/i.test(href), `Unsafe link in ${page.slug}`);
    if (href.startsWith('/content/')) { assert(slugs.has(decodeURIComponent(href.split('/')[2])), `Broken local link ${href} in ${page.slug}`); checked++; }
  });
  if (page.type === 'profile') assert(!/ude\.alcu\.htam@/.test(page.text), `Reversed contact address in ${page.slug}`);
  assert(fs.existsSync(`out/content/${page.slug}/index.html`), `Missing built page for ${page.slug}`);
}
for (const person of people) if (person.url.startsWith('/content/')) assert(slugs.has(person.url.split('/')[2]), `Broken profile link for ${person.name}`);
const fuse = new Fuse(index, { keys: [{ name: 'title', weight: .65 }, { name: 'description', weight: .2 }, { name: 'text', weight: .15 }], threshold: .3, ignoreLocation: true });
for (const [query, expected] of [['advisng', 'academic-advising'], ['graduate admissions', 'admissions'], ['Tao', 'person-tao'], ['financial support', 'financial-support']]) {
  assert.equal(fuse.search(query)[0]?.item.slug, expected, `Search must find the right result for ${query}`);
}
console.log(`Verified ${pages.length} built content pages, ${checked} internal links, ${people.length} directory records, HTML sanitization, and representative search queries.`);
