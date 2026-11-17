/* ============================================================
   DATA — Jordan's real work. Metrics stay bracketed.
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
  {id:'rachy',title:'Rachy Clothing',cat:'Ecom Design & Development',year:'2024',img:'/assets/rachy.jpg',url:'https://rachyclothing.com',role:'Design · Build · Content',
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
  {id:'acioe',title:'ACIOE',cat:'Organization & Web',year:'2022',img:'/assets/acioe.jpg',url:'https://acioe.org',role:'Design · Build',
   desc:'An organization’s public home. Clear information architecture, event and programme pages, and a credible, fast web presence.',
   tags:['Web','Information Architecture','CMS'],outcome:'[traffic] · [engagement] - figures supplied by Jordan.'},
  {id:'acioefoundation',title:'ACIOE Foundation',cat:'NGO & Web',year:'2022',img:'/assets/acioe.jpg',url:'https://acioefoundation.com',role:'Design · Build',
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