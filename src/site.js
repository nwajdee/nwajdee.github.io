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
  const DATA = window.__JN || {imgs:{},titles:{},books:{},posts:{}};
  const imgOf = id => DATA.imgs[id];

  const labels={home:'Home',work:'Work',about:'About',contact:'Contact',resources:'Resources',books:'Books',academy:'Academy',blog:'Blog'};
  const RESFAM=['resources','books','academy','blog','book','post'];
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
    if(r==='/resources') return {name:'resources',id:null};
    if(r==='/resources/books') return {name:'books',id:null};
    if(r==='/resources/academy') return {name:'academy',id:null};
    if(r==='/resources/blog') return {name:'blog',id:null};
    if(r.indexOf('/resources/books/')===0){ const id=r.slice(17); return DATA.books&&DATA.books[id]?{name:'book',id:id}:null; }
    if(r.indexOf('/resources/blog/')===0){ const id=r.slice(16); return DATA.posts&&DATA.posts[id]?{name:'post',id:id}:null; }
    if(r.indexOf('/work/')===0){ const id=r.slice(6); return imgOf(id)?{name:'project',id:id}:null; }
    return null;
  }
  function pathOf(name,id){
    if(name==='project'&&id) return '/work/'+id+'/';
    if(name==='book'&&id) return '/resources/books/'+id+'/';
    if(name==='post'&&id) return '/resources/blog/'+id+'/';
    if(name==='books') return '/resources/books/';
    if(name==='academy') return '/resources/academy/';
    if(name==='blog') return '/resources/blog/';
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
    return labels[r]?pathOf(r):null;
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
    const hoverSel='a,button,[role="link"],input,select,textarea,.work-row,.book3d canvas';
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
    /* cover first (instant), then the captured hover GIF once decoded */
    const gif=DATA.gifs&&DATA.gifs[id];
    if(gif){ const im=new Image(); im.onload=()=>{ if(pvId===id) previewImg.src=gif; }; im.src=gif; }
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
    const hov=near?near.closest('a,button,[role="link"],input,select,textarea,.work-row,.book3d canvas'):null;
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

  /* ---------- header resources dropdown ---------- */
  (function(){
    const drop=$('#navDrop'), caret=$('#navDropCaret'); if(!drop||!caret) return;
    function setOpen(v){ drop.classList.toggle('open',v); caret.setAttribute('aria-expanded',String(v)); }
    caret.addEventListener('click',e=>{ e.stopPropagation(); setOpen(!drop.classList.contains('open')); });
    drop.addEventListener('click',e=>{ if(e.target.closest('a')) setOpen(false); });
    document.addEventListener('click',e=>{ if(!drop.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&drop.classList.contains('open')){ setOpen(false); caret.focus({preventScroll:true}); } });
    drop.addEventListener('focusout',e=>{ if(e.relatedTarget&&!drop.contains(e.relatedTarget)) setOpen(false); });
  })();

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

  /* ============================================================
     3D BOOK VIEWER — three.js lazy module, one damped rAF per
     scene, IO pause offscreen, pixel-ratio cap, full dispose.
     ============================================================ */
  let threeP=null;
  function loadThree(){ if(!threeP) threeP=import('/assets/vendor/three.module.min.js'); return threeP; }
  const clampN=(v,a,b)=>Math.min(b,Math.max(a,v));

  function BookScene(el,meta,mode){
    const hero=mode==='hero';
    const defs={dist:hero?3.7:4.3,spin:!reduce,speed:hero?1:.6,float:reduce?0:(hero?.07:.05),light:1.15,angle:35};
    let cover='a', spin=defs.spin, speed=defs.speed, floatAmp=defs.float, lightI=defs.light, angle=defs.angle;
    const target={ry:.5,rx:-.06,dist:defs.dist}, cur={ry:.5,rx:-.06,dist:defs.dist};
    let dragging=false, dirty=true, ready=false, dead=false, inView=true, raf=0;
    let THREE,renderer,scene,camera,mesh,key,amb,ro,io,canvas,geoShared;
    const texCache={}, mats=[];
    let frontMat,backMat;

    function spineTexture(){
      const c=document.createElement('canvas'); c.width=128; c.height=1024;
      const x=c.getContext('2d');
      x.fillStyle=meta.c[0]; x.fillRect(0,0,128,1024);
      x.fillStyle='#141517';
      x.save(); x.translate(64,512); x.rotate(Math.PI/2);
      x.font='700 46px "Hanken Grotesk",sans-serif'; x.textAlign='center'; x.textBaseline='middle';
      x.fillText(meta.t.toUpperCase(),0,0,900);
      x.restore();
      x.beginPath(); x.arc(64,60,10,0,7); x.fill();
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
    }
    function pagesTexture(){
      const c=document.createElement('canvas'); c.width=256; c.height=256;
      const x=c.getContext('2d');
      x.fillStyle='#F2EEE4'; x.fillRect(0,0,256,256);
      x.fillStyle='rgba(0,0,0,.09)';
      for(let y=0;y<256;y+=3) x.fillRect(0,y,256,1);
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
    }
    function coverTex(url){
      if(texCache[url]) return texCache[url];
      const t=new THREE.TextureLoader().load(url,()=>{dirty=true;});
      t.colorSpace=THREE.SRGBColorSpace;
      t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      texCache[url]=t; return t;
    }
    function applyCover(){ if(!ready)return; frontMat.map=coverTex(meta[cover][0]); backMat.map=coverTex(meta[cover][1]); frontMat.needsUpdate=true; backMat.needsUpdate=true; dirty=true; }
    function applyLight(){ if(!ready)return; const r=angle*Math.PI/180; key.position.set(Math.sin(r)*3.2,2.1,Math.cos(r)*3.2); key.intensity=1.15*lightI; amb.intensity=.5*lightI; dirty=true; }

    function init(T){
      if(dead) return;
      THREE=T;
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.setSize(el.clientWidth||300,el.clientHeight||300,false);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.06;
      canvas=renderer.domElement;
      canvas.setAttribute('aria-label',meta.t+' - interactive 3D book. Drag to orbit, scroll to zoom.');
      canvas.setAttribute('role','img');
      el.appendChild(canvas);
      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(38,(el.clientWidth||300)/(el.clientHeight||300),.1,50);
      camera.position.set(0,.12,cur.dist);
      amb=new THREE.AmbientLight(0xffffff,.5*lightI);
      key=new THREE.DirectionalLight(0xffffff,1.15*lightI);
      const rim=new THREE.DirectionalLight(0xbfd4ff,.55); rim.position.set(-2.5,1.5,-3);
      const fill=new THREE.DirectionalLight(0xfff2e0,.3); fill.position.set(-3,-.5,2);
      scene.add(amb,key,rim,fill);
      if(!BookScene.geo) BookScene.geo=new THREE.BoxGeometry(1.4,2.1,.18);
      geoShared=BookScene.geo;
      const spine=spineTexture(), pages=pagesTexture();
      texCache.__spine=spine; texCache.__pages=pages;
      const edgeMat=new THREE.MeshStandardMaterial({map:pages,roughness:.9});
      const spineMat=new THREE.MeshStandardMaterial({map:spine,roughness:.6});
      frontMat=new THREE.MeshStandardMaterial({roughness:.5,metalness:.02});
      backMat=new THREE.MeshStandardMaterial({roughness:.5,metalness:.02});
      mats.push(edgeMat,spineMat,frontMat,backMat);
      mesh=new THREE.Mesh(geoShared,[edgeMat,spineMat,edgeMat,edgeMat,frontMat,backMat]);
      scene.add(mesh);
      ready=true;
      applyCover(); applyLight();
      /* prefetch the other cover variation once the first frame is up */
      setTimeout(()=>{ if(!dead){ coverTex(meta[cover==='a'?'b':'a'][0]); coverTex(meta[cover==='a'?'b':'a'][1]); } },600);

      let lx=0,ly=0;
      canvas.addEventListener('pointerdown',e=>{ dragging=true; lx=e.clientX; ly=e.clientY; try{canvas.setPointerCapture(e.pointerId);}catch(_){} });
      canvas.addEventListener('pointermove',e=>{ if(!dragging)return; target.ry+=(e.clientX-lx)*.0075; target.rx=clampN(target.rx+(e.clientY-ly)*.005,-.55,.55); lx=e.clientX; ly=e.clientY; dirty=true; });
      const endDrag=()=>{dragging=false;};
      canvas.addEventListener('pointerup',endDrag);
      canvas.addEventListener('pointercancel',endDrag);
      canvas.addEventListener('wheel',e=>{ e.preventDefault(); e.stopPropagation(); target.dist=clampN(target.dist+e.deltaY*.0022,2.4,6); dirty=true; },{passive:false});

      ro=new ResizeObserver(()=>{ const w=el.clientWidth,h=el.clientHeight; if(!w||!h)return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); dirty=true; });
      ro.observe(el);
      if('IntersectionObserver' in window){
        io=new IntersectionObserver(es=>{es.forEach(en=>{inView=en.isIntersecting; if(inView)dirty=true;});},{threshold:.02});
        io.observe(el);
      }
      el.classList.add('book3d--live');
      raf=requestAnimationFrame(frame);
    }
    function frame(t){
      if(dead) return;
      raf=requestAnimationFrame(frame);
      if(!inView||document.hidden) return;
      const time=t*.001;
      if(spin&&!dragging) target.ry+=speed*.0045;
      cur.ry+=(target.ry-cur.ry)*.085;
      cur.rx+=(target.rx-cur.rx)*.085;
      cur.dist+=(target.dist-cur.dist)*.1;
      mesh.rotation.y=cur.ry;
      mesh.rotation.x=cur.rx+(floatAmp?Math.sin(time*.7)*.02:0);
      mesh.position.y=floatAmp?Math.sin(time*1.1)*floatAmp:0;
      camera.position.z=cur.dist;
      const moving=dragging||spin||floatAmp>0||Math.abs(target.ry-cur.ry)>1e-4||Math.abs(target.rx-cur.rx)>1e-4||Math.abs(target.dist-cur.dist)>1e-3;
      if(moving||dirty){ renderer.render(scene,camera); dirty=false; }
    }
    loadThree().then(init).catch(()=>{
      el.classList.add('book3d--flat');
      const ctl=el.parentElement&&(el.parentElement.querySelector('.rail')||el.parentElement.querySelector('.shelf-ctl'));
      if(ctl){ ctl.style.opacity=.4; ctl.style.pointerEvents='none'; ctl.setAttribute('aria-disabled','true'); }
    });

    return {
      setCover(v){ cover=v; applyCover(); },
      setFace(f){ const two=Math.PI*2; target.ry=f==='front'?Math.round(cur.ry/two)*two:Math.round((cur.ry-Math.PI)/two)*two+Math.PI; target.rx=-.06; spin=false; dirty=true; },
      toggleSpin(){ spin=!spin; dirty=true; return spin; },
      setSpin(v){ spin=v; dirty=true; },
      setSpeed(v){ speed=v; },
      setFloat(v){ floatAmp=v; dirty=true; },
      setLight(v){ lightI=v; applyLight(); },
      setAngle(v){ angle=v; applyLight(); },
      setZoom(v){ target.dist=clampN(v,2.4,6); dirty=true; },
      reset(){ cover='a'; spin=defs.spin; speed=defs.speed; floatAmp=defs.float; lightI=defs.light; angle=defs.angle; target.ry=.5; target.rx=-.06; target.dist=defs.dist; applyCover(); applyLight(); dirty=true; return this.state(); },
      state(){ return {cover,spin,speed,float:floatAmp,light:lightI,angle,dist:target.dist}; },
      dispose(){
        dead=true; cancelAnimationFrame(raf);
        if(ro)ro.disconnect(); if(io)io.disconnect();
        Object.keys(texCache).forEach(k=>{ if(texCache[k]&&texCache[k].dispose)texCache[k].dispose(); });
        mats.forEach(m=>m.dispose());
        if(renderer){ renderer.dispose(); try{renderer.forceContextLoss();}catch(_){} }
        if(canvas)canvas.remove();
        el.classList.remove('book3d--live');
      }
    };
  }

  function bindBookControls(el,api,meta,mode){
    const scope=el.parentElement&&(el.parentElement.querySelector('.rail')||el.parentElement.querySelector('.shelf-ctl'));
    if(!scope) return;
    const ac=new AbortController(), sig={signal:ac.signal};
    const segs=$$('.seg__btn',scope), spinBtn=$('[data-ctl="spin"]',scope),
          ranges={speed:$('[data-ctl="speed"]',scope),float:$('[data-ctl="float"]',scope),light:$('[data-ctl="light"]',scope),angle:$('[data-ctl="angle"]',scope),zoom:$('[data-ctl="zoom"]',scope)},
          resetBtn=$('[data-ctl="reset"]',scope), dl=$('[data-ctl="download"]',scope);
    let face='front';
    function syncSeg(ctl,val){ segs.forEach(b=>{ if(b.dataset.ctl!==ctl)return; const on=b.dataset.val===val; b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); }); }
    function syncSpin(on){ if(!spinBtn)return; spinBtn.classList.toggle('is-on',on); spinBtn.setAttribute('aria-pressed',String(on)); }
    function syncDownload(){ if(dl)dl.setAttribute('href',meta[api.state().cover][0]); }
    segs.forEach(b=>b.addEventListener('click',()=>{
      const ctl=b.dataset.ctl, val=b.dataset.val;
      if(ctl==='cover'){ api.setCover(val); syncSeg('cover',val); syncDownload(); }
      if(ctl==='face'){ face=val; api.setFace(val); syncSeg('face',val); syncSpin(false); }
    },sig));
    const flip=$('[data-ctl="face"]:not(.seg__btn)',scope);
    if(flip) flip.addEventListener('click',()=>{ face=face==='front'?'back':'front'; api.setFace(face); syncSpin(false); },sig);
    if(spinBtn) spinBtn.addEventListener('click',()=>syncSpin(api.toggleSpin()),sig);
    Object.keys(ranges).forEach(k=>{ const r=ranges[k]; if(!r)return;
      r.addEventListener('input',()=>{ const v=parseFloat(r.value);
        if(k==='speed')api.setSpeed(v); if(k==='float')api.setFloat(v); if(k==='light')api.setLight(v); if(k==='angle')api.setAngle(v); if(k==='zoom')api.setZoom(v);
      },sig);
    });
    if(resetBtn) resetBtn.addEventListener('click',()=>{
      const s=api.reset(); face='front';
      syncSeg('cover',s.cover); syncSeg('face','front'); syncSpin(s.spin); syncDownload();
      if(ranges.speed)ranges.speed.value=s.speed; if(ranges.float)ranges.float.value=s.float;
      if(ranges.light)ranges.light.value=s.light; if(ranges.angle)ranges.angle.value=s.angle; if(ranges.zoom)ranges.zoom.value=s.dist;
    },sig);
    syncDownload();
    syncSpin(api.state().spin);
    pageCleanup.push(()=>ac.abort());
  }

  function initBookScopes(page){
    $$('.book3d',page).forEach(el=>{
      const meta=DATA.books&&DATA.books[el.dataset.book]; if(!meta) return;
      const mode=el.dataset.mode||'shelf';
      const api=BookScene(el,meta,mode);
      bindBookControls(el,api,meta,mode);
      pageCleanup.push(()=>api.dispose());
    });
  }

  /* ---------- FAQ accordion ---------- */
  function bindAcc(scope){
    if(!scope) return;
    const ac=new AbortController();
    scope.addEventListener('click',e=>{
      const q=e.target.closest('.acc__q'); if(!q)return;
      const open=q.closest('.acc__item').classList.toggle('open');
      q.setAttribute('aria-expanded',String(open));
    },{signal:ac.signal});
    pageCleanup.push(()=>ac.abort());
  }

  /* ---------- sticky buy bar (hero out of view, footer out of view) ---------- */
  function initBuybar(page){
    const bar=$('#buybar',page), hero=$('.bl-hero',page), footer=$('#footer');
    if(!bar||!hero) return;
    let heroIn=true, footIn=false;
    const update=()=>bar.classList.toggle('show',!heroIn&&!footIn);
    const io=new IntersectionObserver(es=>{
      es.forEach(en=>{ if(en.target===hero)heroIn=en.isIntersecting; else footIn=en.isIntersecting; });
      update();
    },{threshold:.06});
    io.observe(hero); if(footer)io.observe(footer);
    pageCleanup.push(()=>{ io.disconnect(); bar.classList.remove('show'); });
  }

  /* ---------- blog topic filter ---------- */
  function bindBlogFilter(page){
    const chips=$$('.chip',page), cards=$$('.post-card',page), empty=$('#postsEmpty',page);
    if(!chips.length) return;
    const ac=new AbortController();
    chips.forEach(ch=>ch.addEventListener('click',()=>{
      chips.forEach(c=>{ const on=c===ch; c.classList.toggle('is-on',on); c.setAttribute('aria-pressed',String(on)); });
      const f=ch.dataset.filter; let n=0;
      cards.forEach(c=>{ const show=f==='all'||c.dataset.cat===f; c.classList.toggle('is-hidden',!show); if(show)n++; });
      if(empty)empty.hidden=n>0;
      if(hasST)window.ScrollTrigger.refresh();
      if(lenis)lenis.resize();
    },{signal:ac.signal}));
    pageCleanup.push(()=>ac.abort());
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
    if(current==='books'||current==='book') initBookScopes(page);
    if(current==='book'){ initBuybar(page); bindAcc($('#bkFaq',page)); }
    if(current==='academy') bindAcc($('#acadFaq',page));
    if(current==='blog') bindBlogFilter(page);
    if(current==='project'){
      /* case videos: play in view, pause out of view; click / key toggles */
      const vids=$$('video[data-casevideo]',page);
      if(vids.length){
        const toggle=v=>{ if(v.paused){ const p=v.play(); if(p&&p.catch)p.catch(()=>{}); } else v.pause(); };
        const onClick=e=>toggle(e.currentTarget);
        const onKey=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(e.currentTarget); } };
        vids.forEach(v=>{ v.addEventListener('click',onClick); v.addEventListener('keydown',onKey); });
        let vio=null;
        if(!reduce && 'IntersectionObserver' in window){
          vio=new IntersectionObserver(es=>es.forEach(en=>{
            const v=en.target;
            if(en.isIntersecting){ const p=v.play(); if(p&&p.catch)p.catch(()=>{}); }
            else v.pause();
          }),{threshold:.25});
          vids.forEach(v=>vio.observe(v));
        }
        pageCleanup.push(()=>{ if(vio)vio.disconnect(); vids.forEach(v=>{ v.pause(); v.removeEventListener('click',onClick); v.removeEventListener('keydown',onKey); }); });
      }
    }
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
    const label=route.name==='project'?(DATA.titles[route.id]||'Work'):route.name==='book'?((DATA.books[route.id]||{}).t||'Books'):route.name==='post'?((DATA.posts[route.id]||{}).t||'Blog'):(labels[route.name]||'');

    const swap=doc=>{
      const newPage=doc.querySelector('.page');
      destroyPage();
      $('#main').replaceChildren(document.importNode(newPage,true));
      current=newPage.dataset.page||route.name;
      const navName=current==='project'?'work':(RESFAM.indexOf(current)>-1?'resources':current);
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