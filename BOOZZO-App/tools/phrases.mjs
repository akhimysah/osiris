// Liste les phrases que BOOZZO dit sans assistant (ui/paroles.js), avec le nom de leur fichier audio.
// Usage : node tools/phrases.mjs > phrases.json
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../ui/paroles.js', import.meta.url), 'utf8');
const { STORIES, JOKES, REPLIES, splitSentences, voiceKey } = vm.runInNewContext(source + '\n({ STORIES, JOKES, REPLIES, splitSentences, voiceKey })');
// Phrases fixes dites ailleurs dans l'application.
const extra = ['Choisis une histoire.', 'Je t’écoute.'];
const phrases = new Map();
for (const text of [...STORIES.map((story) => story.text), ...JOKES, ...Object.values(REPLIES), ...extra])
  for (const sentence of splitSentences(text)) phrases.set(voiceKey(sentence), sentence);
console.log(JSON.stringify([...phrases], null, 1));
