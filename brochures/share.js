/* Lotus Medical brochure sharing: one panel, every device. */
(function(){
  var BASE='https://sstojetz-art.github.io/lotus-medical/brochures/';
  var INFO={
    '':            ['Lotus Medical surgeon brochures','animated digital brochures for Shark Screw (foot and ankle, scaphoid), Integrity, Mg OsteoCrete, Mg OsteoCrete Protein Matrix, Mg OsteoRod, FibFix, MiniLock and LapiLock'],
    'shark-screw/':['Shark Screw','the Shark Screw Cage for 1st MTP fusion, plus nonunion fixation'],
    'shark-screw-scaphoid/':['Shark Screw Scaphoid','scaphoid non-union revision with the allograft bone screw'],
    'integrity/':  ['Integrity','HA scaffold augmentation for Achilles, peroneal and posterior tibialis repair'],
    'osteocrete/': ['Mg OsteoCrete','the magnesium bone void filler for the foot and ankle that sets like a cement and remodels to bone'],
    'osteorod.html':['Mg OsteoRod','the spacer mold for the intramedullary canal'],
    'osteocrete-opm/':['Mg OsteoCrete Protein Matrix','magnesium and allograft proteins in one graft that sets in place and remodels to bone'],
    'fibfix/':     ['FibFix','the low-profile intramedullary fibula nail: rigid at both ends, flexible in the middle'],
    'minilock/':   ['MiniLock','minimally invasive bunion plating with compression across the osteotomy'],
    'lapilock/':   ['LapiLock','4D Lapidus correction with one jig and one cut']
  };
  var REPS={
    scott:{name:'Scott Stojetz',title:'Owner / Principal',phone:'513-317-6971',email:'scott@lotusmedcompany.com'},
    john:{name:'John Callahan',title:'Vice President, Sales',phone:'330-858-6718',email:'john@lotusmedcompany.com'}
  };
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function keyFor(href){
    var a=document.createElement('a');a.href=href||location.href;
    var p=a.pathname.split('/brochures/')[1]||'';p=p.replace(/index\.html$/,'');return p;
  }
  var ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var android=/Android/i.test(navigator.userAgent);
  var mobile=ios||android;

  var css='#lshare{position:fixed;top:14px;right:16px;z-index:60;background:#D5B863;color:#000;border:0;font:800 15px/1 "Barlow Condensed",Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:11px 16px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.5);display:flex;align-items:center;gap:8px}'+
  '#lshare svg{width:16px;height:16px}'+
  '.lsx{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}'+
  '.lsp{width:100%;max-width:460px;background:#0c0c0c;border:1px solid #D5B863;padding:22px;color:#fff;font:16px/1.4 Barlow,Arial,sans-serif;max-height:92vh;overflow:auto}'+
  '.lsp h3{margin:0 0 2px;font:800 26px/1.1 "Barlow Condensed",Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em}'+
  '.lsp .ls-sub{color:#D5B863;font:600 13px "Barlow Condensed",Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;margin-bottom:16px}'+
  '.lsp label{display:block;font:600 12px "Barlow Condensed",Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#9a9284;margin:12px 0 5px}'+
  '.lsp input{width:100%;box-sizing:border-box;background:#161616;border:1px solid #333;color:#fff;font:17px Barlow,Arial,sans-serif;padding:11px 12px;border-radius:0}'+
  '.lsp input:focus{outline:0;border-color:#D5B863}'+
  '.ls-from{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
  '.ls-from button{background:#161616;border:1px solid #333;color:#ddd;padding:10px;font:700 16px "Barlow Condensed",Arial,sans-serif;letter-spacing:.06em;cursor:pointer}'+
  '.ls-from button.on{background:#D5B863;border-color:#D5B863;color:#000}'+
  '.ls-acts{display:grid;gap:8px;margin-top:18px}'+
  '.ls-acts button{display:flex;justify-content:space-between;align-items:center;background:#161616;border:1px solid #333;color:#fff;padding:13px 14px;font:800 18px "Barlow Condensed",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;text-align:left}'+
  '.ls-acts button small{font:500 13px Barlow,Arial,sans-serif;letter-spacing:0;text-transform:none;color:#9a9284}'+
  '.ls-acts button.pri{background:#D5B863;border-color:#D5B863;color:#000;flex-direction:column;align-items:flex-start;gap:3px}.ls-acts button.pri small{color:#3a3016}'+
  '@media (max-width:640px){#lshare.lsm{top:auto!important;bottom:16px;left:16px;right:auto!important;height:auto!important;padding:10px 14px!important}}'+
  '.ls-x{float:right;background:none;border:0;color:#9a9284;font-size:28px;line-height:1;cursor:pointer;margin:-6px -4px 0 0}'+
  '.ls-ok{margin-top:10px;color:#D5B863;font:600 14px Barlow,Arial,sans-serif;min-height:1.2em}'+
  '.tile .lst{position:absolute;bottom:12px;right:12px;background:transparent;border:1px solid rgba(213,184,99,.6);color:#D5B863;font:700 13px "Barlow Condensed",Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:6px 10px;cursor:pointer;z-index:2}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6"/></svg>';

  function compose(k){
    var info=INFO[k]||INFO[''],rep=REPS[store('lotus-from')||'scott'];
    var url=BASE+k,dr=(store('lotus-dr')||'').trim();
    var greet=dr?('Dr. '+dr.replace(/^dr\.?\s*/i,'')+','):'Doctor,';
    var subject=info[0]+' | Lotus Medical';
    var body=greet+'\n\nHere is the '+info[0]+' digital brochure: '+info[1]+'.\n\n'+url+
      '\n\nIt plays on a phone, iPad or computer. Tap through the animation to see each step.\n\n'+
      rep.name+'\n'+rep.title+', Lotus Medical\n'+rep.phone+'\n'+rep.email+'\nIntegrity First. Patient First. Always.';
    var text=info[0]+' digital brochure from Lotus Medical: '+url+' — '+rep.name+', '+rep.phone;
    return {info:info,rep:rep,url:url,subject:subject,body:body,text:text};
  }
  function enc(s){return encodeURIComponent(s)}

  function open(k){
    var c=compose(k),from=store('lotus-from')||'scott';
    var x=document.createElement('div');x.className='lsx';
    x.innerHTML='<div class="lsp" role="dialog" aria-label="Share"><button class="ls-x" aria-label="Close">&times;</button>'+
      '<h3>Share '+c.info[0]+'</h3><div class="ls-sub">Lotus Medical digital brochure</div>'+
      '<label>From</label><div class="ls-from"><button data-r="scott">Scott</button><button data-r="john">John</button></div>'+
      '<label>Surgeon email</label><input type="email" id="ls-to" placeholder="name@hospital.org" autocomplete="email" inputmode="email">'+
      '<label>Surgeon last name (optional)</label><input id="ls-dr" placeholder="Smith">'+
      '<div class="ls-acts">'+
        '<button class="pri" data-a="gmail">Email from Lotus Gmail <small id="ls-acct"></small></button>'+
        '<button data-a="text">Text message <small>Messages</small></button>'+
        '<button data-a="copy">Copy link <small>Paste anywhere</small></button>'+
        (navigator.share?'<button data-a="more">More options <small>AirDrop, apps</small></button>':'')+
        '<button data-a="mail">Other email app <small>Default mail</small></button>'+
      '</div><div class="ls-ok" id="ls-ok"></div></div>';
    document.body.appendChild(x);
    var to=x.querySelector('#ls-to'),dr=x.querySelector('#ls-dr'),ok=x.querySelector('#ls-ok');
    dr.value=store('lotus-dr')||'';
    function setFrom(r){from=r;store('lotus-from',r);[].forEach.call(x.querySelectorAll('.ls-from button'),function(b){b.classList.toggle('on',b.getAttribute('data-r')===r)});x.querySelector('#ls-acct').textContent=REPS[r].email}
    setFrom(from);
    x.querySelector('.ls-from').addEventListener('click',function(e){var r=e.target.getAttribute('data-r');if(r)setFrom(r)});
    function close(){x.remove();document.removeEventListener('keydown',esc)}
    function esc(e){if(e.key==='Escape')close()}
    document.addEventListener('keydown',esc);
    x.addEventListener('click',function(e){if(e.target===x||e.target.classList.contains('ls-x'))close()});
    x.querySelector('.ls-acts').addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;var a=b.getAttribute('data-a');
      store('lotus-dr',dr.value);c=compose(k);var t=to.value.trim();
      if(a==='gmail'){
        if(mobile){
          var app=ios?('googlegmail:///co?to='+enc(t)+'&subject='+enc(c.subject)+'&body='+enc(c.body))
                     :('mailto:'+enc(t)+'?subject='+enc(c.subject)+'&body='+enc(c.body));
          var left=false;function h(){left=true}window.addEventListener('pagehide',h);document.addEventListener('visibilitychange',h);
          location.href=app;
          setTimeout(function(){if(!left&&!document.hidden){ok.textContent='Gmail app not found. Opening your mail app instead.';location.href='mailto:'+enc(t)+'?subject='+enc(c.subject)+'&body='+enc(c.body)}},1800);
          ok.textContent='Opening Gmail. Make sure '+c.rep.email+' is the account selected in the From line.';
        } else {
          window.open('https://mail.google.com/mail/?authuser='+enc(c.rep.email)+'&view=cm&fs=1&to='+enc(t)+'&su='+enc(c.subject)+'&body='+enc(c.body),'lotusmail');
          ok.textContent='Gmail opened in a new tab from '+c.rep.email+'.';
        }
      } else if(a==='mail'){
        location.href='mailto:'+enc(t)+'?subject='+enc(c.subject)+'&body='+enc(c.body);
      } else if(a==='text'){
        location.href='sms:'+(ios?'&':'?')+'body='+enc(c.text);
      } else if(a==='copy'){
        var done=function(){ok.textContent='Link copied: '+c.url};
        if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(c.url).then(done,function(){prompt('Copy this link:',c.url)});else prompt('Copy this link:',c.url);
      } else if(a==='more'){
        navigator.share({title:c.subject,text:c.info[0]+' digital brochure from Lotus Medical',url:c.url}).catch(function(){});
      }
    });
    setTimeout(function(){if(!mobile)to.focus()},50);
  }

  function init(){
    var k=keyFor();
    if(document.querySelector('.grid .tile')){
      [].forEach.call(document.querySelectorAll('.grid .tile'),function(t){
        t.style.position='relative';
        var b=document.createElement('button');b.className='lst';b.type='button';b.textContent='Share';
        b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open(keyFor(t.href))});
        t.appendChild(b);
      });
    }
    var b=document.createElement('button');b.id='lshare';b.type='button';b.innerHTML=ICON+'<span>Share</span>';
    b.addEventListener('click',function(){open(k)});
    document.body.appendChild(b);if(document.getElementById('home'))b.classList.add('lsm');
    var home=document.getElementById('home');
    function place(){if(!home||window.innerWidth<=640)return;var r=home.getBoundingClientRect();b.style.top=r.top+'px';b.style.right=(window.innerWidth-r.left+8)+'px';b.style.height=r.height+'px';b.style.padding='0 12px';b.style.fontSize='14px'}
    place();window.addEventListener('resize',place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
