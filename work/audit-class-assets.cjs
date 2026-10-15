// Audit current shared skill metadata AND the independently constructed result URLs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const acorn=require('../scripts/audit/node_modules/acorn');
const W=__dirname,index=JSON.parse(fs.readFileSync(path.join(W,'live-index.json')));
const key=p=>p.key?.name??p.key?.value;
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn);}
let catalog,source;
for(const file of index.activeFiles){const text=fs.readFileSync(path.join(W,'chunks',file),'utf8');if(!text.includes('skillCore1:')||!text.includes('시아:'))continue;
 walk(acorn.parse(text,{ecmaVersion:'latest'}),n=>{if(n.type!=='ObjectExpression')return;const keys=n.properties.map(key);if(!['시아','에렐','나이트로드'].every(k=>keys.includes(k))||!n.properties.find(p=>key(p)==='시아')?.value?.properties?.some(p=>key(p)==='skillCore1'))return;
  catalog={};source=file;for(const p of n.properties){const slots={};for(const s of p.value.properties||[]){const props=s.value.properties||[];const title=props.find(p=>key(p)==='title')?.value?.value;const url=props.find(p=>key(p)==='url')?.value?.value;if(typeof title==='string'&&typeof url==='string')slots[key(s)]={title,url};}catalog[key(p)]=slots;}
 });}
if(!catalog||Object.keys(catalog).length<50)throw Error('Current class catalog was not recognized');
const derived={masteryCore1:2,masteryCore2:7,masteryCore3:8,masteryCore4:9,reinCore1:3,reinCore2:4,reinCore3:5,reinCore4:6,skillCore1:1,skillCore2:10,skillCore3:12,generalCore3:11};
const refs=[],empty=[];
for(const [name,slots] of Object.entries(catalog)){const stem=slots.skillCore1.url.replace(/_1\.png$/,'');for(const [slot,s] of Object.entries(slots)){
 const unreleased=/^(미출시|XXX)$/.test(s.title);const row={class:name,slot,title:s.title,unreleased};
 if(s.url)refs.push({...row,view:'catalog',url:s.url});else empty.push({...row,displayed:slot in derived});
 if(slot in derived)refs.push({...row,view:'result',url:stem+'_'+derived[slot]+'.png'});
}}
const urls=[...new Set(refs.map(r=>r.url))],assets=[];let next=0;
async function fetchOne(url){try{const r=await fetch('https://maplescouter.com'+url,{signal:AbortSignal.timeout(20000)});const b=Buffer.from(await r.arrayBuffer());assets.push({url,status:r.status,type:r.headers.get('content-type'),bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}catch(e){assets.push({url,error:e.message});}}
(async()=>{await Promise.all(Array.from({length:6},async()=>{while(next<urls.length)await fetchOne(urls[next++]);}));
 const failed=assets.filter(r=>r.status!==200||!r.type?.startsWith('image/')).map(a=>({...a,references:refs.filter(r=>r.url===a.url)}));
 const report={at:new Date().toISOString(),source,classes:Object.keys(catalog).length,catalog,empty,assets,failed,unexpected:failed.filter(a=>a.references.some(r=>!r.unreleased))};
 fs.writeFileSync(path.join(W,'class-assets-current.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({classes:report.classes,assets:assets.length,empty:empty.length,displayedEmpty:empty.filter(x=>x.displayed),failed:failed.map(x=>({url:x.url,status:x.status,unreleased:x.references.every(r=>r.unreleased)})),unexpected:report.unexpected}));if(report.unexpected.length)process.exitCode=1;
})();
