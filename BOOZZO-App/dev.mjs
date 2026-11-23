import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
await import('./build.mjs');
const {default:worker}=await import('./dist/server/index.js');
const {createAssistant}=await import('./assistant.mjs');const assistant=createAssistant();
// Relais TURN facultatif pour les appels sur réseaux mobiles : TURN_URLS (séparées par des virgules), TURN_USERNAME, TURN_CREDENTIAL.
const turn=process.env.TURN_URLS?{urls:process.env.TURN_URLS.split(',').map(u=>u.trim()).filter(Boolean),username:process.env.TURN_USERNAME||'',credential:process.env.TURN_CREDENTIAL||''}:null;
const dataDir=process.env.DATA_DIR||'.local';mkdirSync(dataDir,{recursive:true});
const db=new DatabaseSync(dataDir+'/boozzo.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS objects (key TEXT PRIMARY KEY, value BLOB NOT NULL, mime TEXT, etag TEXT NOT NULL)');
const read=db.prepare('SELECT * FROM objects WHERE key=?');
const bucket={
 head(key){return db.prepare('SELECT etag FROM objects WHERE key=?').get(key)},
 get(key){const row=read.get(key);if(!row)return null;return {etag:row.etag,body:row.value,httpMetadata:{contentType:row.mime},json:()=>JSON.parse(Buffer.from(row.value).toString())}},
 list({prefix}){return {objects:db.prepare('SELECT key FROM objects WHERE substr(key,1,?)=? ORDER BY key').all(prefix.length,prefix),truncated:false}},
 put(key,value,options={}){const old=this.head(key),test=options.onlyIf;
  if((test?.etagDoesNotMatch==='*'&&old)||(test?.etagMatches&&test.etagMatches!==old?.etag))return null;
  const etag=randomUUID();db.prepare('INSERT OR REPLACE INTO objects VALUES(?,?,?,?)').run(key,Buffer.from(value),options.httpMetadata?.contentType||null,etag);return {etag}}
};
const env={BUCKET:bucket,...(assistant?{ASSISTANT:assistant}:{}),...(turn?{TURN:turn}:{}),...(process.env.YOUTUBE_API_KEY?{YOUTUBE_KEY:process.env.YOUTUBE_API_KEY}:{})};
const port=Number(process.env.PORT||4174),origin='http://127.0.0.1:'+port;
http.createServer(async(req,res)=>{try{
 const parts=[];let size=0;for await(const part of req){size+=part.length;if(size>6000000){res.writeHead(413).end();return}parts.push(part)}
 const proto=String(req.headers['x-forwarded-proto']||'http').split(',')[0].trim()==='https'?'https':'http';
 const request=new Request(new URL(req.url,proto+'://'+(req.headers.host||'127.0.0.1:'+port)),{method:req.method,headers:req.headers,body:parts.length?Buffer.concat(parts):undefined});
 const response=await worker.fetch(request,env);
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch{res.writeHead(500).end('Erreur du serveur local.')}}).listen(port,process.env.HOST||'127.0.0.1',()=>console.log('BeyaBear’s · '+origin+(assistant?' · assistant actif':' · assistant non configuré (ANTHROPIC_API_KEY absent)')));
