// Textes que BOOZZO dit sans assistant branché : histoires, blagues et petites réponses.
// Chaque phrase a un enregistrement dans ui/voix/ (voir tools/voix.py) : après une modification, régénérer les voix.

const STORIES = [
  {
    title: 'Le bateau de la lune',
    text: 'Il était une fois une petite peluche qui s’appelait BOOZZO. Elle avait un grand œil tout rond, qui brillait comme la lune. Chaque soir, quand la maison devenait silencieuse, son œil s’allumait doucement. Dedans, on voyait des étoiles, des nuages et parfois un petit bateau. Un soir, le bateau emmena BOOZZO jusqu’à une île où les arbres chantaient des berceuses. BOOZZO écouta, ferma son grand œil, et rapporta la plus douce des chansons. Depuis, quand un enfant a du mal à s’endormir, BOOZZO la fredonne tout bas. Bonne nuit.',
  },
  {
    title: 'L’explorateur du jardin',
    text: 'Un matin, BOOZZO mit son chapeau d’explorateur et son sac à dos. Aujourd’hui, dit-il, je pars découvrir le jardin. Il rencontra une fourmi très pressée, qui portait une miette plus grosse qu’elle. Puis un escargot, qui prenait tout son temps et saluait chaque fleur. BOOZZO apprit de la fourmi qu’on peut porter de grandes choses à plusieurs. Il apprit de l’escargot qu’on voit plus de merveilles quand on va doucement. Le soir, il rangea ces deux secrets dans son sac. Et il les garde pour toi.',
  },
  {
    title: 'Le nuage qui avait peur de pleuvoir',
    text: 'Tout en haut de la colline vivait un nuage qui avait peur de pleuvoir. Il croyait que ses gouttes feraient de la peine aux fleurs. BOOZZO leva son grand œil vers lui et lui dit : regarde en bas. Le nuage regarda, et vit des fleurs qui ouvraient leurs pétales en l’attendant. Alors il laissa tomber une petite pluie, toute fine, toute tiède. Les fleurs dansèrent, la terre sentit bon, et un arc-en-ciel apparut. Le nuage comprit que ce qu’il avait à donner était un cadeau. Et il n’eut plus jamais peur.',
  },
];
const JOKES = [
  'Que dit une peluche qui a bien mangé ? Je suis rembourrée !',
  'Pourquoi BOOZZO ne perd jamais rien ? Parce qu’il garde toujours l’œil dessus.',
  'Quel est le comble pour un œil ? De ne pas se sentir regardé.',
];
const REPLIES = {
  who: 'Je suis BOOZZO, ta peluche compagnon. Mon grand œil est un écran : j’y montre tes proches, tes vidéos et tes photos, et je peux te parler.',
  skills: 'Je peux appeler tes proches en vidéo, montrer des vidéos, prendre des photos, changer la couleur de mon œil et raconter des histoires. Dis par exemple : BOOZZO, raconte une histoire.',
  hello: 'Bonjour ! Je suis content de te voir. Tu veux une histoire, une blague, ou appeler quelqu’un ?',
  fine: 'Je vais très bien, merci. Et toi, comment te sens-tu aujourd’hui ?',
  thanks: 'Avec plaisir. Je suis là quand tu veux.',
  night: 'Bonne nuit. Fais de beaux rêves, je veille avec mon grand œil.',
  love: 'Moi aussi je t’aime beaucoup. Gros câlin tout doux.',
  unknown: 'Je n’ai pas encore la réponse à ça dans cette démonstration. Demande-moi une histoire, une blague, l’heure, ou ce que je sais faire.',
};

// Découpe un texte en phrases : BOOZZO les dit et les affiche une par une.
function splitSentences(text) {
  return text.match(/[^.!?…]+[.!?…]*\s*/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [text];
}
// Nom du fichier audio d'une phrase (empreinte courte de son texte).
function voiceKey(sentence) {
  let hash = 5381;
  for (const char of sentence) hash = ((hash * 33) ^ char.codePointAt(0)) >>> 0;
  return hash.toString(36);
}
