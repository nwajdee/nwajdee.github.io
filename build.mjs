/* ============================================================
   build.mjs — zero-dependency static generator
   Emits real HTML documents for every route so clean URLs work
   natively on GitHub Pages (directory index files, real 200s):
     /            → index.html
     /work/       → work/index.html
     /about/      → about/index.html
     /contact/    → contact/index.html
     /work/<id>/  → work/<id>/index.html   (×11)
   plus assets/site.css, assets/site.js, sitemap.xml, robots.txt,
   and a styled 404.html. Run: node build.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS, SERVICES, RECENT, SITE } from './src/data.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const read = p => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => { mkdirSync(dirname(join(ROOT, p)), { recursive: true }); writeFileSync(join(ROOT, p), s, 'utf8'); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const byId = id => PROJECTS.find(p => p.id === id);
const shell = read('src/shell.html');

/* ---------- server-rendered lists (markup identical to the old client builders) ---------- */
function renderRows() {
  return RECENT.map(id => {
    const p = byId(id);
    return '<a class="work-row" data-id="' + p.id + '" href="/work/' + p.id + '/" aria-label="' + esc(p.title + ' - ' + p.cat) + '">' +
      '<div class="work-row__thumb"><img src="' + p.img + '" alt="" loading="lazy"></div>' +
      '<h3 class="work-row__title">' + esc(p.title) + '</h3>' +
      '<div class="work-row__meta"><span class="work-row__cat">' + esc(p.cat) + '</span><span class="work-row__year">' + esc(p.year) + '</span></div></a>';
  }).join('\n');
}
function renderCards() {
  return PROJECTS.map((p, i) =>
    '<article class="card" data-id="' + p.id + '" style="z-index:' + (i + 1) + '">' +
      '<div class="card__inner">' +
        '<div class="card__media"><img src="' + p.img + '" alt="' + esc(p.title) + '" loading="lazy"></div>' +
        '<div class="card__body">' +
          '<div><div class="card__idx">' + String(i + 1).padStart(2, '0') + ' / ' + String(PROJECTS.length).padStart(2, '0') + '</div>' +
          '<h2 class="card__title">' + esc(p.title) + '</h2><div class="card__cat">' + esc(p.cat) + '</div>' +
          '<p class="card__desc">' + esc(p.desc) + '</p>' +
          '<div class="card__tags">' + p.tags.map(t => '<span class="card__tag">' + esc(t) + '</span>').join('') + '</div></div>' +
          '<div class="card__foot"><span class="card__year">' + esc(p.year) + '</span>' +
          '<a class="card__open" href="/work/' + p.id + '/">View project <svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg></a></div>' +
        '</div>' +
      '</div>' +
    '</article>').join('\n');
}
function renderServices() {
  return SERVICES.map((s, i) =>
    '<div class="service" data-reveal><span class="service__idx">' + String(i + 1).padStart(2, '0') + '</span><h3 class="service__name">' + esc(s.n) + '</h3><p class="service__desc">' + esc(s.d) + '</p></div>').join('\n');
}

/* ---------- case template fill ---------- */
function fillCase(tpl, p) {
  const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
  const sub = (a, b) => { if (!tpl.includes(a)) throw new Error('case template missing: ' + a); tpl = tpl.replace(a, b); };
  sub('id="caseTitle" data-reveal></h1>', 'id="caseTitle" data-reveal>' + esc(p.title) + '</h1>');
  sub('id="caseRole"></p>', 'id="caseRole">' + esc(p.role) + '</p>');
  sub('id="caseYear"></p>', 'id="caseYear">' + esc(p.year) + '</p>');
  if (!/<img id="caseImg"[^>]*\/>/.test(tpl)) throw new Error('caseImg missing');
  tpl = tpl.replace(/<img id="caseImg"[^>]*\/>/, '<img id="caseImg" src="' + p.img + '" alt="' + esc(p.title + ' - project cover') + '" />');
  const m = p.media;
  const vid = (id, src, label) => '<video id="' + id + '" data-casevideo muted loop playsinline preload="metadata" tabindex="0" aria-label="' + esc(label) + '" src="' + src + '" poster="' + m.poster + '"></video>';
  tpl = tpl.replace(/<video id="caseTour"[^>]*><\/video>/, vid('caseTour', m.tour, p.title + ' desktop walkthrough - click to pause or play'));
  tpl = tpl.replace(/<video id="caseFlow"[^>]*><\/video>/, vid('caseFlow', m.flow, p.title + ' secondary flow - click to pause or play'));
  const shot = (id, src, alt) => '<img id="' + id + '" src="' + src + '" alt="' + esc(alt) + '" loading="lazy" />';
  tpl = tpl.replace(/<img id="caseDetail"[^>]*\/>/, shot('caseDetail', m.detail, p.title + ' - detail shot'));
  tpl = tpl.replace(/<img id="caseFull"[^>]*\/>/, shot('caseFull', m.full, p.title + ' - full-width site visual'));
  tpl = tpl.replace(/<img id="caseM1"[^>]*\/>/, shot('caseM1', m.m[0], p.title + ' - mobile screen 1'));
  tpl = tpl.replace(/<img id="caseM2"[^>]*\/>/, shot('caseM2', m.m[1], p.title + ' - mobile screen 2'));
  tpl = tpl.replace(/<img id="caseM3"[^>]*\/>/, shot('caseM3', m.m[2], p.title + ' - mobile screen 3'));
  sub('id="caseMobileCap">Mobile experience<', 'id="caseMobileCap">Mobile experience - ' + esc(p.title) + '<');
  const liveOpen = '<div class="case-live-row"><a class="btn" id="caseLive" target="_blank" rel="noopener">';
  if (p.url) sub(liveOpen, '<div class="case-live-row"><a class="btn" id="caseLive" href="' + esc(p.url) + '" target="_blank" rel="noopener">');
  else sub(liveOpen, '<div class="case-live-row" style="display:none"><a class="btn" id="caseLive" target="_blank" rel="noopener">');
  sub('<span>Live site</span>', '<span>' + (p.url && p.url.charAt(0) === '/' ? 'Open mockup' : 'Live site') + '</span>');
  sub('id="caseDesc" data-reveal></p>', 'id="caseDesc" data-reveal>' + esc(p.desc) + '</p>');
  sub('id="caseOutcome"></span>', 'id="caseOutcome">' + esc(p.outcome) + '</span>');
  sub('id="caseTags" data-reveal></div>', 'id="caseTags" data-reveal>' + p.tags.map(t => '<span class="card__tag">' + esc(t) + '</span>').join('') + '</div>');
  sub('id="caseNext" href="/work/">', 'id="caseNext" href="/work/' + next.id + '/">');
  sub('id="caseNextTitle"></span>', 'id="caseNextTitle">' + esc(next.title) + '</span>');
  return tpl;
}

/* ---------- client data island (preview images + curtain labels) ---------- */
const ISLAND = JSON.stringify({
  imgs: Object.fromEntries(PROJECTS.map(p => [p.id, p.img])),
  gifs: Object.fromEntries(PROJECTS.map(p => [p.id, p.media.gif])),
  titles: Object.fromEntries(PROJECTS.map(p => [p.id, p.title]))
});

/* ---------- page definitions ---------- */
const PAGES = [
  { file: 'index.html', partial: 'home', path: '/', nav: '', curtain: 'Home', ogType: 'website',
    title: SITE.name + ' - ' + SITE.role,
    desc: 'Jordan Nwachukwu is a creative technologist and founder helping ecommerce brands stand out and sell more - strategy, creative, code and media buying under one roof.',
    ogDesc: 'Strategy, creative, code and media buying under one roof.' },
  { file: 'work/index.html', partial: 'work', path: '/work/', nav: 'work', curtain: 'Work', ogType: 'website',
    title: 'Work - ' + SITE.name,
    desc: 'Eleven builds across food, fashion, beauty, events and software - client storefronts and my own products. Strategy, design and code by Jordan Nwachukwu.',
    ogDesc: 'Client storefronts and my own products - strategy, design and code by me.' },
  { file: 'about/index.html', partial: 'about', path: '/about/', nav: 'about', curtain: 'About', ogType: 'website',
    title: 'About - ' + SITE.name,
    desc: 'Jordan Nwachukwu is a creative technologist and founder based in Aba, Nigeria - marketing strategy, design and engineering under one roof.',
    ogDesc: 'I build the whole thing - the pitch, the funnel and the product.' },
  { file: 'contact/index.html', partial: 'contact', path: '/contact/', nav: 'contact', curtain: 'Contact', ogType: 'website',
    title: 'Contact - ' + SITE.name,
    desc: "Tell Jordan what you're building or selling. Strategy, creative, code and media buying - usually replies within a day.",
    ogDesc: "Let's work together - usually replies within a day." },
  ...PROJECTS.map(p => ({
    file: 'work/' + p.id + '/index.html', partial: 'case', path: '/work/' + p.id + '/', nav: 'work',
    curtain: p.title, ogType: 'article', project: p, ogImage: SITE.origin + p.img,
    title: p.title + ' - ' + SITE.name, desc: p.desc, ogDesc: p.desc
  })),
  { file: '404.html', partial: '404', path: '/404.html', nav: '', curtain: '404', ogType: 'website',
    title: 'Page not found - ' + SITE.name, desc: 'This page does not exist.', ogDesc: 'This page does not exist.',
    robots: '<meta name="robots" content="noindex" />', noCanonical: true }
];

function emit(def) {
  let pageHtml = read('src/pages/' + def.partial + '.html');
  if (def.partial === 'home') pageHtml = pageHtml.replace('<div id="recentRows"></div>', '<div id="recentRows">\n' + renderRows() + '\n</div>');
  if (def.partial === 'work') pageHtml = pageHtml.replace('<section class="cards wrap" id="cards"></section>', '<section class="cards wrap" id="cards">\n' + renderCards() + '\n</section>');
  if (def.partial === 'about') pageHtml = pageHtml.replace('<div id="services"></div>', '<div id="services">\n' + renderServices() + '\n</div>');
  if (def.partial === 'case') pageHtml = fillCase(pageHtml, def.project);
  if (!pageHtml.includes('class="page"')) throw new Error('page div missing in ' + def.partial);
  pageHtml = pageHtml.replace('class="page"', 'class="page active" data-curtain="' + esc(def.curtain) + '"');

  const canonical = SITE.origin + def.path;
  const ogImage = def.ogImage || SITE.origin + SITE.portrait;
  const tokens = {
    '{{TITLE}}': esc(def.title),
    '{{DESCRIPTION}}': esc(def.desc),
    '{{ROBOTS}}': def.robots || '',
    '{{OG_TITLE}}': esc(def.title),
    '{{OG_DESCRIPTION}}': esc(def.ogDesc),
    '{{OG_TYPE}}': def.ogType,
    '{{CANONICAL}}': canonical,
    '{{OG_IMAGE}}': ogImage,
    '{{ACTIVE_WORK}}': def.nav === 'work' ? ' active' : '',
    '{{ACTIVE_ABOUT}}': def.nav === 'about' ? ' active' : '',
    '{{ACTIVE_CONTACT}}': def.nav === 'contact' ? ' active' : '',
    '{{PAGE}}': pageHtml,
    '{{DATA}}': ISLAND
  };
  let html = shell;
  for (const [k, v] of Object.entries(tokens)) html = html.split(k).join(v);
  if (def.noCanonical) html = html.replace('<link rel="canonical" href="' + canonical + '" />\n', '');
  if (html.includes('{{')) throw new Error('unreplaced token in ' + def.file);
  write(def.file, html);
  return def.file;
}

const emitted = PAGES.map(emit);

/* ---------- shared assets ---------- */
copyFileSync(join(ROOT, 'src/site.css'), join(ROOT, 'assets/site.css'));
copyFileSync(join(ROOT, 'src/site.js'), join(ROOT, 'assets/site.js'));
emitted.push('assets/site.css', 'assets/site.js');

/* ---------- sitemap + robots ---------- */
const today = new Date().toISOString().slice(0, 10);
const prio = p => p === '/' ? '1.0' : p === '/work/' ? '0.9' : p.startsWith('/work/') ? '0.8' : '0.7';
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  PAGES.filter(p => !p.noCanonical).map(p =>
    '  <url>\n    <loc>' + SITE.origin + p.path + '</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + prio(p.path) + '</priority>\n  </url>').join('\n') +
  '\n</urlset>\n';
write('sitemap.xml', sitemap);
write('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /src/\nDisallow: /maintenance.html\nDisallow: /404.html\n\nSitemap: ' + SITE.origin + '/sitemap.xml\n');
emitted.push('sitemap.xml', 'robots.txt');

/* ---------- retire the parked SPA fallback (obsolete: real files now) ---------- */
if (existsSync(join(ROOT, '_redirects'))) { unlinkSync(join(ROOT, '_redirects')); console.log('removed _redirects (SPA fallback no longer needed)'); }

console.log('BUILD OK — ' + emitted.length + ' files');
emitted.forEach(f => console.log('  ' + f));