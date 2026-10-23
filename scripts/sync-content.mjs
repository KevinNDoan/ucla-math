import { load } from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const origin = 'https://ww3.math.ucla.edu';
const failures = [];
await mkdir(path.join(root, 'content/raw'), { recursive: true });
await mkdir(path.join(root, 'public/images'), { recursive: true });

async function get(url, json = false) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000), headers: { 'User-Agent': 'UCLAMathContentArchive/1.0 (public website redesign)' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return json ? await response.json() : await response.text();
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }
}

const decode = html => load(`<body>${html ?? ''}</body>`).text().replace(/\s+/g, ' ').trim();
const homepage = await get(origin);
await writeFile('content/raw/home.html', homepage);
const $home = load(homepage);
const originalLinks = [];
$home('a[href]').each((_, node) => {
  const a = $home(node);
  const label = a.text().replace(/\s+/g, ' ').trim();
  let url;
  try { url = new URL(a.attr('href'), origin).href; } catch { return; }
  if (label && !url.endsWith('#') && !label.startsWith('Read More')) originalLinks.push({ label, url });
});
const navigation = [...new Map(originalLinks.map(link => [link.url, link])).values()];
const types = await get(`${origin}/wp-json/wp/v2/types`, true);
const collections = Object.values(types).filter(type => type.rest_namespace === 'wp/v2' && ['page', 'post', 'dls', 'announcements_ugrad', 'opportunities_ugrad', 'math_announce_oppor', 'portfolio'].includes(type.slug));
const entries = [];
for (const type of collections) {
  console.log(`Importing ${type.slug}…`);
  let page = 1;
  while (true) {
    const url = `${origin}/wp-json/wp/v2/${type.rest_base}?per_page=100&page=${page}&_fields=id,date,modified,slug,link,title,content,excerpt,parent,featured_media,categories`;
    try {
      const batch = await get(url, true);
      if (!Array.isArray(batch) || !batch.length) break;
      entries.push(...batch.map(entry => ({ ...entry, type: type.slug })));
      console.log(`${type.slug} batch ${page}: ${batch.length}`);
      page++;
    } catch (error) {
      if (!String(error).includes('400')) failures.push({ url, error: String(error) });
      break;
    }
  }
}
await writeFile('content/raw/wordpress.json', JSON.stringify(entries));

// Lecture metadata lives in the rendered template rather than the WordPress body.
const renderedEntries = entries.filter(entry => entry.type === 'dls' || !decode(entry.content?.rendered));
for (let i = 0; i < renderedEntries.length; i += 3) {
  await Promise.all(renderedEntries.slice(i, i + 3).map(async entry => {
    try {
      const $ = load(await get(entry.link));
      $('#header, #footer, #socket, nav, header, footer, script, style, .av-share-box, .post-navigation').remove();
      const main = $('#main').first();
      entry.content = { rendered: main.html() || entry.content?.rendered || '' };
      if (!decode(entry.content.rendered)) entry.content.rendered = `<p>This resource is available on the original UCLA Mathematics website.</p><p><a href="${entry.link}">Open ${decode(entry.title.rendered)}</a></p>`;
    } catch (error) { failures.push({ url: entry.link, error: String(error) }); }
  }));
}
console.log(`Rendered lecture and resource pages: ${renderedEntries.length}`);

const externalSources = navigation.filter(link => /https:\/\/(www|secure)\.math\.ucla\.edu\/(people|seminars\/)/.test(link.url));
for (let i = 0; i < externalSources.length; i += 3) {
  await Promise.all(externalSources.slice(i, i + 3).map(async link => {
    try {
      const html = await get(link.url);
      const $ = load(html);
      $('script, style, header, footer, nav, #header, #skip-link, #navbar, .navbar, #navigation, #footer, #block-system-main-menu, #block-system-user-menu').remove();
      const main = $('main, #content, .main-container, .region-content, article').first();
      const content = main.length ? main.html() : $('body').html();
      const slug = link.url.includes('/people') ? `directory-${new URL(link.url).pathname.split('/').filter(Boolean).at(-1)}` : `seminar-${new URL(link.url).searchParams.get('type')?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'weekly'}`;
      entries.push({ id: `external-${slug}`, type: link.url.includes('/people') ? 'directory' : 'seminar', slug, link: link.url, title: { rendered: link.label }, content: { rendered: content }, date: null, modified: null });
    } catch (error) { failures.push({ url: link.url, error: String(error) }); }
  }));
  console.log(`Directories & seminars: ${Math.min(i + 3, externalSources.length)}/${externalSources.length}`);
}

const profiles = new Map();
for (const entry of entries.filter(entry => entry.type === 'directory')) {
  const $ = load(entry.content.rendered);
  $('table tbody tr').each((_, node) => {
    const cells = $(node).find('td');
    const href = cells.eq(0).find('a').attr('href');
    if (!href) return;
    const url = new URL(href, entry.link).href;
    if (!url.includes('/people/')) return;
    const name = cells.eq(0).text().replace(/\s+/g, ' ').trim();
    profiles.set(url, { name, group: entry.slug.replace('directory-', '') });
  });
}
const profileSources = [...profiles];
for (let i = 0; i < profileSources.length; i += 4) {
  await Promise.all(profileSources.slice(i, i + 4).map(async ([url, person]) => {
    try {
      const $ = load(await get(url));
      $('script,style,header,footer,nav,#header,#skip-link,.navbar,#navbar,#navigation,#footer,#block-system-main-menu,#block-system-user-menu,.breadcrumb').remove();
      const main = $('main, #content, .main-container, .region-content, article').first();
      const name = person.name.includes(',') ? person.name.split(',').reverse().join(' ').trim() : person.name;
      const slug = `person-${new URL(url).pathname.split('/').filter(Boolean).at(-1)}`;
      entries.push({ id: slug, slug, type: 'profile', link: url, title: { rendered: name }, content: { rendered: main.html() || $('body').html() }, date: null, modified: null });
    } catch (error) { failures.push({ url, error: String(error) }); }
  }));
  if (i % 40 === 0 || i + 4 >= profileSources.length) console.log(`People profiles: ${Math.min(i + 4, profileSources.length)}/${profileSources.length}`);
}

const usedSlugs = new Set();
for (const entry of entries) {
  if (usedSlugs.has(entry.slug)) entry.slug += `-${entry.id}`;
  usedSlugs.add(entry.slug);
}
const byUrl = new Map(entries.map(entry => [entry.link.replace(/\/$/, ''), entry]));
const byId = new Map(entries.map(entry => [String(entry.id), entry]));
function localHref(href, base = origin) {
  if (!href || href.startsWith('#') || /^(mailto:|tel:)/.test(href)) return href;
  try {
    const url = new URL(href, base);
    if (!['https:', 'http:'].includes(url.protocol)) return '#';
    const found = byUrl.get(url.href.replace(/\/$/, '').split('#')[0]) || (url.hostname === 'ww3.math.ucla.edu' ? byId.get(url.searchParams.get('page_id') || url.searchParams.get('p')) : null);
    if (url.href === `${origin}/`) return '/';
    return found ? `/content/${found.slug}/${url.hash}` : url.href;
  } catch { return href; }
}

function category(entry) {
  const text = `${entry.title?.rendered} ${entry.slug}`.toLowerCase();
  if (entry.type === 'post') return 'News';
  if (['announcements_ugrad', 'opportunities_ugrad', 'math_announce_oppor'].includes(entry.type)) return 'Undergraduate';
  if (entry.type === 'dls') return 'Events';
  if (entry.type === 'directory' || entry.type === 'profile' || /faculty|staff|people|tutor/.test(text)) return 'People';
  if (entry.type === 'seminar' || /lecture|colloquium|seminar|workshop|events|calendar/.test(text)) return 'Events';
  if (/graduate|admission|qualifying|phd|ph-d|handbook/.test(text) && !/undergraduate/.test(text)) return 'Graduate';
  if (/undergraduate|major|minor|specialization|advising|placement|petition|enrollment|courses$|pic-|summer|scholarship|student-group|math-center|opportunities/.test(text)) return 'Undergraduate';
  if (/research|cam-report|workforce|ai-center|curtis|applied-math/.test(text)) return 'Research';
  if (/comput|resource|form|reading-room|policy|policies|merchandise|feedback/.test(text)) return 'Resources';
  return 'About';
}

const content = entries.map(entry => {
  const $ = load(entry.content?.rendered || '');
  $('object,embed').each((_, node) => {
    const resource = $(node).attr('data') || $(node).attr('src');
    if (resource) $(node).replaceWith(`<p><a href="${localHref(resource, entry.link)}">View attached document ↗</a></p>`);
    else $(node).remove();
  });
  $('script,style,noscript,svg,form,link,meta,button,input,select,textarea,.elementor-pagination,.pagination,.av-share-box').remove();
  $('.changedirection').each((_, node) => {
    const address = $(node).text().split('').reverse().join('');
    $(node).replaceWith(`<a href="mailto:${address}">${address}</a>`);
  });
  $('a[href="#"]').each((_, node) => {
    if (/^(hide|next|previous|«|»)/i.test($(node).text().trim())) $(node).remove();
    else $(node).replaceWith($(node).contents());
  });
  if (entry.type === 'profile') {
    $('h1').first().remove();
    $('h2').each((_, node) => $(node).replaceWith(`<p><strong>${$(node).text().trim()}</strong></p>`));
  }
  $('*').each((_, node) => {
    for (const attr of Object.keys(node.attribs || {})) {
      if (!['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'id', 'width', 'height'].includes(attr)) $(node).removeAttr(attr);
    }
  });
  $('a').each((_, node) => { $(node).attr('href', localHref($(node).attr('href'), entry.link)); });
  $('img').each((_, node) => {
    const src = $(node).attr('src');
    if (src) $(node).attr('src', new URL(src, entry.link).href).attr('loading', 'lazy');
    $(node).removeAttr('width').removeAttr('height');
  });
  $('iframe').each((_, node) => {
    const src = $(node).attr('src');
    if (src) $(node).replaceWith(`<p><a href="${localHref(src, entry.link)}">Open embedded resource ↗</a></p>`);
    else $(node).remove();
  });
  const title = decode(entry.title?.rendered) || entry.slug;
  const $text = load($.html());
  $text('p,div,td,th,li,h1,h2,h3,h4,br').append(' ');
  const text = $text.text().replace(/\s+/g, ' ').trim();
  const headings = [];
  $('h2,h3').each((index, node) => {
    const label = $(node).text().trim();
    if (label) { $(node).attr('id', `section-${index}`); headings.push({ id: `section-${index}`, label }); }
  });
  const links = [];
  $('a[href]').each((_, node) => { const label = $(node).text().trim(); if (label) links.push({ label, href: $(node).attr('href') }); });
  return { id: entry.id, slug: entry.slug, title, category: category(entry), type: entry.type, source: entry.link, date: entry.date, modified: entry.modified, description: decode(entry.excerpt?.rendered) || text.slice(0, 230), html: $('body').html() || '', text, headings, links, image: $('img').first().attr('src') || null };
}).filter(entry => entry.title && (entry.text || entry.html));

const people = [];
for (const entry of content.filter(entry => entry.type === 'directory' && entry.slug !== 'directory-people')) {
  const $ = load(entry.html);
  const group = entry.slug.replace('directory-', '');
  $('table tbody tr').each((_, node) => {
    const cells = $(node).find('td');
    if (cells.length < 2) return;
    const name = cells.eq(0).text().replace(/\s+/g, ' ').trim();
    if (!name) return;
    people.push({ name, group, title: cells.eq(1).text().trim(), office: cells.eq(2).text().replace(/\s+/g, ' ').trim(), phone: cells.eq(3).text().trim(), url: cells.eq(0).find('a').attr('href') || entry.source });
  });
}
await writeFile('content/people.json', JSON.stringify(people));
const weekly = content.find(entry => entry.slug === 'seminar-weekly');
const events = [];
if (weekly) {
  const $ = load(weekly.html);
  let day = '';
  const rows = $('table').first().find('tr').toArray();
  rows.forEach((node, i) => {
    const cells = $(node).children('td');
    const first = cells.first().text().trim();
    if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),/.test(first)) day = first;
    if (/^\d{1,2}:\d{2}/.test(first)) {
      const next = $(rows[i + 1]).children('td');
      const seminar = cells.eq(1).find('a').text().trim();
      const location = cells.eq(1).text().replace(seminar, '').replace(/[()]/g, '').trim();
      events.push({ day, time: first, seminar, location, speaker: next.eq(1).text().trim(), title: next.eq(2).text().trim(), href: cells.eq(1).find('a').attr('href'), abstract: $(rows[i + 2]).text().replace(/^Abstract\./, '').replace(/Hide$/, '').trim() });
    }
  });
}
await writeFile('content/events.json', JSON.stringify(events));

const assets = {
  'math-sciences.jpg': `${origin}/wp-content/uploads/2023/10/Math-Sciences-Building-13.jpg`,
  'community.jpg': `${origin}/wp-content/uploads/2023/10/Applied-REU-group3.jpg`,
  'hong-wang.jpg': `${origin}/wp-content/uploads/2026/07/Hong-Wang-Fields-Medal-2026-1.jpg`,
  'ariana-chin.jpg': `${origin}/wp-content/uploads/2026/06/Ariana-Chin-1015x1030.jpg`,
};
await Promise.all(Object.entries(assets).map(async ([name, url]) => {
  try { const response = await fetch(url); if (!response.ok) throw new Error(`HTTP ${response.status}`); await writeFile(`public/images/${name}`, Buffer.from(await response.arrayBuffer())); }
  catch (error) { failures.push({ url, error: String(error) }); }
}));
await writeFile('content/pages.json', JSON.stringify(content));
await writeFile('content/navigation.json', JSON.stringify(navigation.map(link => ({ ...link, href: localHref(link.url) })), null, 2));
const index = content.map(({ id, slug, title, category, type, description, text, source }) => ({ id, slug, title, category, type, description: description.slice(0, 240), text, source }));
await writeFile('public/search-index.json', JSON.stringify(index));
const report = { importedAt: new Date().toISOString(), source: origin, total: content.length, wordpressPages: content.filter(x => x.type === 'page').length, newsArticles: content.filter(x => x.type === 'post').length, profiles: content.filter(x => x.type === 'profile').length, directories: content.filter(x => x.type === 'directory').length, seminars: content.filter(x => x.type === 'seminar').length, categories: Object.fromEntries([...new Set(content.map(x => x.category))].map(key => [key, content.filter(x => x.category === key).length])), failures, scope: 'All published pages and posts exposed by the public WordPress API, rendered distinguished lecture pages, the people directories and linked department profiles, and seminar schedules linked from the main navigation. Linked PDFs, faculty personal sites, external services, and authenticated intranet resources retain their original URLs. Content is a snapshot; rerun npm run sync:content to refresh.' };
await writeFile('content/import-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
