import {researchReadiness,researchApi} from './research-engine.js';
const ROSTER=/*ROSTER*/null;
const SEED=/*SEED*/null;
const PAGE=/*PAGE*/null;
const SHEET='https://docs.google.com/spreadsheets/d/1UiOOr3965Ul2rHaXjN4OEGp6B_c14Anf64vbcFDAufk/edit#gid=2141759653';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json'}});
export function decode(s=''){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),1114111)));}
const strip=s=>decode(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const norm=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
export function parseFeed(xml){return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].slice(0,100).map(([,item])=>{const tag=n=>decode(item.match(new RegExp('<'+n+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+n+'>'))?.[1]||'').trim();const link=tag('link');return {title:strip(tag('title')).slice(0,600),url:/^https:\/\//.test(link)?link:null,publishedAt:tag('pubDate'),publisher:strip(tag('source')),snippet:strip(tag('description')).slice(0,600)};}).filter(x=>x.title&&x.url);}
export function matchAthletes(title,players){const s=' '+norm(title)+' ';return players.filter(p=>{let n=norm(p.name).replace(/\b(jr|iii|ii)\b/g,'').trim();let parts=n.split(' ').filter(Boolean);if(parts.length<2)return false;return s.includes(' '+n+' ')||s.includes(' '+parts[0]+' '+parts.at(-1)+' ');}).map(p=>p.id);}
const field=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
function safeLink(v){try{let u=new URL(v);return u.protocol==='https:'?u.href:null;}catch{return null;}}
function dateRange(start,end){if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))return false;let a=Date.parse(start),b=Date.parse(end);return Number.isFinite(a)&&Number.isFinite(b)&&b>=a&&b-a<=30*86400000&&new Date(a).toISOString().slice(0,10)===start&&new Date(b).toISOString().slice(0,10)===end&&b<Date.now()+86400000;}
async function readObjects(bucket,prefix,limit=100){let list=await bucket.list({prefix,limit});let objects=await Promise.all(list.objects.map(async o=>{let v=await bucket.get(o.key);return v?await v.json():null;}));return objects.filter(Boolean);}
export default {async fetch(req,env){const url=new URL(req.url);try{
 if(url.pathname==='/')return new Response(PAGE,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'"}});
 if(url.pathname==='/api/bootstrap'&&req.method==='GET')return json({roster:ROSTER,seed:SEED,sheet:SHEET,storageReady:!!env.BUCKET,research:researchReadiness(env)});
 if(!url.pathname.startsWith('/api/'))return new Response('Not found',{status:404});
 if(!env.BUCKET)return json({error:'Research storage is unavailable. Saved research remains visible; updates cannot be saved yet.'},503);
 if(url.pathname==='/api/library'&&req.method==='GET'){const [runs,notes,researchJobs]=await Promise.all([readObjects(env.BUCKET,'runs/',100),readObjects(env.BUCKET,'notes/',200),readObjects(env.BUCKET,'research/index/',100)]);return json({runs:runs.sort((a,b)=>b.completedAt.localeCompare(a.completedAt)),notes:notes.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),researchJobs:researchJobs.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))});}
 if(url.pathname==='/api/research/status'&&req.method==='GET')return researchApi(req,url,null,env,ROSTER);
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('origin')!==url.origin)return json({error:'This action must be run from the Research Room.'},403);
 if(!req.headers.get('oai-authenticated-user-id')&&url.hostname!=='localhost'&&url.hostname!=='127.0.0.1')return json({error:'Sign in to run updates or save research.'},401);
 if(Number(req.headers.get('content-length')||0)>20000)return json({error:'Request too large'},413);
 const body=await req.json();
 if(url.pathname.startsWith('/api/research/'))return researchApi(req,url,body,env,ROSTER);
 if(url.pathname==='/api/update'){
  let school=field(body.school,80),start=field(body.start,10),end=field(body.end,10);let players=ROSTER.filter(p=>p.school===school);
  if(!players.length||!dateRange(start,end))return json({error:'Choose a roster school and a valid date range of 31 days or fewer.'},400);
  const id=field(body.requestId,80);if(!/^[a-zA-Z0-9-]{12,80}$/.test(id))return json({error:'Invalid update request'},400);
  let existing=await env.BUCKET.get('requests/'+id+'/'+encodeURIComponent(school));if(existing)return json(await existing.json());
  const before=new Date(Date.parse(end)+86400000).toISOString().slice(0,10);const aliases={'Ole Miss':'"Ole Miss"','USC':'"USC" Trojans','UCLA':'"UCLA" Bruins','Texas':'"Texas Longhorns"','Ohio State':'"Ohio State" Buckeyes'};
  const q=(aliases[school]||'"'+school+'"')+' football after:'+start+' before:'+before;
  let response=await fetch('https://news.google.com/rss/search?q='+encodeURIComponent(q)+'&hl=en-US&gl=US&ceid=US:en',{signal:AbortSignal.timeout(20000),headers:{'Accept':'application/rss+xml, application/xml, text/xml'}});
  if(!response.ok)throw new Error('News source returned '+response.status+'. Prior research has been retained.');
  let xml=await response.text();if(!xml.includes('<rss'))throw new Error('The news source did not return a readable feed. Prior research has been retained.');
  const items=parseFeed(xml).filter(x=>{let t=Date.parse(x.publishedAt);return Number.isFinite(t)&&t>=Date.parse(start)&&t<Date.parse(before);}).map(x=>({...x,athletes:matchAthletes(x.title,players),status:'unreviewed'}));
  const run={id:id+'-'+school,school,start,end,completedAt:new Date().toISOString(),items,status:'success',query:q,method:'Google News RSS headline discovery; original articles require verification',coverage:'Team news scan; title matching only. No matched headlines does not mean an athlete had no news.'};
  await env.BUCKET.put('runs/'+run.completedAt.replace(/:/g,'-')+'-'+id+'-'+encodeURIComponent(school)+'.json',JSON.stringify(run));
  await env.BUCKET.put('requests/'+id+'/'+encodeURIComponent(school),JSON.stringify(run));return json(run);
 }
 if(url.pathname==='/api/notes'){
  let kind=body.kind==='team'?'team':'player',school=field(body.school,80),athleteId=field(body.athleteId,160),text=field(body.text,4000),source=safeLink(body.source),eventDate=field(body.eventDate,10);
  if(!ROSTER.some(p=>p.school===school)||!text||!dateRange(eventDate,eventDate))return json({error:'Choose a school, event date and research note.'},400);
  if(kind==='player'&&(!ROSTER.some(p=>p.id===athleteId&&p.school===school)||!source))return json({error:'Player research needs a matching athlete and an HTTPS source link.'},400);
  let decision=['hold','review-up','review-down','needs-data'].includes(body.decision)?body.decision:'needs-data';
  let id=field(body.requestId,80);if(!/^[a-zA-Z0-9-]{12,80}$/.test(id))return json({error:'Invalid save request'},400);
  let note={id,kind,school,athleteId:kind==='player'?athleteId:null,text,source,eventDate,decision:kind==='team'?decision:null,contentAngle:field(body.contentAngle,1000),createdAt:new Date().toISOString(),status:'reviewed'};
  await env.BUCKET.put('notes/'+id+'.json',JSON.stringify(note));return json(note,201);
 }
 return json({error:'Not found'},404);
 }catch(e){return json({error:e instanceof SyntaxError?'Invalid request data':String(e.message||'Unable to complete this action')},502);}}};
