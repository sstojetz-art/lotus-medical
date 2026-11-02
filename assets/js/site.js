/* Lotus Medical — motion, light and sound. */
(function(){
"use strict";
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(q,r){return (r||document).querySelector(q)},$$=function(q,r){return [].slice.call((r||document).querySelectorAll(q))};
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

/* ================= SOUND ================= */
var Snd=(function(){
  var ctx=null,master=null,amb=null,unlocked=false;
  var on=store('lm-sound')!=='off';
  var scale=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5];
  function init(){
    if(ctx)return ctx;
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    ctx=new AC();master=ctx.createGain();master.gain.value=.55;
    var comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);
    return ctx;
  }
  function ok(){return on&&unlocked&&ctx&&ctx.state==='running'}
  function tone(f,t,dur,type,g,dest){
    var o=ctx.createOscillator(),v=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.008);v.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(v);v.connect(dest||master);o.start(t);o.stop(t+dur+.05);return o;
  }
  function noise(dur){
    var n=ctx.createBuffer(1,Math.floor(ctx.sampleRate*dur),ctx.sampleRate),d=n.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    var s=ctx.createBufferSource();s.buffer=n;return s;
  }
  var lastHover=0;
  var api={
    hover:function(){if(!ok())return;var now=performance.now();if(now-lastHover<70)return;lastHover=now;
      var t=ctx.currentTime,f=scale[Math.floor(Math.random()*scale.length)]*1.5;tone(f,t,.12,'sine',.045);tone(f*2,t,.06,'triangle',.012)},
    click:function(){if(!ok())return;var t=ctx.currentTime;
      tone(783.99,t,1.1,'sine',.11);tone(1174.66,t+.04,1.3,'sine',.07);tone(1567.98,t+.08,1.0,'sine',.04);tone(3135.96,t+.08,.4,'sine',.012)},
    zap:function(){if(!ok())return;var t=ctx.currentTime,s=noise(.32),bp=ctx.createBiquadFilter(),v=ctx.createGain();
      bp.type='bandpass';bp.Q.value=9;bp.frequency.setValueAtTime(5200,t);bp.frequency.exponentialRampToValueAtTime(380,t+.28);
      v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.32,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+.3);
      s.connect(bp);bp.connect(v);v.connect(master);s.start(t);s.stop(t+.33);
      var o=ctx.createOscillator(),og=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(48,t+.25);
      og.gain.setValueAtTime(.05,t);og.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(og);og.connect(master);o.start(t);o.stop(t+.27)},
    whoosh:function(){if(!ok())return;var t=ctx.currentTime,s=noise(1.2),lp=ctx.createBiquadFilter(),v=ctx.createGain();
      lp.type='lowpass';lp.Q.value=6;lp.frequency.setValueAtTime(200,t);lp.frequency.exponentialRampToValueAtTime(3800,t+.55);lp.frequency.exponentialRampToValueAtTime(300,t+1.1);
      v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.16,t+.4);v.gain.exponentialRampToValueAtTime(.0001,t+1.15);
      s.connect(lp);lp.connect(v);v.connect(master);s.start(t);s.stop(t+1.2)},
    rise:function(){if(!ok())return;var t=ctx.currentTime;[392,523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,t+i*.07,.9,'sine',.05)})},
    startAmb:function(){if(!ok()||amb)return;var t=ctx.currentTime;amb=ctx.createGain();amb.gain.setValueAtTime(.0001,t);amb.gain.exponentialRampToValueAtTime(.05,t+3);
      var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=2;lp.connect(amb);amb.connect(master);
      var lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.07;lg.gain.value=260;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
      [55,82.41,110.4,164.8].forEach(function(f,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type=i%2?'triangle':'sine';o.frequency.value=f;o.detune.value=(i-1.5)*4;g.gain.value=i<2?.5:.18;o.connect(g);g.connect(lp);o.start()});
      amb._lp=lp},
    stopAmb:function(){if(!amb||!ctx)return;var a=amb;amb=null;var t=ctx.currentTime;a.gain.cancelScheduledValues(t);a.gain.setValueAtTime(a.gain.value,t);a.gain.exponentialRampToValueAtTime(.0001,t+.8);setTimeout(function(){try{a.disconnect()}catch(e){}},1000)},
    isOn:function(){return on},
    set:function(v){on=v;store('lm-sound',v?'on':'off');if(v){api.unlock();setTimeout(function(){api.startAmb();api.rise()},60)}else api.stopAmb();paint()},
    unlock:function(){if(!init())return;if(ctx.state!=='running')ctx.resume();if(!unlocked){unlocked=true;setTimeout(function(){if(on){api.startAmb()}},80)}}
  };
  function paint(){$$('.snd').forEach(function(b){b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');var l=$('.lbl',b);if(l)l.textContent=on?'Sound on':'Sound off'})}
  document.addEventListener('DOMContentLoaded',paint);
  ['pointerdown','keydown','touchstart'].forEach(function(ev){window.addEventListener(ev,function first(){api.unlock();window.removeEventListener(ev,first,true)},true)});
  return api;
})();
window.LotusSound=Snd;

/* ================= FIELD: gold particles + lightning ================= */
function field(){
  var c=$('#field');if(!c||reduce)return;var x=c.getContext('2d'),W,H,DPR=Math.min(2,window.devicePixelRatio||1),P=[],mouse={x:-999,y:-999,t:0},arcs=[];
  function size(){W=c.width=innerWidth*DPR;H=c.height=innerHeight*DPR;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';
    var n=Math.round(Math.min(110,innerWidth*innerHeight/14000));P=[];for(var i=0;i<n;i++)P.push(mk(true))}
  function mk(any){return{x:Math.random()*W,y:any?Math.random()*H:H+10,r:(Math.random()*1.6+.4)*DPR,vx:(Math.random()-.5)*.18*DPR,vy:-(Math.random()*.35+.08)*DPR,a:Math.random()*.6+.2,tw:Math.random()*6.28}}
  size();addEventListener('resize',size);
  addEventListener('pointermove',function(e){mouse.x=e.clientX*DPR;mouse.y=e.clientY*DPR;mouse.t=performance.now()},{passive:true});
  function bolt(x1,y1,x2,y2,life){var pts=[[x1,y1]],segs=10;for(var i=1;i<segs;i++){var t=i/segs,j=(1-Math.abs(.5-t)*2)*28*DPR;pts.push([x1+(x2-x1)*t+(Math.random()-.5)*j,y1+(y2-y1)*t+(Math.random()-.5)*j])}pts.push([x2,y2]);arcs.push({p:pts,life:life||1})}
  window.LotusBolt=function(cx,cy,n){cx*=DPR;cy*=DPR;for(var k=0;k<(n||5);k++){var q=P[Math.floor(Math.random()*P.length)];if(q)bolt(cx,cy,q.x,q.y,1)}};
  var lastArc=0;
  (function loop(now){
    x.clearRect(0,0,W,H);
    var near=now-mouse.t<1600;
    for(var i=0;i<P.length;i++){var p=P[i];p.x+=p.vx;p.y+=p.vy;p.tw+=.03;
      if(near){var dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy);if(d<160*DPR){p.x+=dx/d*.8;p.y+=dy/d*.8}}
      if(p.y<-10||p.x<-10||p.x>W+10)P[i]=mk(false);
      var al=p.a*(.6+.4*Math.sin(p.tw));x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fillStyle='rgba(243,222,156,'+al+')';x.shadowColor='rgba(213,184,99,.9)';x.shadowBlur=8*DPR;x.fill()}
    x.shadowBlur=0;
    for(var a=0;a<P.length;a++){for(var b=a+1;b<P.length;b++){var dx2=P[a].x-P[b].x,dy2=P[a].y-P[b].y,dd=dx2*dx2+dy2*dy2,lim=(110*DPR)*(110*DPR);if(dd<lim){x.strokeStyle='rgba(213,184,99,'+(.13*(1-dd/lim))+')';x.lineWidth=DPR*.7;x.beginPath();x.moveTo(P[a].x,P[a].y);x.lineTo(P[b].x,P[b].y);x.stroke()}}}
    if(near&&now-lastArc>900){lastArc=now;var best=null,bd=1e9;P.forEach(function(q){var d=Math.hypot(q.x-mouse.x,q.y-mouse.y);if(d<bd&&d>40*DPR){bd=d;best=q}});if(best&&bd<260*DPR)bolt(mouse.x,mouse.y,best.x,best.y,.8)}
    for(var k=arcs.length-1;k>=0;k--){var A=arcs[k];A.life-=.05;if(A.life<=0){arcs.splice(k,1);continue}
      x.beginPath();A.p.forEach(function(pt,ix){ix?x.lineTo(pt[0],pt[1]):x.moveTo(pt[0],pt[1])});
      x.strokeStyle='rgba(255,246,216,'+A.life+')';x.lineWidth=1.4*DPR;x.shadowColor='rgba(213,184,99,1)';x.shadowBlur=18*DPR;x.stroke();x.shadowBlur=0}
    requestAnimationFrame(loop)})(0);
}

/* ================= UI ================= */
function ui(){
  var nav=$('.nav');
  function onScroll(){if(nav)nav.classList.toggle('solid',scrollY>30)}
  onScroll();addEventListener('scroll',onScroll,{passive:true});
  var bg=$('.burger');if(bg)bg.addEventListener('click',function(){nav.classList.toggle('open');bg.setAttribute('aria-expanded',nav.classList.contains('open'));Snd.click()});
  $$('.dd>button').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var d=b.parentNode;d.classList.toggle('open');b.setAttribute('aria-expanded',d.classList.contains('open'))})});
  document.addEventListener('click',function(e){$$('.dd.open').forEach(function(d){if(!d.contains(e.target)&&innerWidth>860)d.classList.remove('open')})});
  $$('.snd').forEach(function(b){b.addEventListener('click',function(){Snd.set(!Snd.isOn())})});

  /* split words */
  $$('.split').forEach(function(el){var html=el.innerHTML.trim().split(/(<[^>]+>|\s+)/).filter(Boolean),out='',i=0;
    html.forEach(function(tok){if(/^\s+$/.test(tok)){out+=' ';return}if(tok.charAt(0)==='<'){out+=tok;return}out+='<span class="w"><span style="transition-delay:'+(i++*0.07)+'s">'+tok+'</span></span>'});el.innerHTML=out});

  /* reveals */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);if(e.target.hasAttribute('data-count'))count(e.target)}})},{threshold:.18,rootMargin:'0px 0px -6% 0px'});
  $$('.rv,.split,.timeline,[data-count]').forEach(function(el){io.observe(el)});

  /* hover + click sounds */
  $$('a,button,.pcard,.hot,.gallery figure').forEach(function(el){el.addEventListener('pointerenter',function(){Snd.hover()})});
  document.addEventListener('click',function(e){var a=e.target.closest('a,button');if(!a||a.classList.contains('snd'))return;Snd.click();
    if(window.LotusBolt&&a.matches('.btn,.pcard'))LotusBolt(e.clientX,e.clientY,6)});

  /* magnetic light on buttons */
  $$('.btn').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--x',(e.clientX-r.left)+'px');b.style.setProperty('--y',(e.clientY-r.top)+'px')})});

  /* tilt cards */
  if(!reduce)$$('.pcard').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    c.style.setProperty('--ry',((px-.5)*9)+'deg');c.style.setProperty('--rx',((.5-py)*9)+'deg');c.style.setProperty('--mx',px*100+'%');c.style.setProperty('--my',py*100+'%')});
    c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')})});

  /* cursor glow */
  var cur=$('.cursor'),tmo;if(cur&&!reduce)addEventListener('pointermove',function(e){cur.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';document.body.classList.add('moving');clearTimeout(tmo);tmo=setTimeout(function(){document.body.classList.remove('moving')},1800)},{passive:true});

  /* orbit parallax */
  var oi=$('.orbit .disc img');if(oi&&!reduce)addEventListener('pointermove',function(e){var dx=(e.clientX/innerWidth-.5),dy=(e.clientY/innerHeight-.5);oi.style.transform='scale(1.06) translate('+(dx*-14)+'px,'+(dy*-14)+'px)'},{passive:true});
  var hb=$('.hero-bg');if(hb&&!reduce)addEventListener('scroll',function(){hb.style.transform='scale(1.08) translateY('+(scrollY*.18)+'px)'},{passive:true});

  /* lightbox */
  var lb=$('.lb');if(lb){var li=$('img',lb),lp=$('p',lb);
    $$('.gallery figure').forEach(function(f){f.setAttribute('tabindex','0');function open(){var im=$('img',f);li.src=im.currentSrc||im.src;li.alt=im.alt;lp.textContent=(f.querySelector('figcaption')||{}).textContent||'';lb.classList.add('on');Snd.whoosh()}
      f.addEventListener('click',open);f.addEventListener('keydown',function(e){if(e.key==='Enter')open()})});
    function close(){lb.classList.remove('on')}$('button',lb).addEventListener('click',close);lb.addEventListener('click',function(e){if(e.target===lb)close()});addEventListener('keydown',function(e){if(e.key==='Escape')close()})}

  /* anatomy */
  var an=$('.anat');if(an){
    $$('.anat .draw').forEach(function(p,i){try{var L=p.getTotalLength();p.style.setProperty('--len',L);p.style.animationDelay=(i*.08)+'s'}catch(e){}});
    var tip=$('.anat-tip'),wrap=$('.anat-wrap');
    $$('.hot',an).forEach(function(h){
      function show(){var r=h.getBoundingClientRect(),w=wrap.getBoundingClientRect();tip.innerHTML='<b>'+h.dataset.name+'</b>'+h.dataset.what;
        var lx=Math.min(Math.max(r.left-w.left-90,0),w.width-210);tip.style.left=lx+'px';tip.style.top=(r.top-w.top-tip.offsetHeight-14)+'px';tip.classList.add('on');Snd.zap();
        if(window.LotusBolt){LotusBolt(r.left+r.width/2,r.top+r.height/2,3)}}
      h.addEventListener('pointerenter',show);h.addEventListener('focus',show);
      h.addEventListener('pointerleave',function(){tip.classList.remove('on')});h.addEventListener('blur',function(){tip.classList.remove('on')});
      h.addEventListener('click',function(){location.href=h.dataset.href});h.addEventListener('keydown',function(e){if(e.key==='Enter')location.href=h.dataset.href})});
  }

  /* intro */
  var intro=$('.intro');if(intro){var seen=false;try{seen=sessionStorage.getItem('lm-intro')}catch(e){}
    if(seen||reduce){intro.classList.add('done')}else{setTimeout(function(){intro.classList.add('done');try{sessionStorage.setItem('lm-intro','1')}catch(e){}},1700)}}
  setTimeout(function(){Snd.whoosh()},300);
}

function count(el){var end=parseFloat(el.dataset.count),dec=(el.dataset.count.split('.')[1]||'').length,dur=1800,t0=performance.now(),pre=el.dataset.pre||'',suf=el.dataset.suf||'';
  if(reduce){el.textContent=pre+end.toFixed(dec)+suf;return}
  (function step(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=pre+(end*e).toFixed(dec)+suf;if(k<1)requestAnimationFrame(step)})(t0)}

document.addEventListener('DOMContentLoaded',function(){ui();field()});
})();
