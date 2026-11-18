/* ============================================================
   DATA - Jordan's real work. Metrics stay bracketed.
   Single source of truth for the static generator (build.mjs).
   ============================================================ */
export const SITE = {
  origin: 'https://nwajdee.github.io',
  name: 'Jordan Nwachukwu',
  role: 'Creative Technologist & Founder',
  portrait: '/assets/hero-portrait-v2.jpg'
};

export const PROJECTS = [
  {id:'bonita',title:'Bonita Foods',cat:'Ecom Design & Development',year:'2024',img:'/assets/bonita.jpg',url:'https://bonitafoods.com.ng',role:'Strategy · Build · Content',
   desc:'A Nigerian coconut-snack brand. I built the WooCommerce storefront, shaped the product story and packaging presentation, and ran the content and ad creative that point at it.',
   tags:['WooCommerce','Content','Ad Creative','Media Buying'],outcome:'[ROAS] · [revenue lift] · [conversion rate] - figures supplied by Jordan.'},
  {id:'rachy',title:'Rachy Clothing',cat:'Ecom Design & Development',year:'2024',img:'/assets/rachy.jpg',url:'https://rachyclothings.com',role:'Design · Build · Content',
   desc:'A contemporary fashion label. Shopify storefront, lookbook-style product photography direction, and a content engine feeding paid social.',
   tags:['Shopify','Brand','Video','Media Buying'],outcome:'[hold rate] · [ROAS] · [AOV] - figures supplied by Jordan.'},
  {id:'camille',title:'Camille Bisou',cat:'Ecom Design & Development',year:'2023',img:'/assets/camille.jpg',url:'https://camillebisou.com',role:'Brand · Funnel · Build',
   desc:'A beauty brand built around a kiss. Identity direction, a conversion-focused funnel, and the storefront to carry it - from first ad to checkout.',
   tags:['Brand Identity','Funnel','Shopify','CRO'],outcome:'[conversion rate] · [CAC] · [revenue] - figures supplied by Jordan.'},
  {id:'luxe',title:'Luxe Party Shop',cat:'Ecommerce & Events',year:'2023',img:'/assets/luxe.jpg',url:'https://luxepartyshop.com',role:'Design · Build',
   desc:'Party and celebration supplies. A bright, browsable storefront with category architecture that makes a big catalogue feel simple.',
   tags:['Ecommerce','UX','Catalogue','SEO'],outcome:'[sessions] · [conversion rate] - figures supplied by Jordan.'},
  {id:'luxeambiance',title:'Luxe Ambiance Events',cat:'Brand & Booking',year:'2024',img:'/assets/luxe.jpg',url:'https://luxeambianceevents.com',role:'Brand · Build',
   desc:'An events studio. Brand presence and a booking-led site that turns a scroll into an enquiry - elegant, fast, and clear about the offer.',
   tags:['Brand','Booking Flow','Web','Content'],outcome:'[enquiries] · [booking rate] - figures supplied by Jordan.'},
  {id:'jmks',title:"JMK's Hair",cat:'Beauty & Ecommerce',year:'2023',img:'/assets/jmks.jpg',url:'https://jmkshair.com',role:'Design · Build · Content',
   desc:'A hair and beauty brand. Storefront, product presentation and the content that shows the result - built to sell a tactile product online.',
   tags:['Ecommerce','Beauty','Content','Social'],outcome:'[ROAS] · [repeat rate] - figures supplied by Jordan.'},
  {id:'acioe',title:'ACIOE',cat:'Organization & Web',year:'2022',img:'/assets/acioe.jpg',url:'https://acioe.com',role:'Design · Build',
   desc:'An organization’s public home. Clear information architecture, event and programme pages, and a credible, fast web presence.',
   tags:['Web','Information Architecture','CMS'],outcome:'[traffic] · [engagement] - figures supplied by Jordan.'},
  {id:'acioefoundation',title:'ACIOE Foundation',cat:'NGO & Web',year:'2022',img:'/assets/acioe.jpg',url:'https://acioefoundation.org',role:'Design · Build',
   desc:'The foundation arm. A mission-led site that communicates impact and makes it easy to support, learn and get involved.',
   tags:['NGO','Web','Storytelling','CMS'],outcome:'[reach] · [donations] - figures supplied by Jordan.'},
  {id:'ai-studio',title:'AI Video Studio',cat:'Product & Development',year:'2025',img:'/assets/ai-studio.jpg',url:null,role:'Founder · Product · Engineering',
   desc:'My own product: an AI video studio that turns a brief into edited, on-brand video. Prompt-to-timeline generation, built solo with AI assistance.',
   tags:['Next.js','AI','Video','Product'],outcome:'[users] · [renders] · [MRR] - figures supplied by Jordan.'},
  {id:'saas',title:'Multi-tenant SaaS',cat:'Product & Engineering',year:'2025',img:'/assets/saas.jpg',url:null,role:'Founder · Architecture · Engineering',
   desc:'A multi-tenant software platform - tenant isolation, billing, dashboards and the architecture to scale it. Proof I can ship real software, not just storefronts.',
   tags:['Architecture','Multi-tenant','React','API'],outcome:'[tenants] · [uptime] · [MRR] - figures supplied by Jordan.'},
  {id:'study-abroad',title:'Study Abroad For Free',cat:'Info Product & Funnel',year:'2025',img:'/assets/study-abroad.jpg',url:null,role:'Author · Funnel · Build',
   desc:'A paid report and opportunity-signal framework that shows people how to study abroad without paying. The product, the funnel and the launch, end to end.',
   tags:['Info Product','Funnel','Copy','Launch'],outcome:'[copies sold] · [refund rate] - figures supplied by Jordan.'}
];

export const SERVICES = [
  {n:'Ad Creative Strategy',d:'Hooks, angles and creative testing plans built from the ad account backwards.'},
  {n:'Media Buying',d:'Paid social campaigns managed to a number, not a vibe - creative and budget in one loop.'},
  {n:'Video Content',d:'Short-form and brand video, edited and motion-designed to stop the scroll.'},
  {n:'Shopify Funnel Architecture',d:'Storefronts, landing pages and checkout flows engineered to convert.'},
  {n:'App Development',d:'Web apps and SaaS products - Next.js, React, and the architecture to scale them.'}
];

export const RECENT = ['bonita','rachy','camille','ai-studio'];

/* ---------- captured media (assets/work/) ----------
   Covers, HD screenshots, product-page detail, mobile screens,
   cinematic tour + flow video, poster frame and hover GIF per project.
   Site-less products carry website mockups + a 3D turntable (orbit). */
const W = '/assets/work/';
for (const p of PROJECTS) {
  p.img = W + p.id + '-cover.jpg';
  p.media = {
    detail: W + p.id + '-detail.jpg',
    full: W + p.id + '-full.jpg',
    m: [W + p.id + '-m1.jpg', W + p.id + '-m2.jpg', W + p.id + '-m3.jpg'],
    tour: W + p.id + '-tour.mp4',
    flow: W + p.id + '-flow.mp4',
    poster: W + p.id + '-poster.jpg',
    gif: W + p.id + '-loop.gif'
  };
}
for (const id of ['ai-studio', 'saas', 'study-abroad']) {
  const p = PROJECTS.find(x => x.id === id);
  p.url = '/src/mockups/' + id + '/';
  p.media.flow = W + id + '-orbit.mp4';
}

/* ============================================================
   RESOURCES - books, academy, blog.
   Copy sourced from the ebooks + launch kits (Oct 2026).
   Honesty rules from the kits are load-bearing: no fake
   testimonials, no admission/scholarship/visa promises,
   "free" always explained, estimates tagged and dated.
   ============================================================ */
const C = '/assets/books/covers/';
const U = '/assets/books/ugc/';
export const BOOKS = [
  {
    id: 'attention-hacking', title: 'Attention Hacking',
    subtitle: '7 hacks for creating irresistible content',
    eyebrow: 'Free ebook · 13 chapters + epilogue',
    price: null, priceLabel: 'Free', format: 'PDF · phone or laptop',
    accent: ['#FF4B3E', '#C43A2E'], brand: '#E8262B',
    hook: 'Red lips stick.',
    lede: 'In a Manchester eye-tracking study, men looked at eyes for 0.95 seconds and hair for 0.85. Red lips held them for seven. Attention is not shared equally - it is won. This is the field manual for winning it.',
    subhead: 'The psychology of why people stop scrolling - and seven repeatable hacks for making your content the thing they cannot ignore.',
    learn: [
      'Why red lips held attention 7x longer than eyes, and what that means for your thumbnails',
      'How the RAS - your brain\'s security officer - filters 99% of incoming stimuli',
      'Voluntary vs involuntary attention, and which one your content must trigger first',
      'The AIDA sequence: attention, interest, desire, action - and where each hack sits',
      'All seven hacks: pattern interrupts, novelty, contrast, emotion, nostalgia, questions, humor',
      'How to turn 8 seconds of attention into focus: be interesting but incomplete'
    ],
    stats: [{ k: '7', v: 'attention hacks' }, { k: '13', v: 'chapters + epilogue' }, { k: '8s', v: 'window to capture' }, { k: '93%', v: 'of content is invisible' }],
    inside: [
      'Red Lips Stick - the eye-tracking study that started it all',
      'What attention is: selective concentration + sustained focus',
      'Pay attention, buy attention: the economics of the attention economy',
      'The Reticular Activating System and the flaws you can exploit',
      'Voluntary vs involuntary attention: two phases, two strategies',
      'The AIDA sequence and the attention funnel',
      'The 7 hacks, each with apply-this prompts',
      '4 signs you\'ve captured attention + the curiosity rule'
    ],
    excerpts: [
      { q: 'Focus is simply attention held over time.', src: 'Chapter 2 · What Is Attention?' },
      { q: 'Your content can\'t stand out by fitting in. Zag when the world zigs.', src: 'Hack 1 · The Pattern Interrupt' }
    ],
    who: [
      'Creators and social managers whose posts die in the feed',
      'Founders and vendors writing their own captions and ads',
      'Marketers tired of publishing into the blind spot',
      'Students of copywriting, persuasion and creative strategy',
      'Anyone who writes for a living and wants to be read'
    ],
    notWho: [
      'Anyone chasing guaranteed virality - nobody honest can promise it',
      'Readers who want theory without the apply-this prompts',
      'People looking for automation instead of craft'
    ],
    includes: [
      'The complete ebook - PDF, 13 chapters + epilogue',
      'Seven apply-this checklists, one per hack',
      'The 4-sign attention diagnostic: paralysis, approach, matching, obedience',
      'The curiosity rule for sustaining captured attention',
      'Free forever - no email wall, no drip sequence',
      'Reads on phone or laptop'
    ],
    offerNote: 'Free means free. The PDF downloads straight from this page - no signup, no paywall later.',
    faq: [
      { q: 'Is it really free?', a: 'Yes. The download button on this page serves the full PDF directly. No email required, no trial, no upsell inside the file.' },
      { q: 'How long does it take to read?', a: 'About an hour. Thirteen short chapters plus an epilogue, each hack ending with apply-this prompts you can run on your next post.' },
      { q: 'I\'m not a marketer. Is this for me?', a: 'If you write anything people must choose to read - captions, pitches, newsletters, product pages - the hacks apply. The examples are content-led, the psychology is universal.' },
      { q: 'What\'s the difference between the book and the bootcamp?', a: 'The book gives you the seven hacks. The Advanced Attention Hacking Bootcamp is a two-week live deep dive into all seven, plus the Storify story marketing framework and live audits of your real content.' },
      { q: 'Can I share it with my team?', a: 'Link them to this page so everyone gets their own free copy and the latest version.' },
      { q: 'Do you teach this live?', a: 'Yes - the bootcamp runs in small cohorts. Join the waitlist on the Academy page and you\'ll hear first when Cohort 01 opens.' }
    ],
    ugc: [
      { src: U + 'attention-hacking-1.jpg', cap: 'Styled shoot · the free edition, in the wild' },
      { src: U + 'attention-hacking-2.jpg', cap: 'Styled shoot · desk copy, variant B cover' }
    ],
    desc: 'Attention Hacking by Jordan Nwachukwu - free ebook. The eye-tracking science of why people stop scrolling, and 7 hacks for creating irresistible content.'
  },
  {
    id: 'your-first-ai-staff', title: 'Your First AI Staff',
    subtitle: 'One weekend. Zero salary.',
    eyebrow: 'For busy solo business owners · no coding needed',
    price: 9900, priceLabel: '₦9,900', format: 'PDF + prompt pack',
    accent: ['#7C8CFF', '#455CE9'], brand: '#455CE9',
    hook: 'You\'re not lazy. You\'re doing six jobs.',
    lede: 'You are the CEO, the marketer, the content creator, the ad person, the customer service desk and the sales closer. That is 40 to 70 hours a week of work that is not the thing you are good at. Hire six AI staff this weekend and pay ₦0 salary.',
    subhead: 'Set up an AI team that learns your business and handles your content, follow-ups and customer chats. Plain English, copy-paste job descriptions, one weekend.',
    learn: [
      'The six-job audit: where your 40-70 hidden hours actually go',
      'The 10-minute quick win: Meta Business Agent inside WhatsApp Business',
      'Hermes - the free, open-source AI office - installed in 20 minutes, no terminal',
      'The Business Brain: teaching AI your prices, products, voice and rules',
      'Hiring six named staff with copy-paste job descriptions and daily routines',
      'The golden rule - AI prepares, you approve - plus safety and privacy'
    ],
    stats: [{ k: '6', v: 'AI staff, named' }, { k: '11', v: 'chapters + prompt pack' }, { k: '20min', v: 'install, no coding' }, { k: '₦0', v: 'salary, forever' }],
    inside: [
      'You\'re doing six jobs - the hours table that shocks owners',
      'The 10-minute quick win: switch on Meta Business Agent',
      'Meet Hermes, your AI office (free, open-source, desktop app)',
      'Install Hermes in 20 minutes - click-through, no terminal',
      'Put Hermes in your pocket: Telegram as your office corridor',
      'The Business Brain: memory that makes staff yours',
      'Hire your AI staff: Ngozi, Ada, Tolu, Kemi, Chidi, Musa',
      'Managing your AI team + your first-week plan',
      'Bonus: run your whole AI team for ₦0',
      'Safety and privacy + cheat sheet and prompt pack'
    ],
    excerpts: [
      { q: 'A chatbot is a smart stranger you ask questions. An agent is a staff member who knows your business and shows up every morning.', src: 'Chapter 1 · Chatbot vs AI agent' },
      { q: 'AI prepares, you approve.', src: 'The golden rule · Chapter 1' }
    ],
    who: [
      'Solo vendors selling on WhatsApp, Instagram, TikTok or Facebook',
      'Service providers and food businesses quoting and chasing deposits',
      'Gadget sellers running their own Meta ads with stale creative',
      'Owners who use ChatGPT only for "write me a caption"',
      'Anyone who cannot afford six salaries but needs six jobs done'
    ],
    notWho: [
      'Anyone who wants AI spending money or posting without approval',
      'People expecting a hands-off business - your laptop must be on',
      'Developers looking for an SDK tutorial; this is plain English'
    ],
    includes: [
      'The complete guide - PDF, 11 chapters',
      'Six copy-paste AI job descriptions with routines',
      'The weekend setup schedule: Saturday morning to Monday',
      'The ₦0 route: free brains, no dollar card needed',
      'Cheat sheet + prompt pack for every staff role',
      'Safety and privacy checklist for customer data'
    ],
    offerNote: 'Honest limits, stated in the book: free tiers mean light daily use with limits, and your laptop must be on for staff to work. AI drafts; you decide anything involving money or your name.',
    faq: [
      { q: 'Do I need to know how to code?', a: 'No. Hermes installs as a normal desktop app for Windows and Mac - click through setup, chat. The guide never opens a terminal.' },
      { q: 'Do I need a dollar card?', a: 'No. The bonus chapter sets up free brains so the whole team runs for ₦0. Paid options exist later; the book shows where the free limits are.' },
      { q: 'Will my WhatsApp get banned?', a: 'Customer chats use Meta Business Agent, an official WhatsApp Business feature. Your behind-the-scenes staff live in Telegram. Chapter 11 covers safety, privacy and handover rules.' },
      { q: 'I already use ChatGPT. What\'s different?', a: 'ChatGPT forgets you every new chat and only answers when asked. Your AI staff remember your business, work on a schedule and message you first - a team of specialists, not one general assistant.' },
      { q: 'Meta Business Agent isn\'t in my app yet. Is the book useless?', a: 'No. Meta is rolling it out market by market; the book says to update and re-check. Everything else - Hermes, the Business Brain, the six staff - works without it.' },
      { q: 'What exactly do I get for ₦9,900?', a: 'The PDF guide, the prompt pack and the six job descriptions. Order on WhatsApp and you receive the download link after payment - usually within a day.' }
    ],
    ugc: [
      { src: U + 'your-first-ai-staff-1.jpg', cap: 'Styled shoot · evening setup, variant B cover' },
      { src: U + 'your-first-ai-staff-2.jpg', cap: 'Styled shoot · co-working desk, variant A cover' }
    ],
    desc: 'Your First AI Staff by Jordan Nwachukwu - ₦9,900. Hire six AI staff in one weekend: content, follow-ups and customer chats. No coding, zero salary.'
  },
  {
    id: 'japa-free', title: 'JAPA FREE',
    subtitle: 'The no-agent guide to fully funded study abroad',
    eyebrow: '2027 intake edition · checked 6-8 Oct 2026',
    price: 15000, priceLabel: '₦15,000', format: 'PDF + fill-in templates',
    accent: ['#4CC38A', '#0B3D2E'], brand: '#0B3D2E',
    hook: 'Get paid to relocate & study abroad',
    lede: 'Most Nigerians believe studying abroad means selling land or paying an agent ₦500,000 to "process" what you could do yourself. The best routes work the other way round: tuition covered, a monthly stipend, sometimes a flight - and in Europe, a PhD that is a salaried job.',
    subhead: '43 fully funded routes ranked for Nigerians, with visa workflows, real naira budgets, scam checks and a deadline calendar to September 2027. No agent. No guarantees - just the real rules.',
    learn: [
      'The four money routes: tuition-free, fully funded, paid PhD, paid fellowship',
      'How to read naira estimates honestly - CBN early-Oct 2026 rates, tagged and dated',
      'The self-assessment quiz that sends you to your 5-8 fitting routes',
      'Age-honest routing: doors actually open at 30+, 40+, with HND or 2:2',
      'Application and visa workflows for 12 countries, plus Nigerian document prep',
      'Scam checks built on real 2026 cases, and the cheapest-path-first rule'
    ],
    stats: [{ k: '43', v: 'routes ranked' }, { k: '20', v: 'full profile cards' }, { k: '12', v: 'country visa workflows' }, { k: '90', v: 'free official links' }],
    inside: [
      'The paradigm shift: they will PAY you',
      'Twelve myths that kept you home + the 2026 reality check',
      'Find your lane: the self-assessment quiz',
      'The ranked routes - 43 scored, 20 profiled',
      'Get paid to do a PhD or research; no-age-limit and mid-career routes',
      'Tuition-free and low-fee countries; your real budget from the ₦0 path up',
      'The application playbook + visa workflows, country by country',
      'Nigerian document prep; scams and refusals',
      'Deadline calendar, 90-day plan and tracker',
      'The free resource vault + appendix of fill-in templates'
    ],
    excerpts: [
      { q: 'Japa with scholarship, not with debt.', src: 'Cover line · 2027 Intake Edition' },
      { q: 'The official page wins every time it disagrees with this guide.', src: 'Disclaimer · read this first' }
    ],
    who: [
      'Fresh graduates and NYSC members (21-29) racing youth age caps',
      'Working professionals 30, 40 and above told they are "too old"',
      'Lecturers, researchers and master\'s holders who could earn a PhD salary',
      '2:2 and HND holders shown which doors are actually open',
      'Married applicants with children, and parents planning a route'
    ],
    notWho: [
      'Anyone shopping for a "guaranteed visa" or a buyable sponsorship letter',
      'People looking for shortcuts around the rules - those end in bans',
      'Readers who want yesterday\'s US-centric advice; 2026 changed the map'
    ],
    includes: [
      'The complete guide - PDF, 15 chapters + appendix',
      '43 routes ranked by cost, odds, ease and age fit; 20 profile cards',
      'Visa workflows for 12 countries + Nigerian document prep',
      'Real naira budgets and a deadline calendar to Sep 2027',
      'Fill-in templates: SOP skeleton, professor cold email, reference request, EMI letter',
      'The 90-link free resource vault, loaded 8 Oct 2026'
    ],
    offerNote: '"Free" means the funder covers tuition and living costs. You still budget passport, documents, medicals, sometimes the visa or a flight - the guide states these in naira. No admission, scholarship or visa is promised, by this book or by anyone honest.',
    faq: [
      { q: 'Does "free" mean I pay nothing at all?', a: 'No - and the book says so on every route. Free means the funder covers tuition and living costs. Applicants still pay some costs: passport, documents, TB test or medicals, sometimes the visa or a flight. Each route lists them in naira.' },
      { q: 'Is the USA a route right now?', a: 'Not for new students. Since 1 January 2026, Proclamation 10998 suspends new F, M and J visas for Nigerians. The guide says this plainly and redirects you to Europe, the UK, Asia and other open doors.' },
      { q: 'I\'m over 30 / have an HND / a 2:2. Is there a door?', a: 'Many, yes. The guide routes by age and qualification honestly: it names schemes with officially no upper age limit (Chevening, Commonwealth, Erasmus Mundus, salaried EU PhDs) and flags the ones that do cap age.' },
      { q: 'Are the deadlines and fees current?', a: 'Everything was researched 6-8 October 2026, mostly on official pages, and every fact carries a tag: "check the official page" or "estimate". Rules change; the official page always wins.' },
      { q: 'Do you guarantee admission, a scholarship or a visa?', a: 'No, and nobody honest can. What you get is a clear map, honest odds and the workflows to apply properly without an agent. Your result depends on your profile, your effort and each panel\'s decision.' },
      { q: 'Can my family come with me?', a: 'Depends on the route. Most UK taught master\'s students can no longer bring dependants; PhD/research and government-sponsored students on longer courses can. The guide flags family rules per route.' },
      { q: 'Why pay ₦15,000 for information that is free online?', a: 'The routes are free; the work is not. Ranking 43 routes, verifying rules, building naira budgets, visa workflows, templates and a deadline calendar is weeks of research you would otherwise do alone - or pay an agent far more to do badly.' }
    ],
    ugc: [
      { src: U + 'japa-free-1.jpg', cap: 'Styled shoot · application desk, variant A cover' },
      { src: U + 'japa-free-2.jpg', cap: 'Styled shoot · departure lounge, variant B cover' }
    ],
    desc: 'JAPA FREE by Jordan Nwachukwu - ₦15,000. The no-agent guide to fully funded study abroad: 43 routes ranked for Nigerians, 2027 intake edition.'
  }
];
for (const b of BOOKS) {
  b.covers = {
    a: { front: C + b.id + '-a-front.jpg', back: C + b.id + '-a-back.jpg' },
    b: { front: C + b.id + '-b-front.jpg', back: C + b.id + '-b-back.jpg' }
  };
  b.href = '/resources/books/' + b.id + '/';
  b.pdf = b.price === null ? '/assets/books/attention-hacking.pdf' : null;
  b.wa = 'https://wa.me/2348111417027?text=' + encodeURIComponent('Hi Jordan, I want to order ' + b.title + ' (' + b.priceLabel + '). Please send payment details and the download link.');
  b.mail = 'mailto:nwajdee1@gmail.com?subject=' + encodeURIComponent('Order: ' + b.title + ' (' + b.priceLabel + ')');
}
// JAPA FREE leads with the alternate stamp cover (the departure-lounge /
// boarding-pass shoot); the mail-slot cover stays as the alternate front.
const japa = BOOKS.find(b => b.id === 'japa-free');
[japa.covers.a.front, japa.covers.b.front] = [japa.covers.b.front, japa.covers.a.front];

export const ACADEMY = {
  name: 'Advanced Attention Hacking Bootcamp',
  length: '2 weeks', format: 'Live online · small cohort',
  status: 'Waitlist open · Cohort 01',
  lede: 'The book gives you the seven hacks. The bootcamp makes them reflex: two live weeks deep-diving every hack, the Storify story marketing framework, and audits of your real content - not hypothetical examples.',
  weeks: [
    { t: 'Week 1 · The seven hacks, live', items: [
      'Pattern interrupts and novelty: lab sessions on your own feed',
      'Contrast and emotion: teardowns of ads that stopped you cold',
      'Nostalgia, questions and humor: drills with same-day feedback',
      'Daily apply-this assignments on content you were going to post anyway'
    ] },
    { t: 'Week 2 · Storify + live audits', items: [
      'The Storify story marketing framework, end to end',
      'Character and conflict: turning brand content into story',
      'Live content audits: your real posts, reviewed in front of the cohort',
      'Capstone: a seven-hack content plan for your business, reviewed live'
    ] }
  ],
  who: [
    'Readers of Attention Hacking who want the hacks drilled, not just read',
    'Creators and vendors whose content is good but invisible',
    'Marketers who want their real posts audited by someone who ships',
    'Founders writing their own copy and tired of guessing'
  ],
  pillars: [
    { n: 'All 7 hacks, deep', d: 'Every hack from the book, taught live with labs and teardowns - not a recap.' },
    { n: 'Storify framework', d: 'The story marketing framework: character, conflict and relatability as a system.' },
    { n: 'Live content audits', d: 'Your actual posts and pages reviewed live, with fixes you can ship that week.' }
  ],
  faq: [
    { q: 'When does Cohort 01 start?', a: 'Dates are announced to the waitlist first. Join with the button above and you\'ll get the schedule, price and seat count before public announcement.' },
    { q: 'Do I need to read the book first?', a: 'It helps - the book is free and takes about an hour. Week 1 assumes you know the seven names; the deep dive starts where the book stops.' },
    { q: 'Is it live or recorded?', a: 'Live online, in a small cohort so audits stay personal. Sessions are recorded for enrolled students.' },
    { q: 'What does it cost?', a: 'Cohort 01 pricing is announced with the schedule to the waitlist. No charge to join the waitlist.' }
  ],
  waitlist: 'mailto:nwajdee1@gmail.com?subject=' + encodeURIComponent('Bootcamp waitlist · Advanced Attention Hacking') + '&body=' + encodeURIComponent('Hi Jordan, add me to the Advanced Attention Hacking Bootcamp waitlist.\n\nName:\nWhat I sell / post:\nMy biggest content struggle:')
};

export const POSTS = [
  {
    id: 'red-lips-study', cat: 'Attention', book: 'attention-hacking',
    title: 'The lipstick hypothesis: The study that demystified human attention',
    dek: 'Fifty men, one hundred faces, and an eye-tracker. The seven-second result that explains why your best post died in the feed.',
    date: '2026-11-18', read: '6 min read',
    body: `
<p>A few years ago, two university researchers in Manchester ran a simple eye-tracking study. Fifty male test subjects watched a slideshow of one hundred women's faces. Half wore light makeup; half wore none. The researchers wanted one number: which part of a face holds attention longest?</p>
<p>Eyes: 0.95 seconds. Hair: 0.85 seconds. Lips wearing red lipstick: <strong>seven seconds</strong>. Seven times longer than the eyes. Nobody argued with the data.</p>
<h2>What the study actually proves</h2>
<p>Not that red lipstick sells. That <strong>we do not pay equal attention to all stimuli</strong>. Some inputs command attention by design; most are filtered out before you consciously see them. The filter has a name: the Reticular Activating System, or RAS - your brain's internal security officer. It reviews incoming sensory information and decides what is important enough to reach your attention and what gets ignored. It filters roughly 99% of what arrives.</p>
<p>Here is the bad news for anyone publishing content: your post is incoming sensory information. If RAS classifies it as predictable, routine or repetitive, it never reaches consciousness. It is not that people rejected your content. They never saw it.</p>
<blockquote>Focus creates blindness. - Mike Murdock</blockquote>
<h2>Attention is a currency, and it has a capacity</h2>
<p>Notice the verbs we use. <em>Lend</em> me your ears. <em>Pay</em> attention. Shakespeare put a financial term in Mark Antony's mouth because the instinct is primal: attention is something we transact with, exchange for value. The global ad industry spent $493 billion in 2016 trying to buy it. Your audience's capacity for it is measured in seconds - about eight, by the estimate this book works with - and roughly 93% of published content never gets even that.</p>
<p>Which means attention has two phases, and they need different strategies. <strong>Voluntary attention</strong> is a choice: you consciously focus on something interesting, and RAS keeps redirecting you to what you've shown interest in. <strong>Involuntary attention</strong> is automatic: your focus is snatched by whatever is most compelling in view. The decision has already been made for you. Content that wins starts in phase two.</p>
<h2>The hack underneath the lipstick</h2>
<p>Red lips worked because they disrupted a pattern. A face is a predictable arrangement; a saturated red mouth in a monochrome field is not. RAS monitors for patterns and ignores them - and alarms at anything out of place, unexpected, or wrong for the context, no matter how trivial. That is hack one: the pattern interrupt. Your content cannot stand out by fitting in. Zag when the world zigs.</p>
<p>The other six hacks - novelty, contrast, emotion, nostalgia, questions, humor - are the same move in different costumes. Each one exploits a documented flaw in the security officer. And once you have the seven seconds, you have about eight more to turn momentary attention into focus. The rule for that is simpler than it sounds: <strong>be interesting but incomplete</strong>. Curiosity is attention held over time.</p>
<p>The full study, the RAS mechanics, the AIDA funnel and all seven hacks with apply-this prompts are in the free ebook below.</p>`
  },
  {
    id: 'six-jobs', cat: 'AI', book: 'your-first-ai-staff',
    title: 'You\'re not lazy. You\'re doing six jobs.',
    dek: 'The hours table that shocks solo owners - and the difference between a chatbot you ask and a staff member who shows up.',
    date: '2026-11-18', read: '7 min read',
    body: `
<p>Let's be honest about your week. Content creator: ideas, photos, captions, reels, Status updates - 8 to 12 hours. Social media manager: posting on three or four platforms, replying to comments - 5 to 8. Ad person: writing ads, making creatives, checking results - 3 to 6. Customer service: "How much?", "Do you deliver to Ibadan?", "Is it original?" - 10 to 15. Sales closer: follow-ups, chasing payments, objections - 4 to 8. Operations: stock, packing, dispatch, suppliers, records - 10 to 20.</p>
<p>Add it up. That is often <strong>40 to 70 hours a week</strong> of work that is not the thing you are actually good at: making your product or serving your customers. The hours are a rough guide; write down your own numbers. Most owners are shocked by the total.</p>
<h2>The old fix doesn't fit</h2>
<p>You cannot afford six salaries. And the tool everyone recommends - ChatGPT - forgets you every new chat. It only answers when you ask. It lives in one website, gives the same help to everybody, and remains one general assistant. Think of a chatbot as a smart stranger you ask questions.</p>
<blockquote>An AI agent is a staff member who knows your business and shows up every morning.</blockquote>
<p>An agent remembers your business, prices, customers and style. It works on a schedule and messages you first. It lives in Telegram and WhatsApp, where you already are. It gets more tailored the more you use it. And it can be a team of specialists, each with its own job - not one generalist.</p>
<h2>Six names, six jobs</h2>
<p>The team in the book is deliberately ordinary: <strong>Ngozi</strong>, chief of staff, sends a daily briefing before you open your eyes. <strong>Ada</strong>, content strategist, plans a month of content in one sitting. <strong>Tolu</strong>, social media manager, writes captions and posts in your voice. <strong>Kemi</strong>, ad creative writer, drafts ads and scripts. <strong>Chidi</strong>, sales follow-up officer, never lets a warm lead go cold. <strong>Musa</strong>, group moderator, keeps your community warm and clean.</p>
<p>They run on Hermes, a free open-source desktop agent - install in 20 minutes, click through setup, no terminal - with a "Business Brain" you teach your prices, products and rules. Customer-facing chats can start even sooner: Meta Business Agent is built into WhatsApp Business and answers "How much?" at 11pm. Meta is rolling it out market by market, and everything else works without it.</p>
<h2>The golden rule</h2>
<p><strong>AI prepares, you approve.</strong> You stay in charge of anything involving money - ad spend, refunds, discounts - anything posted publicly in your name, and your relationships with big customers and suppliers. Your AI staff draft. You decide. And the honest limits stay on the table: free tiers mean light daily use with limits, and your laptop must be on for staff to work.</p>
<p>That is the whole pitch: stop being the whole company. Hire six AI staff this weekend. Pay ₦0 salary. The weekend schedule, the job descriptions and the prompt pack are in the guide.</p>`
  },
  {
    id: 'four-money-routes', cat: 'Japa', book: 'japa-free',
    title: 'Get paid to study abroad: the four surprising doors',
    dek: 'Tuition-free, fully funded, paid PhD, paid fellowship. What each one actually pays - and what "free" still costs you in naira.',
    date: '2026-11-18', read: '8 min read',
    body: `
<p>If you have ever said "I would japa if I had the money", this is for you. Most Nigerians believe studying abroad means selling land, borrowing from every uncle, or paying an agent ₦500,000 to "process" something you could do yourself. That belief kept a lot of brilliant people at home.</p>
<p>Here is the truth, with official sources behind it: there are governments, universities and foundations that pay your tuition, give you a monthly allowance, and sometimes buy your flight. In parts of Europe, a PhD is not a course you pay for. It is a job with a salary. Some of the biggest awards have no age limit at all.</p>
<h2>Route 1 · Tuition-free</h2>
<p>You pay living costs only. Germany: ₦0 tuition at most public universities. This is the cheapest legal door, and the one most lists skip because nobody earns a commission on it. Living costs are real, and the guide budgets them in naira.</p>
<h2>Route 2 · Fully funded</h2>
<p>Tuition plus stipend plus flight. Commonwealth-type awards: about ₦3m a month in living support, at CBN official rates from early October 2026 ($1 ≈ ₦1,330, €1 ≈ ₦1,500, £1 ≈ ₦1,765). Naira moves; the foreign amount is the anchor. For many of these awards, the funder's award letter replaces the proof of funds that scares everybody.</p>
<h2>Route 3 · Paid PhD</h2>
<p>A job with a salary. Netherlands-type contracts: about ₦4.8-6.1m a month gross. You are not a student begging for aid; you are an employee doing research. This route is open to lecturers, researchers and master's holders who were told they were "too old" - many salaried EU PhD positions officially have no upper age limit.</p>
<h2>Route 4 · Paid fellowship</h2>
<p>For experienced people. Humboldt-type research stays: about ₦4.5-5.4m a month. Research experience becomes the qualification, not the obstacle.</p>
<blockquote>Japa with scholarship, not with debt.</blockquote>
<h2>What "free" still costs</h2>
<p>Free means the funder covers tuition and living costs. You still pay some costs: passport, documents, TB test or medicals, sometimes the visa or a flight. Every route in the guide states these in naira, tagged <em>estimate</em> where it is our judgement and <em>check the official page</em> where sources disagree. The official page wins every time it disagrees with the guide.</p>
<p>And the 2026 reality check matters: new US F, M and J visas for Nigerians have been suspended since 1 January 2026 (Proclamation 10998). Chevening 2027/28 closed on 6 October 2026; the next round is expected around early August 2027. Most UK taught master's students can no longer bring family. Guides still selling yesterday's American assistantships are selling a closed door.</p>
<p>No guarantees - not admission, not scholarship, not visa. What the guide gives you is 43 routes ranked by cost, odds, ease and age fit, a quiz that sends you to your lane, visa workflows for 12 countries, scam checks built on real 2026 cases, and a deadline calendar to September 2027. No agent in the middle.</p>`
  }
];
for (const p of POSTS) p.href = '/resources/blog/' + p.id + '/';