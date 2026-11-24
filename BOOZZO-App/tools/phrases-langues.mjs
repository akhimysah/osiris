// Liste les phrases anglaises et espagnoles de ui/langue.js, avec le nom de leur fichier audio.
import fs from 'node:fs';
import vm from 'node:vm';
const read = (name) => fs.readFileSync(new URL('../ui/' + name, import.meta.url), 'utf8');
const ctx = { location: { search: '' }, navigator: { language: 'fr' }, URLSearchParams, document: { documentElement: {} } };
const { PAROLES, splitSentences, voiceKey } = vm.runInNewContext(read('paroles.js') + '\n' + read('langue.js') + '\n({ PAROLES, splitSentences, voiceKey })', ctx);
const out = {};
for (const [lang, p] of Object.entries(PAROLES)) {
  const map = new Map();
  for (const text of [...p.stories.map((s) => s.text), ...p.jokes, ...Object.values(p.replies), p.ui['Choisis une histoire.'], p.ui['Je t’écoute.']])
    for (const sentence of splitSentences(text)) map.set(voiceKey(sentence), sentence);
  out[lang] = [...map];
}
console.log(JSON.stringify(out));
