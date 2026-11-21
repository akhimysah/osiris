import fs from 'node:fs';
const mime={jpeg:'image/jpeg',html:'text/html; charset=utf-8',js:'text/javascript',css:'text/css',webp:'image/webp',svg:'image/svg+xml'};
const files=Object.fromEntries(fs.readdirSync('ui').map(k=>['/'+k,[mime[k.split('.').pop()],fs.readFileSync('ui/'+k).toString('base64')]]));
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','const FILES='+JSON.stringify(files)+';\n'+fs.readFileSync('server.mjs','utf8'));

