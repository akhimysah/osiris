// Traduction en direct pendant un appel.
// Chaque appareil traduit CE QU'IL ENTEND dans la langue de son choix : la voix du correspondant part vers
// Gemini Live Translate, la voix traduite revient et se joue par-dessus, avec les sous-titres dans l'œil.
// La clé Google n'est jamais ici : le serveur donne un jeton à usage unique, valable quinze minutes.
// Rien n'est enregistré, ni ici ni sur le serveur.
const TRAD = (() => {
  const SERVEUR = 'https://bhvnhgyutxtbfydersda.supabase.co/functions/v1/traduction-jeton';
  const SOCKET = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.';
  const LANGUES = [
    ['fr', 'Français'], ['en', 'English'], ['es', 'Español'], ['ar', 'العربية'], ['zh-Hans', '中文'], ['de', 'Deutsch'], ['it', 'Italiano'],
    ['pt-BR', 'Português'], ['tr', 'Türkçe'], ['ru', 'Русский'], ['ja', '日本語'], ['ko', '한국어'], ['hi', 'हिन्दी'], ['nl', 'Nederlands'],
  ];
  const garde = (cle, defaut) => { try { return localStorage.getItem('boozzo.trad.' + cle) || defaut; } catch { return defaut; } };
  const note = (cle, valeur) => { try { localStorage.setItem('boozzo.trad.' + cle, valeur); } catch {} };
  const parDefaut = () => {
    const page = typeof DEMO_LANG === 'string' ? DEMO_LANG : 'fr';
    return LANGUES.some(([c]) => c === page) ? page : 'fr';
  };
  const appareil = () => {
    let id = garde('appareil', '');
    if (!id) note('appareil', (id = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now())));
    return id;
  };

  const etat = { actif: false, cible: garde('cible', parDefaut()), statut: '', sousTitre: '', original: '' };
  let ws = null, ctx = null, source = null, capteur = null, fond = null, flux = null, video = null, prochain = 0, tour = 0, efface = 0, relance = 0, change = () => {};

  const dire = (statut) => { etat.statut = statut; change(); };
  const base64 = (octets) => { let s = ''; for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000)); return btoa(s); };

  // Micro distant -> PCM 16 bits, 16 kHz, par paquets de 100 ms.
  function brancher() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    ctx = new Ctx();
    ctx.resume?.();
    source = ctx.createMediaStreamSource(new MediaStream(flux.getAudioTracks()));
    // La voix d'origine reste en fond, très bas : on garde le ton de la personne sans gêner la traduction.
    fond = ctx.createGain();
    fond.gain.value = 0.12;
    source.connect(fond).connect(ctx.destination);
    capteur = ctx.createScriptProcessor(4096, 1, 1);
    const muet = ctx.createGain();
    muet.gain.value = 0;
    source.connect(capteur);
    capteur.connect(muet).connect(ctx.destination);
    const pas = ctx.sampleRate / 16000;
    let reste = [], position = 0;
    capteur.onaudioprocess = (e) => {
      if (!ws || ws.readyState !== 1) return;
      const entree = e.inputBuffer.getChannelData(0);
      for (; position < entree.length; position += pas) {
        const i = Math.floor(position), j = Math.min(i + 1, entree.length - 1), f = position - i;
        const v = Math.max(-1, Math.min(1, entree[i] * (1 - f) + entree[j] * f));
        reste.push(v < 0 ? v * 0x8000 : v * 0x7fff);
      }
      position -= entree.length;
      while (reste.length >= 1600) {
        const paquet = new Int16Array(reste.splice(0, 1600));
        ws.send(JSON.stringify({ realtimeInput: { audio: { data: base64(new Uint8Array(paquet.buffer)), mimeType: 'audio/pcm;rate=16000' } } }));
      }
    };
    if (video) video.muted = true; // le son d'origine passe désormais par le mélange ci-dessus
  }

  // Voix traduite : PCM 16 bits, 24 kHz, jouée bout à bout.
  function jouer(donnees) {
    if (!ctx) return;
    const brut = atob(donnees), n = brut.length >> 1;
    if (!n) return;
    const tampon = ctx.createBuffer(1, n, 24000), canal = tampon.getChannelData(0);
    for (let i = 0; i < n; i++) { const v = brut.charCodeAt(2 * i) | (brut.charCodeAt(2 * i + 1) << 8); canal[i] = (v >= 0x8000 ? v - 0x10000 : v) / 0x8000; }
    const noeud = ctx.createBufferSource();
    noeud.buffer = tampon;
    noeud.connect(ctx.destination);
    // Si la lecture a pris du retard, on recolle au direct plutôt que d'accumuler le décalage.
    if (prochain - ctx.currentTime > 1.2) prochain = 0;
    prochain = Math.max(prochain, ctx.currentTime + 0.06);
    noeud.start(prochain);
    prochain += tampon.duration;
  }

  function recevoir(message) {
    const c = message.serverContent;
    if (message.goAway) return renouveler();
    if (!c) return;
    if (c.inputTranscription?.text) etat.original = (etat.original + c.inputTranscription.text).slice(-160);
    if (c.outputTranscription?.text) {
      etat.sousTitre = (etat.sousTitre + c.outputTranscription.text).slice(-220);
      clearTimeout(efface);
      efface = setTimeout(() => { etat.sousTitre = ''; etat.original = ''; change(); }, 6000);
    }
    c.modelTurn?.parts?.forEach((p) => p.inlineData?.data && jouer(p.inlineData.data));
    if (c.turnComplete || c.generationComplete) { clearTimeout(efface); efface = setTimeout(() => { etat.sousTitre = ''; etat.original = ''; change(); }, 3500); }
    if (c.inputTranscription || c.outputTranscription) change();
  }

  async function jeton() {
    const r = await fetch(SERVEUR, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cible: etat.cible, appareil: appareil() }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.jeton) return j;
    throw Object.assign(new Error(j.erreur || 'serveur'), { code: j.erreur || 'serveur' });
  }

  // Ouvre la liaison avec Google. Deux adresses existent selon le type de jeton : on essaie l'une puis l'autre.
  async function ouvrir(essai = 0) {
    const moi = ++tour;
    const j = await jeton();
    if (moi !== tour || !etat.actif) return;
    const chemin = (j.forme === 'C') === (essai === 0) ? 'BidiGenerateContent' : 'BidiGenerateContentConstrained';
    const s = (ws = new WebSocket(`${SOCKET}${chemin}?access_token=${encodeURIComponent(j.jeton)}`));
    let recu = false;
    s.onopen = () => {
      s.send(JSON.stringify({ setup: { model: j.modele, generationConfig: { responseModalities: ['AUDIO'], translationConfig: { targetLanguageCode: etat.cible, echoTargetLanguage: true } }, inputAudioTranscription: {}, outputAudioTranscription: {} } }));
      dire('ecoute');
      clearTimeout(relance);
      relance = setTimeout(renouveler, (j.minutes * 60 - 40) * 1000);
    };
    s.onmessage = async (e) => {
      recu = true;
      try { recevoir(JSON.parse(typeof e.data === 'string' ? e.data : await e.data.text())); } catch {}
    };
    s.onclose = () => {
      if (s !== ws || !etat.actif) return;
      ws = null;
      if (!recu && essai === 0) return ouvrir(1).catch(echec);
      if (recu) return renouveler();
      echec(new Error('liaison'));
    };
  }
  function renouveler() {
    if (!etat.actif) return;
    const ancien = ws;
    ws = null;
    try { ancien?.close(); } catch {}
    ouvrir().catch(echec);
  }
  function echec(erreur) {
    const code = erreur?.code || erreur?.message;
    arreter();
    dire(code === 'quota' ? 'quota' : code === 'cle_absente' ? 'bientot' : 'erreur');
  }

  function demarrer(remote, element) {
    if (!remote?.getAudioTracks().length) return dire('erreur');
    arreter();
    flux = remote;
    video = element || null;
    etat.actif = true;
    dire('connexion');
    try { brancher(); } catch { return echec(new Error('audio')); }
    ouvrir().catch(echec);
  }
  function arreter() {
    tour++;
    etat.actif = false;
    clearTimeout(relance);
    clearTimeout(efface);
    const ancien = ws;
    ws = null;
    try { ancien?.close(); } catch {}
    try { capteur && (capteur.onaudioprocess = null); source?.disconnect(); capteur?.disconnect(); fond?.disconnect(); ctx?.close(); } catch {}
    if (video) video.muted = false;
    ctx = source = capteur = fond = flux = video = null;
    prochain = 0;
    etat.sousTitre = etat.original = '';
    dire('');
  }

  return {
    LANGUES, etat, demarrer, arreter,
    // Un nouveau flux arrive (reconnexion) : on rebranche la traduction dessus.
    suivre(remote, element) { if (etat.actif && remote !== flux) demarrer(remote, element); },
    choisir(code) { if (!LANGUES.some(([c]) => c === code)) return; etat.cible = code; note('cible', code); if (etat.actif && flux) demarrer(flux, video); },
    surChangement(f) { change = f; },
  };
})();
