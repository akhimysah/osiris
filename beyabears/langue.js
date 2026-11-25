// Langue de la démo pour les histoires et les jeux : ?lang=en ou ?lang=es dans l'adresse, sinon la langue de l'appareil.
// Chargé après paroles.js : il remplace les textes français par leur version dans la langue choisie.
// Chaque phrase a son enregistrement dans voix/ (voir tools/voix-langues.py) : après une modification, régénérer les voix.
const DEMO_LANG = (() => {
  const asked = new URLSearchParams(location.search).get('lang') || (navigator.language || 'fr').slice(0, 2);
  return ['fr', 'en', 'es'].includes(asked) ? asked : 'fr';
})();
const PAROLES = {
  en: {
    stories: [
      { title: 'The moon boat', text: 'Once upon a time there was a little plush called BeyaBear’s. It had one big round eye that shone like the moon. Every evening, when the house grew quiet, its eye lit up softly. Inside, you could see stars, clouds and sometimes a little boat. One evening, the boat carried BeyaBear’s to an island where the trees sang lullabies. BeyaBear’s listened, closed its big eye, and brought back the sweetest song of all. Ever since, when a child cannot fall asleep, BeyaBear’s hums it very quietly. Good night.' },
      { title: 'The garden explorer', text: 'One morning, BeyaBear’s put on an explorer’s hat and a backpack. Today, it said, I am off to discover the garden. It met an ant in a great hurry, carrying a crumb bigger than itself. Then a snail, who took its time and greeted every flower. From the ant, BeyaBear’s learned that we can carry big things together. From the snail, it learned that we see more wonders when we go slowly. That evening, it tucked both secrets into its bag. And it keeps them for you.' },
      { title: 'The cloud who was afraid to rain', text: 'High on top of the hill lived a cloud who was afraid to rain. It thought its drops would make the flowers sad. BeyaBear’s raised its big eye and said: look down. The cloud looked, and saw flowers opening their petals, waiting. So it let a little rain fall, very fine, very warm. The flowers danced, the earth smelled good, and a rainbow appeared. The cloud understood that what it had to give was a gift. And it was never afraid again.' },
    ],
    jokes: ['What does a plush say after a big meal? I am stuffed!', 'Why does BeyaBear’s never lose anything? Because it always keeps an eye on it.', 'What is the worst thing for an eye? Feeling that nobody is looking.'],
    replies: {
      who: 'I am BeyaBear’s, your plush companion. My big eye is a screen: I show your loved ones, your videos and your photos, and I can talk to you.',
      skills: 'I can video-call your loved ones, show videos, take photos, change the colour of my eye and tell stories. Just ask me for a story.',
      hello: 'Hello! I am happy to see you. Would you like a story, a joke, or to call someone?',
      fine: 'I am very well, thank you. And you, how do you feel today?',
      thanks: 'With pleasure. I am here whenever you want.',
      night: 'Good night. Sweet dreams, I am keeping watch with my big eye.',
      love: 'I love you very much too. A big soft hug.',
      unknown: 'I do not have the answer to that yet in this demo. Ask me for a story, a joke, the time, or what I can do.',
    },
    ui: {
      'Choisis une histoire.': 'Choose a story.', 'Je t’écoute.': 'I am listening.',
      Jeux: 'Games', 'Course au miel': 'Honey run', 'Les paires': 'Pairs', 'Pluie d’étoiles': 'Star shower', Calcul: 'Maths', Dessin: 'Drawing',
      'Touche l’écran pour sauter : attrape les pots de miel, évite les souches et les abeilles.': 'Tap the screen to jump: catch the honey pots, avoid the stumps and the bees.',
      'Retrouve les images qui vont ensemble.': 'Find the pictures that go together.', 'Glisse le doigt pour attraper les étoiles.': 'Slide your finger to catch the stars.',
      'Touche la bonne réponse, dix fois de suite.': 'Tap the right answer, ten times in a row.', 'Choisis une couleur et dessine avec le doigt.': 'Pick a colour and draw with your finger.',
      'Cinq jeux pensés pour l’écran rond : ils se jouent du bout du doigt, directement dans l’œil.': 'Five games designed for the round screen: play with a fingertip, right in the eye.',
      Rejouer: 'Play again', 'Autre jeu': 'Another game', 'Bravo !': 'Well done!', 'Fini !': 'Finished!', 'Touche pour sauter': 'Tap to jump', Record: 'Best',
      coup: 'move', coups: 'moves', étoile: 'star', étoiles: 'stars', 'pot de miel': 'honey pot', 'pots de miel': 'honey pots', pots: 'pots', 'sur 10': 'out of 10',
    },
  },
  es: {
    stories: [
      { title: 'El barco de la luna', text: 'Había una vez un pequeño peluche que se llamaba BeyaBear’s. Tenía un gran ojo redondo que brillaba como la luna. Cada noche, cuando la casa se quedaba en silencio, su ojo se encendía suavemente. Dentro se veían estrellas, nubes y a veces un barquito. Una noche, el barco llevó a BeyaBear’s hasta una isla donde los árboles cantaban nanas. BeyaBear’s escuchó, cerró su gran ojo y trajo la canción más dulce. Desde entonces, cuando a un niño le cuesta dormirse, BeyaBear’s la tararea muy bajito. Buenas noches.' },
      { title: 'El explorador del jardín', text: 'Una mañana, BeyaBear’s se puso su sombrero de explorador y su mochila. Hoy, dijo, salgo a descubrir el jardín. Encontró una hormiga con mucha prisa, que llevaba una miga más grande que ella. Luego un caracol, que se tomaba su tiempo y saludaba a cada flor. De la hormiga, BeyaBear’s aprendió que juntos se pueden llevar cosas grandes. Del caracol aprendió que se ven más maravillas cuando se va despacio. Por la noche, guardó esos dos secretos en su mochila. Y los guarda para ti.' },
      { title: 'La nube que tenía miedo de llover', text: 'En lo alto de la colina vivía una nube que tenía miedo de llover. Creía que sus gotas pondrían tristes a las flores. BeyaBear’s levantó su gran ojo y le dijo: mira hacia abajo. La nube miró, y vio flores que abrían sus pétalos esperándola. Entonces dejó caer una lluvia pequeña, muy fina, muy tibia. Las flores bailaron, la tierra olió bien y apareció un arcoíris. La nube entendió que lo que tenía para dar era un regalo. Y nunca más tuvo miedo.' },
    ],
    jokes: ['¿Qué dice un peluche que ha comido bien? ¡Estoy relleno!', '¿Por qué BeyaBear’s nunca pierde nada? Porque siempre le echa un ojo.', '¿Qué es lo peor para un ojo? Sentir que nadie lo mira.'],
    replies: {
      who: 'Soy BeyaBear’s, tu peluche compañero. Mi gran ojo es una pantalla: en él muestro a tus seres queridos, tus vídeos y tus fotos, y puedo hablar contigo.',
      skills: 'Puedo llamar por vídeo a tus seres queridos, mostrar vídeos, hacer fotos, cambiar el color de mi ojo y contar cuentos. Pídeme un cuento.',
      hello: '¡Hola! Me alegro de verte. ¿Quieres un cuento, un chiste o llamar a alguien?',
      fine: 'Estoy muy bien, gracias. Y tú, ¿cómo te sientes hoy?',
      thanks: 'Con mucho gusto. Estoy aquí cuando quieras.',
      night: 'Buenas noches. Dulces sueños, yo vigilo con mi gran ojo.',
      love: 'Yo también te quiero mucho. Un abrazo grande y suave.',
      unknown: 'Todavía no tengo la respuesta a eso en esta demostración. Pídeme un cuento, un chiste, la hora o lo que sé hacer.',
    },
    ui: {
      'Choisis une histoire.': 'Elige un cuento.', 'Je t’écoute.': 'Te escucho.',
      Jeux: 'Juegos', 'Course au miel': 'Carrera de miel', 'Les paires': 'Las parejas', 'Pluie d’étoiles': 'Lluvia de estrellas', Calcul: 'Cálculo', Dessin: 'Dibujo',
      'Touche l’écran pour sauter : attrape les pots de miel, évite les souches et les abeilles.': 'Toca la pantalla para saltar: atrapa los tarros de miel, evita los troncos y las abejas.',
      'Retrouve les images qui vont ensemble.': 'Encuentra las imágenes que van juntas.', 'Glisse le doigt pour attraper les étoiles.': 'Desliza el dedo para atrapar las estrellas.',
      'Touche la bonne réponse, dix fois de suite.': 'Toca la respuesta correcta, diez veces seguidas.', 'Choisis une couleur et dessine avec le doigt.': 'Elige un color y dibuja con el dedo.',
      'Cinq jeux pensés pour l’écran rond : ils se jouent du bout du doigt, directement dans l’œil.': 'Cinco juegos pensados para la pantalla redonda: se juegan con la punta del dedo, directamente en el ojo.',
      Rejouer: 'Otra vez', 'Autre jeu': 'Otro juego', 'Bravo !': '¡Muy bien!', 'Fini !': '¡Fin!', 'Touche pour sauter': 'Toca para saltar', Record: 'Récord',
      coup: 'jugada', coups: 'jugadas', étoile: 'estrella', étoiles: 'estrellas', 'pot de miel': 'tarro de miel', 'pots de miel': 'tarros de miel', pots: 'tarros', 'sur 10': 'de 10',
    },
  },
};
const BACK = '<button class="back" data-go="menu" type="button">‹ Accueil BeyaBear’s</button>';
Object.assign(PAROLES.en.ui, { [BACK]: BACK.replace('Accueil BeyaBear’s', 'BeyaBear’s home'), Histoire: 'Story', Histoires: 'Stories', Assistant: 'Assistant', 'Arrêter l’histoire': 'Stop the story',
  'Touchez une histoire : BeyaBear’s la raconte à voix haute, et elle défile dans son œil.': 'Tap a story: BeyaBear’s tells it out loud, and it scrolls in its eye.' ,
  'Touchez une histoire : BeyaBear’s la raconte à voix haute, dans un décor animé. Touchez la lune, les fleurs ou le nuage : ils réagissent.': 'Tap a story: BeyaBear’s tells it out loud in an animated scene. Tap the moon, the flowers or the cloud: they react.' });
Object.assign(PAROLES.es.ui, { [BACK]: BACK.replace('Accueil BeyaBear’s', 'Inicio BeyaBear’s'), Histoire: 'Cuento', Histoires: 'Cuentos', Assistant: 'Asistente', 'Arrêter l’histoire': 'Parar el cuento',
  'Touchez une histoire : BeyaBear’s la raconte à voix haute, et elle défile dans son œil.': 'Toca un cuento: BeyaBear’s lo cuenta en voz alta y se muestra en su ojo.' ,
  'Touchez une histoire : BeyaBear’s la raconte à voix haute, dans un décor animé. Touchez la lune, les fleurs ou le nuage : ils réagissent.': 'Toca un cuento: BeyaBear’s lo cuenta en voz alta en un decorado animado. Toca la luna, las flores o la nube: reaccionan.' });
const L = (text) => PAROLES[DEMO_LANG]?.ui[text] || text;
if (PAROLES[DEMO_LANG]) {
  STORIES.splice(0, STORIES.length, ...PAROLES[DEMO_LANG].stories);
  JOKES.splice(0, JOKES.length, ...PAROLES[DEMO_LANG].jokes);
  Object.assign(REPLIES, PAROLES[DEMO_LANG].replies);
  document.documentElement.lang = DEMO_LANG;
}
