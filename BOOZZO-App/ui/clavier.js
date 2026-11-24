// Clavier de l'œil : un clavier tactile dessiné pour l'écran rond (les rangées suivent la largeur du cercle).
// Il remplit un champ du panneau puis valide son formulaire, ce qui le rend utilisable sur l'écran seul (/?oeil).
// Chargé après app.js, dont il utilise eye, panel, state, store, toast et esc.
const KB_ROWS = {
  abc: ['azertyuiop', 'qsdfghjklm', '⇧wxcvbn’⌫'],
  num: ['1234567890', '-_/:;()!?,', 'éèàçùê+⌫'],
};
const kb = { input: null, text: '', mode: 'abc', shift: false, node: null };
function kbDraw() {
  const email = kb.input?.type === 'email';
  const key = (k) => {
    const label = kb.mode === 'abc' && kb.shift && k.length === 1 && k !== '⇧' && k !== '⌫' ? k.toUpperCase() : k;
    const wide = k === '⇧' || k === '⌫';
    return `<button type="button" data-k="${k}" class="${wide ? 'w' : ''}${k === '⇧' && kb.shift ? ' on' : ''}" aria-label="${k === '⇧' ? 'Majuscule' : k === '⌫' ? 'Effacer' : label}">${label}</button>`;
  };
  const last = `<button type="button" data-k="close" class="s" aria-label="Fermer le clavier">×</button><button type="button" data-k="mode" class="m">${kb.mode === 'abc' ? '123' : 'abc'}</button><button type="button" data-k="@">@</button>${
    email ? '<button type="button" data-k="." >.</button><button type="button" data-k=".fr" class="m">.fr</button><button type="button" data-k=".com" class="m">.com</button>' : '<button type="button" data-k=" " class="sp" aria-label="Espace">espace</button><button type="button" data-k=".">.</button>'
  }<button type="button" data-k="ok" class="ok">OK</button>`;
  kb.node.innerHTML = `<small>${esc(kb.label)}</small><output>${esc(kb.text)}<i></i></output>${KB_ROWS[kb.mode].map((row) => `<div>${[...row].map(key).join('')}</div>`).join('')}<div>${last}</div>`;
  const out = kb.node.querySelector('output');
  out.scrollLeft = out.scrollWidth;
}
function kbOpen(input) {
  if (!input) return;
  kb.input = input;
  kb.text = input.value || '';
  kb.label = input.getAttribute('aria-label') || input.placeholder || 'Écrire';
  kb.mode = 'abc';
  kb.shift = false;
  if (!kb.node) {
    kb.node = document.createElement('div');
    kb.node.className = 'kb';
    kb.node.addEventListener('click', kbTap);
    eye.append(kb.node);
  }
  kb.node.hidden = false;
  kbDraw();
  if (typeof setView === 'function') setView(true);
}
function kbClose() {
  if (kb.node) kb.node.hidden = true;
  kb.input = null;
}
function kbTap(event) {
  event.stopPropagation();
  const k = event.target.closest('[data-k]')?.dataset.k;
  if (!k) return;
  if (k === 'close') return kbClose();
  if (k === 'mode') kb.mode = kb.mode === 'abc' ? 'num' : 'abc';
  else if (k === '⇧') kb.shift = !kb.shift;
  else if (k === '⌫') kb.text = kb.text.slice(0, -1);
  else if (k === 'ok') {
    const input = kb.input;
    kbClose();
    if (!input?.isConnected) return;
    input.value = kb.text.trim();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (input.form) input.form.requestSubmit ? input.form.requestSubmit() : input.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return;
  } else {
    const max = Number(kb.input?.maxLength) > 0 ? Number(kb.input.maxLength) : 120;
    if (kb.text.length + k.length <= max) kb.text += kb.mode === 'abc' && kb.shift ? k.toUpperCase() : k;
    kb.shift = false;
  }
  kbDraw();
}
// Bouton « clavier » dans l'œil : présent dès que l'écran courant attend du texte.
const kbButton = document.createElement('button');
kbButton.type = 'button';
kbButton.className = 'kbOpen';
kbButton.setAttribute('aria-label', 'Ouvrir le clavier');
kbButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/></svg>';
kbButton.hidden = true;
eye.append(kbButton);
const kbField = () => panel.querySelector('form input:not([type=checkbox]):not([type=hidden]):not([type=password])');
kbButton.addEventListener('click', (event) => { event.stopPropagation(); kbOpen(kbField()); });
new MutationObserver(() => {
  kbButton.hidden = !kbField() || ['home', 'menu', 'games'].includes(state.screen);
  if (kb.input && !kb.input.isConnected) kbClose();
}).observe(panel, { childList: true, subtree: true });

// Forfait : l'adresse e-mail du parent, saisie au clavier de l'œil. Elle reste sur l'appareil tant qu'aucun serveur de commande n'existe.
const esimBase = openEsim;
openEsim = function (options) {
  esimBase(options);
  const mail = store.get('email', '');
  panel.insertAdjacentHTML('beforeend', `<div class="invite"><p><strong>Adresse e-mail du parent</strong><br><span class="muted">${mail ? `Enregistrée : ${esc(mail)}` : 'Pour recevoir la confirmation du forfait.'}</span></p>
    <form class="line" id="mailForm"><input name="email" type="email" maxlength="80" required placeholder="prenom@exemple.fr" aria-label="Adresse e-mail" autocomplete="email" value="${esc(mail)}"><button class="btn">Enregistrer</button></form></div>`);
};
document.addEventListener('submit', (event) => {
  if (event.target.id !== 'mailForm') return;
  event.preventDefault();
  const mail = event.target.email.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return toast('Adresse e-mail incomplète.');
  store.set('email', mail);
  toast('Adresse enregistrée sur cet appareil.');
  if (state.screen === 'esim') openEsim();
});
