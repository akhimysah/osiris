import fs from 'node:fs';
import path from 'node:path';
// Assemble le dossier ui/ (sous-dossiers compris) et server.mjs dans dist/server/index.js.
const mime={jpeg:'image/jpeg',html:'text/html; charset=utf-8',js:'text/javascript',css:'text/css',webp:'image/webp',svg:'image/svg+xml',json:'application/json',bin:'application/octet-stream'};
const files={};
const walk=(dir,prefix)=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full,prefix+entry.name+'/');else files[prefix+entry.name]=[mime[entry.name.split('.').pop()]||'application/octet-stream',fs.readFileSync(full).toString('base64')]}};
walk('ui','/');
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','const FILES='+JSON.stringify(files)+';\n'+fs.readFileSync('server.mjs','utf8'));
