/* ============================================================
   build.mjs - zero-dependency static generator
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
import { PROJECTS, SERVICES, RECENT, SITE, BOOKS, ACADEMY, POSTS } from './src/data.mjs';

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

/* ---------- resources renderers ---------- */
const ARR = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>';
const btn = (href, label, solid, extra) => '<a class="btn' + (solid ? ' btn--solid' : '') + '" href="' + href + '"' + (extra || '') + ' data-magnetic><span class="btn__bg" aria-hidden="true"></span><span>' + label + '</span>' + ARR + '</a>';
const fmtDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const bookById = id => BOOKS.find(b => b.id === id);
const postById = id => POSTS.find(p => p.id === id);

function primaryCta(b, extra) {
  return b.pdf
    ? btn(b.pdf, 'Download free PDF', true, ' download' + (extra || ''))
    : btn(b.wa, 'Buy on WhatsApp · ' + b.priceLabel, true, ' target="_blank" rel="noopener"' + (extra || ''));
}
function renderShelf() {
  return BOOKS.map((b, i) =>
    '<article class="shelf-item" data-id="' + b.id + '" style="--bk:' + b.accent[0] + ';--bk-l:' + b.accent[1] + '" data-reveal>' +
      '<div class="shelf-item__stage">' +
        '<div class="book3d" data-book="' + b.id + '" data-mode="shelf"><img class="book3d__fallback" src="' + b.covers.a.front + '" alt="' + esc(b.title) + ' - front cover" /></div>' +
      '</div>' +
      '<div class="shelf-item__info">' +
        '<div class="shelf-item__top mono"><span>' + String(i + 1).padStart(2, '0') + ' / ' + String(BOOKS.length).padStart(2, '0') + '</span><span class="price-tag">' + esc(b.priceLabel) + '</span></div>' +
        '<h2 class="shelf-item__title">' + esc(b.title) + '</h2>' +
        '<p class="shelf-item__sub">' + esc(b.subtitle) + '</p>' +
        '<p class="shelf-item__hook">' + esc(b.hook) + '</p>' +
        '<div class="shelf-item__meta mono">' + esc(b.format) + '</div>' +
        '<div class="shelf-item__cta">' + btn(b.href, b.pdf ? 'Read free' : 'View book', true) + '</div>' +
      '</div>' +
    '</article>').join('\n');
}
function renderHubNotes() {
  return POSTS.map(p =>
    '<a class="note-row" href="' + p.href + '" data-reveal>' +
      '<span class="note-row__cat mono">' + esc(p.cat) + '</span>' +
      '<h3 class="note-row__title">' + esc(p.title) + '</h3>' +
      '<span class="note-row__meta mono">' + esc(p.read) + ' · ' + fmtDate(p.date) + '</span>' + ARR +
    '</a>').join('\n');
}
function renderBlogIndex() {
  return POSTS.map(p => {
    return '<article class="post-card" data-cat="' + esc(p.cat) + '" data-reveal>' +
      '<a href="' + p.href + '">' +
        '<div class="post-card__meta mono"><span class="post-card__cat">' + esc(p.cat) + '</span><span>' + esc(p.read) + '</span></div>' +
        '<h2 class="post-card__title">' + esc(p.title) + '</h2>' +
        '<p class="post-card__dek">' + esc(p.dek) + '</p>' +
        '<div class="post-card__foot"><span class="mono">' + fmtDate(p.date) + '</span>' + ARR + '</div>' +
      '</a></article>';
  }).join('\n');
}
function renderMiniBooks() {
  return BOOKS.map(b =>
    '<a class="minibook" href="' + b.href + '" style="--bk:' + b.accent[0] + ';--bk-l:' + b.accent[1] + '" data-reveal>' +
      '<span class="minibook__pic"><img src="' + b.covers.a.front + '" alt="' + esc(b.title) + ' - front cover" loading="lazy" /></span>' +
      '<span class="minibook__body"><span class="minibook__title">' + esc(b.title) + '</span><span class="minibook__sub">' + esc(b.subtitle) + '</span><span class="minibook__price mono">' + esc(b.priceLabel) + '</span></span>' + ARR +
    '</a>').join('\n');
}
function renderFaq(faq) {
  return faq.map(f =>
    '<div class="acc__item">' +
      '<button type="button" class="acc__q" aria-expanded="false"><span>' + esc(f.q) + '</span><span class="acc__icon" aria-hidden="true"></span></button>' +
      '<div class="acc__a"><p>' + esc(f.a) + '</p></div>' +
    '</div>').join('\n');
}

/* ---------- book landing fill ---------- */
const PROOF = {
  'attention-hacking': { lbl: 'From the same desk as', items: ['Bonita Foods', 'Rachy Clothing', 'Camille Bisou', "JMK's Hair", 'Luxe Party Shop'] },
  'your-first-ai-staff': { lbl: 'Built for where you actually sell', items: ['WhatsApp Business', 'Instagram', 'TikTok', 'Facebook'] },
  'japa-free': { lbl: 'Sourced, dated, tagged', items: ['Official pages first', 'Checked 6-8 Oct 2026', 'Estimates in naira, tagged', 'No agent, no guarantees'] }
};
function fillBook(tpl, b) {
  const sub = (a, html) => { if (!tpl.includes(a)) throw new Error('book template missing: ' + a); tpl = tpl.replace(a, html); };
  const proof = PROOF[b.id];
  const others = BOOKS.filter(x => x.id !== b.id);

  sub('<div class="bl-copy" id="bkHeroCopy"></div>',
    '<div class="bl-copy" id="bkHeroCopy">' +
      '<h1 class="bl-title" data-reveal>' + esc(b.hook) + '</h1>' +
      '<p class="bl-book mono" data-reveal>' + esc(b.title) + ' - ' + esc(b.subtitle) + '</p>' +
      '<p class="bl-lede" data-reveal>' + esc(b.lede) + '</p>' +
      '<div class="bl-cta" data-reveal>' + primaryCta(b) + '</div>' +
      '<div class="bl-facts mono" data-reveal><span>' + esc(b.format) + '</span><span>' + esc(b.priceLabel) + '</span><span>by Jordan Nwachukwu</span></div>' +
    '</div>');

  sub('<div class="buybar" id="buybar"></div>',
    '<div class="buybar" id="buybar"><div class="buybar__inner wrap">' +
      '<div class="buybar__id"><span class="buybar__title">' + esc(b.title) + '</span><span class="buybar__price mono">' + esc(b.priceLabel) + '</span></div>' +
      '<div class="buybar__acts">' + primaryCta(b) +
        (b.pdf ? '' : '<a class="buybar__mail mono" href="' + b.mail + '">or order by email</a>') +
      '</div></div></div>');

  sub('<section class="bl-proof wrap" id="bkProof" data-reveal></section>',
    '<section class="bl-proof wrap" id="bkProof" data-reveal><div class="proof mono"><span class="proof__lbl">' + esc(proof.lbl) + '</span><span class="proof__items">' + proof.items.map(esc).join('<span class="proof__dot" aria-hidden="true">·</span>') + '</span></div></section>');

  sub('<div class="learn" id="bkLearn"></div>',
    '<div class="learn" id="bkLearn">' + b.learn.map((l, i) =>
      '<div class="learn__item" data-reveal><span class="learn__idx mono">' + String(i + 1).padStart(2, '0') + '</span><p>' + esc(l) + '</p></div>').join('') + '</div>');

  sub('<ul class="inside__list" id="bkInside"></ul>',
    '<ul class="inside__list" id="bkInside">' + b.inside.map((c, i) =>
      '<li data-reveal><span class="mono">' + String(i + 1).padStart(2, '0') + '</span>' + esc(c) + '</li>').join('') + '</ul>');

  sub('<div class="inside__stats" id="bkStats"></div>',
    '<div class="inside__stats" id="bkStats">' + b.stats.map(s =>
      '<div class="stat" data-reveal><span class="stat__k">' + esc(s.k) + '</span><span class="stat__v mono">' + esc(s.v) + '</span></div>').join('') + '</div>');

  sub('<div class="visuals" id="bkVisuals"></div>',
    '<div class="visuals" id="bkVisuals">' +
      '<figure class="visual" data-reveal><img src="' + b.ugc[0].src + '" alt="' + esc(b.ugc[0].cap) + '" loading="lazy" /><figcaption class="mono">' + esc(b.ugc[0].cap) + '</figcaption></figure>' +
      '<blockquote class="excerpt" data-reveal><p>“' + esc(b.excerpts[0].q) + '”</p><cite class="mono">' + esc(b.excerpts[0].src) + '</cite></blockquote>' +
      '<blockquote class="excerpt" data-reveal><p>“' + esc(b.excerpts[1].q) + '”</p><cite class="mono">' + esc(b.excerpts[1].src) + '</cite></blockquote>' +
      '<figure class="visual" data-reveal><img src="' + b.ugc[1].src + '" alt="' + esc(b.ugc[1].cap) + '" loading="lazy" /><figcaption class="mono">' + esc(b.ugc[1].cap) + '</figcaption></figure>' +
    '</div>');

  sub('<ul id="bkWho"></ul>', '<ul id="bkWho">' + b.who.map(w => '<li data-reveal>' + esc(w) + '</li>').join('') + '</ul>');
  sub('<ul id="bkNot"></ul>', '<ul id="bkNot">' + b.notWho.map(w => '<li data-reveal>' + esc(w) + '</li>').join('') + '</ul>');

  sub('<div class="offer" id="bkOffer"></div>',
    '<div class="offer" id="bkOffer"><div class="offer__card" data-reveal>' +
      '<div class="offer__head"><div><div class="offer__name">' + esc(b.title) + '</div><div class="offer__sub mono">' + esc(b.subtitle) + '</div></div>' +
      '<div class="offer__price">' + esc(b.priceLabel) + '<span class="offer__per mono">' + esc(b.format) + '</span></div></div>' +
      '<ul class="offer__list">' + b.includes.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      '<p class="offer__note">' + esc(b.offerNote) + '</p>' +
      '<div class="offer__cta">' + primaryCta(b) +
        (b.pdf ? btn('/resources/academy/', 'Want it taught live?', false) : '<a class="offer__mail" href="' + b.mail + '">Order by email instead' + ARR + '</a>') +
      '</div>' +
      '<p class="offer__safe mono">' + (b.pdf ? 'Direct download · no signup · share the page, not the file' : 'Order via WhatsApp · PDF delivered after payment · usually within a day') + '</p>' +
    '</div></div>');

  sub('<div class="acc" id="bkFaq"></div>', '<div class="acc" id="bkFaq">' + renderFaq(b.faq) + '</div>');

  sub('<div class="nextbooks" id="bkNext"></div>',
    '<div class="nextbooks" id="bkNext">' + others.map(o =>
      '<a class="nextbook" href="' + o.href + '" style="--bk:' + o.accent[0] + ';--bk-l:' + o.accent[1] + '" data-reveal>' +
        '<span class="nextbook__pic"><img src="' + o.covers.a.front + '" alt="" loading="lazy" /></span>' +
        '<span class="nextbook__body"><span class="nextbook__price mono">' + esc(o.priceLabel) + '</span><span class="nextbook__title">' + esc(o.title) + '</span><span class="nextbook__go mono">' + (o.pdf ? 'Read free' : 'View book') + '</span></span>' + ARR +
      '</a>').join('') + '</div>');
  return tpl;
}

/* ---------- post fill ---------- */
function fillPost(tpl, p) {
  const sub = (a, html) => { if (!tpl.includes(a)) throw new Error('post template missing: ' + a); tpl = tpl.replace(a, html); };
  const b = bookById(p.book);
  const next = POSTS[(POSTS.indexOf(p) + 1) % POSTS.length];
  sub('<article class="post wrap">', '<article class="post wrap" data-cat="' + esc(p.cat) + '">');
  sub('id="postCat"></span>', 'id="postCat">' + esc(p.cat) + '</span>');
  sub('id="postDate"></span>', 'id="postDate">' + fmtDate(p.date) + '</span>');
  sub('id="postRead"></span>', 'id="postRead">' + esc(p.read) + '</span>');
  sub('id="postTitle" data-reveal></h1>', 'id="postTitle" data-reveal>' + esc(p.title) + '</h1>');
  sub('id="postDek" data-reveal></p>', 'id="postDek" data-reveal>' + esc(p.dek) + '</p>');
  sub('<div class="post__body" id="postBody" data-reveal></div>', '<div class="post__body" id="postBody" data-reveal>' + p.body + '</div>');
  sub('<div class="post__cta" id="postCta"></div>',
    '<div class="post__cta" id="postCta"><a class="post-cta" href="' + b.href + '" style="--bk:' + b.accent[0] + ';--bk-l:' + b.accent[1] + '" data-reveal>' +
      '<span class="post-cta__pic"><img src="' + b.covers.a.front + '" alt="" loading="lazy" /></span>' +
      '<span class="post-cta__body"><span class="mono post-cta__k">From the book</span><span class="post-cta__title">' + esc(b.title) + '</span><span class="post-cta__sub">' + esc(b.subtitle) + '</span></span>' +
      '<span class="post-cta__go mono">' + esc(b.priceLabel) + '</span>' + ARR +
    '</a></div>');
  sub('id="postNext" href="/resources/blog/"', 'id="postNext" href="' + next.href + '"');
  sub('id="postNextTitle"></span>', 'id="postNextTitle">' + esc(next.title) + '</span>');
  return tpl;
}

/* ---------- breadcrumbs (every page except home) ---------- */
const CRUMB_LABELS = { work: 'Work', about: 'About', contact: 'Contact', resources: 'Resources', books: 'Books', academy: 'Academy', blog: 'Blog' };
const HOME_CRUMB = '<a class="crumbs__home" href="/" aria-label="Home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 9.2V21h14V9.2"/><path d="M10 21v-6h4v6"/></svg></a>';
function renderCrumbs(def) {
  if (def.partial === 'home') return '';
  const segs = def.path.split('/').filter(Boolean);
  const items = [{ href: '/', label: 'Home', home: true }];
  let acc = '/';
  segs.forEach((s, i) => {
    acc += s + '/';
    const last = i === segs.length - 1;
    const label = last
      ? (def.project ? def.project.title : def.book ? def.book.title : def.post ? def.post.title : def.partial === '404' ? 'Page not found' : CRUMB_LABELS[s] || s)
      : CRUMB_LABELS[s] || s;
    items.push({ href: last ? '' : acc, label });
  });
  return '<nav class="crumbs" aria-label="Breadcrumb"><ol class="crumbs__list mono">' +
    items.map(it => '<li>' + (it.home ? HOME_CRUMB : it.href ? '<a href="' + it.href + '">' + esc(it.label) + '</a>' : '<span aria-current="page">' + esc(it.label) + '</span>') + '</li>').join('') +
    '</ol></nav>';
}

/* ---------- client data island (preview images + curtain labels + book textures) ---------- */
const ISLAND = JSON.stringify({
  imgs: Object.fromEntries(PROJECTS.map(p => [p.id, p.img])),
  gifs: Object.fromEntries(PROJECTS.map(p => [p.id, p.media.gif])),
  titles: Object.fromEntries(PROJECTS.map(p => [p.id, p.title])),
  books: Object.fromEntries(BOOKS.map(b => [b.id, { t: b.title, a: [b.covers.a.front, b.covers.a.back], b: [b.covers.b.front, b.covers.b.back], c: b.accent, p: b.priceLabel }])),
  posts: Object.fromEntries(POSTS.map(p => [p.id, { t: p.title }]))
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
  { file: 'resources/index.html', partial: 'resources', path: '/resources/', nav: 'resources', curtain: 'Resources', ogType: 'website',
    title: 'Resources - ' + SITE.name,
    desc: 'Books, academy and field notes by Jordan Nwachukwu - a free attention manual, an AI staff guide, the no-agent japa map, and a live bootcamp.',
    ogDesc: 'Everything I teach, written down. Books, a live bootcamp and honest field notes.' },
  { file: 'resources/books/index.html', partial: 'books', path: '/resources/books/', nav: 'resources', curtain: 'Books', ogType: 'website',
    title: 'Books - ' + SITE.name,
    desc: 'Three books by Jordan Nwachukwu: Attention Hacking (free), Your First AI Staff (₦9,900) and JAPA FREE (₦15,000). Floating 3D previews, two covers each.',
    ogDesc: 'Three titles, one free. Drag the 3D mockups, flip the covers, read the argument.' },
  { file: 'resources/academy/index.html', partial: 'academy', path: '/resources/academy/', nav: 'resources', curtain: 'Academy', ogType: 'website',
    title: 'Academy - ' + SITE.name,
    desc: 'The Advanced Attention Hacking Bootcamp: two live weeks on all seven hacks, the Storify framework and live content audits. Waitlist open for Cohort 01.',
    ogDesc: 'Two live weeks. All seven hacks, the Storify framework, audits of your real content.' },
  { file: 'resources/blog/index.html', partial: 'blog', path: '/resources/blog/', nav: 'resources', curtain: 'Blog', ogType: 'website',
    title: 'Blog - ' + SITE.name,
    desc: 'Field notes by Jordan Nwachukwu on attention, AI staff and funded study abroad - the strongest argument from each book, written free.',
    ogDesc: 'Sourced, dated, honest. The strongest argument from each book, free.' },
  ...BOOKS.map(b => ({
    file: 'resources/books/' + b.id + '/index.html', partial: 'book', path: b.href, nav: 'resources',
    curtain: b.title, ogType: 'article', book: b, ogImage: SITE.origin + b.covers.a.front,
    title: b.title + ' - ' + b.priceLabel + ' - ' + SITE.name, desc: b.desc, ogDesc: b.desc
  })),
  ...POSTS.map(p => ({
    file: 'resources/blog/' + p.id + '/index.html', partial: 'post', path: p.href, nav: 'resources',
    curtain: p.title, ogType: 'article', post: p, ogImage: SITE.origin + bookById(p.book).covers.a.front,
    title: p.title + ' - ' + SITE.name, desc: p.dek, ogDesc: p.dek
  })),
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
  if (def.partial === 'resources') pageHtml = pageHtml.replace('<div id="hubNotes"></div>', '<div id="hubNotes">\n' + renderHubNotes() + '\n</div>');
  if (def.partial === 'books') pageHtml = pageHtml.replace('<section class="shelf wrap" id="shelf"></section>', '<section class="shelf wrap" id="shelf">\n' + renderShelf() + '\n</section>');
  if (def.partial === 'academy') {
    pageHtml = pageHtml.replace('<div class="minibooks" id="acadShelf"></div>', '<div class="minibooks" id="acadShelf">\n' + renderMiniBooks() + '\n</div>');
    pageHtml = pageHtml.replace('<div class="acc" id="acadFaq"></div>', '<div class="acc" id="acadFaq">\n' + renderFaq(ACADEMY.faq) + '\n</div>');
  }
  if (def.partial === 'blog') pageHtml = pageHtml.replace('<section class="posts wrap" id="posts"></section>', '<section class="posts wrap" id="posts">\n' + renderBlogIndex() + '\n</section>');
  if (def.partial === 'book') pageHtml = fillBook(pageHtml, def.book);
  if (def.partial === 'post') pageHtml = fillPost(pageHtml, def.post);
  if (def.partial === 'case') pageHtml = fillCase(pageHtml, def.project);
  const crumbs = renderCrumbs(def);
  if (crumbs) {
    const anchor = def.partial === 'post' ? '<header class="post__head">' : def.partial === 'book' ? '<section class="bl-hero wrap">' : '';
    if (anchor) {
      if (!pageHtml.includes(anchor)) throw new Error('crumb anchor missing in ' + def.partial);
      pageHtml = pageHtml.replace(anchor, anchor + crumbs);
    } else {
      pageHtml = pageHtml.replace(/<section class="[^"]*wrap">/, m => m + crumbs);
    }
  }
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
    '{{ACTIVE_RESOURCES}}': def.nav === 'resources' ? ' active' : '',
    '{{PAGE}}': pageHtml,
    '{{DATA}}': ISLAND
  };
  if (def.book) {
    tokens['{{BK_ID}}'] = def.book.id;
    tokens['{{BK_D}}'] = def.book.accent[0];
    tokens['{{BK_L}}'] = def.book.accent[1];
    tokens['{{BK_FRONT}}'] = def.book.covers.a.front;
    tokens['{{BK_TITLE}}'] = esc(def.book.title);
  }
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
const prio = p => p === '/' ? '1.0' : p === '/work/' ? '0.9' : p.startsWith('/work/') ? '0.8' : (p === '/resources/' || p === '/resources/books/' || /^\/resources\/books\/[^/]+\/$/.test(p)) ? '0.8' : p.startsWith('/resources/blog/') && p !== '/resources/blog/' ? '0.6' : '0.7';
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

console.log('BUILD OK - ' + emitted.length + ' files');
emitted.forEach(f => console.log('  ' + f));