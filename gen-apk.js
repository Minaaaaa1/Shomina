require('dotenv').config({path:'./server/.env'});
const fs=require('fs');
const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_KEY;
if(!url||!key){console.log('❌ .env ناقص'); process.exit(1);}
let html=fs.readFileSync('index.html','utf8');
// حول الـ fetch لـ supabase مباشر
const standalone=`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Shomina</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
${html.split('<style>')[1].split('</head>')[0] ? '<style>'+html.split('<style>')[1].split('</head>')[0].split('</style>')[0]+'</style>' : ''}
<style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;margin:0;display:flex;justify-content:center;min-height:100vh}.card{background:#141414;padding:24px;border-radius:20px;width:95%;max-width:400px;margin:20px 0;border:1px solid #222}.id-box{background:#1e1e1e;padding:14px;border-radius:12px;text-align:center;font-family:monospace;font-size:20px;color:#22c55e;letter-spacing:2px;border:1px dashed #333}.btn{width:100%;padding:12px;border-radius:12px;border:none;font-weight:bold;cursor:pointer;margin:6px 0}.btn-p{background:#a855f7;color:#fff}.btn-g{background:#222;color:#fff}input{width:100%;padding:12px;border-radius:12px;border:1px solid #333;background:#1a1a1a;color:#fff;box-sizing:border-box;margin:6px 0}.msgs{height:300px;overflow-y:auto;background:#0f0f0f;border-radius:12px;padding:10px;margin:10px 0;border:1px solid #222}.msg{padding:8px 10px;border-radius:10px;margin:6px 0;max-width:80%;font-size:14px}.me{background:#a855f7;margin-left:auto}.other{background:#222}.vibe{display:flex;gap:6px;margin:8px 0;overflow-x:auto}.vibe span{padding:6px 10px;border-radius:20px;background:#222;font-size:12px;cursor:pointer;white-space:nowrap}.vibe span.active{background:#a855f7}.status{color:#22c55e;font-size:13px;text-align:center;margin-top:8px}</style>
</head><body>
<div class="card" id="home"><h1 style="color:#a855f7;text-align:center">👻 Shomina</h1><div style="color:#666;text-align:center;font-size:13px;margin:8px 0 16px">شات مجهول - يختفي بعد 24 ساعة - APK</div><div id="myId" class="id-box">جاري...</div><button class="btn btn-p" onclick="createId()">إنشاء هوية جديدة</button><hr style="border-color:#222;margin:16px 0"><input id="friendId" placeholder="الصق كود صديقك SHO-XXXX"><button class="btn btn-g" onclick="openChat()">فتح الشات</button><div id="status" class="status"></div></div>
<div class="card" id="chat" style="display:none"><h3>شات مع <span id="chatWith"></span></h3><div class="vibe"><span onclick="setVibe(this,'🔥 رايق')">🔥 رايق</span><span onclick="setVibe(this,'💔 متضايق')">💔 متضايق</span><span onclick="setVibe(this,'😂 بهزر')">😂 بهزر</span><span onclick="setVibe(this,'🤫 سر')">🤫 سر</span></div><div id="msgs" class="msgs"></div><input id="msgInput" placeholder="اكتب رسالة شبح..."><button class="btn btn-p" onclick="send()">إرسال 👻</button><button class="btn btn-g" onclick="showHome()">رجوع</button></div>
<script>
const SUPA_URL='${url}';
const SUPA_KEY='${key}';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);
let myData=JSON.parse(localStorage.getItem('myUser')||'null');
let currentFriend=null; let currentVibe='🔥 رايق';
function setVibe(el,v){currentVibe=v; document.querySelectorAll('.vibe span').forEach(s=>s.classList.remove('active')); el.classList.add('active');}
async function createId(){
  const shomina_id='SHO-'+Math.random().toString(36).substring(2,6).toUpperCase();
  const {data,error}=await supa.from('ghost_users').insert({shomina_id}).select().single();
  if(error){document.getElementById('status').innerText=error.message; return;}
  myData=data; localStorage.setItem('myUser',JSON.stringify(data));
  document.getElementById('myId').innerText=data.shomina_id;
}
async function openChat(){
  const code=document.getElementById('friendId').value.trim();
  if(!code) return alert('حط كود صديقك');
  currentFriend=code;
  document.getElementById('chatWith').innerText=code;
  document.getElementById('home').style.display='none';
  document.getElementById('chat').style.display='block';
  loadMsgs(); setInterval(loadMsgs,3000);
}
function showHome(){document.getElementById('chat').style.display='none'; document.getElementById('home').style.display='block';}
async function loadMsgs(){
  if(!myData||!currentFriend) return;
  const since=new Date(Date.now()-24*60*60*1000).toISOString();
  const {data}=await supa.from('ghost_messages').select('*').or(\`and(sender_id.eq.\${myData.shomina_id},receiver_shomina_id.eq.\${currentFriend}),and(sender_id.eq.\${currentFriend},receiver_shomina_id.eq.\${myData.shomina_id})\`).gt('created_at',since).order('created_at',{ascending:true});
  const box=document.getElementById('msgs');
  if(!data||data.length===0){box.innerHTML='<div style="color:#555;text-align:center;margin-top:100px">لا رسائل بعد - ابدأ انت 👻</div>'; return;}
  box.innerHTML=data.map(m=>\`<div class="msg \${m.sender_id===myData.shomina_id?'me':'other'}"><small style="opacity:.6">\${m.vibe||''}</small><br>\${m.content}</div>\`).join('');
  box.scrollTop=box.scrollHeight;
}
async function send(){
  const content=document.getElementById('msgInput').value;
  if(!content) return;
  await supa.from('ghost_messages').insert({sender_id:myData.shomina_id,receiver_shomina_id:currentFriend,content,vibe:currentVibe});
  document.getElementById('msgInput').value=''; loadMsgs();
}
if(myData){document.getElementById('myId').innerText=myData.shomina_id;} else {createId();}
</script></body></html>`;
fs.writeFileSync('Shomina-APK-Final.html', standalone);
console.log('✅ اتعمل Shomina-APK-Final.html جاهز للـ APK - بيكلم Supabase مباشر');
