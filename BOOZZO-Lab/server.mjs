const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const ids={wa:310633997,yt:544007664,tk:835599320,safari:1146562112};
const allowedTests=['wa','safari','cam','photo','yt','tk','notif','micro','voix','face','iris','qr'];
const states=['à préparer','en test','validé','à retester','bloqué','à confirmer'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
async function assetsIcon(k,env){
 const key='icons/'+k;
 let saved=await env.BUCKET.get(key);
 if(saved)return new Response(saved.body,{headers:{'Content-Type':saved.httpMetadata.contentType,'Cache-Control':'public,max-age=86400'}});
 const info=await fetch('https://itunes.apple.com/lookup?country=fr&id='+ids[k]);
 const artwork=(await info.json()).results[0]?.artworkUrl100;
 if(!artwork||!new URL(artwork).hostname.endsWith('.mzstatic.com'))return new Response(null,{status:404});
 const f=await fetch(artwork);if(!f.ok)return new Response(null,{status:404});
 const bytes=await f.arrayBuffer(),type=f.headers.get('content-type')||'image/png';
 await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});
 return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public,max-age=86400'}});
}
async function api(req,env,path){
 const b=env.BUCKET,post=req.method==='POST';
 if(post&&req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({},403);
 if(req.method!=='GET'&&!post)return json({},405);
 if(path==='/api/trials'&&!post){
  const entries=[];let cursor;
  do{const page=await b.list({prefix:'trials/',cursor});for(let i=0;i<page.objects.length;i+=20){const batch=await Promise.all(page.objects.slice(i,i+20).map(async o=>(await b.get(o.key)).json()));entries.push(...batch)}cursor=page.truncated?page.cursor:undefined}while(cursor);
  return json(entries.sort((a,b)=>b.date.localeCompare(a.date)));
 }
 if(path==='/api/trials'&&post){
  if(Number(req.headers.get('content-length'))>5700000)return json({},413);
  const d=await req.json();if(!uuid.test(d.id)||!allowedTests.includes(d.test)||!states.includes(d.status))return json({},400);
  const key='trials/'+d.id;if(await b.head(key))return json({id:d.id});
  let record={id:d.id,test:d.test,status:d.status,date:new Date().toISOString(),hasImage:false};
  for(const f of ['device','version','action','result','place','proof','problem','next']){if(typeof d[f]!=='string'||d[f].length>4000)return json({},400);record[f]=d[f].trim()}
  if(!record.device||!record.action||!record.result)return json({},400);
  if(d.image){let m=/^data:(image\/(?:png|jpeg|webp));base64,/.exec(d.image);if(!m||d.image.length>5650000)return json({},400);
   let bytes=Uint8Array.from(atob(d.image.slice(m[0].length)),c=>c.charCodeAt(0));await b.put('proof/'+d.id,bytes,{httpMetadata:{contentType:m[1]}});record.hasImage=true}
  await b.put(key,JSON.stringify(record),{onlyIf:{etagDoesNotMatch:'*'}});return json({id:d.id},201);
 }
 const id=path.split('/').pop();
 if(path.startsWith('/api/proof/')&&uuid.test(id)&&!post){const proof=await b.get('proof/'+id);return proof?new Response(proof.body,{headers:{'Content-Type':proof.httpMetadata.contentType,'X-Content-Type-Options':'nosniff','Cache-Control':'private,no-store'}}):json({},404)}
 if(path==='/api/pair'&&post){const {scope}=await req.json();if(!['Caméra','Microphone','Notifications','Appel WhatsApp','Navigation'].includes(scope))return json({},400);const p={id:crypto.randomUUID(),scope,expires:Date.now()+600000};await b.put('pair/'+p.id,JSON.stringify(p));return json(p,201)}
 if(path.startsWith('/api/pair/')&&uuid.test(id)){let key='pair/'+id,obj=await b.get(key);if(!obj)return json({},404);let p=await obj.json();if(Date.now()>p.expires)return json({},410);if(post){const d=await req.json();if(!['iPhone','Android'].includes(d.os))return json({},400);if(p.os&&p.os!==d.os)return json({},409);p.os=d.os;if(!await b.put(key,JSON.stringify(p),{onlyIf:{etagMatches:obj.etag}}))return json({},409)}return json(p)}
 return json({},404);
}
export default {async fetch(req,env){try{const path=new URL(req.url).pathname;if(path.startsWith('/api/'))return await api(req,env,path);const k=path.split('/').pop();if(path.startsWith('/brand/')&&Object.hasOwn(ids,k))return await assetsIcon(k,env);const asset=FILES[path==='/'?'/index.html':path];if(!asset)return new Response('Introuvable',{status:404});return new Response(Uint8Array.from(atob(asset[1]),c=>c.charCodeAt(0)),{headers:{'Content-Type':asset[0],'X-Content-Type-Options':'nosniff'}})}catch{return json({error:'Service temporairement indisponible'},503)}}};
