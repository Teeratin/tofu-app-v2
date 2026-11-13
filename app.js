/* เต้าหู้ v2 — ต้นแบบดีไซน์ใหม่ (Cobalt poster) · vanilla JS · localStorage key tofu2.v1 (แยกจากแอปเดิม tofu.v4) */
(function(){
'use strict';
const KEY='tofu2.v1', OLD_KEYS=[], SCHEMA=4, SOON=7; /* SOON: เกณฑ์ «ใกล้ถึง» เดียวทั้งแอป = 7 วัน (วันนี้ถึงอีก 6 วัน) */
const $=s=>document.querySelector(s);
const app=$('#app'), layer=$('#sheetLayer'), dlg=$('#dlgLayer'), toastEl=$('#toast');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const reduceMotion=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- dates (พ.ศ.) ---------- */
const MS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const ML=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const WD=['อา','จ','อ','พ','พฤ','ศ','ส'];
const WDL=['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{if(!s)return null;const[y,m,d]=s.split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const todayIso=()=>iso(today());
const addDays=(n,base)=>{const d=base?parse(base):today();d.setDate(d.getDate()+n);return iso(d)};
const addYears=n=>{const d=today();d.setFullYear(d.getFullYear()+n);return iso(d)};
const MIN_DATE='2000-01-01';
const fmt=s=>{const d=parse(s);return d?`${d.getDate()} ${MS[d.getMonth()]} ${d.getFullYear()+543}`:'—'};
const fmtLong=s=>{const d=parse(s);return d?`${WDL[d.getDay()]}ที่ ${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()+543}`:'—'};
const diff=s=>Math.round((parse(s)-today())/864e5);
const rel=s=>{const n=diff(s);if(n===0)return 'วันนี้';if(n===1)return 'พรุ่งนี้';if(n===-1)return 'เมื่อวาน';return n>0?`อีก ${n} วัน`:`เลยมา ${-n} วัน`};
const timeTxt=t=>t?esc(t)+' น.':'ไม่ระบุเวลา';
const byDT=(a,b)=>(a.date+(a.time||'99:99')).localeCompare(b.date+(b.time||'99:99'));
const in7=s=>{const n=diff(s);return n>=0&&n<SOON};
function fmtBirth(p){if(!p.birth)return 'ไม่ทราบ';const[y,m]=p.birth.split('-').map(Number);
  if(p.birthPrec==='y')return 'ปี '+(y+543)+' (ไม่ทราบวัน)';if(p.birthPrec==='ym')return ML[m-1]+' '+(y+543)+' (ไม่ทราบวัน)';return fmt(p.birth)}
function age(p){if(!p||!p.birth)return '';const t=today();const[y,m,d]=p.birth.split('-').map(Number);
  if(p.birthPrec==='y'){const n=t.getFullYear()-y;return n<1?'ไม่ถึงปี':'ราว '+n+' ปี'}
  let mo=(t.getFullYear()-y)*12+(t.getMonth()+1-m);if(p.birthPrec!=='ym'&&t.getDate()<d)mo--;
  if(mo<1)return 'ไม่ถึงเดือน';const yy=Math.floor(mo/12),r=mo%12;const s=(yy?yy+' ปี':'')+(yy&&r?' ':'')+(r?r+' เดือน':'');return p.birthPrec==='ym'?'ราว '+s:s}

/* ---------- icons ---------- */
const S='stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const I={
 paw:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M8 17.2c0-2.6 1.8-4.6 4-4.6s4 2 4 4.6c0 1.6-1.3 2.4-2.6 2.1-.6-.1-.9-.3-1.4-.3s-.8.2-1.4.3C9.3 19.6 8 18.8 8 17.2z"/><circle cx="6.2" cy="11.2" r="1.7"/><circle cx="9.6" cy="7.4" r="1.8"/><circle cx="14.4" cy="7.4" r="1.8"/><circle cx="17.8" cy="11.2" r="1.7"/></svg>`,
 home:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4 11.2 12 4.5l8 6.7V20H4z"/><path d="M9.5 20v-5.5h5V20"/></svg>`,
 book:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5z"/><path d="M5 18a2 2 0 0 1 2-2h11.5"/><path d="M11.8 7.6v5M9.3 10.1h5"/></svg>`,
 cal:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.8" y="5.2" width="16.4" height="15" rx="3.5"/><path d="M3.8 10h16.4M8.3 3.3v3.4M15.7 3.3v3.4"/></svg>`,
 plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
 back:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.8"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>`,
 chev:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.6"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>`,
 x:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="2.8"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>`,
 edit:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 19.5 5.3 15 15.6 4.7a2.1 2.1 0 0 1 3 3L8.3 18 4.5 19.5z"/><path d="M13.8 6.5l3.5 3.5"/></svg>`,
 trash:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.5h9l1-12.5"/><path d="M10.2 10.5v6M13.8 10.5v6"/></svg>`,
 gear:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 2.8l1.6 2.3 2.8-.4.6 2.7 2.5 1.3-1 2.6 1 2.6-2.5 1.3-.6 2.7-2.8-.4L12 21.2l-1.6-2.3-2.8.4-.6-2.7-2.5-1.3 1-2.6-1-2.6 2.5-1.3.6-2.7 2.8.4z"/><circle cx="12" cy="12" r="3"/></svg>`,
 syringe:`<svg viewBox="0 0 24 24" fill="none" ${S}><g transform="rotate(45 12 12)"><rect x="9" y="6.5" width="6" height="10" rx="1.2"/><path d="M12 16.5v5M8 6.5h8M12 6.5V3M9.5 3h5M9 9.5h3M9 12.5h3"/></g></svg>`,
 steth:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 3.5H4.5v5a4.5 4.5 0 0 0 9 0v-5H12"/><path d="M9 13v1.5a5 5 0 0 0 10 0V12"/><circle cx="19" cy="10" r="2.2"/></svg>`,
 scissors:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="6.5" cy="7" r="2.8"/><circle cx="6.5" cy="17" r="2.8"/><path d="M8.8 8.6 19.5 18M8.8 15.4 19.5 6"/></svg>`,
 clock:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
 cake:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 20.5v-7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7z"/><path d="M4.5 16c1.3 1 2.5 1 3.750 0s2.5-1 3.75 0 2.5 1 3.75 0 2.5-1 3.75 0M12 11.5V8.5"/></svg>`,
 scale:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.5" y="4" width="17" height="16" rx="4"/><path d="M8 9.5a5 5 0 0 1 8 0l-2.6 2.3M12 12l1.5-1.5"/></svg>`,
 check:`<svg viewBox="0 0 24 24" fill="none" ${S} stroke-width="3.2"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
 note:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 3.5h8.5L19 8v12.5H6z"/><path d="M14 3.5V8.5h5M9 13h6.5M9 16.5h4"/></svg>`,
 bell:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>`,
 share:`<svg viewBox="0 0 24 24" fill="none" ${S}><circle cx="8" cy="9" r="3"/><circle cx="16.5" cy="8" r="2.5"/><path d="M3 19.5c.6-3.3 2.6-5.2 5-5.2s4.4 1.9 5 5.2M13.6 14.6c.9-.6 1.8-.9 2.9-.9 2.1 0 3.7 1.6 4.2 4.6"/></svg>`,
 photo:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m4.5 17 5-4.5 3.5 3 2.5-2 4 3.5"/></svg>`,
 copy:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/></svg>`,
 repeat:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4.5 11V9.5a3 3 0 0 1 3-3h11M15.5 3.5l3 3-3 3M19.5 13v1.5a3 3 0 0 1-3 3h-11M8.5 20.5l-3-3 3-3"/></svg>`,
 lock:`<svg viewBox="0 0 24 24" fill="none" ${S}><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>`,
 warn:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M12 4.2 20.5 19H3.5L12 4.2z"/><path d="M12 10v4.5" stroke-width="2.4"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>`,
 funnel:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M4 5.2h16l-6.2 7.5v5.6l-3.6 1.9v-7.5z"/></svg>`,
 list:`<svg viewBox="0 0 24 24" fill="none" ${S}><path d="M9 6.5h10.5M9 12h10.5M9 17.5h10.5"/><circle cx="5" cy="6.5" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="5" cy="17.5" r="1.2"/></svg>`,
};
Object.keys(I).forEach(k=>{I[k]=I[k].replace('<svg ','<svg aria-hidden="true" focusable="false" ')});
const SP={
 dog:{label:'สุนัข',bg:'#F4E9CB',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M11 15c-4 1-6 8-4 13 1.5 2.5 4 1 5-1" fill="#BA905D"/><path d="M37 15c4 1 6 8 4 13-1.5 2.5-4 1-5-1" fill="#BA905D"/><path d="M12 22c0-7 5-11 12-11s12 4 12 11v5c0 7-5 11-12 11s-12-4-12-11z" fill="#E9CFA2"/><circle cx="19" cy="23" r="1.6" fill="#414648"/><circle cx="29" cy="23" r="1.6" fill="#414648"/><path d="M21.5 29.5h5l-2.5 2.5z" fill="#414648"/><path d="M24 32v2.2c-1 1.4-3 1.4-4 0M24 34.2c1 1.4 3 1.4 4 0"/></svg>`},
 cat:{label:'แมว',bg:'#E9ECEA',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M11 21 10 8l9 6M37 21l1-13-9 6" fill="#EFEBE4"/><path d="M10 26c0-8 6-13 14-13s14 5 14 13-6 12-14 12-14-4-14-12z" fill="#EFEBE4"/><path d="M17 24.5q2-2 4 0M27 24.5q2-2 4 0"/><path d="M22.5 28.5h3L24 30z" fill="#E8B9AA"/><path d="M24 30q-1.5 2.5-4 1.5M24 30q1.5 2.5 4 1.5M7 27l7 1M7 31l7-1M41 27l-7 1M41 31l-7-1"/></svg>`},
 rabbit:{label:'กระต่าย',bg:'#F4E3DC',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M14 22c-6-2-8-9-7-12 3-1 8 3 10 9M34 22c6-2 8-9 7-12-3-1-8 3-10 9" fill="#E3C9A6"/><path d="M11 29c0-7 6-11 13-11s13 4 13 11-6 10-13 10-13-3-13-10z" fill="#F3E3CB"/><circle cx="18.5" cy="27" r="1.6" fill="#414648"/><circle cx="29.5" cy="27" r="1.6" fill="#414648"/><path d="M22.5 31h3L24 32.5zM24 32.5v2M22 34.5h4"/></svg>`},
 bird:{label:'นก',bg:'#E7EDE0',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M24 9c-8 0-13 6-13 14 0 9 6 16 13 16s13-7 13-16c0-8-5-14-13-14z" fill="#C9D8BE"/><path d="M14 27c-4 2-5 6-4 8 3 0 6-2 7-5M34 27c4 2 5 6 4 8-3 0-6-2-7-5" fill="#A9BF9E"/><circle cx="19" cy="21" r="1.6" fill="#414648"/><circle cx="29" cy="21" r="1.6" fill="#414648"/><path d="M21 25h6l-3 4z" fill="#E9D3A8"/></svg>`},
 other:{label:'อื่นๆ',bg:'#F4E9CB',svg:`<svg viewBox="0 0 48 48" fill="none" ${S}><path d="M16 33c0-5 3.6-9 8-9s8 4 8 9c0 3-2.5 4.6-5 4.1-1.2-.2-1.8-.6-3-.6s-1.8.4-3 .6c-2.5.5-5-1.1-5-4.1z" fill="#E9CFA2"/><circle cx="12" cy="22.5" r="3.4" fill="#E9CFA2"/><circle cx="19" cy="14.6" r="3.6" fill="#E9CFA2"/><circle cx="29" cy="14.6" r="3.6" fill="#E9CFA2"/><circle cx="36" cy="22.5" r="3.4" fill="#E9CFA2"/></svg>`},
};
Object.values(SP).forEach(s=>{s.svg=s.svg.replace('<svg ','<svg aria-hidden="true" focusable="false" ')});
const SEX={m:'ตัวผู้',f:'ตัวเมีย',u:'ไม่ระบุ'};
const ATYPE={vaccine:{label:'ฉีดวัคซีน',chip:'yellow',ic:'syringe',mk:'vaccine'},checkup:{label:'ตรวจสุขภาพ',chip:'sky',ic:'steth',mk:'checkup'},grooming:{label:'Grooming',chip:'peach',ic:'scissors',mk:'grooming'},other:{label:'อื่นๆ',chip:'mint',ic:'note',mk:'other'}};
const BREEDS={
 cat:['เปอร์เซีย','สก็อตติชโฟลด์','บริติชช็อตแฮร์','อเมริกันช็อตแฮร์','เมนคูน','แร็กดอลล์','เอ็กซ์โซติกช็อตแฮร์','เบงกอล','วิเชียรมาศ','ขาวมณี'],
 dog:['ชิวาวา','ปอมเมอเรเนียน','ชิสุ','พุดเดิ้ล','ไซบีเรียนฮัสกี้','โกลเด้นรีทรีฟเวอร์','ลาบราดอร์รีทรีฟเวอร์','เฟรนช์บูลด็อก','คอร์กี้','บีเกิ้ล'],
};
const BREED_MIX='ไทย/พันธุ์ผสม', BREED_UNK='ไม่ทราบ';
const COLORS={white:{label:'ขาว',hex:'#FBF8F0'},cream:{label:'ครีม',hex:'#E8CF9E'},gold:{label:'ทอง',hex:'#D29A32'},orange:{label:'ส้ม',hex:'#D9733A'},brown:{label:'น้ำตาล',hex:'#7E5233'},gray:{label:'เทา',hex:'#8E918F'},black:{label:'ดำ',hex:'#2E3032'},calico:{label:'สามสี / ลาย',hex:'#D9733A'}};
const COLOR_KEYS=Object.keys(COLORS);
const VACS=[
 {value:'rabies',label:'วัคซีนพิษสุนัขบ้า (Rabies)',species:'all'},
 {value:'dog_5in1',label:'วัคซีนรวมสุนัข 5 โรค (DHPPi)',species:'dog'},
 {value:'dog_6in1',label:'วัคซีนรวมสุนัข 6 โรค (DHPPi+L)',species:'dog'},
 {value:'kennel_cough',label:'วัคซีนหลอดลมอักเสบสุนัข (Kennel Cough)',species:'dog'},
 {value:'cat_3in1',label:'วัคซีนรวมแมว 3 โรค (FVRCP)',species:'cat'},
 {value:'cat_4in1',label:'วัคซีนรวมแมว 4 โรค (FVRCP-C)',species:'cat'},
 {value:'felv',label:'วัคซีนลิวคีเมียแมว (FeLV)',species:'cat'},
 {value:'fiv',label:'วัคซีนเอดส์แมว (FIV)',species:'cat'},
 {value:'fip',label:'วัคซีนเยื่อบุช่องท้องอักเสบแมว (FIP)',species:'cat'},
 {value:'other',label:'อื่นๆ (Other)',species:'all'},
];
const VACMAP=Object.fromEntries(VACS.map(v=>[v.value,v]));
const vacOpts=sp=>VACS.filter(v=>v.species==='all'||v.species===sp);
const IC='';
const NIM={main:IC+'nim-hero.png',hello:IC+'nim-pets.png',writing:IC+'nim-note.png',trash:IC+'nim-alert.png',syringe:IC+'nim-syringe.png',healthbook:IC+'nim-healthbook.png',appointment:IC+'nim-calendar.png',thumbsup:IC+'nim-check.png',sleep:IC+'nim-check.png',badge:IC+'nim-family.png',alert:IC+'nim-alert.png',bell:IC+'nim-bell.png',reminder:IC+'nim-reminder.png',family:IC+'nim-family.png',weight:IC+'nim-weight.png',check:IC+'nim-check.png',note:IC+'nim-note.png',pets:IC+'nim-pets.png',calendar:IC+'nim-calendar.png'};
const PETIMG={cat:IC+'pet-cat.png',dog:IC+'pet-dog.png',rabbit:IC+'pet-rabbit.png'};
const NIM_DESC='ก้อนเต้าหู้ไหมหน้าตาย ใส่หมวกพยาบาลลายอุ้งเท้า มีต้นหอมแปะหัว คอยจดทุกนัดแบบขี้เกียจแต่ชัวร์';

/* ---------- state + migration ---------- */
const genCode=()=>String(Math.floor(100000+Math.random()*900000));
const familyDefault=()=>({code:genCode(),members:[{id:uid(),name:'ฉัน',role:'owner',self:true,pets:[]}]});
function seed(){
  const p1=uid(),p2=uid(),p3=uid();const w=(n,kg)=>({id:uid(),date:addDays(n),kg});
  const V=(petId,type,given,next,name,note)=>({id:uid(),petId,type,name:name||'',given:addDays(given),next:next==null?'':addDays(next),note:note||''});
  const A=(petId,type,title,d,time,place,extra)=>Object.assign({id:uid(),petId,type,title,date:addDays(d),time,place,notes:'',status:'planned',vacKey:''},extra||{});
  return {schema:SCHEMA,onboarded:false,selPet:p1,
    pets:[
      {id:p1,name:'มะลิ',species:'cat',breed:'สก็อตติชโฟลด์',birth:'2023-03-14',birthPrec:'ymd',sex:'f',color:'gray',colorOther:'',look:'ขาวเทา หูพับ ตาสีทอง',notes:'ชอบนอนบนโซฟา ไม่ชอบอาบน้ำ แพ้อาหารทะเลบางชนิด',weights:[w(-180,3.8),w(-95,4.0),w(-12,4.2)]},
      {id:p2,name:'ทองดี',species:'dog',breed:'โกลเด้นรีทรีฟเวอร์',birth:'2021-07',birthPrec:'ym',sex:'m',color:'gold',colorOther:'',look:'สีทองอ่อน ขนยาว',notes:'ชอบว่ายน้ำ ต้องแปรงขนสัปดาห์ละ 3 ครั้ง กินเก่งมาก',weights:[w(-200,29.8),w(-120,30.6),w(-40,31.5)]},
      {id:p3,name:'ปุย',species:'rabbit',breed:'ฮอลแลนด์ลอป',birth:'2024',birthPrec:'y',sex:'f',color:'brown',colorOther:'',look:'น้ำตาลครีม หูตก',notes:'กินหญ้าทิโมธีเป็นหลัก ตกใจง่ายเวลามีเสียงดัง',weights:[w(-60,1.6)]},
    ],
    vaccines:[
      V(p1,'cat_3in1',-715,-350),V(p1,'cat_3in1',-350,15),V(p1,'rabies',-200,165),V(p1,'felv',-400,-10,'','หมอแนะนำให้มาฉีดกระตุ้น'),
      V(p2,'dog_6in1',-30,335),V(p2,'rabies',-370,-5),V(p2,'other',-25,5,'ยาป้องกันพยาธิหนอนหัวใจ','ให้ทุกเดือน'),
      V(p3,'other',-160,205,'วัคซีนโรคเลือดออกในกระต่าย (RHDV2)'),V(p3,'other',-60,28,'ยาหยอดป้องกันเห็บหมัด'),
    ],
    visits:[
      {id:uid(),petId:p1,date:addDays(-45),clinic:'โรงพยาบาลสัตว์ทองหล่อ',reason:'ตรวจสุขภาพประจำปี',notes:'สุขภาพดี น้ำหนักเหมาะสม แนะนำขูดหินปูนปีหน้า'},
      {id:uid(),petId:p1,date:addDays(-120),clinic:'คลินิกรักษ์สัตว์ อารีย์',reason:'ท้องเสีย',notes:'ให้ยาปรับลำไส้ 5 วัน หายดีแล้ว'},
      {id:uid(),petId:p2,date:addDays(-30),clinic:'โรงพยาบาลสัตว์มหาวิทยาลัยเกษตรศาสตร์',reason:'ฉีดวัคซีนรวมและตรวจเลือด',notes:'ค่าเลือดปกติทั้งหมด'},
      {id:uid(),petId:p2,date:addDays(-90),clinic:'คลินิกหมอหมา บางนา',reason:'ขาหลังเจ็บ',notes:'เอกซเรย์ไม่พบกระดูกหัก ให้พักการวิ่ง 2 สัปดาห์'},
      {id:uid(),petId:p3,date:addDays(-60),clinic:'โรงพยาบาลสัตว์เล็กและสัตว์แปลก',reason:'ตัดเล็บและตรวจฟัน',notes:'ฟันหน้ายาวเล็กน้อย นัดตรวจซ้ำ'},
    ],
    appts:[
      A(p2,'vaccine','ฉีดวัคซีนพิษสุนัขบ้า',3,'09:00','คลินิกหมอหมา บางนา',{vacKey:'rabies',notes:'งดอาหารก่อน 2 ชั่วโมง'}),
      A(p1,'grooming','อาบน้ำตัดเล็บ',6,'13:00','ร้านหอมกรุ่น เพ็ทสปา'),
      A(p3,'checkup','ตรวจฟันซ้ำ',8,'14:00','โรงพยาบาลสัตว์เล็กและสัตว์แปลก'),
      A(p2,'grooming','อาบน้ำแปรงขน',6,'15:00','ร้านหอมกรุ่น เพ็ทสปา'),A(p3,'grooming','ตัดเล็บ',6,'16:00','ร้านหอมกรุ่น เพ็ทสปา'),
      A(p1,'vaccine','ฉีดวัคซีนรวมแมว 3 โรค ประจำปี',15,'10:30','โรงพยาบาลสัตว์ทองหล่อ',{vacKey:'cat_3in1',notes:'พาใส่กระเป๋าแมว อย่าให้หนี'}),
      A(p2,'checkup','ตรวจติดตามอาการขาหลัง',20,'16:00','คลินิกหมอหมา บางนา'),
      A(p3,'checkup','ตรวจผิวหนังที่หลัง',-4,'','โรงพยาบาลสัตว์เล็กและสัตว์แปลก'),
      A(p2,'grooming','ตัดขนรับหน้าร้อน',-20,'11:00','ร้านหอมกรุ่น เพ็ทสปา',{status:'done',doneAt:addDays(-20)}),
    ],
    notes:[{id:uid(),petId:p1,text:'ช่วงนี้กินน้ำน้อย ลองเปลี่ยนเป็นน้ำพุแมวดู ถ้าไม่ดีขึ้นจะพาไปหาหมอ',created:addDays(-3),updated:addDays(-3)}],
    reminders:[
      {id:uid(),petId:p2,title:'ป้อนยาแก้อักเสบหลังอาหาร',time:'19:00',start:addDays(-2),end:addDays(4),paused:false},
      {id:uid(),petId:p1,title:'แปรงฟันมะลิ',time:'21:00',start:addDays(-10),end:'',paused:false},
    ],
    family:{code:genCode(),members:[{id:uid(),name:'ฉัน',role:'owner',self:true,pets:[p1,p2,p3]},{id:uid(),name:'แม่',role:'carer',pets:[p1,p2,p3]},{id:uid(),name:'พี่ฝ้าย พี่เลี้ยง',role:'carer',pets:[p2]}]},
  };
}
const COLOR_WORDS=[['สามสี','calico'],['ลาย','calico'],['ขาว','white'],['ครีม','cream'],['ทอง','gold'],['ส้ม','orange'],['น้ำตาล','brown'],['เทา','gray'],['ดำ','black']];
function guessColor(text,used){let best=null,pos=1e9;COLOR_WORDS.forEach(([w,k])=>{const i=text.indexOf(w);if(i>=0&&i<pos){pos=i;best=k}});
  return best||COLOR_KEYS.find(k=>!used.has(k))||COLOR_KEYS[used.size%COLOR_KEYS.length]}
function guessVac(name){const n=String(name||'').toLowerCase();
  if(/พิษสุนัขบ้า|rabies/.test(n))return 'rabies';if(/fvrcp-c|รวมแมว 4/.test(n))return 'cat_4in1';if(/fvrcp|รวมแมว/.test(n))return 'cat_3in1';
  if(/felv|ลิวคีเมีย/.test(n))return 'felv';if(/\bfiv\b|เอดส์แมว/.test(n))return 'fiv';if(/\bfip\b|เยื่อบุช่องท้อง/.test(n))return 'fip';
  if(/kennel|หลอดลม/.test(n))return 'kennel_cough';if(/dhppl|dhppi\+l|6 โรค/.test(n))return 'dog_6in1';if(/dhpp|รวมสุนัข/.test(n))return 'dog_5in1';return 'other'}
/* schema 2 (key tofu.v2, ไม่มีเลขเวอร์ชัน) -> schema 3 */
function migrate2to3(s){
  const used=new Set();
  s.pets=(s.pets||[]).map(p=>{const q=Object.assign({},p);
    q.name=String(p.name||'').trim()||'ไม่มีชื่อ';q.breed=String(p.breed||'').trim();
    q.birth=p.birth||'';q.birthPrec=p.birth?(p.birthPrec||'ymd'):'';
    if(!COLORS[p.color]&&p.color!=='other'){q.look=p.look!=null?p.look:String(p.color||'');q.color=guessColor(String(p.color||''),used);q.colorOther=''}
    used.add(q.color);
    if(!Array.isArray(p.weights)){const kg=parseFloat(String(p.weight||'').replace(',','.'));q.weights=isFinite(kg)&&kg>0&&kg<=150?[{id:uid(),date:todayIso(),kg:Math.round(kg*100)/100}]:[]}
    delete q.weight;q.notes=p.notes||'';q.sex=SEX[p.sex]?p.sex:'u';q.species=SP[p.species]?p.species:'other';return q});
  s.vaccines=(s.vaccines||[]).map(v=>{const type=v.type||guessVac(v.name);return Object.assign({},v,{type,name:type==='other'?(v.name||'ไม่ระบุชื่อ'):'',given:v.given||'',next:v.next||'',note:v.note||''})});
  s.visits=s.visits||[];
  s.appts=(s.appts||[]).map(a=>{const vk=a.type==='vaccine'?(a.vacKey||guessVac(a.title)):'';return Object.assign({},a,{status:a.status||'planned',time:a.time||'',vacKey:vk==='other'?'':vk})});
  s.notes=s.notes||[];s.reminders=s.reminders||[];s.family=s.family||familyDefault();
  delete s.mascot;s.schema=3;return s;
}
/* schema 3 -> 4: สมาชิกครอบครัวมีรายการน้องที่ดูได้ (pets) สมาชิกเดิมได้ทุกตัว */
function migrate3to4(s){const all=(s.pets||[]).map(p=>p.id);s.family=s.family||familyDefault();
  s.family.members=(s.family.members||[]).map(m=>Object.assign({},m,{pets:m.role==='owner'?all.slice():(Array.isArray(m.pets)?m.pets.filter(id=>all.includes(id)):all.slice())}));
  s.schema=4;return s}
function migrate(s){if(!s||!Array.isArray(s.pets))return null;let v=Number(s.schema)||2;
  if(v<3){s=migrate2to3(s);v=3}
  if(v<4){s=migrate3to4(s);v=4}
  s.schema=SCHEMA;['vaccines','visits','appts','notes','reminders'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[]});if(!s.family)s.family=familyDefault();return s}
let migratedFrom=null;
function load(){let s=null;
  try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw)}catch(e){s=null}
  if(!s){for(const k of OLD_KEYS){try{const raw=localStorage.getItem(k);if(raw){s=JSON.parse(raw);migratedFrom=k;break}}catch(e){}}}
  /* ข้อมูลเก่าใน tofu.v3 / tofu.v2 ไม่ถูกลบ เก็บไว้เป็นสำเนาสำรอง */
  return migrate(s)||seed();
}
let st=load();
let saveWarned=0;
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));return true}catch(e){if(Date.now()-saveWarned>4000){saveWarned=Date.now();setTimeout(()=>toast('บันทึกลงเครื่องไม่ได้ พื้นที่เก็บข้อมูลของเบราว์เซอร์อาจเต็ม ข้อมูลรอบนี้จะหายเมื่อปิดหน้า'),0)}return false}}
save();

/* ---------- derived data ---------- */
const pet=id=>st.pets.find(p=>p.id===id);
const vacKeyOf=v=>v.type&&v.type!=='other'?v.type:'other:'+String(v.name||'').trim();
const vacLabelOf=v=>v.type&&v.type!=='other'&&VACMAP[v.type]?VACMAP[v.type].label:(v.name||'ไม่ระบุชื่อ');
const keyLabel=k=>k.startsWith('other:')?k.slice(6):(VACMAP[k]?VACMAP[k].label:k);
function vstatus(v){if(v.next){const n=diff(v.next);if(n<0)return 'over';if(n<SOON)return 'soon';return 'sched'}return v.given?'done':'none'}
const VS={over:'เลยกำหนด',soon:'ใกล้ถึง',sched:'มีนัดครั้งถัดไป',done:'ฉีดแล้ว',none:'ยังไม่ลงวัน'};
const VIC={over:'warn',soon:'clock',sched:'cal',done:'check',none:'note'};
const RANK={over:0,soon:1,sched:2,none:3,done:4};
const statusChip=s=>`<span class="status ${s}">${I[VIC[s]]}${VS[s]}</span>`;
function vacGroups(pid){const g={};st.vaccines.filter(v=>v.petId===pid).forEach(v=>{const k=vacKeyOf(v);(g[k]=g[k]||{key:k,petId:pid,label:vacLabelOf(v),recs:[]}).recs.push(v)});
  return Object.values(g).map(x=>{x.recs.sort((a,b)=>(b.given||'').localeCompare(a.given||''));x.latest=x.recs[0];x.status=vstatus(x.latest);x.next=x.latest.next||'';return x})
    .sort((a,b)=>RANK[a.status]-RANK[b.status]||(a.next||'9').localeCompare(b.next||'9'))}
function vacSummary(pid){const g=vacGroups(pid);const c={over:0,soon:0,sched:0,done:0,none:0};g.forEach(x=>c[x.status]++);return {groups:g,c}}
function vacBadge(pid){const {groups,c}=vacSummary(pid);
  if(!groups.length)return '<span class="chip">ยังไม่มีบันทึกวัคซีน</span>';
  if(c.over)return `<span class="chip peach">${I.warn} วัคซีนเลยกำหนด ${c.over} รายการ</span>`;
  if(c.soon)return `<span class="chip yellow">${I.clock} วัคซีนใกล้ถึงใน 7 วัน ${c.soon} รายการ</span>`;
  if(c.none)return `<span class="chip">${I.note} ยังไม่ลงวันฉีด ${c.none} รายการ</span>`;
  return `<span class="chip mint">${I.check} วัคซีนครบ เก่งมาก</span>`}
const hasPlannedFor=(pid,key)=>st.appts.some(a=>a.petId===pid&&a.type==='vaccine'&&a.status!=='done'&&a.vacKey===key&&diff(a.date)>=0);
function dueItems(){const out=[];st.pets.forEach(p=>vacGroups(p.id).forEach(g=>{if(!g.next)return;
  if(diff(g.next)>=0&&hasPlannedFor(p.id,g.key))return; /* มีนัดในหน้านัดหมายแล้ว ไม่โชว์ซ้ำ */
  out.push({kind:'due',id:'due-'+p.id+'-'+g.key,petId:p.id,type:'vaccine',date:g.next,time:'',title:'ครบกำหนด '+g.label,key:g.key,status:'planned'})}));return out}
const apptItems=()=>st.appts.filter(a=>pet(a.petId)).map(a=>Object.assign({kind:'appt'},a));
const allItems=()=>apptItems().concat(dueItems());
const isOver=it=>it.status!=='done'&&diff(it.date)<0;
const upcoming=pid=>allItems().filter(it=>(!pid||it.petId===pid)&&it.status!=='done'&&diff(it.date)>=0).sort(byDT);
const overdueItems=pid=>allItems().filter(it=>(!pid||it.petId===pid)&&isOver(it)).sort(byDT);
const remEnded=r=>!!r.end&&diff(r.end)<0;
const remOnDay=(r,day)=>!r.paused&&r.start<=day&&(!r.end||day<=r.end);
function remNext(r){if(r.paused||remEnded(r))return null;let d=r.start>todayIso()?r.start:todayIso();
  if(d===todayIso()&&r.time){const n=new Date();const[h,m]=r.time.split(':').map(Number);if(n.getHours()*60+n.getMinutes()>h*60+m)d=addDays(1)}
  if(r.end&&d>r.end)return null;return d}
const latestWeight=p=>{const w=(p.weights||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));return w[w.length-1]||null};


/* ---------- small renderers (ดีไซน์ใหม่: Cobalt poster) ---------- */
const nimImg=(pose,cls,size)=>`<img class="nim ${cls||''}" src="${NIM[pose]||NIM.main}" alt="" aria-hidden="true" width="${size||88}" height="${size||88}" decoding="async">`;
const icoBtn=(icon,label,attrs,cls)=>`<button type="button" class="btn-ico ${cls||''}" aria-label="${label}" ${attrs||''}><img src="${IC}btn-${icon}.png" alt="" aria-hidden="true"></button>`;
const colorOf=p=>COLORS[p.color]||null;
const colorHex=p=>{const c=colorOf(p);return c?c.hex:'#DDC9AC'};
const colorName=p=>p.color==='other'?(p.colorOther||'อื่นๆ'):(colorOf(p)?colorOf(p).label:'ไม่ระบุ');
const dot=(p,cls)=>`<i class="dot ${p.color==='calico'?'calico':''} ${p.color==='other'||!colorOf(p)?'other':''} ${cls||''}" style="background-color:${colorHex(p)}" aria-hidden="true"></i>`;
const pbadge=p=>p?`<span class="pet-chip">${dot(p)}<span class="pb-name">${esc(p.name)}</span></span>`:'';
const faceInner=p=>PETIMG[p.species]?`<img src="${PETIMG[p.species]}" alt="" aria-hidden="true" decoding="async">`:`<span class="letter" style="background:${colorHex(p)}">${esc(String(p.name||'?').slice(0,1))}</span>`;
const face=(p,cls)=>`<span class="face ${cls||''}">${faceInner(p)}</span>`;
const petArt=p=>PETIMG[p.species]||NIM.pets;
const emptyBox=(title,text,btn,mini,pose)=>`<div class="empty ${mini?'mini':''}">${nimImg(pose||'check','',mini?84:120)}<h3>${title}</h3><p>${text}</p>${btn||''}</div>`;
const breedTxt=p=>!p.breed?'':(p.breed===BREED_UNK?'ไม่ทราบพันธุ์':p.breed);
const petMeta=p=>{const s=SP[p.species]||SP.other;return [s.label,breedTxt(p),p.birth?age(p):'ไม่ทราบอายุ'].filter(Boolean).map(esc).join(' · ')};
const shortDate=s=>{const d=parse(s);return d?`${d.getDate()} ${MS[d.getMonth()]}`:'—'};
let toastT,toastUndo=null;
function toast(t,undo){toastEl.innerHTML=`<span class="toast-msg">${esc(t)}</span>${undo?'<button type="button" class="toast-act" data-act="undo">เลิกทำ</button>':''}`;toastUndo=undo||null;
  toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(hideToast,undo?6500:2600);
  document.querySelectorAll('.nim-break,.sheet-head .nim,.empty .nim,.dlg-art .nim').forEach(img=>{img.classList.remove('mascot-react');void img.offsetWidth;img.classList.add('mascot-react')})}
function hideToast(){toastEl.classList.remove('show');toastUndo=null;setTimeout(()=>{if(!toastEl.classList.contains('show'))toastEl.innerHTML=''},350)}
function withUndo(fn,msg){const snap=JSON.stringify(st);fn();save();rerender();toast(msg,()=>{st=JSON.parse(snap);save();rerender();toast('กู้คืนให้แล้ว')})}
function scrollToEl(el,center){if(!el)return;const box=el.closest('.sheet-body,.screen');if(!box)return;const r=el.getBoundingClientRect(),b=box.getBoundingClientRect();
  const top=box.scrollTop+r.top-b.top-(center?(b.height-r.height)/2:8);box.scrollTo({top:Math.max(0,top),behavior:reduceMotion()?'auto':'smooth'})}
function centerChip(el){if(!el)return;const box=el.parentElement;const left=el.offsetLeft-(box.clientWidth-el.offsetWidth)/2;box.scrollTo({left:Math.max(0,left),behavior:reduceMotion()?'auto':'smooth'})}
const go=h=>{if(location.hash===h)route();else location.hash=h};
const NAVS=[['home','#/home','nav-home','หน้าแรก'],['health','#/health','nav-health','สุขภาพ'],['appts','#/appts','nav-appts','นัดหมาย'],['settings','#/settings','nav-settings','ตั้งค่า']];
const nav=tab=>`<nav class="dock" aria-label="เมนูหลัก">${NAVS.map(([k,h,ic,l])=>`<a href="${h}" class="${tab===k?'active':''}" ${tab===k?'aria-current="page"':''}><span class="nav-ico" aria-hidden="true"><img src="${IC}${ic}.png" alt=""></span><span>${l}</span></a>`).join('')}</nav>`;
const statusGap='<div class="status-gap" aria-hidden="true"></div>';
const backBtn=h=>icoBtn('back','ย้อนกลับ',`data-go="${h}"`);
const topActions=(left,right)=>`<div class="top-actions">${left||''}<span class="spacer"></span>${right?`<div class="actions">${right}</div>`:''}</div>`;
const req='<span class="req" aria-hidden="true">*</span>';
const reqNote='<p class="req-note"><span aria-hidden="true">*</span> = ต้องกรอก ที่เหลือไม่บังคับ</p>';
const opt=t=>`<em class="opt">${t||'(ไม่บังคับ)'}</em>`;
const dIn=(n,v,id,o)=>{o=o||{};return `<div class="dpick input date"><span class="dshow ${v?'':'ph'}" aria-hidden="true">${v?fmt(v):'เลือกวันที่'}</span><input class="dnative" id="${id}" type="date" name="${n}" value="${esc(v)}"${o.min?` min="${o.min}"`:''}${o.max?` max="${o.max}"`:''}${o.req?' aria-required="true"':''}></div>`};
const tIn=(n,v,id,o)=>{o=o||{};return `<div class="dpick input time"><span class="dshow ${v?'':'ph'}" aria-hidden="true">${v?esc(v)+' น.':'ไม่ระบุเวลา'}</span><input class="dnative" id="${id}" type="time" name="${n}" value="${esc(v)}"${o.req?' aria-required="true"':''}></div>`};
function syncPick(i){const sp=i.parentElement.querySelector('.dshow');if(!sp)return;sp.classList.toggle('ph',!i.value);sp.textContent=i.value?(i.type==='date'?fmt(i.value):i.value+' น.'):(i.type==='date'?'เลือกวันที่':'ไม่ระบุเวลา')}
document.addEventListener('click',e=>{const i=e.target;if(i.classList&&i.classList.contains('dnative')&&i.showPicker){try{i.showPicker()}catch(_){}}},true);
/* สติกเกอร์หน้าน้อง (หลายตัว = checkbox, ตัวเดียว = radio) */
const petStickers=(name,checked,type,cls)=>`<div class="pets-row on-cream ${cls||''}">${st.pets.map(p=>`<label class="pet-sticker pick"><input class="sr-only" type="${type||'checkbox'}" name="${name}" value="${p.id}" ${checked.includes(p.id)?'checked':''}>${face(p)}<span class="nm">${esc(p.name)}</span></label>`).join('')}</div>`;
function sheetHead(title,lead,pose){return `<div class="sheet-head">${pose?nimImg(pose,'mascot',92):''}<div class="sh-text"><h2 id="sheetTitle">${title}</h2>${lead?`<p>${lead}</p>`:''}</div></div>`}
const vacVerb=label=>/^ยา/.test(String(label||''))?'ให้':'ฉีด';

/* ---------- greeting ---------- */
function greet(){const h=window.__TOFU_HOUR!=null?window.__TOFU_HOUR:new Date().getHours();
  if(h>=5&&h<12)return {k:'ช่วงเช้า',hi:'อรุณสวัสดิ์ ทาสน้อง',q:'ตื่นแล้วก็ไปเติมน้ำให้เจ้านายด้วย'};
  if(h>=12&&h<17)return {k:'ช่วงบ่าย',hi:'บ่ายแล้ว ง่วงยัง?',q:'นิ่มละลายไปครึ่งก้อน แต่นัดยังไม่ละลายนะ'};
  if(h>=17&&h<21)return {k:'ช่วงเย็น',hi:'เย็นแล้ว กลับบ้านยัง?',q:'เจ้านายรอข้าวเย็นอยู่ อย่าทำเนียน'};
  return {k:'ช่วงดึก',hi:'ดึกแล้ว ยังไม่นอนอีก',q:'เช็คนัดพรุ่งนี้ให้เสร็จ แล้วไปนอนซะ'}}

/* ---------- screens ---------- */
function splash(){
  return `<div class="screen scr-splash no-nav"><header class="hero">${statusGap}
    <p class="splash-tag"><span class="stamp">สมุดสุขภาพน้อง ที่คอยแซะไม่ให้คุณลืมนัด</span></p>
    <h1 class="splash-logo">เต้าหู้</h1><p class="sub">สมุดดูแลสัตว์เลี้ยง</p>
    <div class="splash-art">${nimImg('main','splash-nim',230)}<span class="speech">ลงชื่อก่อน เดี๋ยวจดให้</span></div></header>
    <section class="content">
     <article class="tile intro"><span class="tape tape-top">รู้จักน้องนิ่ม</span><p>${NIM_DESC} จดประวัติน้อง สมุดสุขภาพ และนัดวัคซีนไว้ที่นี่ ที่เหลือให้นิ่มจดแทน</p></article>
     <button type="button" class="btn yellow block lg" data-act="enter">ตกลง เริ่มเลย</button>
     <p class="hint">ข้อมูลเก็บในเครื่องนี้ ไม่ต้องสมัครอะไรทั้งนั้น</p></section></div>`;
}
function notifCount(){const T=todayIso();return overdueItems().length+upcoming().filter(it=>diff(it.date)<=1).length+st.reminders.filter(r=>pet(r.petId)&&remNext(r)===T).length}
function homeScreen(){
  const g=greet();const ups=upcoming();const n=ups[0];const n7=ups.filter(it=>in7(it.date)).length;const ov=overdueItems().length;const np=st.pets.length;
  const sp=g.q.indexOf(' ');const q=sp>0?esc(g.q.slice(0,sp))+'<br>'+esc(g.q.slice(sp+1)):esc(g.q);
  const nc=notifCount();
  const next=n?`<button type="button" class="appt" ${n.kind==='due'?`data-act="viewDue" data-pet="${n.petId}" data-key="${esc(n.key)}"`:`data-act="viewAppt" data-id="${n.id}"`}>
      <span class="appt-ico" aria-hidden="true"><img src="${NIM.calendar}" alt=""></span>
      <span class="appt-body"><span class="appt-label">นัดถัดไป</span><span class="h3">${fmt(n.date)}</span><span class="when">${rel(n.date)}${n.time?' · '+esc(n.time)+' น.':''}</span>
      <span class="line">${pbadge(pet(n.petId))}<span class="t">${esc(n.title)}</span></span></span>
      <span class="appt-stat"><b>${n7}</b><span>นัดใน 7 วัน</span></span></button>`
    :`<div class="appt is-empty"><span class="appt-ico" aria-hidden="true"><img src="${NIM.check}" alt=""></span><span class="appt-body"><span class="appt-label">นัดถัดไป</span><span class="h3">ยังไม่มีนัดถัดไป</span><span class="when">ว่างจัด ลองลงนัดวัคซีนหรือตรวจสุขภาพไว้</span></span>
      ${np?`<button type="button" class="btn yellow sm" data-act="addAppt">+ เพิ่มนัด</button>`:''}</div>`;
  const menu=[['pets','โปรไฟล์สัตว์','data-act="petPicker" aria-haspopup="dialog"'],['healthbook','สมุดสุขภาพ','data-go="#/health"'],['reminder','ตั้งแจ้งเตือน','data-go="#/reminders"'],['family','แชร์ให้ครอบครัว','data-go="#/share"']];
  const empty=np?'':`<section class="content">${emptyBox('ว่างเปล่า... เหมือนกล่องเต้าหู้','ยังไม่มีน้องสักตัว เพิ่มมาหน่อยสิ นิ่มเหงา',`<button type="button" class="btn primary" data-go="#/pet/new">+ เพิ่มสัตว์เลี้ยงตัวแรก</button>`,true,'pets')}</section>`;
  return `<div class="screen scr-home"><header class="hero">${statusGap}
    <div class="top"><div class="brand"><h1>เต้าหู้</h1><p>สมุดดูแลสัตว์เลี้ยง</p></div>
      <button class="bell" type="button" data-act="notif" aria-haspopup="dialog" aria-label="การแจ้งเตือนในแอป${nc?` มี ${nc} เรื่อง`:''}"><img src="${NIM.bell}" alt="">${nc?'<span class="bdot" aria-hidden="true"></span>':''}</button></div>
    <div class="bento">
      <article class="tile greet"><span class="stamp time">${g.k}</span><p class="bubble">${esc(g.hi)}</p><h2>${q}</h2><p class="date">${fmtLong(todayIso())}</p>
        ${nimImg('main','nim-break',118)}<span class="tape-deco" aria-hidden="true"></span></article>
      <button class="tile overdue ${ov?'':'calm'}" type="button" data-go="#/overdue" aria-label="${ov?`เลยกำหนด ${ov} รายการ ต้องเคลียร์`:'ไม่มีอะไรเลยกำหนด'}">
        <img src="${ov?NIM.alert:NIM.check}" alt=""><span class="kicker">เลยกำหนด</span><b>${ov}</b><span class="sub">${ov?'รายการ<br>ต้องเคลียร์':'เคลียร์หมด<br>เก่งมาก'}</span></button>
    </div></header>
    <section class="home-next" aria-label="นัดถัดไป">${next}</section>
    <nav class="menu" aria-label="ทางลัด">${menu.map(([ic,l,a])=>`<button type="button" ${a}><img src="${NIM[ic]}" alt=""><span>${l}</span></button>`).join('')}</nav>
    ${empty}
  </div>${nav('home')}`;
}
const prow=(p,attrs)=>`<li><button type="button" class="prow" ${attrs}>${face(p,'sm')}<span class="prow-b"><b>${dot(p)} ${esc(p.name)}</b><span>${petMeta(p)}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;
function petPickerSheet(){
  openSheet(`${sheetHead('ดูโปรไฟล์น้องตัวไหน',st.pets.length?'เลือกน้องที่จะเปิดดูข้อมูล':'ยังไม่มีน้องเลย เพิ่มตัวแรกกัน','pets')}
   <ul class="pick-list" aria-label="รายชื่อสัตว์เลี้ยง">${st.pets.map(p=>prow(p,`data-go="#/pet/${p.id}"`)).join('')}
    <li><button type="button" class="prow add" data-go="#/pet/new"><span class="face sm plus" aria-hidden="true">+</span><span class="prow-b"><b>เพิ่มน้อง</b><span>เพิ่มสัตว์เลี้ยงตัวใหม่</span></span><span class="chev" aria-hidden="true">›</span></button></li></ul>`)}
function petChooseSheet(kind){const K={vac:['บันทึกวัคซีนให้น้องตัวไหน','syringe'],visit:['บันทึกการหาหมอของน้องตัวไหน','healthbook']}[kind];
  openSheet(`${sheetHead(K[0],'เลือกน้องก่อน แล้วค่อยกรอกรายละเอียด',K[1])}
   <ul class="pick-list" aria-label="เลือกสัตว์เลี้ยง">${st.pets.map(p=>prow(p,`data-act="pickFor" data-for="${kind}" data-pet="${p.id}"`)).join('')}</ul>`)}
function notifSheet(){const T=todayIso();const ov=overdueItems().length;const soon=upcoming().filter(it=>diff(it.date)<=1);
  const rems=st.reminders.filter(r=>pet(r.petId)&&remNext(r)===T).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const rows=[];
  if(ov)rows.push(`<li><button type="button" class="nrow over" data-go="#/overdue"><img src="${NIM.alert}" alt=""><span><b>เลยกำหนด ${ov} รายการ</b><span>วัคซีนและนัดที่ยังไม่เคลียร์ แตะเพื่อดู</span></span></button></li>`);
  soon.forEach(it=>rows.push(`<li><button type="button" class="nrow" ${it.kind==='due'?`data-act="viewDue" data-pet="${it.petId}" data-key="${esc(it.key)}"`:`data-act="viewAppt" data-id="${it.id}"`}><img src="${NIM.calendar}" alt=""><span><b>${rel(it.date)} · ${esc(it.title)}</b><span>${pbadge(pet(it.petId))} ${timeTxt(it.time)}</span></span></button></li>`));
  rems.forEach(r=>rows.push(`<li><button type="button" class="nrow" data-go="#/reminders"><img src="${NIM.reminder}" alt=""><span><b>${esc(r.time)} น. · ${esc(r.title)}</b><span>${pbadge(pet(r.petId))} เตือนประจำทุกวัน</span></span></button></li>`));
  openSheet(`${sheetHead('วันนี้นิ่มทวงอะไรบ้าง','เตือนในแอปเท่านั้น ไม่ส่ง LINE หรือแจ้งเตือนมือถือ','bell')}
   ${rows.length?`<ul class="notif-list">${rows.join('')}</ul>`:emptyBox('ไม่มีอะไรต้องทวง','วันนี้ว่าง ไปนอนกลิ้งได้','',true,'check')}
   <button type="button" class="btn ghost block mt16" data-go="#/reminders">ดูเตือนประจำทั้งหมด</button>`)}
function overdueScreen(){
  const items=overdueItems();const vac=items.filter(i=>i.kind==='due'),ap=items.filter(i=>i.kind==='appt');
  const vacCards=vac.map(it=>{const p=pet(it.petId);const booked=st.appts.filter(a=>a.petId===it.petId&&a.vacKey===it.key&&a.status!=='done'&&diff(a.date)>=0).sort(byDT)[0];
    return `<article class="postage od"><span class="rubber pill red">เลยมา ${-diff(it.date)} วัน</span>
      <div class="od-row"><img class="postage-ico" src="${NIM.syringe}" alt=""><div>${pbadge(p)}<h3 class="title">${esc(keyLabel(it.key))}</h3><p class="meta">ครบกำหนดฉีด ${fmt(it.date)}${booked?` · มีนัดแล้ว ${fmt(booked.date)}`:''}</p></div></div>
      <div class="btn-row"><button type="button" class="btn primary" data-act="recordShot" data-pet="${it.petId}" data-key="${esc(it.key)}">ฉีดแล้ว บันทึก</button>
      ${booked?`<button type="button" class="btn ghost" data-go="#/health/${it.petId}?tab=vac">ดูในสมุด</button>`:`<button type="button" class="btn ghost" data-act="bookDue" data-pet="${it.petId}" data-key="${esc(it.key)}">ลงนัด</button>`}</div>
      ${booked?'':`<button type="button" class="btn ghost block mt8" data-go="#/health/${it.petId}?tab=vac">ดูในสมุด</button>`}</article>`}).join('');
  const apCards=ap.map(a=>{const p=pet(a.petId);const t=ATYPE[a.type]||ATYPE.other;const d=parse(a.date);
    return `<article class="ticket over"><span class="ticket-stub" aria-hidden="true"><span class="mo">${MS[d.getMonth()]}</span><span class="nu">${d.getDate()}</span><span class="wd">${WD[d.getDay()]}</span></span>
      <div class="ticket-body"><span class="pill red">เลยมา ${-diff(a.date)} วัน</span><h3 class="title">${esc(a.title)}</h3><span class="sr-only">${fmtLong(a.date)}</span><p class="meta">${pbadge(p)} ${timeTxt(a.time)}</p>
      <div class="chips"><span class="pill ink">${t.label}</span></div>
      <div class="btn-row"><button type="button" class="btn primary" data-act="markDone" data-id="${a.id}">ไปแล้ว</button><button type="button" class="btn ghost" data-act="reschedule" data-id="${a.id}">เลื่อนวัน</button></div>
      <button type="button" class="link mt8" data-act="viewAppt" data-id="${a.id}">ดูรายละเอียด</button></div></article>`}).join('');
  const body=items.length?`
    <div class="section-head"><h2>วัคซีนเลยกำหนด</h2><span class="count">${vac.length}</span></div>${vac.length?vacCards:'<p class="empty-line">ไม่มีวัคซีนเลยกำหนด</p>'}
    <div class="section-head"><h2>นัดที่ผ่านมาแล้ว ยังไม่เช็ค</h2><span class="count">${ap.length}</span></div>${ap.length?apCards:'<p class="empty-line">ไม่มีนัดค้างเช็ค</p>'}`
   :`<div class="tile pad">${emptyBox('ไม่มีอะไรเลยกำหนด','เคลียร์หมดแล้ว นิ่มยอมรับว่าเก่ง (นิดนึง)',`<button type="button" class="btn primary" data-go="#/home">กลับหน้าแรก</button>`,false,'check')}</div>`;
  return `<div class="screen scr-overdue"><header class="hero">${statusGap}${topActions(backBtn('#/home'))}
    <div class="bento"><article class="tile greet"><h2>รายการเลยกำหนด</h2><p class="caption">รวมของน้องทุกตัว: วัคซีนที่เลยวันนัดครั้งถัดไป และนัดที่วันผ่านไปแล้วแต่ยังไม่ได้เช็คว่าไปแล้ว</p>${nimImg(items.length?'alert':'check','nim-break',120)}</article>
      <div class="tile overdue ${items.length?'':'calm'}"><span class="kicker">ต้องเคลียร์</span><b>${items.length}</b><span class="sub">รายการ</span></div></div></header>
    <section class="content">${body}</section>
  </div>${nav('home')}`;
}
function vacPill(pid){const {groups,c}=vacSummary(pid);
  if(!groups.length)return '<span class="pill ink">ยังไม่มีบันทึกวัคซีน</span>';
  if(c.over)return `<span class="pill red"><span class="sr-only">วัคซีน</span>เลยกำหนด${c.over>1?' '+c.over:''}</span>`;
  if(c.soon)return `<span class="pill yellow"><span class="sr-only">วัคซีน</span>ใกล้ถึง${c.soon>1?' '+c.soon:''}</span>`;
  if(c.none)return `<span class="pill ink">ยังไม่ลงวันฉีด ${c.none}</span>`;
  return `<span class="pill cobalt">วัคซีนครบ เก่งมาก</span>`}
function petDetail(id){
  const p=pet(id);if(!p)return notFound();
  st.selPet=id;save();
  const s=SP[p.species]||SP.other;const {groups}=vacSummary(id);const ups=upcoming(id);const visits=st.visits.filter(v=>v.petId===id);const lw=latestWeight(p);const nN=st.notes.filter(n=>n.petId===id).length;
  return `<div class="screen scr-pet"><header class="hero">${statusGap}${topActions(backBtn('#/home'),icoBtn('edit','แก้ไขข้อมูล'+esc(p.name),`data-go="#/pet/${id}/edit"`))}
   <div class="bento"><article class="tile greet pet-card"><span class="tape tape-top">น้อง${esc(p.name)}</span><h2 class="pet-name">${esc(p.name)}</h2>
     <p class="caption strong">${esc(s.label)}${p.breed?' · '+esc(breedTxt(p)):''}</p>
     <div class="chips">${vacPill(id)}<span class="pill ink">${SEX[p.sex]||'ไม่ระบุ'}</span><span class="pill yellow">${dot(p)}สี${esc(colorName(p))}</span></div>
     <img class="nim-break pet-art" src="${petArt(p)}" alt="" aria-hidden="true"></article>
    <button class="tile poster" type="button" data-act="weight" data-pet="${id}" aria-label="น้ำหนัก ${lw?lw.kg+' กิโลกรัม':'ยังไม่มี'} แตะเพื่ออัปเดตและดูกราฟ"><img src="${NIM.weight}" alt=""><b>${lw?lw.kg:'—'}</b><span class="sub">กก. · อัปเดต</span></button></div></header>
   <section class="content">
    <div class="facts"><div><b>${p.birth?age(p):'—'}</b><span>อายุ</span></div><div><b>${groups.length} ชนิด</b><span>วัคซีน</span></div><div><b>${visits.length} ครั้ง</b><span>หาหมอ</span></div></div>
    <div class="icon-row">
     <button type="button" data-go="#/health/${id}?tab=vac"><img src="${NIM.healthbook}" alt=""><b>สมุดสุขภาพ</b><span>วัคซีน ${groups.length} · หาหมอ ${visits.length}</span></button>
     <button type="button" data-go="#/appts?pet=${id}"><img src="${NIM.calendar}" alt=""><b>นัดหมาย</b><span>${ups.length?'ถัดไป '+shortDate(ups[0].date):'ยังไม่มีนัด'}</span></button>
     <button type="button" data-go="#/health/${id}?tab=notes"><img src="${NIM.note}" alt=""><b>โน๊ตเจ้าของ</b><span>${nN?nN+' โน๊ต':'ยังไม่มีโน๊ต'}</span></button>
     <button type="button" data-go="#/share?pet=${id}"><img src="${NIM.family}" alt=""><b>แชร์ครอบครัว</b><span>ตัวอย่าง · ${st.family.members.length} คน</span></button></div>
    <div class="section-head"><h2>นัดที่กำลังจะถึง</h2><button type="button" class="link" data-act="addAppt" data-pet="${id}">เพิ่มนัด</button></div>
    ${ups.length?ups.slice(0,3).map(it=>itemCard(it,{pet:1})).join(''):`<div class="tile pad">${emptyBox('ไม่มีนัดเลย','ว่างขนาดนี้ ไปนอนกลิ้งกันได้','',true)}</div>`}
    <div class="section-head"><h2>ประวัติน้อง</h2></div>
    <dl class="passport"><div class="hist-row"><dt>วันเกิด</dt><dd>${fmtBirth(p)}</dd></div>
     <div class="hist-row"><dt>สีประจำตัว</dt><dd><span class="pet-chip">${dot(p)}${esc(colorName(p))}</span></dd></div>
     <div class="hist-row"><dt>ลักษณะเด่น</dt><dd>${esc(p.look)||'—'}</dd></div>
     <div class="hist-row"><dt>บันทึก</dt><dd>${esc(p.notes)||'—'}</dd></div></dl>
    <button type="button" class="btn soft-danger block" data-act="delPet" data-id="${id}">ลบ${esc(p.name)}ออกจากแอป</button>
   </section></div>${nav('home')}`;
}

/* ---- pet form ---- */
function breedField(species,val){
  const list=BREEDS[species];
  if(!list)return `<div class="field" id="breedField" data-f="breedText"><label class="lbl" for="pet-breed">สายพันธุ์ ${opt()}</label><input class="input" id="pet-breed" name="breedText" value="${esc(val)}" placeholder="เช่น ฮอลแลนด์ลอป, ค็อกคาเทล" maxlength="40"></div>`;
  const preset=[...list,BREED_MIX,BREED_UNK];const isOther=!!val&&!preset.includes(val);const sel=!val?'':(isOther?'__other':val);
  return `<div class="field" id="breedField" data-f="breedOther"><label class="lbl" for="pet-breed">สายพันธุ์${species==='cat'?'แมว':'สุนัข'} ${opt()}</label>
    <select class="input" id="pet-breed" name="breedSel"><option value="" ${sel===''?'selected':''}>— เลือกสายพันธุ์ —</option>
    <optgroup label="ยอดนิยม">${list.map(b=>`<option ${sel===b?'selected':''}>${b}</option>`).join('')}</optgroup>
    <optgroup label="อื่นๆ"><option ${sel===BREED_MIX?'selected':''}>${BREED_MIX}</option><option ${sel===BREED_UNK?'selected':''}>${BREED_UNK}</option><option value="__other" ${sel==='__other'?'selected':''}>อื่นๆ (พิมพ์เอง)</option></optgroup></select>
    <div class="sub-field" ${sel==='__other'?'':'hidden'}><label for="pet-breed-other" class="lbl sm">พิมพ์ชื่อสายพันธุ์ ${req}</label><input class="input" id="pet-breed-other" name="breedOther" value="${isOther?esc(val):''}" placeholder="เช่น ชิบะ อินุ" maxlength="40"></div></div>`;
}
const spIcon=k=>PETIMG[k]?`<img src="${PETIMG[k]}" alt="" aria-hidden="true">`:`<span class="sp-svg" aria-hidden="true">${SP[k].svg}</span>`;
function petForm(id){
  const p=id?pet(id):{name:'',species:'dog',breed:'',birth:'',birthPrec:'',sex:'u',color:'',colorOther:'',look:'',notes:''};
  if(id&&!p)return notFound();
  const bp=p.birthPrec||'';const[by,bm]=(p.birth||'').split('-');const ty=today().getFullYear();
  const years=[];for(let y=ty;y>=ty-30;y--)years.push(y);
  const usedColors=new Set(st.pets.filter(x=>x.id!==id).map(x=>x.color));
  const col=p.color||COLOR_KEYS.find(k=>!usedColors.has(k))||'white';
  const PREC=[['','ไม่ทราบ'],['y','รู้แค่ปี'],['ym','ปีกับเดือน'],['ymd','วันเต็ม']];
  return `<div class="screen scr-form no-nav"><header class="hero">${statusGap}${topActions(backBtn(id?'#/pet/'+id:'#/home'))}
    <article class="tile greet form-art"><span class="tape tape-top">${id?'แก้ไขข้อมูล':'น้องใหม่'}</span><h1 class="h2">${id?'แก้ไขข้อมูลน้อง':'เพิ่มสัตว์เลี้ยง'}</h1><p class="caption">${id?'แก้ตรงไหน บอกมา นิ่มรอจดอยู่':'กรอกเท่าที่รู้ นิ่มจะจำแทน คุณจะได้ลืมได้เต็มที่'}</p>${nimImg('note','nim-break',112)}</article></header>
   <form class="content form" id="petForm" data-id="${id||''}" novalidate>
    ${reqNote}
    <div class="field" data-f="name"><label class="lbl" for="pet-name">ชื่อน้อง ${req}</label><input class="input" id="pet-name" name="name" value="${esc(p.name)}" placeholder="เช่น ข้าวปั้น" maxlength="30" aria-required="true" autocomplete="off"></div>
    <div class="field" role="group" aria-labelledby="species-label"><span class="lbl" id="species-label">ชนิดสัตว์</span><div class="choice species" data-choice="species">${Object.entries(SP).map(([k,s])=>`<button type="button" data-val="${k}" class="chip-type sp ${p.species===k?'on':''}" aria-pressed="${p.species===k?'true':'false'}">${spIcon(k)}<span>${s.label}</span></button>`).join('')}</div></div>
    ${breedField(p.species,p.breed)}
    <div class="field" role="group" aria-labelledby="prec-label" data-f="birth"><span class="lbl" id="prec-label">วันเกิด ${opt('(น้องจรรู้แค่ปีก็ได้)')}</span>
      <div class="choice" data-choice="birthPrec">${PREC.map(([k,l])=>`<button type="button" class="chip-type ${bp===k?'on':''}" data-val="${k}" aria-pressed="${bp===k?'true':'false'}">${l}</button>`).join('')}</div>
      <div class="two mt8" data-birth="y ym" ${bp==='y'||bp==='ym'?'':'hidden'}>
        <div data-f="birthY"><label for="birthY" class="lbl sm">ปี (พ.ศ.) ${req}</label><select class="input" id="birthY" name="birthY"><option value="">— ปี —</option>${years.map(y=>`<option value="${y}" ${String(y)===by&&bp!=='ymd'?'selected':''}>${y+543}</option>`).join('')}</select></div>
        <div data-birth="ym" data-f="birthM" ${bp==='ym'?'':'hidden'}><label for="birthM" class="lbl sm">เดือน ${req}</label><select class="input" id="birthM" name="birthM"><option value="">— เดือน —</option>${ML.map((m,i)=>`<option value="${pad(i+1)}" ${pad(i+1)===bm&&bp==='ym'?'selected':''}>${m}</option>`).join('')}</select></div></div>
      <div class="mt8" data-birth="ymd" data-f="birthD" ${bp==='ymd'?'':'hidden'}><label for="birthD" class="lbl sm">วันเกิด ${req}</label>${dIn('birthD',bp==='ymd'?p.birth:'','birthD',{max:todayIso(),min:'1990-01-01'})}</div></div>
    ${id?'':`<div class="field" data-f="weight"><label class="lbl" for="pet-weight">น้ำหนักตอนนี้ ${opt()}</label><div class="unit"><input class="input" id="pet-weight" name="weight" inputmode="decimal" placeholder="เช่น 4.2" maxlength="6"><span>กก.</span></div><p class="hint-s">หลังจากนี้อัปเดตน้ำหนักได้ที่หน้าข้อมูลน้อง พร้อมดูกราฟ</p></div>`}
    <div class="field" role="group" aria-labelledby="sex-label"><span class="lbl" id="sex-label">เพศ</span><div class="choice" data-choice="sex">${Object.entries(SEX).map(([k,v])=>`<button type="button" class="chip-type ${p.sex===k?'on':''}" data-val="${k}" aria-pressed="${p.sex===k?'true':'false'}">${v}</button>`).join('')}</div></div>
    <fieldset class="field" data-f="colorOther"><legend class="lbl">สีประจำตัว ${opt('(เป็นจุดสีของน้องทั้งแอป)')}</legend>
      <div class="swatches">${COLOR_KEYS.map(k=>`<label class="swopt"><input type="radio" class="sr-only" name="color" value="${k}" ${col===k?'checked':''}><i class="dot big ${k==='calico'?'calico':''}" style="background-color:${COLORS[k].hex}" aria-hidden="true"></i><span>${COLORS[k].label}</span></label>`).join('')}
      <label class="swopt"><input type="radio" class="sr-only" name="color" value="other" ${col==='other'?'checked':''}><i class="dot big other" aria-hidden="true"></i><span>อื่นๆ</span></label></div>
      <div class="sub-field" ${col==='other'?'':'hidden'}><label for="pet-color-other" class="lbl sm">ชื่อสี ${req}</label><input class="input" id="pet-color-other" name="colorOther" value="${esc(p.colorOther)}" placeholder="เช่น ช็อกโกแลต" maxlength="20"></div></fieldset>
    <div class="field"><label class="lbl" for="pet-look">ลักษณะเด่น ${opt()}</label><input class="input" id="pet-look" name="look" value="${esc(p.look)}" placeholder="เช่น ขาวลายส้ม มีจุดที่หู" maxlength="60"></div>
    <div class="field"><label class="lbl" for="pet-notes">บันทึกเพิ่มเติม ${opt()}</label><textarea class="input" id="pet-notes" name="notes" placeholder="แพ้อะไร ชอบอะไร นิสัยแปลกๆ จดไว้เลย" maxlength="300">${esc(p.notes)}</textarea></div>
    <input type="hidden" name="species" value="${p.species}"><input type="hidden" name="sex" value="${p.sex}"><input type="hidden" name="birthPrec" value="${bp}">
    <div class="form-foot"><button type="submit" class="btn yellow block lg">${id?'บันทึกการแก้ไข':'บันทึก เพิ่มน้องเลย'}</button></div>
   </form></div>`;
}

/* ---- health book ---- */
let healthTab='vac';
const photoURLs={}; /* ตัวอย่างเท่านั้น: อยู่ในหน่วยความจำ ไม่บันทึกไฟล์ หายเมื่อรีเฟรช */
const HTABS=[['vac','วัคซีน'],['visit','หาหมอ'],['notes','โน๊ต & รูป']];
const VPILL={over:'red',soon:'yellow',sched:'cobalt',done:'ink',none:'ink'};
function healthScreen(id){
  if(!st.pets.length)return `<div class="screen scr-health"><header class="hero">${statusGap}<div class="hero-copy"><h1>สมุดสุขภาพ</h1></div></header><section class="content">${emptyBox('ยังไม่มีใครให้ดูแล','เพิ่มน้องก่อน แล้วค่อยมาเปิดสมุดนะ',`<button type="button" class="btn primary" data-go="#/pet/new">+ เพิ่มสัตว์เลี้ยง</button>`,false,'healthbook')}</section></div>${nav('health')}`;
  const p=id?pet(id):null;const all=!p;if(p){st.selPet=p.id;save()}
  if(all&&healthTab==='notes')healthTab='vac';
  const tabsList=all?HTABS.filter(t=>t[0]!=='notes'):HTABS;
  const pids=all?st.pets.map(x=>x.id):[p.id];const whose=all?'น้องทุกตัว':esc(p.name);
  const bd=pid=>all?pbadge(pet(pid)):'';
  const stack=st.pets.slice(0,3).map(x=>faceInner(x)).join('');
  const allChip=`<button type="button" role="tab" class="pet-sticker ${all?'on':''}" data-pchip="all" data-go="#/health" aria-selected="${all}" aria-controls="hpanel" tabindex="${all?0:-1}"><span class="face stack">${stack}</span><span class="nm">ทั้งหมด${all?' ✓':''}</span></button>`;
  const chips=`<div class="pets-row switcher" role="tablist" aria-label="เลือกสัตว์เลี้ยงที่จะดูสมุด">${allChip}${st.pets.map(x=>{const on=!all&&x.id===p.id;return `<button type="button" role="tab" class="pet-sticker ${on?'on':''}" data-pchip="${x.id}" data-go="#/health/${x.id}" aria-selected="${on}" aria-controls="hpanel" tabindex="${on?0:-1}">${face(x)}<span class="nm">${esc(x.name)}${on?' ✓':''}</span></button>`}).join('')}</div>`;
  const tabs=`<div class="seg big" role="tablist" aria-label="หมวดในสมุดสุขภาพ">${tabsList.map(([k,l])=>`<button type="button" role="tab" id="htab-${k}" data-htab="${k}" aria-controls="hpanel" aria-selected="${healthTab===k}" tabindex="${healthTab===k?0:-1}" class="${healthTab===k?'on':''}">${l}</button>`).join('')}</div>`;
  const petAttr=all?'':` data-pet="${p.id}"`;
  let panel,tiles='';
  if(healthTab==='vac'){
    const byDue=(a,b)=>{if(a.next&&b.next)return a.next.localeCompare(b.next);if(a.next)return -1;if(b.next)return 1;return (b.latest.given||'').localeCompare(a.latest.given||'')};
    const groups=all?pids.flatMap(x=>vacGroups(x)).sort(byDue):vacGroups(p.id);
    const c={over:0,soon:0};groups.forEach(g=>{if(g.status in c)c[g.status]++});
    const plannedV=st.appts.filter(a=>pids.includes(a.petId)&&a.type==='vaccine'&&a.status!=='done'&&diff(a.date)>=0).sort(byDT);
    tiles=`<div class="bento wide" role="group" aria-label="สถานะวัคซีนของ${whose}">
        <div class="tile poster tilt-l"><span class="kicker">ใกล้ถึง 7 วัน</span><b>${c.soon}</b><span class="sub">${c.soon?'เตรียมพาไปฉีดได้เลย':'ยังไม่มีเข็มที่ใกล้ถึง'}</span></div>
        <div class="tile overdue ${c.over?'':'calm'}"><span class="kicker">เลยกำหนด</span><b>${c.over}</b><span class="sub">${c.over?'รีบนัดฉีดนะ<br>อย่าทำเนียน':'ไม่มี เก่งมาก'}</span></div></div>`;
    panel=`<div class="section-head"><h2>วัคซีนของ${whose}</h2><button type="button" class="link" data-act="addVac"${petAttr}>+ บันทึกเข็ม</button></div>
      ${groups.length?groups.map(g=>{const s=g.status;const lv=g.latest;const vb=vacVerb(g.label);
        const booked=s==='over'?st.appts.filter(a=>a.petId===g.petId&&a.vacKey===g.key&&a.status!=='done'&&diff(a.date)>=0).sort(byDT)[0]:null;
        return `<button type="button" class="postage" data-act="vacGroup" data-pet="${g.petId}" data-key="${esc(g.key)}">
        <span class="rubber pill ${VPILL[s]}">${VS[s]}</span><img class="postage-ico" src="${NIM.syringe}" alt="">${all?`<span class="pc">${bd(g.petId)}</span>`:''}
        <span class="title">${esc(g.label)}</span>
        <span class="meta">${vb}ล่าสุด ${lv.given?fmt(lv.given):'ยังไม่ลง'}</span>
        <span class="meta">ครั้งถัดไป ${lv.next?fmt(lv.next)+(s!=='over'?' · '+rel(lv.next):''):'—'}</span>
        ${s==='over'?`<span class="meta warn">${rel(lv.next)}แล้วนะ ทำเป็นลืม?${booked?' · มีนัดแล้ว '+fmt(booked.date):''}</span>`:''}
        <span class="meta">${vb}มาแล้ว ${g.recs.filter(r=>r.given).length} ครั้ง · <u>ดูประวัติ</u></span></button>`}).join('')
        :`<div class="tile pad">${emptyBox('ไม่มีวัคซีนสักเข็ม?','จดไว้หน่อย ไม่งั้นนิ่มจะมองบนทุกวัน','',true,'syringe')}</div>`}
      <div class="section-head"><h2>นัดวัคซีนที่ลงไว้</h2><button type="button" class="link" data-act="addAppt"${petAttr} data-type="vaccine">+ นัดฉีด</button></div>
      ${plannedV.length?plannedV.map(it=>itemCard(it)).join(''):'<p class="empty-line">ยังไม่มีนัดฉีดที่ลงไว้ในหน้านัดหมาย</p>'}`;
  }else if(healthTab==='visit'){const vis=st.visits.filter(v=>pids.includes(v.petId)).sort((a,b)=>b.date.localeCompare(a.date));
    const ck=st.appts.filter(a=>pids.includes(a.petId)&&a.type==='checkup');const cu=ck.filter(a=>a.status!=='done'&&diff(a.date)>=0).length,co=ck.filter(a=>a.status!=='done'&&diff(a.date)<0).length,cd=ck.filter(a=>a.status==='done').length;
    tiles=`<div class="bento wide" role="group" aria-label="สถานะนัดหมอของ${whose}">
        <div class="tile poster tilt-l"><span class="kicker">นัดหมอที่จะถึง</span><b>${cu}</b><span class="sub">ไปตามนัดแล้ว ${cd} ครั้ง</span></div>
        <div class="tile overdue ${co?'':'calm'}"><span class="kicker">เลยนัดหมอ</span><b>${co}</b><span class="sub">${co?'ยังไม่ได้เช็คว่าไป':'ไม่มี เก่งมาก'}</span></div></div>`;
    panel=`<div class="section-head"><h2>ประวัติหาหมอของ${whose}</h2><button type="button" class="link" data-act="addVisit"${petAttr}>+ บันทึก</button></div>
      ${vis.length?vis.map(v=>`<button type="button" class="tile rec" data-act="editVisit" data-id="${v.id}"><img class="rec-ico" src="${NIM.healthbook}" alt="">
        <span class="rec-b">${all?`<span class="pc">${bd(v.petId)}</span>`:''}<span class="title">${esc(v.reason)}</span><span class="meta">${fmt(v.date)}${v.clinic?' · '+esc(v.clinic):''}</span>${v.notes?`<span class="meta ink">${esc(v.notes)}</span>`:''}</span></button>`).join('')
       :`<div class="tile pad">${emptyBox('ยังไม่เคยไปหาหมอ','สุขภาพดี หรือแค่ยังไม่ได้จด? นิ่มสงสัย','',true,'healthbook')}</div>`}`;
  }else{const notes=st.notes.filter(n=>n.petId===p.id).sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
    const SLOTS=[['book','สมุด'],['sticker','สติกเกอร์วัคซีน'],['wound','แผล']];
    panel=`<div class="section-head"><h2>รูปในสมุดสุขภาพ</h2><span class="stamp">ตัวอย่าง ไม่บันทึกรูป</span></div>
      <div class="album three">${SLOTS.map(([k,l])=>{const u=photoURLs[p.id+':'+k];return `<label class="polaroid pslot ${u?'has':''}"><span class="photo">${u?`<img class="prev" src="${u}" alt="รูป${l}ที่เลือก (ตัวอย่าง)">`:'<span class="letter">+</span>'}</span><span class="pl">${l}${u?' ✓':''}</span><input type="file" class="sr-only" accept="image/*" data-photo="${p.id}:${k}" aria-label="เลือกรูป${l} (ตัวอย่าง ไม่บันทึกรูป)"></label>`}).join('')}</div>
      <p class="hint">เปิดกล้องหรือคลังรูปได้ รูปแสดงให้ดูเท่านั้น ไม่ถูกเก็บในเครื่องและหายเมื่อรีเฟรช</p>
      <div class="section-head"><h2>โน๊ตเจ้าของ</h2><button type="button" class="link" data-act="addNote" data-pet="${p.id}">+ เขียนโน๊ต</button></div>
      ${notes.length?notes.map(n=>`<button type="button" class="tile rec" data-act="editNote" data-id="${n.id}"><img class="rec-ico" src="${NIM.note}" alt=""><span class="rec-b"><span class="note-text">${esc(n.text)}</span><span class="meta">แก้ล่าสุด ${fmt(n.updated||n.created)}</span></span></button>`).join('')
       :`<div class="tile pad">${emptyBox('ยังไม่มีโน๊ต','เรื่องเล็กๆ ของน้อง จดไว้ตรงนี้ได้เลย','',true,'note')}</div>`}`;
  }
  return `<div class="screen scr-health"><header class="hero">${statusGap}
   <div class="hero-copy"><h1>สมุดสุขภาพ</h1><p class="sub">${all?'แสตมป์วัคซีนของน้องทุกตัว':'สมุดของ'+esc(p.name)}</p></div>${nimImg('healthbook','nim-break hb-art',100)}
   ${chips}${tiles}</header>
   <section class="content">${tabs}${all?'<p class="hint">โน๊ตและรูปดูได้เมื่อเลือกน้องทีละตัว</p>':''}
    <div class="panel" id="hpanel" role="tabpanel" aria-labelledby="htab-${healthTab}" tabindex="0">${panel}</div></section>
  </div>${nav('health')}`;
}

/* ---- appointments ---- */
const AP={mode:'all',sel:null,cursor:null,pets:[],types:[],from:'',showAll:false,showEnded:false};
const weekStart=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()-d.getDay());
function apFilter(){const pets=AP.pets.filter(id=>pet(id));const types=AP.types.filter(t=>ATYPE[t]);return {pets,types,n:(pets.length?1:0)+(types.length?1:0)}}
const fDesc=F=>[F.pets.length?F.pets.map(id=>esc(pet(id).name)).join(', '):'',F.types.length?F.types.map(t=>ATYPE[t].label).join(', '):''].filter(Boolean).join(' · ');
function itemCard(it,o){o=o||{};const d=parse(it.date);const p=pet(it.petId);const t=ATYPE[it.type]||ATYPE.other;const od=isOver(it),done=it.status==='done';
  const pill=done?`<span class="pill ink">${I.check}ไปแล้ว</span>`:od?`<span class="pill red">เลยกำหนด ${-diff(it.date)} วัน</span>`:`<span class="pill ${o.pet?'cobalt':in7(it.date)?'yellow':'ink'}">${rel(it.date)}</span>`;
  const act=it.kind==='due'?`data-act="viewDue" data-pet="${it.petId}" data-key="${esc(it.key)}"`:`data-act="viewAppt" data-id="${it.id}"`;
  const meta=(o.pet?'':pbadge(p)+' ')+timeTxt(it.time)+(it.place?' · '+esc(it.place):'');
  return `<button type="button" class="ticket ${od?'over':''} ${done?'is-done':''}" ${act}><span class="ticket-stub" aria-hidden="true"><span class="mo">${MS[d.getMonth()]}</span><span class="nu">${d.getDate()}</span><span class="wd">${WD[d.getDay()]}</span></span>
   <span class="ticket-body">${pill}<span class="title">${esc(it.title)}</span><span class="sr-only">${fmtLong(it.date)}</span><span class="meta">${meta}</span>
   ${o.pet?'':`<span class="chips"><span class="pill ink">${t.label}</span>${it.kind==='due'?'<span class="pill ink">จากสมุดสุขภาพ</span>':''}</span>`}</span></button>`}
function remCard(r){const p=pet(r.petId);const nx=remNext(r);const ended=remEnded(r);
  return `<div class="t-item ${r.paused?'paused':''} ${ended?'ended':''}"><div class="t-time">${timeTxt(r.time)}</div><article class="tile rem">
    <h3 class="title">${esc(r.title)}</h3><p class="meta">${pbadge(p)} ทุกวัน</p><p class="meta">${fmt(r.start)} ถึง ${r.end?fmt(r.end):'ไม่มีวันสิ้นสุด'}</p>
    <p class="meta ink b">${ended?'จบแล้ว':r.paused?'หยุดชั่วคราวอยู่':nx?`ครั้งถัดไป ${nx===todayIso()?'วันนี้':fmt(nx)} ${timeTxt(r.time)}`:'ไม่มีรอบถัดไป'}</p>
    <div class="btn-row rem-acts">${ended?'':`<button type="button" class="switch ${r.paused?'off':''}" role="switch" aria-checked="${!r.paused}" data-act="toggleRem" data-id="${r.id}"><span class="track" aria-hidden="true"></span><span>${r.paused?'หยุดชั่วคราว':'เปิดเตือนอยู่'}</span></button>`}
    <span class="spacer"></span>${icoBtn('edit','แก้ไขเตือน '+esc(r.title),`data-act="editRem" data-id="${r.id}"`)}${icoBtn('trash','ลบเตือน '+esc(r.title),`data-act="delRem" data-id="${r.id}"`)}</div></article></div>`}
function weekNote(byDay,ws){const off=Math.round((ws-weekStart(today()))/(7*864e5));
  const lab=off===0?'สัปดาห์นี้':off===1?'สัปดาห์หน้า':off===-1?'สัปดาห์ที่แล้ว':`${shortDate(iso(ws))} – ${fmt(addDays(6,iso(ws)))}`;
  const nx=[];for(let i=7;i<14;i++){const k=addDays(i,iso(ws));if((byDay[k]||[]).some(a=>a.status!=='done'))nx.push(parse(k))}
  const nm=off===0?'สัปดาห์หน้า':'สัปดาห์ถัดไป';
  let txt;if(!nx.length)txt=nm+'ยังไม่มีนัด';else{const sameM=nx.every(d=>d.getMonth()===nx[0].getMonth());
    const parts=nx.map(d=>sameM?String(d.getDate()):d.getDate()+' '+MS[d.getMonth()]);const j=parts.length>1?parts.slice(0,-1).join(', ')+' และ '+parts[parts.length-1]:parts[0];
    txt=nm+'มีนัด '+j+(sameM?' '+MS[nx[0].getMonth()]:'')}
  return lab+' · '+txt+' · จุดสี = นัดของน้อง'}
function apptsScreen(){
  const F=apFilter();const inF=it=>(!F.pets.length||F.pets.includes(it.petId))&&(!F.types.length||F.types.includes(it.type));
  const onePet=F.pets.length===1?F.pets[0]:'';
  if(!AP.cursor)AP.cursor=weekStart(today());
  const ws=AP.cursor;const we=new Date(ws);we.setDate(ws.getDate()+6);
  const items=allItems().filter(inF);
  const byDay={};items.forEach(a=>(byDay[a.date]=byDay[a.date]||[]).push(a));const T=todayIso();
  const title=ws.getMonth()===we.getMonth()?`${ML[ws.getMonth()]} ${ws.getFullYear()+543}`:`${MS[ws.getMonth()]}${ws.getFullYear()!==we.getFullYear()?' '+(ws.getFullYear()+543):''} – ${MS[we.getMonth()]} ${we.getFullYear()+543}`;
  let cells='';for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const k=iso(d);const has=byDay[k];
    const ps=has?st.pets.filter(p=>has.some(a=>a.petId===p.id)):[];
    const lab=`${d.getDate()} ${ML[d.getMonth()]} ${d.getFullYear()+543}${k===T?' วันนี้':''}${has?` มี ${has.length} รายการ ของ${ps.map(p=>esc(p.name)).join(', ')}`:''}`;
    const sel=AP.mode==='day'&&AP.sel===k;
    cells+=`<button type="button" class="wday ${k===T?'today':''} ${has?'has':''} ${sel?'sel':''}" data-day="${k}" aria-pressed="${sel}" aria-label="${lab}"><span class="wd" aria-hidden="true">${WD[d.getDay()]}</span><span class="n" aria-hidden="true">${d.getDate()}</span><span class="dots" aria-hidden="true">${ps.slice(0,3).map(p=>dot(p)).join('')}${ps.length>3?'<span class="cmore">+</span>':''}</span></button>`}
  let body;
  if(AP.mode==='day'&&AP.sel){const ds=(byDay[AP.sel]||[]).sort(byDT);
    body=`<div class="section-head"><h2>${fmtLong(AP.sel)}</h2><span class="count">${ds.length} รายการ</span></div>`+(ds.length?ds.map(it=>itemCard(it)).join(''):`<div class="tile pad">${emptyBox('ว่างจ้า ไม่มีนัด','ไม่มีนัดเลย จะเพิ่มก็ได้นะ ไม่บังคับ',`<button type="button" class="btn yellow" data-act="addAppt" data-date="${AP.sel}" data-pet="${onePet}">+ เพิ่มนัด</button>`,true,'calendar')}</div>`);
  }else{const ov=items.filter(isOver).sort(byDT);const ups=items.filter(it=>it.status!=='done'&&diff(it.date)>=0).sort(byDT);
    const done=items.filter(it=>it.status==='done').sort((a,b)=>b.date.localeCompare(a.date));const shown=AP.showAll?ups:ups.slice(0,7);
    body=(ov.length?`<div class="section-head"><h2>เลยกำหนด ยังไม่เช็ค ${ov.length}</h2><button type="button" class="link" data-go="#/overdue">จัดการทั้งหมด</button></div>${ov.map(it=>itemCard(it)).join('')}`:'')
      +`<div class="section-head"><h2>นัดที่กำลังจะถึง ${ups.length} รายการ</h2></div>`
      +(ups.length?`${shown.map(it=>itemCard(it)).join('')}${ups.length>7?`<p class="hint"><button type="button" class="link" data-act="toggleAll" aria-expanded="${AP.showAll}">${AP.showAll?'แสดงแค่ 7 รายการที่ใกล้ที่สุด':`แสดงทั้งหมด (${ups.length})`}</button></p>`:''}`:`<div class="tile pad">${emptyBox(F.n?'ไม่มีนัดตามตัวกรองนี้':'ไม่มีนัดเลยสักนัด',F.n?'ลองล้างตัวกรอง หรือเลือกน้องตัวอื่นดู':'ชิลเกินไปแล้ว ลองเพิ่มนัดวัคซีนดูมั้ย',F.n?`<button type="button" class="btn ghost" data-act="clearFilter">ล้างตัวกรอง</button>`:'',true,'calendar')}</div>`)
      +(done.length?`<div class="section-head"><h2>ไปแล้ว</h2><span class="count">${done.length}</span></div>${done.slice(0,5).map(it=>itemCard(it)).join('')}`:'');}
  const fp=AP.from&&pet(AP.from);
  const fLabel=F.n?`ตัวกรองนัดหมาย กำลังกรองอยู่: ${fDesc(F)}`:'ตัวกรองนัดหมาย ตอนนี้แสดงทั้งหมด';
  const right=`<button type="button" class="btn-ico fbtn ${F.n?'on':''}" data-act="filterSheet" aria-haspopup="dialog" aria-label="${fLabel}"><img src="${IC}btn-filter.png" alt="">${F.n?'<span class="fbadge" aria-hidden="true"></span>':''}</button>${st.pets.length?icoBtn('add','เพิ่มนัด',`data-act="addAppt" data-date="${AP.mode==='day'&&AP.sel?AP.sel:''}" data-pet="${onePet}"`,'bar-add'):''}`;
  const fsum=F.n?`<div class="fsum"><img src="${IC}btn-filter.png" alt=""><span class="fs-t"><b>กรองอยู่:</b> ${fDesc(F)}</span><button type="button" class="link" data-act="clearFilter">ล้างตัวกรอง</button></div>`:'';
  const legendPets=F.pets.length?F.pets.map(pet):st.pets;
  const h1=fp&&onePet===AP.from?'นัดหมายของ'+esc(fp.name):'ตารางนัดหมาย';
  return `<div class="screen scr-appts"><header class="hero">${statusGap}
   <div class="top-actions">${fp?backBtn('#/pet/'+fp.id):''}<div class="hero-copy inline"><h1>${h1}</h1></div><span class="spacer"></span><div class="actions">${right}</div></div>
   <div class="week-card"><div class="week-head"><button type="button" class="btn-ico prev" data-wk="-1" aria-label="สัปดาห์ก่อน"><img src="${IC}btn-back.png" alt=""></button><h2 aria-live="polite">${title}</h2><button type="button" class="btn-ico next" data-wk="1" aria-label="สัปดาห์ถัดไป"><img src="${IC}btn-back.png" alt=""></button></div>
    <div class="seg center" role="group" aria-label="มุมมองรายการ"><button type="button" data-mode="day" aria-pressed="${AP.mode==='day'}" class="${AP.mode==='day'?'on':''}">รายวัน</button><button type="button" data-mode="all" aria-pressed="${AP.mode==='all'}" class="${AP.mode==='all'?'on':''}">ทั้งหมด</button></div>
    <div class="week">${cells}</div>
    <div class="week-legend">${legendPets.map(p=>pbadge(p)).join('')}<p>${weekNote(byDay,ws)}</p></div></div>
   </header>
   <section class="content">
   ${fp?`<div class="ctx-bar">${pbadge(fp)}<span>มาจากโปรไฟล์${esc(fp.name)}</span><button type="button" class="link" data-go="#/pet/${fp.id}">กลับโปรไฟล์</button></div>`:''}
   ${fsum}${body}</section>
  </div>${nav('appts')}`;
}
function filterSheet(){const F=apFilter();
  openSheet(`${sheetHead('กรองนัดหมาย','เลือกได้หลายอย่าง ไม่ติ๊กเลย = ดูทั้งหมด','calendar')}
  <form id="filterForm" data-nodirty="1" novalidate>
   <fieldset class="field"><legend class="lbl">น้องตัวไหน</legend>${petStickers('fpets',F.pets)}</fieldset>
   <fieldset class="field"><legend class="lbl">ประเภทนัด</legend><div class="types">${Object.entries(ATYPE).map(([k,t])=>`<label class="chip-type ck-chip"><input type="checkbox" class="sr-only" name="ftypes" value="${k}" ${F.types.includes(k)?'checked':''}><span>${t.label}</span></label>`).join('')}</div></fieldset>
   <div class="btn-row"><button type="button" class="btn ghost" data-act="resetFilter">ล้างตัวกรอง</button><button type="submit" class="btn yellow">ใช้ตัวกรอง</button></div>
  </form>`)}
function setFilter(pets,types,msg){AP.pets=pets;AP.types=types;AP.showAll=false;pendingFocus='[data-act="filterSheet"]';closeSheet();rerender();if(msg)toast(msg)}

/* ---- daily reminders ---- */
function remindersScreen(){
  const rems=st.reminders.filter(r=>pet(r.petId));const active=rems.filter(r=>!remEnded(r)).sort((a,b)=>(a.time||'').localeCompare(b.time||'')),ended=rems.filter(remEnded);
  const on=active.filter(r=>!r.paused).length;
  const add=st.pets.length?icoBtn('add','เพิ่มเตือน','data-act="addRem"','bar-add'):'';
  const emptyBtn=st.pets.length?`<button type="button" class="btn yellow" data-act="addRem">+ ตั้งเตือนแรก</button>`:`<button type="button" class="btn primary" data-go="#/pet/new">+ เพิ่มน้องก่อน</button>`;
  return `<div class="screen scr-rem"><header class="hero">${statusGap}${topActions(backBtn('#/home'),add)}
   <div class="bento"><article class="tile greet"><span class="tape tape-top">เตือนในแอปเท่านั้น</span><h2>เตือนประจำ</h2><p class="caption">ไม่ส่ง LINE หรือแจ้งเตือนมือถือ ต้องเปิดแอปถึงจะเห็น รอบนี้ซ้ำได้แบบทุกวันอย่างเดียว</p>${nimImg('bell','nim-break',120)}</article>
    <div class="tile poster"><span class="kicker">กำลังเตือน</span><b>${on}</b><span class="sub">รายการ${active.length-on?`<br>พักอยู่ ${active.length-on}`:''}</span></div></div></header>
   <section class="content">
    ${active.length?`<div class="timeline">${active.map(remCard).join('')}</div>`:`<div class="tile pad">${emptyBox('ยังไม่มีเตือนประจำ','เช่น ป้อนยาทุกวัน แปรงฟันก่อนนอน ตั้งครั้งเดียว นิ่มทวงให้ทุกวัน',emptyBtn,true,'reminder')}</div>`}
    ${ended.length?`<p class="hint"><button type="button" class="link" data-act="toggleEnded" aria-expanded="${AP.showEnded}">${AP.showEnded?'ซ่อนที่จบแล้ว':`ดูที่จบแล้ว (${ended.length})`}</button></p>${AP.showEnded?`<div class="timeline">${ended.map(remCard).join('')}</div>`:''}`:''}
   </section></div>${nav('home')}`;
}

/* ---- share (mock) ---- */
const SHARE_BASE='https://teeratin.github.io/tofu-app-v2/';
const memberPets=mb=>mb.role==='owner'?st.pets:(mb.pets||[]).map(pet).filter(Boolean);
const PHOTO_BG=['#EEF2FF','#FFF6D6','#FFF1EF','#E8F5E9'];
function shareScreen(q){
  const fp=q.pet&&pet(q.pet);const f=st.family;const link=`${SHARE_BASE}#/join/${f.code}`;
  const allIds=st.pets.map(p=>p.id);
  const card=(mb,i)=>{const ps=memberPets(mb);const own=mb.role==='owner';const txt=own?'เจ้าของ · เห็นทุกตัว':!ps.length?'ช่วยดูแล · ยังไม่ได้แชร์ตัวไหน':ps.length===st.pets.length?'ช่วยดูแล · ดูได้ทุกตัว':'ช่วยดูแล · ดูได้: '+ps.map(p=>esc(p.name)).join(', ');
    return `<article class="polaroid">${mb.self?'<span class="tape tape-top">คุณ</span>':''}<div class="photo" style="background:${PHOTO_BG[i%PHOTO_BG.length]}"><span class="letter">${esc(mb.name.slice(0,1))}</span></div>
      <h3>${esc(mb.name)}</h3><p>${txt}</p><p class="mdots">${ps.map(p=>dot(p)).join(' ')}</p>
      <div class="acts">${own?`<span class="btn-ico" role="img" aria-label="เจ้าของลบไม่ได้"><img src="${IC}btn-lock.png" alt=""></span>`:`${icoBtn('edit','แก้ไขน้องที่'+esc(mb.name)+'ดูได้',`data-act="editMemberPets" data-id="${mb.id}" aria-haspopup="dialog"`)}${icoBtn('trash','เอา'+esc(mb.name)+'ออก',`data-act="delMember" data-id="${mb.id}"`)}`}</div></article>`};
  return `<div class="screen scr-share"><header class="hero">${statusGap}${topActions(backBtn(fp?'#/pet/'+fp.id:'#/home'))}
   <div class="hero-copy wide"><span class="stamp">ตัวอย่าง</span><h1>ชวนคนในบ้านมาช่วยดูแล${fp?esc(fp.name):'น้องๆ'}</h1></div>
   <article class="tile code-card"><p class="kicker">รหัสเชิญ 6 หลัก</p><div class="code-row"><span class="code-xl" role="text" aria-label="รหัสเชิญ ${f.code.split('').join(' ')}">${f.code.slice(0,3)} ${f.code.slice(3)}</span>${icoBtn('copy','คัดลอกรหัส',`data-act="copy" data-copy="${f.code}" data-what="รหัส"`,'on-yellow')}</div>
    <p class="meta">เลือกแชร์ทุกตัวหรือเฉพาะตัวก็ได้ เช่น จ้างพี่เลี้ยงมาดูแค่ตัวเดียว หน้านี้ยังเป็นตัวอย่าง ไม่มีการส่งข้อมูลไปเครื่องอื่น</p>${nimImg('family','nim-break',126)}</article></header>
   <section class="content">
    <article class="tile pad-s"><label class="kicker" for="shareLink">ลิงก์เชิญ</label><input class="input link-box" id="shareLink" value="${esc(link)}" readonly>
     <div class="copy-line">${icoBtn('copy','คัดลอกลิงก์',`data-act="copy" data-copy="${esc(link)}" data-what="ลิงก์"`,'on-yellow')}<span aria-hidden="true">คัดลอกลิงก์</span></div>
     <button type="button" class="link mt8" data-act="newCode">ขอรหัสใหม่</button></article>
    <div class="section-head"><h2>สมาชิกที่แชร์แล้ว</h2><span class="count">${f.members.length} คน</span></div>
    <div class="album members">${f.members.map(card).join('')}</div>
    <form class="tile pad-s" id="memberForm" novalidate><h3 class="title">เชิญสมาชิก (ตัวอย่าง)</h3>
      <div class="field" data-f="mname"><label class="lbl" for="m-name">ชื่อ ${req}</label><input class="input" id="m-name" name="mname" maxlength="30" placeholder="เช่น พี่ชาย, ยาย, พี่เลี้ยง" autocomplete="off" aria-required="true"></div>
      <fieldset class="field"><legend class="lbl">บทบาท</legend><div class="types"><label class="chip-type ck-chip"><input type="radio" class="sr-only" name="role" value="carer" checked><span>ช่วยดูแล</span></label><label class="chip-type ck-chip"><input type="radio" class="sr-only" name="role" value="owner"><span>เจ้าของ (ลบไม่ได้)</span></label></div></fieldset>
      ${st.pets.length?`<fieldset class="field" data-f="mpets" id="mpetsField"><legend class="lbl">น้องที่จะแชร์ ${req} ${opt('(เลือกเฉพาะตัวได้)')}</legend>${petStickers('mpets',allIds)}<p class="hint-s" id="mpetsHint">ติ๊กออกตัวที่ไม่อยากให้คนนี้เห็น แก้ทีหลังได้ที่รายชื่อสมาชิก</p></fieldset>`:''}
      <button type="submit" class="btn yellow block mt16">+ เพิ่มสมาชิก</button></form>
   </section></div>${nav('home')}`;
}
function memberPetsSheet(id){const mb=st.family.members.find(x=>x.id===id);if(!mb||mb.role==='owner')return;
  openSheet(`${sheetHead('น้องที่'+esc(mb.name)+'ดูได้','ติ๊กเฉพาะตัวที่อยากแชร์ (ตัวอย่าง)','family')}
   <form id="memberPetsForm" data-id="${mb.id}" novalidate><fieldset class="field" data-f="mpets"><legend class="lbl">น้องที่แชร์ ${req}</legend>${petStickers('mpets',memberPets(mb).map(p=>p.id))}</fieldset>
    <button type="submit" class="btn yellow block mt16">บันทึก</button></form>`)}
function joinScreen(code){code=String(code||'');
  return `<div class="screen scr-join"><header class="hero">${statusGap}${topActions(backBtn('#/home'))}
   <article class="tile greet"><span class="tape tape-top">ตัวอย่าง</span><h1 class="h2">คำเชิญเข้าครอบครัว</h1><p class="caption">รหัสเชิญ <b>${esc(code.slice(0,3))} ${esc(code.slice(3,6))}</b> หน้านี้แค่จำลองว่าคนที่ได้ลิงก์จะเห็นอะไร ยังไม่มีระบบบัญชีหรือการส่งข้อมูลจริง</p>${nimImg('family','nim-break',120)}</article></header>
   <section class="content"><button type="button" class="btn yellow block" data-go="#/home">เข้าใจแล้ว กลับหน้าแรก</button><button type="button" class="btn ghost block" data-go="#/share">ดูหน้าแชร์ให้ครอบครัว</button></section></div>${nav('home')}`}
function settingsScreen(){
  return `<div class="screen scr-settings"><header class="hero">${statusGap}<div class="hero-copy"><h1>ตั้งค่า</h1></div>
   <article class="tile greet mascot-card"><h2>น้องนิ่ม</h2><p class="caption">${NIM_DESC}</p>${nimImg('main','nim-break',140)}</article></header>
   <section class="content">
    <dl class="passport"><div class="hist-row"><dt>เวอร์ชัน</dt><dd>ต้นแบบ 2.0 (ดีไซน์ใหม่) · ข้อมูลรุ่น ${SCHEMA} (เก็บในเครื่อง)</dd></div>
     <div class="hist-row"><dt>เกณฑ์ใกล้ถึง</dt><dd>ภายใน 7 วัน (วันนี้ถึงอีก 6 วัน)</dd></div>
     <div class="hist-row"><dt>การแจ้งเตือน</dt><dd>เตือนในแอปเท่านั้น ไม่ส่ง LINE</dd></div></dl>
    <button type="button" class="btn ghost block left" data-go="#/share"><img src="${NIM.family}" alt="">แชร์ให้ครอบครัว (ตัวอย่าง)</button>
    <div><button type="button" class="btn soft-danger block" data-act="reset">รีเซ็ตเป็นข้อมูลตัวอย่าง</button><p class="hint mt8">ปุ่มนี้ลบข้อมูลที่คุณเพิ่มทั้งหมด แล้วใส่ข้อมูลตัวอย่างใหม่ทันที</p></div>
   </section></div>${nav('settings')}`;
}
const notFound=()=>`<div class="screen scr-404"><header class="hero">${statusGap}${topActions(backBtn('#/home'))}<div class="hero-copy"><h1>ไม่เจอเลย</h1></div></header><section class="content">${emptyBox('หาไม่เจอ','น้องตัวนี้อาจถูกลบไปแล้ว หรือนิ่มแค่มึน',`<button type="button" class="btn primary" data-go="#/home">กลับหน้าแรก</button>`,false,'alert')}</section></div>${nav('home')}`;

/* ---------- router ---------- */
let pendingFocus=null, afterRender=[];
function parseHash(){const h=location.hash.slice(1)||'/';const[path,qs]=h.split('?');return {seg:path.split('/').filter(Boolean),q:Object.fromEntries(new URLSearchParams(qs||''))}}
function route(){
  const {seg,q}=parseHash();const fresh=!route.keep;route.keep=false;
  if(fresh){closeSheet(true);closeDlg(true)}
  let html;
  if(seg[0]==='splash'||(!st.onboarded&&seg[0]!=='pet'&&seg[0]!=='join'))html=splash();
  else if(seg[0]==='pet'&&seg[1]==='new')html=petForm(null);
  else if(seg[0]==='pet'&&seg[2]==='edit')html=petForm(seg[1]);
  else if(seg[0]==='pet')html=petDetail(seg[1]);
  else if(seg[0]==='health'){if(fresh&&q.tab&&HTABS.some(t=>t[0]===q.tab))healthTab=q.tab;html=healthScreen(seg[1]);
    if(fresh)afterRender.push(()=>{const c=app.querySelector('.switcher [aria-selected="true"]');centerChip(c)})}
  else if(seg[0]==='appts'&&q.rem)html=remindersScreen();
  else if(seg[0]==='appts'){if(fresh){const from=q.pet&&pet(q.pet)?q.pet:'';if(from)AP.pets=[from];else if(AP.from)AP.pets=[];AP.from=from;AP.showAll=false;if(q.day){AP.mode='day';AP.sel=q.day;AP.cursor=weekStart(parse(q.day))}}
    html=apptsScreen()}
  else if(seg[0]==='reminders')html=remindersScreen();
  else if(seg[0]==='overdue')html=overdueScreen();
  else if(seg[0]==='share')html=shareScreen(q);
  else if(seg[0]==='join')html=joinScreen(seg[1]);
  else if(seg[0]==='settings')html=settingsScreen();
  else if(!seg[0]||seg[0]==='home')html=homeScreen();
  else html=notFound();
  app.innerHTML=html;
  const sc=app.querySelector('.screen');if(sc&&fresh)sc.scrollTop=0;
  const fns=afterRender;afterRender=[];fns.forEach(f=>{try{f()}catch(e){}});
  if(pendingFocus){const el=app.querySelector(pendingFocus);pendingFocus=null;if(el)el.focus()}
}
const rerender=()=>{const sc=app.querySelector('.screen');const t=sc?sc.scrollTop:0;const sw=app.querySelector('.switcher');const sl=sw?sw.scrollLeft:0;route.keep=true;route();
  const s2=app.querySelector('.screen');if(s2)s2.scrollTop=t;const sw2=app.querySelector('.switcher');if(sw2)sw2.scrollLeft=sl};
window.addEventListener('hashchange',route);

/* ---------- sheets & dialogs ---------- */
let lastFocus=null, lastFocusSel='', sheetSnap='';
const focusSel=el=>{if(!el||!el.dataset)return '';const d=el.dataset;if(d.act)return `[data-act="${d.act}"]`+(d.id?`[data-id="${d.id}"]`:'');if(d.go)return `[data-go="${d.go}"]`;return el.id?'#'+el.id:''};
const snap=()=>[...layer.querySelectorAll('form:not([data-nodirty])')].map(f=>JSON.stringify([...new FormData(f)].filter(([,v])=>typeof v==='string'))).join('|');
function openSheet(html,opts){opts=opts||{};const wasOpen=layer.classList.contains('open');if(!wasOpen){lastFocus=document.activeElement;lastFocusSel=focusSel(lastFocus)}
  layer.innerHTML=`<div class="scrim" data-act="reqClose"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" tabindex="-1"><div class="sheet-handle" aria-hidden="true"></div>${icoBtn('close','ปิดหน้าต่างนี้','data-act="reqClose"','close')}<div class="sheet-body">${html}</div></div>`;
  sheetSnap=snap();
  const focus=()=>{const t=opts.focus&&layer.querySelector(opts.focus);(t||layer.querySelector('.sheet')).focus()};
  if(wasOpen)focus();else requestAnimationFrame(()=>requestAnimationFrame(()=>{layer.classList.add('open');focus()}));
}
function closeSheet(now){const back=lastFocus,bsel=lastFocusSel;layer.classList.remove('open');sheetSnap='';
  const done=()=>{layer.innerHTML='';if(layer.classList.contains('open'))return;let t=back&&document.contains(back)?back:null;if(!t&&bsel){try{t=app.querySelector(bsel)}catch(e){}}
    if(t&&typeof t.focus==='function'&&!(document.activeElement&&document.activeElement!==document.body&&app.contains(document.activeElement)&&document.activeElement!==back)){try{t.focus()}catch(e){}}};
  if(now||!layer.innerHTML){done();return}setTimeout(()=>{if(!layer.classList.contains('open'))done()},reduceMotion()?0:300)}
function reqClose(){if(layer.querySelector('form')&&snap()!==sheetSnap){confirmDialog({title:'ทิ้งที่กรอกไว้?',text:'ที่พิมพ์ไว้ยังไม่ได้บันทึก ถ้าปิดตอนนี้จะหายหมดนะ',ok:'ทิ้งเลย',cancel:'กลับไปกรอกต่อ',pose:'writing',onOk:()=>closeSheet()});return}closeSheet()}
let dlgLast=null,dlgOk=null;
function confirmDialog(o){dlgLast=document.activeElement;dlgOk=o.onOk;
  dlg.innerHTML=`<div class="dlg-scrim" data-dlg="cancel"></div><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgTitle" aria-describedby="dlgText"><button type="button" class="btn-ico dlg-x" data-dlg="cancel" aria-label="ปิด"><img src="${IC}btn-close.png" alt=""></button>
    ${o.pose?`<div class="dlg-art">${nimImg(o.pose,'',104)}</div>`:''}<h3 id="dlgTitle">${o.title}</h3><p id="dlgText">${o.text}</p>
    <div class="btn-row"><button type="button" class="btn ghost" data-dlg="cancel">${o.cancel||'ไม่ลบแล้ว'}</button><button type="button" class="btn ${o.danger?'danger':'yellow'}" data-dlg="ok">${o.ok||'ลบเลย'}</button></div></div>`;
  dlg.classList.add('open');const c=dlg.querySelector('.btn.ghost');if(c)c.focus()}
function closeDlg(silent){if(!dlg.classList.contains('open'))return;dlg.classList.remove('open');dlg.innerHTML='';dlgOk=null;if(!silent&&dlgLast&&document.contains(dlgLast)){try{dlgLast.focus()}catch(e){}}}
const confirmDelete=(title,text,onOk,label)=>confirmDialog({title,text,ok:label||'ลบเลย',cancel:'ไม่ลบแล้ว',pose:'trash',danger:true,onOk});

const petOptions=(sel)=>st.pets.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)} (${(SP[p.species]||SP.other).label})</option>`).join('');
const VSTAT=s=>`<span class="pill ${VPILL[s]}">${VS[s]}</span>`;
function vacSheet(v,petId,pre){
  const isNew=!v;const p=pet(isNew?petId:v.petId);if(!p)return;
  v=v||Object.assign({type:'',name:'',given:todayIso(),next:'',note:'',petId},pre||{});
  const opts=vacOpts(p.species);const typeVal=v.type||'';
  openSheet(`${sheetHead(isNew?'บันทึกวัคซีน':'แก้ไขวัคซีน',`ของ${esc(p.name)} · ฉีดแล้วจดเลย อย่าดอง`,'syringe')}
  <form id="vacForm" data-id="${isNew?'':v.id}" data-pet="${p.id}" novalidate>${reqNote}
   <div class="field" data-f="type"><label class="lbl" for="vac-type">ชนิดวัคซีน ${req}</label><select class="input" id="vac-type" name="type" aria-required="true"><option value="">— เลือกชนิดวัคซีน —</option>${opts.map(o=>`<option value="${o.value}" ${typeVal===o.value?'selected':''}>${o.label}</option>`).join('')}</select></div>
   <div class="field sub-field" data-f="name" ${typeVal==='other'?'':'hidden'}><label class="lbl" for="vac-name">ชื่อวัคซีนหรือยา ${req}</label><input class="input" id="vac-name" name="name" value="${esc(v.name)}" placeholder="เช่น ยาป้องกันพยาธิหนอนหัวใจ" maxlength="60"></div>
   <div class="two"><div class="field" data-f="given"><label class="lbl" for="given">วันที่ฉีด ${req}</label>${dIn('given',v.given,'given',{max:todayIso(),min:MIN_DATE,req:1})}</div><div class="field" data-f="next"><label class="lbl" for="next">นัดครั้งถัดไป</label>${dIn('next',v.next,'next',{min:v.given||MIN_DATE})}</div></div>
   <p class="hint-s">ลงย้อนหลังได้ ครั้งถัดไปต้องหลังวันที่ฉีด และจะไปโผล่ในหน้านัดหมายให้เอง</p>
   <div class="field"><label class="lbl" for="vac-note">หมายเหตุ ${opt()}</label><textarea class="input" id="vac-note" name="note" placeholder="ล็อตวัคซีน อาการหลังฉีด ฯลฯ" maxlength="200">${esc(v.note)}</textarea></div>
   <div class="btn-row">${isNew?'':`<button type="button" class="btn soft-danger" data-act="delVac" data-id="${v.id}">ลบ</button>`}<button type="submit" class="btn yellow">บันทึก</button></div>
  </form>`);
}
function vacGroupSheet(pid,key){const p=pet(pid);const g=vacGroups(pid).find(x=>x.key===key);if(!p||!g){closeSheet();return}
  const shots=g.recs.filter(r=>r.given);
  openSheet(`${sheetHead(esc(g.label),`ของ${esc(p.name)} · ฉีดมาแล้ว ${shots.length} ครั้ง`,'syringe')}
   <dl class="passport"><div class="hist-row"><dt>สถานะล่าสุด</dt><dd>${VSTAT(g.status)}</dd></div><div class="hist-row"><dt>ครั้งถัดไป</dt><dd>${g.next?fmt(g.next)+' · '+rel(g.next):'ยังไม่ลง'}</dd></div></dl>
   <h3 class="sub-h">ประวัติการฉีด</h3><ol class="shots">${g.recs.map((r,i)=>`<li><button type="button" class="shot" data-act="editVac" data-id="${r.id}"><span class="shot-n" aria-hidden="true">${g.recs.length-i}</span><span class="shot-b"><b>เข็มที่ ${g.recs.length-i} · ${r.given?fmt(r.given):'ยังไม่ลงวันฉีด'}</b><span>${r.next?'นัดถัดไปตอนนั้น '+fmt(r.next):'ไม่มีนัดถัดไป'}${r.note?' · '+esc(r.note):''}</span></span><img src="${IC}btn-edit.png" alt="" aria-hidden="true"></button></li>`).join('')}</ol>
   <button type="button" class="btn yellow block mt16" data-act="recordShot" data-pet="${pid}" data-key="${esc(key)}">+ บันทึกเข็มใหม่</button>`);
}
function visitSheet(v,petId){
  const isNew=!v;v=v||{date:todayIso(),clinic:'',reason:'',notes:'',petId};const p=pet(v.petId);if(!p)return;
  openSheet(`${sheetHead(isNew?'บันทึกการหาหมอ':'แก้ไขการหาหมอ',`ของ${esc(p.name)} · หมอพูดอะไร จดไว้ก่อนลืม`,'healthbook')}
  <form id="visitForm" data-id="${isNew?'':v.id}" data-pet="${p.id}" novalidate>${reqNote}
   <div class="two"><div class="field" data-f="date"><label class="lbl" for="visit-date">วันที่ไป ${req}</label>${dIn('date',v.date,'visit-date',{max:todayIso(),min:MIN_DATE,req:1})}</div><div class="field" data-f="reason"><label class="lbl" for="visit-reason">สาเหตุ ${req}</label><input class="input" id="visit-reason" name="reason" value="${esc(v.reason)}" placeholder="เช่น ตรวจประจำปี" maxlength="60" aria-required="true"></div></div>
   <div class="field"><label class="lbl" for="visit-clinic">คลินิก / โรงพยาบาล ${opt()}</label><input class="input" id="visit-clinic" name="clinic" value="${esc(v.clinic)}" placeholder="เช่น โรงพยาบาลสัตว์ใกล้บ้าน" maxlength="60"></div>
   <div class="field"><label class="lbl" for="visit-notes">ผลตรวจ / คำแนะนำหมอ ${opt()}</label><textarea class="input" id="visit-notes" name="notes" placeholder="ยาที่ได้ ผลเลือด นัดติดตาม" maxlength="400">${esc(v.notes)}</textarea></div>
   <div class="btn-row">${isNew?'':`<button type="button" class="btn soft-danger" data-act="delVisit" data-id="${v.id}">ลบ</button>`}<button type="submit" class="btn yellow">บันทึก</button></div>
  </form>`);
}
function vacPickHtml(petIds,checked,vacName,single){
  const sps=[...new Set(petIds.map(id=>(pet(id)||{}).species))];const list=VACS.filter(v=>v.species==='all'||sps.includes(v.species));
  const tag=v=>v.species==='all'?'':` <span class="sp-tag">${SP[v.species].label}</span>`;
  return `<span class="lbl" id="vac-label">${single?'วัคซีน':'วัคซีนที่จะฉีด'} ${req} ${single?'':opt('(หลายชนิด = แยกเป็นคนละนัด)')}</span><div class="ck-list" role="group" aria-labelledby="vac-label">${list.map(v=>`<label class="ck"><input type="${single?'radio':'checkbox'}" name="vac" value="${v.value}" ${checked.includes(v.value)?'checked':''}><span>${v.label}${tag(v)}</span></label>`).join('')}</div>
   <div class="sub-field" data-f="vacName" ${checked.includes('other')?'':'hidden'}><label for="appt-vacname" class="lbl sm">ชื่อวัคซีนอื่นๆ ${req}</label><input class="input" id="appt-vacname" name="vacName" value="${esc(vacName||'')}" maxlength="60" placeholder="เช่น ยาหยอดป้องกันเห็บหมัด"></div>`}
const titleLabel=type=>type==='vaccine'?'หัวข้อนัด '+opt('(ไม่บังคับ ถ้าว่างจะตั้งตามชื่อวัคซีน)'):'หัวข้อนัด '+req;
function apptSheet(a,opts){
  opts=opts||{};const isNew=!a;
  a=a||{petId:opts.pet||st.selPet||st.pets[0].id,type:opts.type||'checkup',title:'',date:opts.date||addDays(1),time:'',place:'',notes:'',vacKey:opts.vacKey||''};
  if(!pet(a.petId))a.petId=st.pets[0].id;
  const vk=a.vacKey||'';const checked=vk?[vk.startsWith('other:')?'other':vk]:[];const vacName=vk.startsWith('other:')?vk.slice(6):'';
  const title=opts.reschedule?'เลื่อนนัด':(isNew?'เพิ่มนัดหมาย':'แก้ไขนัดหมาย');
  openSheet(`${sheetHead(title,opts.reschedule?'เลือกวันใหม่ แล้วกดบันทึก':'นัดแล้วต้องไปนะ นิ่มจะคอยทวง','calendar')}
  <form id="apptForm" data-id="${isNew?'':a.id}" novalidate>${reqNote}
   ${isNew?`<fieldset class="field" data-f="pets"><legend class="lbl">น้องตัวไหน ${req} ${opt('(หลายตัว = แยกเป็นคนละนัด)')}</legend>${petStickers('pets',[a.petId])}</fieldset>`
     :`<fieldset class="field"><legend class="lbl">น้องตัวไหน</legend>${petStickers('petId',[a.petId],'radio')}</fieldset>`}
   <div class="field" role="group" aria-labelledby="type-label"><span class="lbl" id="type-label">ประเภทนัด</span><div class="choice types" data-choice="type">${Object.entries(ATYPE).map(([k,t])=>`<button type="button" data-val="${k}" class="chip-type ${a.type===k?'on':''}" aria-pressed="${a.type===k?'true':'false'}">${t.label}</button>`).join('')}</div><input type="hidden" name="type" value="${a.type}"></div>
   <div class="field" id="vacPick" data-f="vac" ${a.type==='vaccine'?'':'hidden'}>${vacPickHtml([a.petId],checked,vacName,!isNew)}</div>
   <div class="field" data-f="title"><label class="lbl" for="appt-title" id="title-label">${titleLabel(a.type)}</label><input class="input" id="appt-title" name="title" value="${esc(a.title)}" placeholder="เช่น ตรวจสุขภาพประจำปี" maxlength="60"></div>
   <div class="two dt"><div class="field" data-f="date"><label class="lbl" for="appt-date">วันที่ ${req}</label>${dIn('date',a.date,'appt-date',{min:MIN_DATE,max:addYears(3),req:1})}</div><div class="field"><label class="lbl" for="appt-time">เวลา ${opt()}</label>${tIn('time',a.time,'appt-time')}</div></div>
   <div class="field"><label class="lbl" for="appt-place">สถานที่ ${opt()}</label><input class="input" id="appt-place" name="place" value="${esc(a.place)}" placeholder="คลินิก โรงพยาบาลสัตว์ หรือร้าน Grooming" maxlength="60"></div>
   <div class="field"><label class="lbl" for="appt-notes">หมายเหตุ ${opt()}</label><textarea class="input" id="appt-notes" name="notes" placeholder="เช่น งดอาหารก่อนไป" maxlength="200">${esc(a.notes)}</textarea></div>
   <button type="submit" class="btn yellow block mt16">${isNew?'บันทึกนัด':'บันทึกการแก้ไข'}</button>
  </form>`,{focus:opts.reschedule?'#appt-date':null});
}
function apptDetail(a){const p=pet(a.petId);const t=ATYPE[a.type]||ATYPE.other;const od=isOver(a),done=a.status==='done';
  openSheet(`<div class="sheet-head">${p?face(p,'lg'):''}<div class="sh-text"><span class="pill ink">${t.label}</span><h2 id="sheetTitle">${esc(a.title)}</h2></div></div>
  <dl class="passport">
   <div class="hist-row"><dt>น้อง</dt><dd>${pbadge(p)}</dd></div>
   <div class="hist-row"><dt>วันที่</dt><dd>${fmtLong(a.date)}<span class="meta d-block">${rel(a.date)}</span></dd></div>
   <div class="hist-row"><dt>เวลา</dt><dd>${timeTxt(a.time)}</dd></div>
   ${a.type==='vaccine'&&a.vacKey?`<div class="hist-row"><dt>วัคซีน</dt><dd>${esc(keyLabel(a.vacKey))}</dd></div>`:''}
   <div class="hist-row"><dt>สถานที่</dt><dd>${esc(a.place)||'—'}</dd></div>
   <div class="hist-row"><dt>หมายเหตุ</dt><dd>${esc(a.notes)||'—'}</dd></div>
   <div class="hist-row"><dt>สถานะ</dt><dd>${done?`<span class="pill ink">${I.check}ไปแล้ว</span>${a.vacRecId?'<span class="meta d-block">ลงสมุดสุขภาพแล้ว</span>':''}`:od?'<span class="pill red">เลยกำหนด ยังไม่เช็ค</span>':'<span class="pill cobalt">รอไป</span>'}</dd></div></dl>
  ${!done&&diff(a.date)>=0&&diff(a.date)<=3?`<div class="tip mt16">${nimImg('appointment','tip-nim',48)}<span>ใกล้แล้วนะ <b>${rel(a.date)}</b> อย่ามาบอกว่าลืม</span></div>`:''}
  <div class="btn-row mt16">${done?`<button type="button" class="btn ghost" data-act="undoDone" data-id="${a.id}">ยกเลิกว่าไปแล้ว</button>`:`<button type="button" class="btn primary" data-act="markDone" data-id="${a.id}">ไปแล้ว</button><button type="button" class="btn ghost" data-act="reschedule" data-id="${a.id}">เลื่อนวัน</button>`}</div>
  <div class="btn-row"><button type="button" class="btn soft-danger" data-act="delAppt" data-id="${a.id}">ลบนัด</button><button type="button" class="btn ghost" data-act="editAppt" data-id="${a.id}">แก้ไข</button></div>`);
}
function dueSheet(pid,key){const p=pet(pid);const g=vacGroups(pid).find(x=>x.key===key);if(!p||!g)return;
  openSheet(`${sheetHead('ครบกำหนด'+esc(g.label),`ของ${esc(p.name)} · มาจากนัดครั้งถัดไปในสมุดสุขภาพ`,'syringe')}
   <dl class="passport"><div class="hist-row"><dt>น้อง</dt><dd>${pbadge(p)}</dd></div><div class="hist-row"><dt>ครบกำหนด</dt><dd>${fmtLong(g.next)}<span class="meta d-block">${rel(g.next)}</span></dd></div>
   <div class="hist-row"><dt>ฉีดล่าสุด</dt><dd>${g.latest.given?fmt(g.latest.given):'—'}</dd></div><div class="hist-row"><dt>สถานะ</dt><dd>${VSTAT(g.status)}</dd></div></dl>
   <div class="btn-row mt16"><button type="button" class="btn primary" data-act="recordShot" data-pet="${pid}" data-key="${esc(key)}">ฉีดแล้ว บันทึกลงสมุด</button><button type="button" class="btn ghost" data-act="bookDue" data-pet="${pid}" data-key="${esc(key)}">ลงนัดหมาย</button></div>
   <button type="button" class="btn ghost block mt8" data-go="#/health/${pid}?tab=vac">ดูในสมุดสุขภาพ</button>`)}
function weightSheet(pid){const p=pet(pid);if(!p)return;const ws=(p.weights||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
  openSheet(`${sheetHead('น้ำหนักของ'+esc(p.name),'อัปเดตได้บ่อยๆ ไม่ต้องเข้าไปแก้ข้อมูลรวม','weight')}
   ${weightChart(ws)}
   <form id="weightForm" data-pet="${pid}" class="mt16" novalidate>
    <div class="two"><div class="field" data-f="kg"><label class="lbl" for="w-kg">น้ำหนักใหม่ ${req}</label><div class="unit"><input class="input" id="w-kg" name="kg" inputmode="decimal" maxlength="6" placeholder="เช่น 4.3" aria-required="true"><span>กก.</span></div></div>
    <div class="field" data-f="wdate"><label class="lbl" for="w-date">ชั่งวันที่ ${req}</label>${dIn('wdate',todayIso(),'w-date',{max:todayIso(),min:MIN_DATE,req:1})}</div></div>
    <button type="submit" class="btn yellow block mt16">บันทึกน้ำหนัก</button></form>
   ${ws.length?`<h3 class="sub-h">ประวัติ</h3><ul class="wlist">${ws.slice().reverse().map(w=>`<li><span>${fmt(w.date)}</span><b>${w.kg} กก.</b>${icoBtn('trash',`ลบน้ำหนัก ${w.kg} กก. วันที่ ${fmt(w.date)}`,`data-act="delWeight" data-pet="${pid}" data-id="${w.id}"`)}</li>`).join('')}</ul>`:''}`)}
function weightChart(ws){
  if(!ws.length)return `<div class="chart-empty">ยังไม่มีน้ำหนัก ใส่ครั้งแรกด้านล่าง</div>`;
  if(ws.length<2)return `<div class="chart-empty">มีแค่ ${ws[0].kg} กก. (${fmt(ws[0].date)}) ใส่อีกครั้งเพื่อดูเทรนด์</div>`;
  const W=320,H=150,L=40,R=12,T=14,B=28;const xs=ws.map(w=>parse(w.date).getTime());const ys=ws.map(w=>w.kg);
  let x0=Math.min(...xs),x1=Math.max(...xs);if(x0===x1)x1=x0+1;let y0=Math.min(...ys),y1=Math.max(...ys);const padY=Math.max((y1-y0)*.2,.2);y0=Math.max(0,y0-padY);y1+=padY;
  const X=t=>L+(t-x0)/(x1-x0)*(W-L-R),Y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B);
  const pts=ws.map((w,i)=>`${X(xs[i]).toFixed(1)},${Y(w.kg).toFixed(1)}`).join(' ');
  const first=ws[0],last=ws[ws.length-1];const d=Math.round((last.kg-first.kg)*100)/100;
  return `<figure class="chart tile"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟน้ำหนัก ${ws.length} ครั้ง จาก ${first.kg} เป็น ${last.kg} กิโลกรัม">
    <line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#1E1E1E" stroke-width="1.5"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#1E1E1E" stroke-width="1.5"/>
    <text x="${L-6}" y="${T+10}" text-anchor="end" class="ax">${y1.toFixed(1)}</text><text x="${L-6}" y="${H-B}" text-anchor="end" class="ax">${y0.toFixed(1)}</text>
    <text x="${L}" y="${H-8}" class="ax">${fmt(first.date)}</text><text x="${W-R}" y="${H-8}" text-anchor="end" class="ax">${fmt(last.date)}</text>
    <polyline points="${pts}" fill="none" stroke="#2747C8" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${ws.map((w,i)=>`<circle cx="${X(xs[i]).toFixed(1)}" cy="${Y(w.kg).toFixed(1)}" r="5" fill="#FFD23F" stroke="#1E1E1E" stroke-width="2"/>`).join('')}</svg>
    <figcaption>${d===0?'น้ำหนักคงที่':d>0?`เพิ่มขึ้น ${d} กก.`:`ลดลง ${-d} กก.`} ตั้งแต่ ${fmt(first.date)}</figcaption></figure>`}
function noteSheet(n,petId){const isNew=!n;n=n||{text:'',petId};const p=pet(n.petId);if(!p)return;if(photoURLs['note:draft']){URL.revokeObjectURL(photoURLs['note:draft']);delete photoURLs['note:draft']}
  openSheet(`${sheetHead(isNew?'เขียนโน๊ตเจ้าของ':'แก้ไขโน๊ต',`ของ${esc(p.name)} · เรื่องส่วนตัว จดไว้กันลืม`,'note')}
   <form id="noteForm" data-id="${isNew?'':n.id}" data-pet="${p.id}" novalidate>
    <div class="field" data-f="text"><label class="lbl" for="note-text">โน๊ต ${req}</label><textarea class="input" id="note-text" name="text" maxlength="500" placeholder="เช่น ช่วงนี้กินน้อย ชอบขนมยี่ห้อใหม่" aria-required="true">${esc(n.text)}</textarea></div>
    <div class="field"><span class="lbl">แนบรูป <span class="stamp">ตัวอย่าง ไม่บันทึกรูป</span></span><label class="polaroid pslot one"><span class="photo"><span class="letter">+</span></span><span class="pl">เลือกรูป</span><input type="file" class="sr-only" accept="image/*" data-photo="note:draft" aria-label="แนบรูปในโน๊ต (ตัวอย่าง ไม่บันทึกรูป)"></label></div>
    <div class="btn-row">${isNew?'':`<button type="button" class="btn soft-danger" data-act="delNote" data-id="${n.id}">ลบ</button>`}<button type="submit" class="btn yellow">บันทึกโน๊ต</button></div></form>`)}
function remSheet(r,petId){const isNew=!r;r=r||{title:'',petId:petId||st.selPet||st.pets[0].id,time:'08:00',start:todayIso(),end:'',paused:false};if(!pet(r.petId))r.petId=st.pets[0].id;
  openSheet(`${sheetHead(isNew?'ตั้งเตือนประจำ':'แก้ไขเตือนประจำ','เช่น ป้อนยาทุกวัน ตั้งครั้งเดียวจบ','reminder')}
   <form id="remForm" data-id="${isNew?'':r.id}" novalidate>${reqNote}
    <p class="lead-box"><b>เตือนในแอปเท่านั้น</b> ไม่ส่ง LINE หรือแจ้งเตือนมือถือ</p>
    <div class="field" data-f="title"><label class="lbl" for="rem-title">ชื่อเรื่อง ${req}</label><input class="input" id="rem-title" name="title" value="${esc(r.title)}" maxlength="60" placeholder="เช่น ป้อนยาแก้อักเสบ" aria-required="true"></div>
    <fieldset class="field"><legend class="lbl">น้องตัวไหน</legend>${petStickers('petId',[r.petId],'radio')}</fieldset>
    <div class="two"><div class="field" data-f="time"><label class="lbl" for="rem-time">เวลา ${req}</label>${tIn('time',r.time,'rem-time',{req:1})}</div><div class="field"><span class="lbl">ทำซ้ำ</span><span class="pill yellow lg">ทุกวัน</span><p class="hint-s">รอบนี้มีแบบทุกวันอย่างเดียว</p></div></div>
    <div class="two"><div class="field" data-f="start"><label class="lbl" for="rem-start">วันเริ่ม ${req}</label>${dIn('start',r.start,'rem-start',{min:MIN_DATE,req:1})}</div><div class="field" data-f="end"><label class="lbl" for="rem-end">วันสิ้นสุด ${opt('(ไม่ใส่ = ไม่มีวันจบ)')}</label>${dIn('end',r.end,'rem-end',{min:r.start})}</div></div>
    <div class="btn-row">${isNew?'':`<button type="button" class="btn soft-danger" data-act="delRem" data-id="${r.id}">ลบ</button>`}<button type="submit" class="btn yellow">บันทึกเตือน</button></div></form>`)}

/* ---------- validation ---------- */
const fdata=f=>{const o={};new FormData(f).forEach((v,k)=>{if(typeof v==='string')o[k]=v.trim()});return o};
const fall=(f,n)=>new FormData(f).getAll(n).map(String);
function clearErrs(f){f.querySelectorAll('.err-msg').forEach(e=>e.remove());f.querySelectorAll('.has-err').forEach(e=>e.classList.remove('has-err'));f.querySelectorAll('[aria-invalid]').forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby')})}
function showErrs(f,errs){clearErrs(f);const keys=Object.keys(errs);if(!keys.length)return true;let first=null;
  keys.forEach((k,i)=>{const box=f.querySelector(`[data-f="${k}"]`);if(!box)return;box.classList.add('has-err');const id='err-'+k;
    const m=document.createElement('p');m.className='err-msg';m.id=id;m.innerHTML=I.warn+'<span>'+esc(errs[k])+'</span>';box.appendChild(m);
    const inp=box.querySelector('input:not([type=hidden]):not([hidden]),select,textarea');if(inp){inp.setAttribute('aria-invalid','true');inp.setAttribute('aria-describedby',id);if(!first)first=inp}});
  if(first){first.focus();scrollToEl(first,true)}
  toast('ยังกรอกไม่ครบ '+keys.length+' จุด ดูข้อความสีแดงนะ');return false}
const parseKg=s=>{s=String(s||'').replace(',','.').trim();if(!s)return null;if(!/^\d{1,3}(\.\d{1,2})?$/.test(s))return NaN;return Number(s)};
const kgErr=n=>Number.isNaN(n)?'ใส่เป็นตัวเลขนะ เช่น 4.2 (ทศนิยมไม่เกิน 2 ตำแหน่ง)':(n<=0?'น้ำหนักต้องมากกว่า 0 กก.':(n>150?'เกิน 150 กก. ดูหน่อยว่าพิมพ์ผิดไหม':''));
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parse(s).getTime());

/* ---------- submit handlers ---------- */
const H={
  petForm(f){const d=fdata(f);const id=f.dataset.id;const e={};
    if(!d.name)e.name='ยังไม่ได้ใส่ชื่อน้อง';
    let breed='';if(BREEDS[d.species]){if(d.breedSel==='__other'){if(!d.breedOther)e.breedOther='เลือก "อื่นๆ" แล้ว พิมพ์ชื่อสายพันธุ์ด้วยนะ';breed=d.breedOther||''}else breed=d.breedSel||''}else breed=d.breedText||'';
    let birth='';const bp=d.birthPrec||'';
    if(bp==='y'){if(!d.birthY)e.birthY='เลือกปีเกิดด้วยนะ';birth=d.birthY}
    else if(bp==='ym'){if(!d.birthY)e.birthY='เลือกปีเกิดด้วยนะ';if(!d.birthM)e.birthM='เลือกเดือนเกิดด้วยนะ';birth=d.birthY+'-'+d.birthM;if(d.birthY&&d.birthM&&birth>todayIso().slice(0,7))e.birthM='เดือนเกิดอยู่ในอนาคต เลือกใหม่นะ'}
    else if(bp==='ymd'){if(!d.birthD)e.birthD='เลือกวันเกิดด้วยนะ';else if(!validDate(d.birthD))e.birthD='วันที่ไม่ถูกต้อง';else if(d.birthD>todayIso())e.birthD='วันเกิดอยู่ในอนาคตไม่ได้';birth=d.birthD}
    const color=d.color||'white';if(color==='other'&&!d.colorOther)e.colorOther='เลือก "อื่นๆ" แล้ว ใส่ชื่อสีด้วยนะ';
    let kg=null;if(!id&&d.weight){kg=parseKg(d.weight);const m=kgErr(kg);if(m)e.weight=m}
    if(!showErrs(f,e))return;
    const data={name:d.name,species:d.species||'other',breed,birth:bp?birth:'',birthPrec:bp,sex:d.sex||'u',color,colorOther:color==='other'?d.colorOther:'',look:d.look||'',notes:d.notes||''};
    if(id){const p=pet(id);if(!p)return;Object.assign(p,data);save();toast('บันทึกการแก้ไขแล้ว');go('#/pet/'+id)}
    else{const p=Object.assign({id:uid(),weights:kg?[{id:uid(),date:todayIso(),kg}]:[]},data);st.pets.push(p);st.selPet=p.id;st.onboarded=true;save();toast('เพิ่ม'+p.name+'แล้ว');go('#/pet/'+p.id)}},
  vacForm(f){const d=fdata(f);const e={};const id=f.dataset.id;
    if(!d.type)e.type='เลือกชนิดวัคซีนก่อนนะ';if(d.type==='other'&&!d.name)e.name='ใส่ชื่อวัคซีนหรือยาด้วยนะ';
    if(!d.given)e.given='ใส่วันที่ฉีดด้วยนะ';else if(!validDate(d.given))e.given='วันที่ไม่ถูกต้อง';else if(d.given>todayIso())e.given='วันที่ฉีดอยู่ในอนาคตไม่ได้ ถ้ายังไม่ฉีดให้ลงเป็นนัดหมายแทน';
    if(d.next){if(!validDate(d.next))e.next='วันที่ไม่ถูกต้อง';else if(d.given&&d.next<=d.given)e.next='ครั้งถัดไปต้องหลังวันที่ฉีด'}
    if(!showErrs(f,e))return;
    const data={type:d.type,name:d.type==='other'?d.name:'',given:d.given,next:d.next||'',note:d.note||''};
    if(id){const v=st.vaccines.find(x=>x.id===id);if(v)Object.assign(v,data)}else st.vaccines.push(Object.assign({id:uid(),petId:f.dataset.pet},data));
    save();closeSheet();rerender();toast(id?'แก้ไขวัคซีนแล้ว':'บันทึกวัคซีนแล้ว'+(data.next?' นัดถัดไปไปโผล่ในหน้านัดหมายด้วยนะ':''))},
  visitForm(f){const d=fdata(f);const e={};const id=f.dataset.id;
    if(!d.date)e.date='ใส่วันที่ไปหาหมอด้วยนะ';else if(!validDate(d.date))e.date='วันที่ไม่ถูกต้อง';else if(d.date>todayIso())e.date='วันที่อยู่ในอนาคตไม่ได้ ถ้ายังไม่ไปให้ลงเป็นนัดหมาย';
    if(!d.reason)e.reason='บอกหน่อยว่าไปหาหมอเรื่องอะไร';if(!showErrs(f,e))return;
    const data={date:d.date,reason:d.reason,clinic:d.clinic||'',notes:d.notes||''};
    if(id){const v=st.visits.find(x=>x.id===id);if(v)Object.assign(v,data)}else st.visits.push(Object.assign({id:uid(),petId:f.dataset.pet},data));
    save();closeSheet();rerender();toast('บันทึกการหาหมอแล้ว')},
  apptForm(f){const d=fdata(f);const e={};const id=f.dataset.id;const type=d.type||'other';
    const pets=id?[d.petId]:fall(f,'pets');if(!id&&!pets.length)e.pets='เลือกน้องอย่างน้อย 1 ตัว';
    let vacs=[];if(type==='vaccine'){vacs=fall(f,'vac');if(!vacs.length)e.vac='เลือกวัคซีนอย่างน้อย 1 ชนิด';if(vacs.includes('other')&&!d.vacName)e.vacName='ใส่ชื่อวัคซีนอื่นๆ ด้วยนะ'}
    if(type!=='vaccine'&&!d.title)e.title='ใส่หัวข้อนัดด้วยนะ เช่น ตรวจสุขภาพประจำปี';
    if(!d.date)e.date='เลือกวันที่นัดด้วยนะ';else if(!validDate(d.date))e.date='วันที่ไม่ถูกต้อง';else if(d.date>addYears(3))e.date='นัดได้ไม่เกิน 3 ปีข้างหน้า';
    if(!showErrs(f,e))return;
    const keyOf=v=>v==='other'?'other:'+d.vacName:v;const base={type,time:d.time||'',place:d.place||'',notes:d.notes||'',date:d.date};
    const mkTitle=k=>d.title||(type==='vaccine'?'ฉีด'+keyLabel(k):d.title);
    if(id){const a=st.appts.find(x=>x.id===id);if(!a)return;const k=type==='vaccine'?keyOf(vacs[0]):'';
      const moved=a.date!==d.date;Object.assign(a,base,{petId:d.petId,vacKey:k,title:mkTitle(k)});if(moved&&a.status==='done'&&diff(d.date)>=0){a.status='planned';delete a.doneAt}
      save();closeSheet();rerender();toast(moved?'เลื่อนนัดเป็น '+fmt(d.date)+' แล้ว':'แก้ไขนัดแล้ว');return}
    let n=0,skipped=0;pets.forEach(pid=>{const p=pet(pid);if(!p)return;
      if(type==='vaccine')vacs.forEach(v=>{const vm=VACMAP[v];if(vm&&vm.species!=='all'&&vm.species!==p.species){skipped++;return}const k=keyOf(v);st.appts.push(Object.assign({id:uid(),petId:pid,title:mkTitle(k),status:'planned',vacKey:k},base));n++});
      else{st.appts.push(Object.assign({id:uid(),petId:pid,title:d.title,status:'planned',vacKey:''},base));n++}});
    if(!n){showErrs(f,{vac:'วัคซีนที่เลือกไม่ตรงกับชนิดของน้องที่เลือก'});return}
    save();closeSheet();rerender();toast(`เพิ่มนัด ${n} รายการแล้ว`+(skipped?` (ข้าม ${skipped} ที่ไม่ตรงชนิดสัตว์)`:''))},
  weightForm(f){const d=fdata(f);const e={};const kg=parseKg(d.kg);
    if(kg==null)e.kg='ใส่น้ำหนักด้วยนะ';else{const m=kgErr(kg);if(m)e.kg=m}
    if(!d.wdate)e.wdate='ใส่วันที่ชั่งด้วยนะ';else if(!validDate(d.wdate))e.wdate='วันที่ไม่ถูกต้อง';else if(d.wdate>todayIso())e.wdate='วันที่ชั่งอยู่ในอนาคตไม่ได้';
    if(!showErrs(f,e))return;const p=pet(f.dataset.pet);if(!p)return;p.weights=p.weights||[];p.weights.push({id:uid(),date:d.wdate,kg});save();rerender();weightSheet(p.id);toast('บันทึกน้ำหนัก '+kg+' กก. แล้ว')},
  noteForm(f){const d=fdata(f);if(!showErrs(f,d.text?{}:{text:'เขียนอะไรสักหน่อยก่อนบันทึกนะ'}))return;const id=f.dataset.id;
    if(id){const n=st.notes.find(x=>x.id===id);if(n){n.text=d.text;n.updated=todayIso()}}else st.notes.push({id:uid(),petId:f.dataset.pet,text:d.text,created:todayIso(),updated:todayIso()});
    save();closeSheet();rerender();toast('บันทึกโน๊ตแล้ว')},
  remForm(f){const d=fdata(f);const e={};const id=f.dataset.id;
    if(!d.title)e.title='ใส่ชื่อเรื่องที่จะให้เตือนด้วยนะ';if(!d.time)e.time='ใส่เวลาที่จะให้เตือนด้วยนะ';
    if(!d.start)e.start='ใส่วันเริ่มด้วยนะ';else if(!validDate(d.start))e.start='วันที่ไม่ถูกต้อง';
    if(d.end){if(!validDate(d.end))e.end='วันที่ไม่ถูกต้อง';else if(d.start&&d.end<d.start)e.end='วันสิ้นสุดต้องไม่ก่อนวันเริ่ม'}
    if(!showErrs(f,e))return;const data={title:d.title,petId:d.petId,time:d.time,start:d.start,end:d.end||''};
    if(id){const r=st.reminders.find(x=>x.id===id);if(r)Object.assign(r,data)}else st.reminders.push(Object.assign({id:uid(),paused:false},data));
    save();closeSheet();rerender();toast('ตั้งเตือนประจำแล้ว เตือนในแอปเท่านั้น')},
  memberForm(f){const d=fdata(f);const e={};const owner=d.role==='owner';const ps=fall(f,'mpets').filter(id=>pet(id));
    if(!d.mname)e.mname='ใส่ชื่อสมาชิกด้วยนะ';if(!owner&&st.pets.length&&!ps.length)e.mpets='เลือกน้องที่จะแชร์อย่างน้อย 1 ตัว';if(!showErrs(f,e))return;
    st.family.members.push({id:uid(),name:d.mname,role:owner?'owner':'carer',pets:owner?st.pets.map(p=>p.id):ps});save();rerender();
    toast('เพิ่ม'+d.mname+'แล้ว · '+(owner||ps.length===st.pets.length?'ดูได้ทุกตัว':'แชร์ '+ps.length+' ตัว')+' (ตัวอย่าง)');const m=$('#m-name');if(m)m.focus()},
  memberPetsForm(f){const ps=fall(f,'mpets').filter(id=>pet(id));if(!showErrs(f,ps.length?{}:{mpets:'เลือกอย่างน้อย 1 ตัว ถ้าไม่อยากแชร์เลย ให้เอาสมาชิกออกแทน'}))return;
    const mb=st.family.members.find(x=>x.id===f.dataset.id);if(!mb)return;mb.pets=ps;save();closeSheet();rerender();toast('แก้น้องที่'+mb.name+'ดูได้แล้ว (ตัวอย่าง)')},
  filterForm(f){const all=(n,list)=>{const v=fall(f,n);return v.length===list.length?[]:v};
    const pets=all('fpets',st.pets),types=all('ftypes',Object.keys(ATYPE));setFilter(pets,types,pets.length||types.length?'กรองนัดหมายแล้ว':'แสดงนัดทั้งหมดแล้ว')}
};
document.addEventListener('submit',e=>{const f=e.target;if(!H[f.id])return;e.preventDefault();if(f.dataset.busy)return;f.dataset.busy='1';
  const b=f.querySelector('[type=submit]');if(b)b.disabled=true;
  try{H[f.id](f)}finally{setTimeout(()=>{delete f.dataset.busy;if(b&&document.contains(b))b.disabled=false},400)}});

/* ---------- inputs ---------- */
function onChoice(btn){const box=btn.closest('[data-choice]');const name=box.dataset.choice;const val=btn.dataset.val;const f=btn.closest('form');
  box.querySelectorAll('button').forEach(b=>{const on=b===btn;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
  const h=f&&f.querySelector(`input[type=hidden][name="${name}"]`);if(h)h.value=val;
  if(name==='species'){const bf=f.querySelector('#breedField');if(bf)bf.outerHTML=breedField(val,'')}
  if(name==='birthPrec')f.querySelectorAll('[data-birth]').forEach(el=>{el.hidden=!el.dataset.birth.split(' ').includes(val)});
  if(name==='type'){const vp=f.querySelector('#vacPick');if(vp)vp.hidden=val!=='vaccine';const tl=f.querySelector('#title-label');if(tl)tl.innerHTML=titleLabel(val)}}
function rebuildVacPick(f){const vp=f.querySelector('#vacPick');if(!vp)return;const pets=fall(f,'pets');const checked=fall(f,'vac');const vn=(f.querySelector('[name=vacName]')||{}).value||'';
  vp.innerHTML=vacPickHtml(pets.length?pets:[st.pets[0].id],checked,vn,false)}
function onField(e){const t=e.target;
  if(t.classList&&t.classList.contains('dnative')){syncPick(t);const f=t.form;
    if(f&&t.name==='start'){const en=f.querySelector('[name=end]');if(en)en.min=t.value||MIN_DATE}
    if(f&&t.name==='given'){const nx=f.querySelector('[name=next]');if(nx)nx.min=t.value||MIN_DATE}}
  if(e.type!=='change')return;
  if(t.id==='pet-breed'){const s=t.parentElement.querySelector('.sub-field');if(s){s.hidden=t.value!=='__other';if(!s.hidden)s.querySelector('input').focus()}}
  if(t.name==='color'){const s=t.closest('fieldset').querySelector('.sub-field');if(s)s.hidden=t.value!=='other'}
  if(t.id==='vac-type'){const s=t.form.querySelector('[data-f="name"]');if(s)s.hidden=t.value!=='other'}
  if(t.name==='vac'){const s=t.form.querySelector('[data-f="vacName"]');if(s)s.hidden=!fall(t.form,'vac').includes('other')}
  if(t.name==='pets')rebuildVacPick(t.form);
  if(t.name==='petId'&&t.form&&t.form.id==='apptForm'){const vp=t.form.querySelector('#vacPick');if(vp){const ck=fall(t.form,'vac');const vn=(t.form.querySelector('[name=vacName]')||{}).value||'';vp.innerHTML=vacPickHtml([t.value],ck,vn,true)}}
  if(t.name==='role'&&t.form&&t.form.id==='memberForm'){const fs=t.form.querySelector('#mpetsField');if(fs){const own=t.value==='owner';fs.querySelectorAll('input').forEach(i=>{i.disabled=own;if(own)i.checked=true});const h=fs.querySelector('#mpetsHint');if(h)h.textContent=own?'เจ้าของเห็นน้องทุกตัวเสมอ':'ติ๊กออกตัวที่ไม่อยากให้คนนี้เห็น แก้ทีหลังได้ที่รายชื่อสมาชิก'}}
  if(t.dataset&&t.dataset.photo){const k=t.dataset.photo;const file=t.files&&t.files[0];if(!file)return;
    if(!/^image\//.test(file.type)){toast('ไฟล์นี้ไม่ใช่รูปภาพ เลือกใหม่นะ');t.value='';return}
    if(photoURLs[k])URL.revokeObjectURL(photoURLs[k]);photoURLs[k]=URL.createObjectURL(file);
    if(k==='note:draft'){const sl=t.closest('.pslot');sl.classList.add('has');const ph=sl.querySelector('.photo');const img=document.createElement('img');img.className='prev';img.alt='รูปที่แนบ (ตัวอย่าง)';img.src=photoURLs[k];ph.innerHTML='';ph.appendChild(img);sl.querySelector('.pl').textContent='เลือกแล้ว (ตัวอย่าง)'}
    else rerender();toast('แสดงรูปให้ดูแล้ว (ตัวอย่าง ไม่บันทึกรูป)')}}
document.addEventListener('input',onField);document.addEventListener('change',onField);

function copyText(txt,what){const ok=()=>toast('คัดลอก'+what+'แล้ว'),fb=()=>{const ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0;left:-9999px';document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand('copy')}catch(e){}ta.remove();r?ok():toast('คัดลอกไม่ได้ กดค้างที่ข้อความเพื่อคัดลอกเองนะ')};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(txt).then(ok,fb);else fb()}
function doMarkDone(a){a.status='done';a.doneAt=todayIso();
  if(a.type==='vaccine'&&a.vacKey){const other=a.vacKey.startsWith('other:');const given=a.date<=todayIso()?a.date:todayIso();
    const v={id:uid(),petId:a.petId,type:other?'other':a.vacKey,name:other?a.vacKey.slice(6):'',given,next:'',note:'บันทึกจากนัด '+a.title};st.vaccines.push(v);a.vacRecId=v.id}}
function undoDone(a){if(a.vacRecId){st.vaccines=st.vaccines.filter(v=>v.id!==a.vacRecId);delete a.vacRecId}a.status='planned';delete a.doneAt}
function recordShot(pid,key){const other=key.startsWith('other:');vacSheet(null,pid,{type:other?'other':key,name:other?key.slice(6):''})}
const findA=id=>st.appts.find(x=>x.id===id);
const rmById=(k,id)=>{st[k]=st[k].filter(x=>x.id!==id)};

/* ---------- clicks ---------- */
document.addEventListener('click',e=>{
  const dl=e.target.closest('[data-dlg]');if(dl){const fn=dlgOk;if(dl.dataset.dlg==='ok'){closeDlg();if(fn)fn()}else closeDlg();return}
  const ch=e.target.closest('[data-choice] button');if(ch){onChoice(ch);return}
  const ht=e.target.closest('[data-htab]');if(ht){healthTab=ht.dataset.htab;pendingFocus='#htab-'+healthTab;rerender();return}
  const pc=e.target.closest('[data-pchip]');if(pc){pendingFocus=`[data-pchip="${pc.dataset.pchip}"]`;go(pc.dataset.go);return}
  const md=e.target.closest('[data-mode]');if(md){AP.mode=md.dataset.mode;if(AP.mode==='day'&&!AP.sel)AP.sel=todayIso();pendingFocus=`[data-mode="${AP.mode}"]`;rerender();return}
  const wk=e.target.closest('[data-wk]');if(wk){const c=AP.cursor||weekStart(today());AP.cursor=new Date(c.getFullYear(),c.getMonth(),c.getDate()+7*Number(wk.dataset.wk));pendingFocus=`[data-wk="${wk.dataset.wk}"]`;rerender();return}
  const dy=e.target.closest('[data-day]');if(dy){AP.mode='day';AP.sel=dy.dataset.day;pendingFocus=`[data-day="${AP.sel}"]`;rerender();return}
  const g=e.target.closest('[data-go]');if(g&&!e.target.closest('[data-act]')){go(g.dataset.go);return}
  const b=e.target.closest('[data-act]');if(!b)return;const A=b.dataset.act,id=b.dataset.id,pid=b.dataset.pet,key=b.dataset.key;
  switch(A){
    case 'enter':st.onboarded=true;save();go(st.pets.length?'#/home':'#/pet/new');break;
    case 'undo':{const fn=toastUndo;hideToast();if(fn)fn();break}
    case 'reqClose':reqClose();break;
    case 'reset':st=seed();st.onboarded=true;healthTab='vac';Object.assign(AP,{mode:'all',sel:null,cursor:null,pets:[],types:[],from:'',showAll:false,showEnded:false});save();toast('รีเซ็ตเป็นข้อมูลตัวอย่างแล้ว');go('#/home');break;
    case 'delPet':{const p=pet(id);if(!p)break;confirmDelete('ลบ'+esc(p.name)+'?','ข้อมูลวัคซีน การหาหมอ นัดหมาย โน๊ต และเตือนประจำของ'+esc(p.name)+'จะหายทั้งหมด',()=>{
      withUndo(()=>{rmById('pets',id);['vaccines','visits','appts','notes','reminders'].forEach(k=>{st[k]=st[k].filter(x=>x.petId!==id)});st.family.members.forEach(m=>{if(Array.isArray(m.pets))m.pets=m.pets.filter(x=>x!==id)});if(st.selPet===id)st.selPet=st.pets[0]?st.pets[0].id:null},'ลบ'+p.name+'แล้ว');go('#/home')},'ลบน้อง');break}
    case 'weight':weightSheet(pid);break;
    case 'delWeight':{const p=pet(pid);if(!p)break;withUndo(()=>{p.weights=p.weights.filter(w=>w.id!==id)},'ลบน้ำหนักแล้ว');weightSheet(pid);break}
    case 'petPicker':petPickerSheet();break;
    case 'notif':notifSheet();break;
    case 'pickFor':if(b.dataset.for==='visit')visitSheet(null,pid);else vacSheet(null,pid);break;
    case 'addVac':if(pid||st.pets.length===1)vacSheet(null,pid||st.pets[0].id);else petChooseSheet('vac');break;
    case 'editVac':{const v=st.vaccines.find(x=>x.id===id);if(v)vacSheet(v);break}
    case 'vacGroup':vacGroupSheet(pid,key);break;
    case 'recordShot':recordShot(pid,key);break;
    case 'delVac':confirmDelete('ลบบันทึกวัคซีนนี้?','ประวัติเข็มนี้จะหายจากสมุดสุขภาพ',()=>{closeSheet();withUndo(()=>rmById('vaccines',id),'ลบบันทึกวัคซีนแล้ว')});break;
    case 'addVisit':if(pid||st.pets.length===1)visitSheet(null,pid||st.pets[0].id);else petChooseSheet('visit');break;
    case 'editVisit':{const v=st.visits.find(x=>x.id===id);if(v)visitSheet(v);break}
    case 'delVisit':confirmDelete('ลบบันทึกหาหมอนี้?','ผลตรวจและคำแนะนำหมอในรายการนี้จะหายไป',()=>{closeSheet();withUndo(()=>rmById('visits',id),'ลบบันทึกหาหมอแล้ว')});break;
    case 'addNote':noteSheet(null,pid);break;
    case 'editNote':{const n=st.notes.find(x=>x.id===id);if(n)noteSheet(n);break}
    case 'delNote':confirmDelete('ลบโน๊ตนี้?','ข้อความในโน๊ตนี้จะหายไป',()=>{closeSheet();withUndo(()=>rmById('notes',id),'ลบโน๊ตแล้ว')});break;
    case 'addAppt':if(!st.pets.length){go('#/pet/new');break}apptSheet(null,{pet:pid||undefined,type:b.dataset.type,date:b.dataset.date||undefined});break;
    case 'viewAppt':{const a=findA(id);if(a)apptDetail(a);break}
    case 'editAppt':{const a=findA(id);if(a)apptSheet(a);break}
    case 'reschedule':{const a=findA(id);if(a)apptSheet(a,{reschedule:true});break}
    case 'markDone':{const a=findA(id);if(!a)break;closeSheet();withUndo(()=>doMarkDone(a),a.type==='vaccine'&&a.vacKey?'ไปแล้ว ลงสมุดสุขภาพให้ด้วย':'บันทึกว่าไปแล้ว');break}
    case 'undoDone':{const a=findA(id);if(!a)break;undoDone(a);save();closeSheet();rerender();toast('ย้ายกลับไปเป็นนัดที่รอไปแล้ว');break}
    case 'delAppt':confirmDelete('ลบนัดนี้?','นัดนี้จะหายจากตารางนัดหมาย',()=>{closeSheet();withUndo(()=>rmById('appts',id),'ลบนัดแล้ว')},'ลบนัด');break;
    case 'viewDue':dueSheet(pid,key);break;
    case 'bookDue':{const gg=vacGroups(pid).find(x=>x.key===key);apptSheet(null,{pet:pid,type:'vaccine',vacKey:key,date:gg&&gg.next&&diff(gg.next)>0?gg.next:addDays(1)});break}
    case 'toggleAll':AP.showAll=!AP.showAll;pendingFocus='[data-act="toggleAll"]';rerender();break;
    case 'toggleEnded':AP.showEnded=!AP.showEnded;pendingFocus='[data-act="toggleEnded"]';rerender();break;
    case 'filterSheet':filterSheet();break;
    case 'resetFilter':setFilter([],[],'ล้างตัวกรองแล้ว แสดงนัดทั้งหมด');break;
    case 'clearFilter':AP.pets=[];AP.types=[];AP.showAll=false;pendingFocus='[data-act="filterSheet"]';rerender();toast('ล้างตัวกรองแล้ว แสดงนัดทั้งหมด');break;
    case 'editMemberPets':memberPetsSheet(id);break;
    case 'addRem':remSheet(null,pid);break;
    case 'editRem':{const r=st.reminders.find(x=>x.id===id);if(r)remSheet(r);break}
    case 'toggleRem':{const r=st.reminders.find(x=>x.id===id);if(!r)break;r.paused=!r.paused;save();pendingFocus=`[data-act="toggleRem"][data-id="${id}"]`;rerender();toast(r.paused?'พักเตือน "'+r.title+'" แล้ว':'เปิดเตือน "'+r.title+'" แล้ว');break}
    case 'delRem':{const r=st.reminders.find(x=>x.id===id);if(!r)break;confirmDelete('ลบเตือนประจำนี้?','"'+esc(r.title)+'" จะไม่เตือนอีก',()=>{closeSheet();withUndo(()=>rmById('reminders',id),'ลบเตือนแล้ว')});break}
    case 'copy':copyText(b.dataset.copy,b.dataset.what||'');break;
    case 'newCode':st.family.code=genCode();save();pendingFocus='[data-act="newCode"]';rerender();toast('สร้างรหัสใหม่แล้ว (ตัวอย่าง)');break;
    case 'delMember':{const m=st.family.members.find(x=>x.id===id);if(!m)break;if(m.role==='owner'){toast('เจ้าของลบออกไม่ได้');break}
      confirmDelete('เอา'+esc(m.name)+'ออก?','ถ้าเป็นของจริง คนนี้จะดูข้อมูลน้องไม่ได้อีก',()=>withUndo(()=>{st.family.members=st.family.members.filter(x=>x.id!==id)},'เอา'+m.name+'ออกแล้ว'),'เอาออก');break}
  }
});

/* ---------- keyboard ---------- */
const FOC='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
function trap(e,box){const els=[...box.querySelectorAll(FOC)].filter(x=>x.offsetParent!==null||x===document.activeElement);if(!els.length)return;const a=els[0],z=els[els.length-1];
  if(e.shiftKey&&(document.activeElement===a||!box.contains(document.activeElement))){e.preventDefault();z.focus()}else if(!e.shiftKey&&(document.activeElement===z||!box.contains(document.activeElement))){e.preventDefault();a.focus()}}
document.addEventListener('keydown',e=>{
  if(dlg.classList.contains('open')){if(e.key==='Escape'){e.preventDefault();closeDlg();return}if(e.key==='Tab')trap(e,dlg);return}
  if(layer.classList.contains('open')){if(e.key==='Escape'){e.preventDefault();reqClose();return}if(e.key==='Tab'){trap(e,layer.querySelector('.sheet'));return}}
  const tab=e.target.closest&&e.target.closest('[role=tab]');
  if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){const list=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')];let i=list.indexOf(tab);
    i=e.key==='Home'?0:e.key==='End'?list.length-1:(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length;e.preventDefault();list[i].focus();list[i].click()}
});

window.__tofu={get st(){return st},seed,migrate,save,migratedFrom};
route();
})();
