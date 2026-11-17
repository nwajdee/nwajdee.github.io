/* ============================================================
   Jordan Nwachukwu — MPA app
   Every route is a real HTML document. Internal links are
   intercepted and swapped behind the signature panel curtain
   (fetch + DOMParser + pushState); deep links, refresh, back and
   no-JS all work natively. Global chrome binds once; page motion
   lives in initPage / destroyPage.
   ============================================================ */
(function(){
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const G = window.gsap;
  const hasG = !!G;
  const hasST = hasG && !!window.ScrollTrigger;
  if(hasST) G.registerPlugin(window.ScrollTrigger);
  const $ = (s,c)=> (c||document).querySelector(s);
  const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
  const DATA = window.__JN || {imgs:{},titles:{}};
  const imgOf = id => DATA.imgs[id];

  const labels={home:'Home',work:'Work',about:'About',contact:'Contact'};
  let current = ($('.page') && $('.page').dataset.page) || 'home';
  let transitioning=false, pendingPop=null;
  function flushPop(){ if(pendingPop){ const p=pendingPop; pendingPop=null; go(p.url,{push:false,restoreY:p.y}); } }

  /* ---------- paths ---------- */
  function parsePath(path){
    const r=(path||'/').replace(/\/+$/,'')||'/';
    if(r==='/') return {name:'home',id:null};
    if(r==='/work') return {name:'work',id:null};
    if(r==='/about') return {name:'about',id:null};
    if(r==='/contact') return {name:'contact',id:null};
    if(r.indexOf('/work/')===0){ const id=r.slice(6); return imgOf(id)?{name:'project',id:id}:null; }
    return null;
  }
  function pathOf(name,id){
    if(name==='project'&&id) return '/work/'+id+'/';
    if(name==='home') return '/';
    return '/'+name+'/';
  }
  /* resolve a link href to an internal route, or null (external / anchor / file) */
  function internalTarget(href){
    if(!href || href.charAt(0)==='#') return null;
    if(/^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
    const a=document.createElement('a'); a.href=href;
    if(a.origin!==location.origin) return null;
    const r=parsePath(a.pathname);
    if(!r) return null;
    return {url:pathOf(r.name,r.id), route:r};
  }
  /* legacy #/ URLs from the previous single-file build → real paths */
  function legacyHashUrl(){
    const h=location.hash;
    if(h.indexOf('#/')!==0) return null;
    const r=h.slice(2).replace(/\/+$/,'');
    if(r===''||r==='home') return '/';
    if(r.indexOf('work/')===0){ const id=r.slice(5); return imgOf(id)?'/work/'+id+'/':'/work/'; }
    return labels[r]?'/'+r+'/':null;
  }

  /* ============================================================
     LENIS SMOOTH SCROLL
     ============================================================ */
  let lenis=null;
  if(window.Lenis && !reduce){
    lenis = new window.Lenis({ duration:1.15, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true, wheelMultiplier:1, touchMultiplier:1.6 });
    if(hasST){ lenis.on('scroll', window.ScrollTrigger.update); }
    if(hasG){ G.ticker.add(t=>lenis.raf(t*1000)); G.ticker.lagSmoothing(0); }
    else { const raf=t=>{lenis.raf(t);requestAnimationFrame(raf);}; requestAnimationFrame(raf); }
  }

  /* ============================================================
     HEADER hide on scroll down / show on up
     ============================================================ */
  const header=$('#header');
  let menuOpen=false;
  let lastY=0;
  function headerState(){
    const y=lenis?lenis.scroll:scrollY;
    header.classList.toggle('solid', y>40||current!=='home');
    header.classList.toggle('over-hero', current==='home'&&y<=40&&!menuOpen);
    if(menuOpen) header.classList.remove('hide');
  }
  function scrollToTop(instant){
    if(lenis) lenis.scrollTo(0,{immediate:!!instant});
    else window.scrollTo(0,0);
    headerState();
  }
  function lockScroll(on){
    document.body.classList.toggle('is-locked',on);
    if(lenis){ on?lenis.stop():lenis.start(); }
  }

  /* ============================================================
     CURSOR
     ============================================================ */
  const cursor=$('.cursor'), ring=$('.cursor-ring'), clabel=$('.cursor-label');
  if(!isTouch && !reduce){
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';clabel.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';},{passive:true});
    (function loop(){ rx+=(mx-rx)*.16; ry+=(my-ry)*.16; ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
    const hoverSel='a,button,[role="link"],input,select,textarea,.work-row';
    document.addEventListener('mouseover',e=>{
      const t=e.target.closest(hoverSel);
      ring.classList.toggle('is-hover',!!t);
      const view=e.target.closest('.work-row,.card__media');
      ring.classList.toggle('is-view',!!view);
      clabel.classList.toggle('show',!!view);
    });
    document.addEventListener('mouseleave',()=>{cursor.style.opacity=0;ring.style.opacity=0;});
    document.addEventListener('mouseenter',()=>{cursor.style.opacity=1;ring.style.opacity=1;});
  } else { document.documentElement.classList.add('no-cursor'); }

  /* ============================================================
     MAGNETIC (chrome once, page content per initPage)
     ============================================================ */
  function bindMagnetic(scope){
    if(isTouch || reduce || !hasG) return;
    $$('[data-magnetic]',scope).forEach(el=>{
      if(el.__mag) return; el.__mag=true;
      const strength=parseFloat(el.dataset.strength||'0.35');
      const inner=el.querySelector('.btn,.footer__btn,.menu-btn__label')||el.firstElementChild||el;
      el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
        G.to(el,{x:x*strength,y:y*strength,duration:.6,ease:'power3.out'});
        G.to(inner,{x:x*strength*.4,y:y*strength*.4,duration:.6,ease:'power3.out'});
      });
      el.addEventListener('mouseleave',()=>{
        G.to(el,{x:0,y:0,duration:.9,ease:'elastic.out(1,0.35)'});
        G.to(inner,{x:0,y:0,duration:.9,ease:'elastic.out(1,0.35)'});
      });
    });
  }
  bindMagnetic(document);

  /* ============================================================
     PHONE PILL → MORPH + SPLIT INTO CALL / WHATSAPP BUBBLES
     ============================================================ */
  (function(){
    const split=$('#phoneSplit'); if(!split) return;
    const trigger=split.querySelector('.phone-split__trigger');
    const wrap=split.querySelector('.phone-split__bubbles');
    const bubbles=[...wrap.querySelectorAll('.bubble')];
    let open=false, tl=null;
    if(hasG && !reduce){
      const sep=()=> (bubbles[0].offsetWidth + (parseFloat(getComputedStyle(wrap).columnGap)||14))/2;
      tl=G.timeline({paused:true,
        onComplete(){ bubbles[0].focus({preventScroll:true}); },
        onReverseComplete(){ trigger.focus({preventScroll:true}); }});
      tl.fromTo(wrap,{autoAlpha:0},{autoAlpha:1,duration:.05},0)
        .to(trigger.querySelectorAll('svg,.lbl'),{opacity:0,y:-6,duration:.2,ease:'power2.in'},0)
        .to(trigger,{width:trigger.offsetHeight,paddingLeft:0,paddingRight:0,duration:.45,ease:'power4.inOut'},0)
        .to(trigger,{autoAlpha:0,scale:.4,duration:.28,ease:'power3.in'},.42)
        .fromTo(bubbles,{scale:0,opacity:0,x:i=>i===0?sep():-sep()},
          {scale:1,opacity:1,x:0,duration:.6,ease:'back.out(1.7)',stagger:.08},.46);
    }
    function setOpen(v){
      if(v===open) return; open=v;
      split.classList.toggle('is-open',v);
      trigger.setAttribute('aria-expanded',String(v));
      if(tl){ v? tl.timeScale(1).play() : tl.timeScale(1.35).reverse(); }
      else {
        trigger.style.visibility=v?'hidden':'visible';
        wrap.style.visibility=v?'visible':'hidden';
        if(v) bubbles[0].focus({preventScroll:true});
      }
    }
    trigger.addEventListener('click',()=>setOpen(!open));
    document.addEventListener('click',e=>{ if(open && !split.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape' && open){ setOpen(false); trigger.focus({preventScroll:true}); } });
    split.addEventListener('focusout',e=>{ if(open && e.relatedTarget && !split.contains(e.relatedTarget)) setOpen(false); });
  })();

  /* ============================================================
     WORK PREVIEW (home rows) — global loop, page-scoped bindings
     ============================================================ */
  const preview=$('#workPreview'), previewImg=preview.querySelector('img');
  let pvx=0,pvy=0,ptx=0,pty=0,pvActive=false,pointerSeen=false,pvId=null,pvDirty=false;
  if(!isTouch){
    addEventListener('mousemove',e=>{ptx=e.clientX;pty=e.clientY;pointerSeen=true;pvDirty=true;},{passive:true});
    (function pvLoop(){ pvx+=(ptx-pvx)*.12; pvy+=(pty-pvy)*.12;
      if(pvActive) preview.style.transform='translate('+pvx+'px,'+pvy+'px) translate(-50%,-50%) scale(1)';
      /* reconcile against the real hit-test one frame after any pointer or
         scroll movement: boundary events alone desync, because scrolling
         slides rows under a stationary pointer and can re-show AFTER a hide */
      if(pvDirty){ pvDirty=false; syncHoverAfterScroll(); }
      requestAnimationFrame(pvLoop); })();
  }
  function showPreview(id){ const src=imgOf(id); if(!src)return;
    if(pvActive&&pvId===id) return;
    pvId=id; pvDirty=true; previewImg.src=src;
    if(hasG&&!reduce){G.to(preview,{opacity:1,duration:.4,ease:'power3.out',overwrite:true});}else{preview.style.opacity=1;}
    pvActive=true; }
  function hidePreview(){ pvId=null;
    if(hasG&&!reduce){G.to(preview,{opacity:0,duration:.3,overwrite:true});}else{preview.style.opacity=0;}
    pvActive=false; }
  /* scrolling can move rows out from under a stationary pointer without
     firing mouseover/mouseleave — re-sync hover state from the real hit-test.
     the preview belongs to the recent-work rows ONLY: card media keeps the
     cursor "view" label but must never keep the preview alive */
  function syncHoverAfterScroll(){
    if(isTouch||!pointerSeen) return;
    const el=document.elementFromPoint(ptx,pty);
    const near=el&&el.closest?el:null;
    const row=near?near.closest('.work-row'):null;
    if(row) showPreview(row.dataset.id);
    else if(pvActive) hidePreview();
    if(reduce) return;
    const view=near?near.closest('.work-row,.card__media'):null;
    clabel.classList.toggle('show',!!view);
    ring.classList.toggle('is-view',!!view);
    const hov=near?near.closest('a,button,[role="link"],input,select,textarea,.work-row'):null;
    ring.classList.toggle('is-hover',!!hov);
  }

  /* ---------- header scroll wiring ---------- */
  function onScroll(y){
    headerState();
    pvDirty=true;
    syncHoverAfterScroll();
    if(y>lastY && y>220 && !menuOpen) header.classList.add('hide');
    else header.classList.remove('hide');
    lastY=y;
  }
  if(lenis) lenis.on('scroll',e=>onScroll(e.scroll));
  else addEventListener('scroll',()=>onScroll(scrollY),{passive:true});

  /* ============================================================
     LIVE CLOCK (Africa/Lagos)
     ============================================================ */
  function tick(){
    let s;
    try{
      s=new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'Africa/Lagos'}).format(new Date());
    }catch(_){ const d=new Date(); s=d.getHours()%12||12; s=String(s).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' '+(d.getHours()<12?'AM':'PM'); }
    const mc=$('#menuClock'); if(mc) mc.textContent=s;
    const cc=$('#contactClock'); if(cc) cc.textContent=s;
  }
  tick(); setInterval(tick,1000*15);

  /* ============================================================
     MENU
     ============================================================ */
  const menu=$('#menu'), menuBtn=$('#menuBtn');
  function openMenu(){
    menuOpen=true; menu.classList.add('open'); menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded','true'); menuBtn.querySelector('.menu-btn__label').textContent='Close';
    header.classList.add('menu-top');
    headerState();
    lockScroll(true);
    if(hasG && !reduce){
      G.to(menu,{clipPath:'inset(0 0 0% 0)',duration:.8,ease:'power4.inOut'});
      G.fromTo('.menu__link .txt',{yPercent:120},{yPercent:0,duration:.9,stagger:.07,ease:'power4.out',delay:.25});
      G.fromTo('.menu__aside',{opacity:0,y:24},{opacity:1,y:0,duration:.8,delay:.5,ease:'power3.out'});
    } else { menu.style.clipPath='inset(0 0 0% 0)'; }
    setTimeout(()=>$('.menu__link').focus(),450);
  }
  function closeMenu(){
    menuOpen=false; menuBtn.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false');
    menuBtn.querySelector('.menu-btn__label').textContent='Menu';
    header.classList.remove('menu-top');
    headerState();
    if(hasG && !reduce){
      G.to(menu,{clipPath:'inset(0 0 100% 0)',duration:.6,ease:'power4.inOut',onComplete:()=>{menu.classList.remove('open');lockScroll(false);}});
    } else { menu.style.clipPath='inset(0 0 100% 0)'; menu.classList.remove('open'); lockScroll(false); }
  }
  menuBtn.addEventListener('click',()=>menuOpen?closeMenu():openMenu());
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&menuOpen)closeMenu(); });

  /* ============================================================
     THEME (dark default / light) — persisted, pre-paint boot in <head>
     ============================================================ */
  const themeToggle=$('#themeToggle'), themeMeta=$('meta[name="theme-color"]');
  let themeTimer=null;
  function applyTheme(t,animate){
    const root=document.documentElement;
    if(animate && !reduce){
      root.classList.add('theme-switching');
      clearTimeout(themeTimer);
      themeTimer=setTimeout(()=>root.classList.remove('theme-switching'),650);
    }
    root.setAttribute('data-theme',t);
    try{localStorage.setItem('jn-theme',t);}catch(_){}
    if(themeToggle){
      const light=t==='light';
      themeToggle.setAttribute('aria-pressed',String(light));
      themeToggle.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
    }
    if(themeMeta) themeMeta.setAttribute('content',t==='light'?'#F8F6F2':'#1C1D20');
    headerState();
  }
  if(themeToggle) themeToggle.addEventListener('click',()=>applyTheme(document.documentElement.getAttribute('data-theme')==='light'?'dark':'light',true));
  let savedTheme=null; try{savedTheme=localStorage.getItem('jn-theme');}catch(_){}
  applyTheme(savedTheme==='light'?'light':'dark',false);

  /* ============================================================
     PAGE LIFECYCLE — motion + interactions for the active document
     ============================================================ */
  const curtain=$('#curtain'), panels=$$('.curtain__panel'), cLabel=$('#curtainLabel');
  let revealIO=null;
  const pageCleanup=[];
  let marqueeTween=null, marqueeDir=1;

  /* ---------- split hero name into chars (both marquee copies) ---------- */
  function splitName(){
    const copy = $('#heroCopy1');
    if(!copy) return;
    const text = 'Jordan Nwachukwu';
    const words = text.split(' ');
    let html='';
    words.forEach((word,wi)=>{
      html+='<span class="word">';
      word.split('').forEach(ch=>{ html+='<span class="char">'+ch+'</span>'; });
      html+='</span>'+(wi<words.length-1?' ':'');
    });
    html+='<span class="hero__name-spacer">-</span>';
    copy.innerHTML=html;
    const copy2=$('#heroCopy2');
    if(copy2) copy2.innerHTML=html;
  }

  /* ---------- split intro into words ---------- */
  function splitWords(){
    const introBig = $('#introBig');
    if(!introBig) return;
    const words = introBig.textContent.trim().split(/\s+/);
    introBig.innerHTML = words.map(w=>'<span class="w">'+w+'</span>').join(' ');
  }

  /* ---------- reveals (IntersectionObserver — robust without GSAP) ---------- */
  function initReveals(page){
    const els=$$('[data-reveal]',page);
    if(!reduce && 'IntersectionObserver' in window){
      els.forEach(el=>el.classList.add('pre'));
      revealIO=new IntersectionObserver(entries=>{
        entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); en.target.classList.remove('pre'); revealIO.unobserve(en.target);} });
      },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      els.forEach(el=>revealIO.observe(el));
    } else { els.forEach(el=>el.classList.add('in')); }
  }

  /* ---------- intro word scrub reveal ---------- */
  function initWordReveal(){
    const words=$$('#introBig .w');
    if(reduce || !hasST || current!=='home'){ words.forEach(w=>w.style.opacity=1); return; }
    words.forEach(w=>w.style.opacity=.16);
    G.to(words,{opacity:1,stagger:.06,ease:'none',
      scrollTrigger:{trigger:'#introBig',start:'top 78%',end:'bottom 45%',scrub:.6}});
  }

  /* ---------- hero parallax + work card scale ---------- */
  function initScrollFX(){
    if(reduce||!hasST) return;
    if(current==='home'){
      const heroImg=$('#heroImg');
      if(heroImg){ G.to(heroImg,{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}}); }
    }
    if(current==='work'){
      // scale + dim each card as the NEXT card rises to cover it
      const arr=$$('.card');
      arr.forEach((card,i)=>{
        if(i===arr.length-1) return;
        const inner=card.querySelector('.card__inner');
        G.fromTo(inner,{scale:1,filter:'brightness(1)'},{scale:.9,filter:'brightness(.55)',ease:'none',
          scrollTrigger:{trigger:arr[i+1],start:'top bottom',end:'top 15%',scrub:true}});
      });
    }
  }

  /* slow infinite marquee, two identical copies → seamless -50% loop;
     scroll direction flips the roll, exactly like the reference's initScrollLetters */
  function startNameMarquee(){
    const track=$('#heroTrack');
    if(!track||reduce||!hasG||marqueeTween) return;
    const copyW=track.scrollWidth/2;
    const dur=Math.min(90,Math.max(26,copyW/42));
    marqueeTween=G.timeline({repeat:-1,onReverseComplete(){this.totalTime(this.rawTime()+this.duration()*10);}})
      .to(track,{xPercent:-50,ease:'none',duration:dur},0);
    marqueeTween.timeScale(marqueeDir);
  }
  function initMarqueeScroll(){
    if(reduce||!hasST||current!=='home') return;
    window.ScrollTrigger.create({trigger:document.body,start:'top top',end:'max',
      onUpdate(self){
        if(self.direction===marqueeDir) return;
        marqueeDir=self.direction;
        if(marqueeTween) G.to(marqueeTween,{timeScale:marqueeDir,overwrite:true});
      }});
  }

  /* ---------- hero entrance (first session load) / static (swaps, repeat loads) ---------- */
  function heroIn(){
    if(current!=='home') return;
    if(reduce||!hasG){ $$('.hero [data-reveal]').forEach(el=>el.classList.add('in')); return; }
    const chars=$$('#heroName .char');
    G.set(chars,{yPercent:120});
    G.set('#heroMedia',{clipPath:'inset(100% 0 0 0)'});
    const tl=G.timeline();
    tl.to(chars,{yPercent:0,duration:1,stagger:.028,ease:'power4.out'})
      .to('#heroMedia',{clipPath:'inset(0% 0 0 0)',duration:1.2,ease:'power4.inOut'},'-=.7')
      .fromTo('.hero__pill',{x:-60,opacity:0},{x:0,opacity:1,duration:.9,ease:'power3.out'},'-=.8')
      .fromTo('.hero__role',{opacity:0,y:16},{opacity:1,y:0,duration:.8,ease:'power3.out'},'-=.6')
      .call(startNameMarquee,null,'-=.5');
  }
  function heroStatic(){
    if(current!=='home') return;
    if(hasG&&!reduce){
      const chars=$$('#heroName .char');
      if(chars.length) G.set(chars,{yPercent:0});
      if($('#heroMedia')) G.set('#heroMedia',{clipPath:'inset(0% 0 0 0)'});
      G.set(['.hero__pill','.hero__role'],{opacity:1,x:0,y:0});
    }
    startNameMarquee();
  }

  /* ---------- contact form (client-side demo submit, as before) ---------- */
  function bindForm(){
    const form=$('#contactForm'); if(!form||form.__bound) return; form.__bound=true;
    function validateField(field){
      const input=field.querySelector('input,select,textarea'); if(!input)return true;
      let ok=true; const v=input.value.trim();
      if(input.required && !v) ok=false;
      if(input.type==='email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok=false;
      field.classList.toggle('invalid',!ok); return ok;
    }
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const fields=$$('.field',form); let allOk=true;
      fields.forEach(f=>{ if(!validateField(f)) allOk=false; });
      if(!allOk){ const first=$('.field.invalid input,.field.invalid select,.field.invalid textarea',form); if(first)first.focus(); return; }
      // client-side demo submit (no backend wired) — show success state
      form.style.display='none';
      const ok=$('#formSuccess'); ok.classList.add('show');
      if(hasG&&!reduce) G.fromTo(ok,{opacity:0,y:20},{opacity:1,y:0,duration:.7,ease:'power3.out'});
    });
    form.addEventListener('input',e=>{const f=e.target.closest('.field'); if(f&&f.classList.contains('invalid'))validateField(f);});
  }

  function initPage(){
    const page=$('.page.active'); if(!page) return;
    current=page.dataset.page||'home';
    splitName(); splitWords();
    initReveals(page);
    bindMagnetic(page);
    if(current==='home'){
      const recentWrap=$('#recentRows');
      if(recentWrap){
        const over=e=>{const r=e.target.closest('.work-row'); if(r)showPreview(r.dataset.id);};
        const leave=()=>hidePreview();
        recentWrap.addEventListener('mouseover',over);
        recentWrap.addEventListener('mouseleave',leave);
        pageCleanup.push(()=>{recentWrap.removeEventListener('mouseover',over);recentWrap.removeEventListener('mouseleave',leave);});
      }
    }
    if(current==='work'){
      const cardsWrap=$('#cards');
      if(cardsWrap){
        const onClick=e=>{
          const media=e.target.closest('.card__media');
          if(media){ const c=media.closest('.card'); go('/work/'+c.dataset.id+'/'); }
        };
        cardsWrap.addEventListener('click',onClick);
        pageCleanup.push(()=>cardsWrap.removeEventListener('click',onClick));
      }
    }
    if(current==='contact') bindForm();
    // page-specific scroll FX
    initWordReveal(); initScrollFX(); initMarqueeScroll();
    // reveal anything already in view on the new page
    requestAnimationFrame(()=>{
      $$('[data-reveal]',page).forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.top<innerHeight*0.92){ el.classList.add('in'); el.classList.remove('pre'); }
      });
      if(hasST) window.ScrollTrigger.refresh();
      if(lenis) lenis.resize();
      headerState();
    });
  }

  function destroyPage(){
    pageCleanup.forEach(fn=>{try{fn();}catch(_){}}); pageCleanup.length=0;
    if(revealIO){revealIO.disconnect();revealIO=null;}
    if(hasST) window.ScrollTrigger.getAll().forEach(t=>t.kill());
    if(marqueeTween){marqueeTween.kill();marqueeTween=null;}
    hidePreview();
    const page=$('.page.active');
    if(page&&hasG) G.killTweensOf($$('*',page));
  }

  /* ============================================================
     SWAP NAVIGATION — fetch real documents, swap behind the curtain
     ============================================================ */
  const cache=new Map(), inflight=new Map();
  function fetchDoc(url){
    if(cache.has(url)) return Promise.resolve(cache.get(url));
    if(inflight.has(url)) return inflight.get(url);
    const p=fetch(url,{credentials:'same-origin'}).then(res=>{
      if(!res.ok) throw new Error('HTTP '+res.status);
      return res.text();
    }).then(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      if(!doc.querySelector('.page')) throw new Error('no page in document');
      cache.set(url,doc);
      inflight.delete(url);
      return doc;
    }).catch(err=>{ inflight.delete(url); throw err; });
    inflight.set(url,p);
    return p;
  }
  function prefetch(url){ if(!cache.has(url)&&!inflight.has(url)) fetchDoc(url).catch(()=>{}); }
  document.addEventListener('mouseover',e=>{
    const a=e.target.closest('a[href]'); if(!a) return;
    const t=internalTarget(a.getAttribute('href')); if(t) prefetch(t.url);
  },{passive:true});
  document.addEventListener('focusin',e=>{
    const a=e.target.closest('a[href]'); if(!a) return;
    const t=internalTarget(a.getAttribute('href')); if(t) prefetch(t.url);
  });

  function syncHead(doc){
    document.title=doc.title;
    const pairs=[
      ['meta[name="description"]','content'],
      ['meta[property="og:title"]','content'],
      ['meta[property="og:description"]','content'],
      ['meta[property="og:url"]','content'],
      ['meta[property="og:image"]','content'],
      ['meta[property="og:type"]','content'],
      ['meta[name="twitter:title"]','content'],
      ['meta[name="twitter:description"]','content'],
      ['meta[name="twitter:image"]','content']
    ];
    pairs.forEach(([sel,attr])=>{
      const from=doc.querySelector(sel), to=document.querySelector(sel);
      if(from&&to) to.setAttribute(attr,from.getAttribute(attr));
    });
    const can=doc.querySelector('link[rel="canonical"]'), cur=document.querySelector('link[rel="canonical"]');
    if(can&&cur) cur.setAttribute('href',can.getAttribute('href'));
  }

  function sameRoute(url){
    const a=parsePath(location.pathname), b=parsePath(url);
    return !!a&&!!b&&a.name===b.name&&a.id===b.id;
  }

  function go(url,{push=true,instant=false,restoreY=null}={}){
    const route=parsePath(url);
    if(!route){ location.assign(url); return Promise.resolve(); }
    if(transitioning) return Promise.resolve();
    if(sameRoute(url)&&restoreY===null){ scrollToTop(); return Promise.resolve(); }
    if(menuOpen) closeMenu();
    transitioning=true;
    const startY=lenis?lenis.scroll:window.scrollY;
    const docP=fetchDoc(url);
    const label=route.name==='project'?(DATA.titles[route.id]||'Work'):(labels[route.name]||'');

    const swap=doc=>{
      const newPage=doc.querySelector('.page');
      destroyPage();
      $('#main').replaceChildren(document.importNode(newPage,true));
      current=newPage.dataset.page||route.name;
      const navName=current==='project'?'work':current;
      $$('.header__link').forEach(a=>a.classList.toggle('active',a.dataset.route===navName));
      syncHead(doc);
      if(push&&!pendingPop){
        try{history.replaceState({jn:1,y:startY},'',location.pathname);}catch(_){}
        history.pushState({jn:1,y:0},'',url);
      }
      initPage();
      if(current==='home') heroStatic();
      if(restoreY!==null){
        requestAnimationFrame(()=>{
          if(lenis) lenis.scrollTo(restoreY,{immediate:true}); else window.scrollTo(0,restoreY);
          headerState();
        });
      } else scrollToTop(true);
    };

    if(instant||reduce||!hasG){
      return docP.then(doc=>{ swap(doc); transitioning=false; flushPop(); })
        .catch(()=>{ transitioning=false; location.assign(url); });
    }
    /* signature curtain: panels rise → swap at the covered moment → panels fall */
    cLabel.textContent=label;
    const tlIn=G.timeline({onComplete:()=>{
      docP.then(doc=>{
        swap(doc);
        const tlOut=G.timeline({onComplete:()=>{transitioning=false;flushPop();}});
        tlOut.to(cLabel,{opacity:0,duration:.25,delay:.25})
          .set(panels,{transformOrigin:'top'})
          .to(panels,{scaleY:0,duration:.5,stagger:.05,ease:'power4.inOut'})
          .set(curtain,{pointerEvents:'none'});
      }).catch(()=>{ transitioning=false; location.assign(url); });
    }});
    tlIn.set(curtain,{pointerEvents:'auto'})
      .set(panels,{transformOrigin:'bottom',scaleY:0})
      .to(panels,{scaleY:1,duration:.5,stagger:.05,ease:'power4.inOut'})
      .to(cLabel,{opacity:1,duration:.3},'-=.3');
    return Promise.resolve();
  }

  document.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    const a=e.target.closest('a[href]');
    if(!a) return;
    if(a.target&&a.target!=='_self') return;
    if(a.hasAttribute('download')) return;
    const t=internalTarget(a.getAttribute('href'));
    if(!t) return;
    e.preventDefault();
    go(t.url);
  });

  addEventListener('popstate',e=>{
    const url=location.pathname;
    if(!parsePath(url)){ location.reload(); return; }
    const y=(e.state&&typeof e.state.y==='number')?e.state.y:0;
    if(transitioning){ pendingPop={url,y}; return; }
    go(url,{push:false,restoreY:y});
  });

  /* ============================================================
     PRELOADER — once per session (sessionStorage), hero entrance after
     ============================================================ */
  const preloader=$('#preloader'), preWord=$('#preWord'), preCount=$('#preCount'), preBar=$('#preBar');
  const greetings=['Hello','Bonjour','स्वागत हे','Ciao','Olá','おい','Hallå','Guten tag','Hallo'];
  let preloaded=false; try{preloaded=sessionStorage.getItem('jn-preloaded')==='1';}catch(_){}
  function markPreloaded(){ try{sessionStorage.setItem('jn-preloaded','1');}catch(_){} }
  function finishPreload(){
    if(preloader.classList.contains('done'))return;
    preloader.classList.add('done');
    if(hasG&&!reduce&&!preloaded){
      G.to(preloader,{yPercent:-100,duration:1,ease:'power4.inOut',onComplete:()=>{preloader.style.display='none';}});
    } else { preloader.style.display='none'; }
    markPreloaded();
    if(preloaded||reduce||!hasG) heroStatic(); else heroIn();
  }
  function runPreload(){
    if(reduce||!hasG){ finishPreload(); return; }
    let i=0;
    G.set(preWord,{opacity:1});
    const cycle=setInterval(()=>{
      i++;
      if(i>=greetings.length){ clearInterval(cycle);
        G.to(preWord,{opacity:0,y:-20,duration:.4,ease:'power2.in',onComplete:finishPreload});
        return;
      }
      preWord.textContent=greetings[i];
      G.fromTo(preWord,{opacity:0,y:14},{opacity:1,y:0,duration:.22,ease:'power2.out'});
      const pct=Math.round((i/(greetings.length-1))*100);
      preCount.textContent=String(pct).padStart(2,'0');
      G.to(preBar,{width:pct+'%',duration:.22,ease:'none'});
    },165);
    preWord.textContent=greetings[0];
    G.fromTo(preWord,{opacity:0,y:14},{opacity:1,y:0,duration:.3});
  }

  /* ============================================================
     FAILSAFE — never leave the user stuck
     ============================================================ */
  setTimeout(()=>{
    if(preloader && !preloader.classList.contains('done')){ preloader.style.display='none'; preloader.classList.add('done'); }
    $$('[data-reveal]').forEach(el=>{const r=el.getBoundingClientRect(); if(r.top<innerHeight){el.classList.add('in');el.classList.remove('pre');}});
  },4200);

  /* ============================================================
     BOOT
     ============================================================ */
  let booted=false;
  async function boot(){
    if(booted) return; booted=true; window.__booted=true;
    if('scrollRestoration' in history) history.scrollRestoration='manual';
    const legacy=legacyHashUrl();
    if(legacy){
      const target=parsePath(legacy), here=parsePath(location.pathname);
      if(target&&(!here||target.name!==here.name||target.id!==here.id)){
        await go(legacy,{push:false,instant:true});
      } else initPage();
      history.replaceState({jn:1,y:0},'',legacy);
    } else {
      history.replaceState({jn:1,y:0},'',location.pathname);
      initPage();
    }
    if(preloaded) finishPreload(); else runPreload();
    if(hasST) window.ScrollTrigger.refresh();
  }
  if(document.readyState==='complete') boot();
  else addEventListener('load',boot);
  // boot quickly if load is slow (fonts/images) but DOM is ready
  if(document.readyState!=='loading') setTimeout(boot,700);
})();