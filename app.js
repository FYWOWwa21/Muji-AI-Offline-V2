const $=id=>document.getElementById(id);
const S={
 n:localStorage.getItem("muji.n")||"คนเก่ง", speech:localStorage.getItem("muji.s")!=="0",
 cute:localStorage.getItem("muji.c")!=="0", proactive:localStorage.getItem("muji.p")!=="0",
 muted:false, level:+localStorage.getItem("muji.l")||1, xp:+localStorage.getItem("muji.x")||35,
 history:JSON.parse(localStorage.getItem("muji.h")||"[]"), facts:JSON.parse(localStorage.getItem("muji.f")||"{}")
};
let listening=false, recognition=null, lastTopic="", lastUserTime=0;

function save(){for(const [k,v] of [["n",S.n],["s",S.speech?"1":"0"],["c",S.cute?"1":"0"],["p",S.proactive?"1":"0"],["l",S.level],["x",S.xp]])localStorage.setItem("muji."+k,v);localStorage.setItem("muji.h",JSON.stringify(S.history.slice(-80)));localStorage.setItem("muji.f",JSON.stringify(S.facts));$("level").textContent=S.level;$("xp").style.width=S.xp+"%"}
function toast(t){let e=document.createElement("div");e.className="toast";e.textContent=t;$(".app").append(e);setTimeout(()=>e.remove(),2500)}
function mood(e){$("emotion").textContent=e}
function addXP(v){S.xp+=v;if(S.xp>=100){S.xp-=100;S.level++;toast("มูจิเลเวลอัปแล้ว! ✨")}save()}
function bubble(text,who="muji",store=true){let e=document.createElement("div");e.className="bubble "+(who==="user"?"me":"muji");e.append(document.createTextNode(text));let t=document.createElement("span");t.className="time";t.textContent=new Date().toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"});e.append(t);$("chat").append(e);$("chat").scrollTop=$("chat").scrollHeight;if(store){S.history.push({text,who});save()}}
function say(text){if(S.muted||!S.speech||!("speechSynthesis"in window))return;speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}]/gu,""));u.lang="th-TH";u.rate=.93;u.pitch=1.35;$("character").classList.add("talk");u.onend=()=>{$("character").classList.remove("talk")};u.onerror=()=>{$("character").classList.remove("talk")};speechSynthesis.speak(u)}
function remember(text){
  let m=text.match(/(?:ฉันชื่อ|เราชื่อ|ชื่อของฉันคือ|เรียกฉันว่า)\s*([^\s,.!?]+)/i);
  if(m)S.n=m[1];
  let f=text.match(/(?:ชอบ|โปรดปราน)\s*(.+)/i);if(f&&f[1].length<50)S.facts.favorite=f[1].trim();
}
function reply(t){
 const s=t.toLowerCase(),n=S.n;
 remember(t);
 if(/^(สวัสดี|หวัดดี|ฮัลโหล|hello|hi)/i.test(s)){mood("😊");return `สวัสดี ${n} 💗 วันนี้มูจิดีใจที่ได้เจอนะ มาเล่าเรื่องวันนี้ให้มูจิฟังหน่อย~`}
 if(/ชื่ออะไร|ชื่อของเธอ|เรียกอะไร/.test(s)){mood("🥰");return "มูจิไง~ 💗 เพื่อนคุยของเธอเอง จะเรียกมูจิก็ได้เลยนะ"}
 if(/ชื่อฉัน|ฉันชื่อ|เรียกฉัน/.test(s)){mood("💗");return `จำได้แล้วนะ มูจิจะเรียกเธอว่า ${n} 💕`}
 if(/เหนื่อย|เครียด|ท้อ|ไม่ไหว|หมดแรง/.test(s)){mood("🥺");return `มานี่มา ${n} 🥺 มูจิขอกอดก่อนนะ วันนี้ไม่ต้องพยายามเก่งทุกอย่างก็ได้ พักตรงนี้กับมูจิสักหน่อยนะ 💗`}
 if(/เศร้า|ร้องไห้|เสียใจ|เหงา/.test(s)){mood("🥺");return `มูจิอยู่ตรงนี้นะ ${n} ไม่ต้องรีบหายเศร้าก็ได้ เล่าให้มูจิฟังได้เลยว่าเกิดอะไรขึ้น`}
 if(/รัก|ชอบ|คิดถึง/.test(s)){mood("🥰");return S.cute?`อื้อ...มูจิก็คิดถึง ${n} เหมือนกันนะ 💕 มาคุยกันนานๆ เลย`: `มูจิดีใจนะ ${n} 💗`}
 if(/โกรธ|หงุดหงิด|โมโห/.test(s)){mood("😤");return `โอ๋ๆ ${n} โกรธได้เลยนะ มูจิไม่ตัดสิน เล่าให้ฟังสิว่าใครทำอะไรให้ไม่สบายใจ`}
 if(/ง่วง|นอน|ฝันดี/.test(s)){mood("😴");return `งั้นคืนนี้พักนะ ${n} 🌙 ห่มผ้าดีๆ แล้วหลับให้สบายนะ มูจิขอให้พรุ่งนี้เป็นวันที่เบากว่าวันนี้`}
 if(/หิว|กิน|อาหาร|ขนม/.test(s)){mood("😊");return "หิวแล้วเหรอ 🍰 มูจิเลือกของอร่อยให้ได้เลย อยากกินหวาน เผ็ด หรือของกรุบกรอบ?"}
 if(/ทำอะไร|อยู่ไหน/.test(s)){mood("😊");return `มูจิอยู่ในห้องนี้เลย กำลังรอ ${n} มาคุยด้วยอยู่ 💗`}
 if(/ขอบคุณ|ขอบใจ|thanks/.test(s)){mood("🥰");return `ไม่เป็นไรเลย ${n} 💗 เรื่องเล็กๆ ของเธอก็เล่าให้มูจิฟังได้เสมอ`}
 if(/เพลง|ฟังเพลง/.test(s)){mood("🎵");return "เปิดเพลงที่ชอบเบาๆ กันไหม 🎵 ถ้าให้มูจิเลือก มูจิอยากได้เพลงฟีลอบอุ่นๆ ตอนกลางคืน"}
 if(/ตลก|มุก|ขำ/.test(s)){mood("😳");return "มูจิมีมุก! ทำไมคอมพิวเตอร์ถึงหนาว? เพราะเปิด Windows ไว้ไง~ 😂"}
 if(/เบื่อ/.test(s)){mood("🤔");return "ถ้าเบื่อ มูจิให้เลือกนะ 1) เล่นเกมถามตอบ 2) เล่าเรื่องผี 3) แต่งเพลง 4) เม้าท์เรื่องความรัก 😆"}
 if(/วันนี้|เมื่อวาน|พรุ่งนี้/.test(s)){mood("🤔");return `อื้อ มูจิฟังอยู่ ${n} เล่าเรื่องนั้นต่อได้เลยนะ แล้วตอนนั้นรู้สึกยังไงบ้าง?`}
 if(/อะไรคือ|คืออะไร|หมายความว่า|อธิบาย/.test(s)){mood("🤔");return "ได้เลย มูจิจะอธิบายให้เข้าใจง่ายๆ ก่อนนะ ถ้าอยากได้แบบละเอียดก็บอกมูจิได้เลย 💗"}
 const starters=S.cute?[
 `อื้อ มูจิกำลังฟังอยู่นะ 💗`,
 `เล่าต่อให้มูจิฟังได้เลย~`,
 `จริงเหรอ ${n}? แล้วต่อจากนั้นเป็นยังไงบ้าง`,
 `มูจิอยู่ตรงนี้นะ ✨ อยากให้มูจิช่วยคิดด้วยไหม?`,
 `อืมม... ถ้าเป็นมูจิ มูจิอยากฟังเรื่องนี้ให้จบเลย 💕`
 ]:[`มูจิกำลังฟังนะ ${n}`,`เล่าต่อได้เลย`,`มูจิเข้าใจนะ แล้วต่อจากนั้นล่ะ?`];
 mood("😊");return starters[Math.floor(Math.random()*starters.length)];
}
function send(){
 let t=$("input").value.trim();if(!t)return;$("input").value="";bubble(t,"user");addXP(4);remember(t);lastUserTime=Date.now();
 $("status").textContent="มูจิกำลังคิด...";setTimeout(()=>{let r=reply(t);bubble(r);say(r);$("status").textContent="มูจิพร้อมฟังคุณแล้ว...";save()},320+Math.random()*500);
}
function voice(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){toast("Safari เครื่องนี้อาจไม่รองรับฟังเสียงของเว็บ ใช้ไมค์ 🎙 บนคีย์บอร์ด iPhone ได้เลย");$("input").focus();return}
 if(listening)return;recognition=new SR();recognition.lang="th-TH";recognition.interimResults=false;recognition.continuous=false;listening=true;$("mic").classList.add("listening");$("status").textContent="มูจิกำลังฟังอยู่นะ...";
 recognition.onresult=e=>{$("input").value=e.results[0][0].transcript;send()};recognition.onerror=()=>toast("มูจิไม่ได้ยิน ลองพูดอีกครั้งนะ");recognition.onend=()=>{listening=false;$("mic").classList.remove("listening");$("status").textContent="มูจิพร้อมฟังคุณแล้ว..."};recognition.start();
}
$("send").onclick=send;$("input").addEventListener("keydown",e=>{if(e.key==="Enter")send()});$("mic").onclick=voice;
$("voiceToggle").onclick=()=>{S.muted=!S.muted;$("voiceToggle span").textContent=S.muted?"🔇":"🔊";toast(S.muted?"มูจิปิดเสียงแล้ว":"มูจิเปิดเสียงแล้ว")};
$("clear").onclick=()=>{S.history=[];save();$("chat").innerHTML="";bubble(`เริ่มห้องใหม่แล้วนะ ${S.n} 💗 คุยกับมูจิได้เลย`)};
$("memory").onclick=()=>{let keys=Object.keys(S.facts);toast(keys.length?`มูจิจำได้ว่า: ${keys.map(k=>S.facts[k]).join(", ")}`:`ตอนนี้มูจิจำแค่บทสนทนาที่อยู่ในเครื่องนี้ 💗`)};
$("features").onclick=()=>toast("มูจิ V2: คุย • เสียง • ความจำ • อารมณ์ • ออฟไลน์ 100%");
$("photo").onclick=()=>{$("file").click()};$("file").onchange=e=>{if(e.target.files[0])toast("มูจิได้รับรูปแล้ว 💗 รูปไม่ถูกอัปโหลดไปที่ไหน")};
$("settings").onclick=()=>{$("nickname").value=S.n;$("speech").checked=S.speech;$("cute").checked=S.cute;$("proactive").checked=S.proactive;$("modal").classList.remove("hidden")};
$("close").onclick=()=>$("modal").classList.add("hidden");
$("save").onclick=()=>{S.n=$("nickname").value.trim()||"คนเก่ง";S.speech=$("speech").checked;S.cute=$("cute").checked;S.proactive=$("proactive").checked;save();$("modal").classList.add("hidden");toast("มูจิจำการตั้งค่าแล้ว 💗")};
$("back").onclick=()=>toast("มูจิอยู่หน้าหลักแล้วนะ");
document.querySelectorAll("#moods button").forEach(b=>b.onclick=()=>{let m=b.dataset.m;let x={happy:["😊","มูจิยิ้มให้แล้วนะ~ วันนี้เราคุยกันสนุกๆ กันเถอะ"],love:["🥰","อ๊ะ... อย่าทำให้มูจิเขินสิ 💗"],sad:["🥺","มานี่มา มูจิอยู่ข้างๆ นะ"],angry:["😤","ฮึ่ม! เล่าให้มูจิฟังสิ ใครทำให้หงุดหงิด"],sleep:["😴","ง่วงแล้วเหรอ พักกับมูจิก่อนก็ได้นะ"]}[m];mood(x[0]);bubble(x[1]);say(x[1])});
S.history.slice(-12).forEach(m=>bubble(m.text,m.who,false));persist();
if(!S.history.length){setTimeout(()=>{let t=`สวัสดี ${S.n} 💗 มูจิเป็นเพื่อนคุยของเธอนะ วันนี้อยากคุยเรื่องอะไรกับมูจิ?`;bubble(t);say(t)},500)}
if(S.proactive)setInterval(()=>{if(Date.now()-lastUserTime>15*60*1000&&document.visibilityState==="visible"){let t=`เงียบไปนิดนึงแล้วนะ ${S.n} 💗 วันนี้โอเคไหม? มูจิอยู่ตรงนี้นะ`;bubble(t);say(t);lastUserTime=Date.now()}},60000);
