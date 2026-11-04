# Builds the passcode-locked live page for John's Lotus Control Center.
# usage: python3 john_live_encrypt.py "John's Lotus Control Center.html" OUT_index.html PASSCODE
# The page content is gzip-compressed and AES-256-GCM encrypted (key from PBKDF2-SHA256, 600k rounds).
# Only someone with the passcode can open it. The browser decrypts it locally.
import sys, os, gzip, base64, json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

SRC, OUT, PW = sys.argv[1], sys.argv[2], sys.argv[3]
ITER = 600000
raw = open(SRC, 'rb').read()
salt, iv = os.urandom(16), os.urandom(12)
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(PW.encode())
ct = AESGCM(key).encrypt(iv, gzip.compress(raw, 9), None)
P = json.dumps({'s': base64.b64encode(salt).decode(), 'i': base64.b64encode(iv).decode(), 'n': ITER, 'c': base64.b64encode(ct).decode()})

PAGE = r'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>John’s Lotus Control Center</title>
<style>
html,body{margin:0;height:100%;background:#000;color:#fff;font:16px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif}
.g{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
.c{width:min(420px,100%);border:1px solid #D5B863;border-radius:16px;padding:32px 28px;background:#0B0905;box-shadow:0 20px 60px rgba(213,184,99,.12)}
.t{color:#D5B863;font-weight:800;letter-spacing:.22em;text-transform:uppercase;font-size:13px}
h1{font-size:26px;margin:8px 0 6px;letter-spacing:.02em}
p{color:#bbb;margin:0 0 18px;font-size:15px}
input{width:100%;box-sizing:border-box;font:18px -apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding:14px 16px;border-radius:10px;border:1px solid #555;background:#000;color:#fff;outline:none}
input:focus{border-color:#D5B863}
label.r{display:flex;gap:10px;align-items:center;margin:14px 0 18px;color:#ccc;font-size:14px}
label.r input{width:18px;height:18px;accent-color:#D5B863}
button{width:100%;font:700 17px -apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding:14px;border:0;border-radius:10px;background:#D5B863;color:#000;cursor:pointer}
button:disabled{opacity:.6}
.e{color:#ff8a7a;font-size:14px;min-height:20px;margin-top:12px}
.f{color:#D5B863;font-size:12px;letter-spacing:.08em;text-align:center;margin-top:22px}
</style></head><body>
<div class="g"><form class="c" id="f" autocomplete="on">
<div class="t">Lotus Medical</div>
<h1>John’s Control Center</h1>
<p>Type your passcode and press Open.</p>
<input id="pw" type="password" autocomplete="current-password" placeholder="Passcode" aria-label="Passcode" required>
<label class="r"><input type="checkbox" id="rm" checked> Remember me on this device</label>
<button id="go" type="submit">Open</button>
<div class="e" id="er" role="alert"></div>
<div class="f">Integrity First. Patient First. Always.</div>
</form></div>
<script>
var P=__P__;
var RK='lcc-john-live-pw';
function b(s){var x=atob(s),u=new Uint8Array(x.length);for(var i=0;i<x.length;i++)u[i]=x.charCodeAt(i);return u}
async function open_(pw){
  var km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  var k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b(P.s),iterations:P.n,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  var z=await crypto.subtle.decrypt({name:'AES-GCM',iv:b(P.i)},k,b(P.c));
  var html=await new Response(new Blob([z]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  document.open();document.write(html);document.close();
}
var f=document.getElementById('f'),pw=document.getElementById('pw'),rm=document.getElementById('rm'),go=document.getElementById('go'),er=document.getElementById('er');
async function tryOpen(v,saved){
  go.disabled=true;go.textContent='Opening…';er.textContent='';
  try{await open_(v);if(!saved){try{rm.checked?localStorage.setItem(RK,v):localStorage.removeItem(RK)}catch(e){}}}
  catch(e){go.disabled=false;go.textContent='Open';
    if(saved){try{localStorage.removeItem(RK)}catch(x){}return}
    er.textContent=(window.DecompressionStream&&window.crypto&&crypto.subtle)?'That passcode did not work. Check it and try again.':'This browser is too old. Open the link in Chrome, Edge or Safari.';pw.select()}
}
f.addEventListener('submit',function(e){e.preventDefault();var v=pw.value.trim();if(v)tryOpen(v,false)});
try{var s=localStorage.getItem(RK);if(s)tryOpen(s,true);else pw.focus()}catch(e){pw.focus()}
</script></body></html>'''
open(OUT, 'w', encoding='utf-8').write(PAGE.replace('__P__', P))
print('ok', len(raw), '->', os.path.getsize(OUT))
