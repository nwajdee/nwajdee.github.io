/* ============================================================
   Jordan Nwachukwu - MPA app
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
      const pick=el.querySelector('.btn,.footer__btn,.menu-btn__label')||el.firstElementChild||el;
      // never parallax the slide-in fill: an inline transform on it cancels its rest-state hide
      const inner=pick.classList.contains('btn__bg')?el:pick;
      el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
        G.to(el,{x:x*strength,y:y*strength,duration:.6,ease:'power3.out'});
        if(inner!==el) G.to(inner,{x:x*strength*.4,y:y*strength*.4,duration:.6,ease:'power3.out'});
      });
      el.addEventListener('mouseleave',()=>{
        G.to(el,{x:0,y:0,duration:.9,ease:'elastic.out(1,0.35)'});
        if(inner!==el) G.to(inner,{x:0,y:0,duration:.9,ease:'elastic.out(1,0.35)'});
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
     WORK PREVIEW (home rows) - global loop, page-scoped bindings
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
     firing mouseover/mouseleave - re-sync hover state from the real hit-test.
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
    drop.addEventListener('click',e=>{ if(e.target.closest('a')){ setOpen(false); /* move focus out of the drop so :focus-within cannot hold the menu open across the page swap */ const m=$('#main'); if(m) m.focus({preventScroll:true}); } });
    document.addEventListener('click',e=>{ if(!drop.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&drop.classList.contains('open')){ setOpen(false); caret.focus({preventScroll:true}); } });
    drop.addEventListener('focusout',e=>{ if(e.relatedTarget&&!drop.contains(e.relatedTarget)) setOpen(false); });
  })();

  /* ============================================================
     THEME (dark default / light) - persisted, pre-paint boot in <head>
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
     PAGE LIFECYCLE - motion + interactions for the active document
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

  /* ---------- reveals (IntersectionObserver - robust without GSAP) ---------- */
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
    // footer parallax reveal (reference site)
    const footer=$('#footer');
    if(footer){
      G.fromTo(footer,{yPercent:12,opacity:.6},{yPercent:0,opacity:1,ease:'none',scrollTrigger:{trigger:footer,start:'top bottom',end:'top 60%',scrub:true}});
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

  /* ---------- email capture -> Kit ----------
     Public form-subscription endpoint (same one Kit's embed uses): no API
     key or backend needed on a static host. Form IDs live in one place -
     window.__KIT_FORMS in shell.html (Kit dashboard -> Forms -> embed).
     While an ID is empty, that form falls back to a pre-composed email so
     a submission is never silently dropped. ---------- */
  const kitForms=()=>window.__KIT_FORMS||{contact:'',waitlist:''};
  const kitPost=(id,data)=>{
    const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),12000);
    return fetch('https://app.kit.com/forms/'+id+'/subscriptions',{method:'POST',body:data,headers:{Accept:'application/json'},mode:'cors',signal:ctl.signal})
      .finally(()=>clearTimeout(to));
  };
  const kitData=(email,name,extra)=>{ const d=new FormData(); d.append('email_address',email); if(name)d.append('first_name',name); Object.keys(extra||{}).forEach(k=>{ if(extra[k])d.append('fields['+k+']',extra[k]); }); return d; };
  // Kit answers 200 even on failure ({status:"failed",errors:{...}}), so judge the body.
  const kitOk=async res=>{ if(!res.ok) return false; try{ const j=await res.json(); return !!j && j.status!=='failed' && !j.errors; }catch(_){ return true; } };
  const mailto=(subject,body)=>'mailto:nwajdee1@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  function setBusy(btn,on,label){ if(!btn)return; btn.disabled=on; const s=btn.querySelector('span:not(.btn__bg)'); if(!s)return; if(on){ btn.__lbl=s.textContent; s.textContent=label||'Sending…'; } else if(btn.__lbl){ s.textContent=btn.__lbl; btn.__lbl=null; } }
  function revealNode(node){ node.classList.add('show'); if(hasG&&!reduce) G.fromTo(node,{opacity:0,y:20},{opacity:1,y:0,duration:.7,ease:'power3.out'}); }

  /* ---------- contact form ---------- */
  function bindForm(){
    const form=$('#contactForm'); if(!form||form.__bound) return; form.__bound=true;
    const err=$('#formErr',form), btn=$('button[type="submit"]',form);
    function validateField(field){
      const input=field.querySelector('input,select,textarea'); if(!input)return true;
      let ok=true; const v=input.value.trim();
      if(input.required && !v) ok=false;
      if(input.type==='email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok=false;
      field.classList.toggle('invalid',!ok); return ok;
    }
    const values=()=>({name:$('#cf-name',form).value.trim(),email:$('#cf-email',form).value.trim(),type:$('#cf-type',form).value,budget:$('#cf-budget',form).value,message:$('#cf-msg',form).value.trim()});
    const inquiryMail=v=>mailto('Project inquiry · '+(v.type||'website'),'Hi Jordan,\n\nName: '+v.name+'\nEmail: '+v.email+'\nProject type: '+v.type+'\nBudget: '+(v.budget||'not stated')+'\n\n'+v.message);
    function fail(v,msg){
      setBusy(btn,false); err.hidden=false; err.textContent='';
      err.append(document.createTextNode(msg+' '));
      const a=document.createElement('a'); a.href=inquiryMail(v); a.textContent='Send it by email instead'; err.append(a);
    }
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const fields=$$('.field',form); let allOk=true;
      fields.forEach(f=>{ if(!validateField(f)) allOk=false; });
      if(!allOk){ const first=$('.field.invalid input,.field.invalid select,.field.invalid textarea',form); if(first)first.focus(); return; }
      const v=values(); err.hidden=true;
      if(!kitForms().contact){ window.location.href=inquiryMail(v); form.style.display='none'; revealNode($('#formMail')); return; }
      setBusy(btn,true);
      try{
        const extra={project_type:v.type,budget:v.budget,message:v.message};
        let good=await kitOk(await kitPost(kitForms().contact,kitData(v.email,v.name,extra)));
        if(!good) good=await kitOk(await kitPost(kitForms().contact,kitData(v.email,v.name)));
        if(!good) throw new Error('kit failed');
        form.style.display='none'; revealNode($('#formSuccess'));
      }catch(_){ fail(v,'Couldn\'t reach the inbox just now.'); }
    });
    form.addEventListener('input',e=>{const f=e.target.closest('.field'); if(f&&f.classList.contains('invalid'))validateField(f);});
  }

  /* ---------- academy waitlist ---------- */
  function bindWaitlist(){
    const form=$('#waitlistForm'); if(!form||form.__bound) return; form.__bound=true;
    const input=$('#wl-email',form), field=input.closest('.field'), msg=$('#waitlistMsg'), btn=$('button[type="submit"]',form);
    const valid=()=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    function say(text,kind,link){
      msg.hidden=false; msg.className='kit-msg'+(kind?' kit-msg--'+kind:''); msg.textContent='';
      msg.append(document.createTextNode(text));
      if(link){ msg.append(document.createTextNode(' ')); const a=document.createElement('a'); a.href=link; a.textContent='Join by email instead'; msg.append(a); }
    }
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const ok=valid(); field.classList.toggle('invalid',!ok); if(!ok){ input.focus(); return; }
      msg.hidden=true;
      if(!kitForms().waitlist){ window.location.href=form.dataset.fallback; say('Your email app should open with the waitlist request pre-filled - hit send there.',''); return; }
      setBusy(btn,true);
      try{
        if(!await kitOk(await kitPost(kitForms().waitlist,kitData(input.value.trim(),'')))) throw new Error('kit failed');
        form.style.display='none';
        say('You\'re on the list. Dates, price and seat count land in your inbox before the public announcement.','ok');
      }catch(_){ setBusy(btn,false); say('Couldn\'t reach the list just now. Try again in a moment.','err',form.dataset.fallback); }
    });
    input.addEventListener('input',()=>{ if(field.classList.contains('invalid')) field.classList.toggle('invalid',!valid()); });
  }

  /* ============================================================
     3D BOOK VIEWER - three.js lazy module, one damped rAF per
     scene, IO pause offscreen, pixel-ratio cap, full dispose.
     Composite hardcover: cover boards + inset page block + rounded
     spine, paper grain bump/roughness, matte varnish, softbox env.
     Drag to orbit only; slow auto-spin and float unless reduced.
     ============================================================ */
  let threeP=null;
  function loadThree(){ if(!threeP) threeP=import('/assets/vendor/three.module.min.js'); return threeP; }
  const clampN=(v,a,b)=>Math.min(b,Math.max(a,v));

  function BookScene(el,meta,mode){
    const target={ry:.55,rx:-.06}, cur={ry:.55,rx:-.06};
    let dragging=false, dirty=true, ready=false, dead=false, inView=true, raf=0, vel=0, lastT=0;
    let THREE,renderer,scene,camera,book,ro,io,canvas,envRT;
    const texCache={}, mats=[];
    const W=1.42,H=2.12,PD=.15,BT=.024,SR=(PD+BT*2)/2,WB=W-SR;
    // Fit the book's bounding sphere (+ float bob + margin) inside the frustum:
    // asin(R/dist) <= the tighter of vertical/horizontal half-fov, so no spin
    // or drag angle can clip the book at any viewport edge, at any aspect.
    const FIT_R=Math.hypot(W/2,H/2,(PD+BT*2)/2)+.055+.02;
    const VHALF=19*Math.PI/180;
    const fitDist=()=>{ const a=(el.clientWidth||300)/(el.clientHeight||300); return FIT_R/Math.sin(Math.min(VHALF,Math.atan(Math.tan(VHALF)*a))); };

    function grain(){
      if(BookScene.grain) return BookScene.grain;
      const c=document.createElement('canvas'); c.width=c.height=256;
      const x=c.getContext('2d'), id=x.createImageData(256,256);
      for(let i=0;i<id.data.length;i+=4){ const v=110+(Math.random()*36|0); id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255; }
      x.putImageData(id,0,0); BookScene.grain=c; return c;
    }
    function weave(x,w,h){
      x.globalAlpha=.05; x.fillStyle='#fff';
      for(let y=0;y<h;y+=3) x.fillRect(0,y,w,1);
      x.globalAlpha=.04; x.fillStyle='#000';
      for(let xx=0;xx<w;xx+=3) x.fillRect(xx,0,1,h);
      x.globalAlpha=1;
    }
    function paperOverlay(x,w,h,hingeSide){
      weave(x,w,h);
      x.globalAlpha=.08; x.globalCompositeOperation='overlay';
      x.fillStyle=x.createPattern(grain(),'repeat'); x.fillRect(0,0,w,h);
      x.globalCompositeOperation='source-over'; x.globalAlpha=1;
      const x0=hingeSide==='left'?0:w*.94;
      const g=x.createLinearGradient(x0,0,x0+w*.06,0);
      g.addColorStop(0,'rgba(0,0,0,.30)'); g.addColorStop(.55,'rgba(0,0,0,.10)'); g.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=g; x.fillRect(x0,0,w*.06,h);
      x.fillStyle='rgba(255,255,255,.05)';
      x.fillRect(0,0,w,3); x.fillRect(0,h-3,w,3); x.fillRect(0,0,3,h); x.fillRect(w-3,0,3,h);
    }
    function noiseTex(w,h,base,alpha){
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      const x=c.getContext('2d'); x.fillStyle=base; x.fillRect(0,0,w,h);
      weave(x,w,h);
      x.globalAlpha=alpha; x.fillStyle=x.createPattern(grain(),'repeat'); x.fillRect(0,0,w,h); x.globalAlpha=1;
      return new THREE.CanvasTexture(c);
    }
    function coverTex(url,hingeSide){
      if(texCache[url]) return texCache[url];
      const c=document.createElement('canvas'); c.width=1024; c.height=1536;
      const x=c.getContext('2d'); x.fillStyle='#8a8a8a'; x.fillRect(0,0,1024,1536);
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
      t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      const img=new Image();
      img.onload=()=>{ if(dead)return;
        const s=Math.max(1024/img.width,1536/img.height), dw=img.width*s, dh=img.height*s;
        x.drawImage(img,(1024-dw)/2,(1536-dh)/2,dw,dh);
        paperOverlay(x,1024,1536,hingeSide); t.needsUpdate=true; dirty=true; };
      img.src=url;
      texCache[url]=t; return t;
    }
    function spineTexture(){
      const c=document.createElement('canvas'); c.width=256; c.height=2048;
      const x=c.getContext('2d');
      x.fillStyle=meta.c[0]; x.fillRect(0,0,256,2048);
      paperOverlay(x,256,2048,'left');
      x.fillStyle='#141517';
      x.save(); x.translate(128,1024); x.rotate(Math.PI/2);
      x.font='700 92px "Hanken Grotesk",sans-serif'; x.textAlign='center'; x.textBaseline='middle';
      x.fillText(meta.t.toUpperCase(),0,0,1500);
      x.restore();
      x.save(); x.translate(128,1880); x.rotate(Math.PI/2);
      x.font='500 44px "Hanken Grotesk",sans-serif'; x.textAlign='center'; x.textBaseline='middle';
      x.fillText('JORDAN NWACHUKWU',0,0,240);
      x.restore();
      x.beginPath(); x.arc(128,140,22,0,7); x.fill();
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
      t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      return t;
    }
    function pagesTexture(dir){
      const c=document.createElement('canvas'); c.width=c.height=512;
      const x=c.getContext('2d');
      x.fillStyle='#F2EDE1'; x.fillRect(0,0,512,512);
      const line=(p,w,col)=>{ x.fillStyle=col; if(dir==='top') x.fillRect(0,p,512,w); else x.fillRect(p,0,w,512); };
      for(let i=0;i<512;i+=2) line(i,1,'rgba(70,58,40,'+(0.05+Math.random()*0.09).toFixed(3)+')');
      let p=10;
      while(p<500){
        line(p,2+Math.floor(Math.random()*2),'rgba(96,82,60,'+(0.20+Math.random()*0.14).toFixed(3)+')');
        line(p+3,1,'rgba(255,252,240,'+(0.10+Math.random()*0.10).toFixed(3)+')');
        p+=26+Math.floor(Math.random()*22);
      }
      const g=dir==='top'?x.createLinearGradient(0,0,0,512):x.createLinearGradient(0,0,512,0);
      g.addColorStop(0,'rgba(60,48,32,.22)'); g.addColorStop(.09,'rgba(60,48,32,0)');
      g.addColorStop(.91,'rgba(60,48,32,0)'); g.addColorStop(1,'rgba(60,48,32,.22)');
      x.fillStyle=g; x.fillRect(0,0,512,512);
      x.globalAlpha=.06; x.fillStyle=x.createPattern(grain(),'repeat'); x.fillRect(0,0,512,512); x.globalAlpha=1;
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
      t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      return t;
    }

    function init(T){
      if(dead) return;
      THREE=T;
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.setSize(el.clientWidth||300,el.clientHeight||300,false);
      renderer.setClearAlpha(0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.12;
      canvas=renderer.domElement;
      canvas.setAttribute('aria-label',meta.t+' - 3D book. Drag to orbit.');
      canvas.setAttribute('role','img');
      el.appendChild(canvas);
      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(38,(el.clientWidth||300)/(el.clientHeight||300),.1,50);
      camera.position.set(0,0,fitDist());

      const pm=new THREE.PMREMGenerator(renderer);
      const es=new THREE.Scene();
      const softbox=(w,h,col,pos,rot)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:col})); m.position.set(pos[0],pos[1],pos[2]); m.rotation.set(rot[0],rot[1],rot[2]); es.add(m); };
      softbox(7,4,new THREE.Color(2.4,1.9,1.4),[0,4.5,0],[Math.PI/2,0,0]);
      softbox(5,3,new THREE.Color(.24,.31,.62),[-5,1,0],[0,Math.PI/2,0]);
      softbox(6,4,new THREE.Color(1.15,1.15,1.2),[0,1,5],[0,Math.PI,0]);
      softbox(5,2.5,new THREE.Color(meta.c[0]).multiplyScalar(1.5),[0,-4,1.5],[-Math.PI/2,0,0]);
      envRT=pm.fromScene(es,.05);
      scene.environment=envRT.texture;
      es.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material)o.material.dispose(); });
      pm.dispose();

      const key=new THREE.DirectionalLight(0xfff0dd,2.0); key.position.set(2.6,3.2,2.2);
      const rim=new THREE.DirectionalLight(0xbccfe4,.85); rim.position.set(-3,1.6,-2.6);
      const bounce=new THREE.PointLight(new THREE.Color(meta.c[0]),2.0,9,2); bounce.position.set(-1.5,-1.5,-1.3);
      const hemi=new THREE.HemisphereLight(0xffffff,0x2a2622,.45);
      scene.add(key,rim,bounce,hemi);

      if(!BookScene.geo) BookScene.geo={
        board:new THREE.BoxGeometry(WB,H,BT),
        pages:new THREE.BoxGeometry(WB-.03,H-.055,PD),
        spine:new THREE.CylinderGeometry(SR,SR,H,28,1,true,Math.PI/2,Math.PI)
      };
      const bump=noiseTex(512,768,'#808080',.5);
      const rough=noiseTex(512,768,'#9a9a9a',.35);
      const coverOpts={bumpMap:bump,bumpScale:.0016,roughnessMap:rough,roughness:1,metalness:0,clearcoat:.04,clearcoatRoughness:.85,envMapIntensity:.22};
      const frontMat=new THREE.MeshPhysicalMaterial(Object.assign({map:coverTex(meta.a[0],'left')},coverOpts));
      const backMat=new THREE.MeshPhysicalMaterial(Object.assign({map:coverTex(meta.a[1],'right')},coverOpts));
      const spineMat=new THREE.MeshPhysicalMaterial(Object.assign({map:spineTexture()},coverOpts));
      const edgeMat=new THREE.MeshStandardMaterial({color:new THREE.Color(meta.c[0]).multiplyScalar(.32),roughness:.9});
      const endMat=new THREE.MeshStandardMaterial({color:0xEDE6D8,roughness:.9});
      const pagesTopMat=new THREE.MeshStandardMaterial({map:pagesTexture('top'),roughness:.95,envMapIntensity:.08});
      const pagesForeMat=new THREE.MeshStandardMaterial({map:pagesTexture('fore'),roughness:.95,envMapIntensity:.08});
      const pagesSideMat=new THREE.MeshStandardMaterial({color:0xEFE8DA,roughness:.95});
      mats.push(frontMat,backMat,spineMat,edgeMat,endMat,pagesTopMat,pagesForeMat,pagesSideMat);
      texCache.__bump=bump; texCache.__rough=rough;

      book=new THREE.Group();
      const bf=new THREE.Mesh(BookScene.geo.board,[edgeMat,edgeMat,edgeMat,edgeMat,frontMat,endMat]);
      bf.position.set(SR/2,0,PD/2+BT/2);
      const bb=new THREE.Mesh(BookScene.geo.board,[edgeMat,edgeMat,edgeMat,edgeMat,endMat,backMat]);
      bb.position.set(SR/2,0,-(PD/2+BT/2));
      const pg=new THREE.Mesh(BookScene.geo.pages,[pagesForeMat,pagesSideMat,pagesTopMat,pagesTopMat,pagesSideMat,pagesSideMat]);
      pg.position.set(SR/2-.004,0,0);
      const sp=new THREE.Mesh(BookScene.geo.spine,spineMat);
      sp.rotation.y=Math.PI/2; sp.position.set(-W/2+SR,0,0);
      book.add(bf,bb,pg,sp);
      scene.add(book);

      ready=true; dirty=true;
      let lx=0,ly=0;
      canvas.addEventListener('pointerdown',e=>{ dragging=true; vel=0; lx=e.clientX; ly=e.clientY; try{canvas.setPointerCapture(e.pointerId);}catch(_){} });
      canvas.addEventListener('pointermove',e=>{ if(!dragging)return;
        const dx=e.clientX-lx, dy=e.clientY-ly;
        target.ry+=dx*.0075; target.rx=clampN(target.rx+dy*.005,-.55,.55);
        vel=dx*.0075*60; lx=e.clientX; ly=e.clientY; dirty=true; });
      const endDrag=()=>{dragging=false;};
      canvas.addEventListener('pointerup',endDrag);
      canvas.addEventListener('pointercancel',endDrag);

      ro=new ResizeObserver(()=>{ const w=el.clientWidth,h=el.clientHeight; if(!w||!h)return; renderer.setSize(w,h,false); camera.aspect=w/h; camera.position.z=fitDist(); camera.updateProjectionMatrix(); dirty=true; });
      ro.observe(el);
      if('IntersectionObserver' in window){
        io=new IntersectionObserver(es2=>{es2.forEach(en=>{inView=en.isIntersecting; if(inView)dirty=true;});},{threshold:.02});
        io.observe(el);
      }
      el.classList.add('book3d--live');
      raf=requestAnimationFrame(frame);
    }
    function frame(t){
      if(dead) return;
      raf=requestAnimationFrame(frame);
      if(!inView||document.hidden) return;
      const time=t*.001, dt=clampN((t-lastT)*.001,0,.05); lastT=t;
      if(!dragging){
        if(!reduce) target.ry+=dt*.12;
        if(Math.abs(vel)>1e-3){ target.ry+=vel*dt; vel*=Math.exp(-4*dt); }
      }
      cur.ry+=(target.ry-cur.ry)*.085;
      cur.rx+=(target.rx-cur.rx)*.085;
      book.rotation.y=cur.ry;
      book.rotation.x=cur.rx+(reduce?0:Math.sin(time*.7)*.02);
      book.rotation.z=reduce?0:Math.sin(time*.6+1.3)*.02;
      const bob=reduce?0:Math.sin(time*.9)*.055;
      book.position.y=bob;
      const moving=dragging||!reduce||Math.abs(target.ry-cur.ry)>1e-4||Math.abs(target.rx-cur.rx)>1e-4;
      if(moving||dirty){ renderer.render(scene,camera); dirty=false; }
    }
    loadThree().then(init).catch(()=>{ el.classList.add('book3d--flat'); });

    return {
      dispose(){
        dead=true; cancelAnimationFrame(raf);
        if(ro)ro.disconnect(); if(io)io.disconnect();
        Object.keys(texCache).forEach(k=>{ if(texCache[k]&&texCache[k].dispose)texCache[k].dispose(); });
        mats.forEach(m=>m.dispose());
        if(envRT)envRT.dispose();
        if(renderer){ renderer.dispose(); try{renderer.forceContextLoss();}catch(_){} }
        if(canvas)canvas.remove();
        el.classList.remove('book3d--live');
      }
    };
  }

  function initBookScopes(page){
    $$('.book3d',page).forEach(el=>{
      const meta=DATA.books&&DATA.books[el.dataset.book]; if(!meta) return;
      const api=BookScene(el,meta,el.dataset.mode||'shelf');
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
    if(current==='academy'){ bindAcc($('#acadFaq',page)); bindWaitlist(); }
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
     SWAP NAVIGATION - fetch real documents, swap behind the curtain
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
     PRELOADER - once per session (sessionStorage), hero entrance after
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
     FAILSAFE - never leave the user stuck
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