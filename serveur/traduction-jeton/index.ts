// BeyaBear's : distribue des jetons de courte durée pour la traduction vocale en direct (Gemini Live).
// La vraie clé Google reste ici, dans les secrets du serveur. L'application ne reçoit qu'un jeton
// à usage unique, valable quelques minutes. Rien n'est enregistré : ni voix, ni texte.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MODELE = "models/gemini-3.5-live-translate-preview";
const ORIGINES = ["https://akhimysah.github.io", "http://localhost:8765", "http://127.0.0.1:8765"];
const LANGUES = new Set(["fr", "en", "es", "ar", "zh-Hans", "de", "it", "pt-BR", "pt-PT", "nl", "tr", "ru", "ja", "ko", "hi", "pl", "id", "vi", "th", "he", "sw", "uk", "ro", "el"]);
const DUREE_MIN = 15;

const nombre = (nom: string, defaut: number) => Number(Deno.env.get(nom)) || defaut;

function entetes(origine: string | null) {
  const ok = origine && ORIGINES.includes(origine);
  return {
    "Access-Control-Allow-Origin": ok ? origine! : ORIGINES[0],
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}
const rep = (corps: unknown, statut: number, origine: string | null) => new Response(JSON.stringify(corps), { status: statut, headers: entetes(origine) });

async function hacher(texte: string) {
  const sel = Deno.env.get("SUPABASE_URL") ?? "beyabears";
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sel + "|" + texte));
  return [...new Uint8Array(octets)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function quota(appareil: string, ip: string) {
  const url = Deno.env.get("SUPABASE_URL"), role = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !role) return "indisponible";
  const r = await fetch(`${url}/rest/v1/rpc/prendre_jeton`, {
    method: "POST",
    headers: { apikey: role, Authorization: `Bearer ${role}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_appareil: appareil, p_ip: ip, lim_appareil: nombre("LIM_APPAREIL", 12), lim_ip: nombre("LIM_IP", 24), lim_tout: nombre("LIM_TOUT", 80) }),
  });
  if (!r.ok) return "indisponible";
  return (await r.json()) as string;
}

// La clé vient des secrets du serveur ou, à défaut, du coffre chiffré de la base.
let cleGardee = "";
async function lireCle() {
  if (cleGardee) return cleGardee;
  const env = Deno.env.get("GEMINI_API_KEY");
  if (env) return (cleGardee = env);
  const url = Deno.env.get("SUPABASE_URL"), role = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !role) return "";
  const r = await fetch(`${url}/rest/v1/rpc/lire_cle_gemini`, { method: "POST", headers: { apikey: role, Authorization: `Bearer ${role}`, "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) return "";
  const v = await r.json();
  return (cleGardee = typeof v === "string" ? v : "");
}

async function creerJeton(cle: string, cible: string) {
  const fin = new Date(Date.now() + DUREE_MIN * 60000).toISOString();
  const debut = new Date(Date.now() + 90000).toISOString();
  const traduction = { targetLanguageCode: cible, echoTargetLanguage: true };
  const base = { uses: 1, expireTime: fin, newSessionExpireTime: debut };
  // Trois écritures possibles selon la version de l'API : la première acceptée est gardée.
  const formes: [string, Record<string, unknown>][] = [
    ["A", { ...base, bidiGenerateContentSetup: { model: MODELE, generationConfig: { responseModalities: ["AUDIO"], translationConfig: traduction }, inputAudioTranscription: {}, outputAudioTranscription: {} } }],
    ["B", { ...base, liveConnectConstraints: { model: MODELE, config: { responseModalities: ["AUDIO"], translationConfig: traduction, inputAudioTranscription: {}, outputAudioTranscription: {} } } }],
    ["C", base],
  ];
  let erreur = "";
  for (const [forme, corps] of formes) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", { method: "POST", headers: { "x-goog-api-key": cle, "Content-Type": "application/json" }, body: JSON.stringify(corps) });
    const texte = await r.text();
    if (r.ok) {
      try { const j = JSON.parse(texte); if (j.name) return { jeton: j.name as string, forme, fin }; } catch { /* suite */ }
    }
    erreur = `${r.status} ${texte.slice(0, 300)}`;
    if (r.status === 401 || r.status === 403 || r.status === 429) break; // clé refusée ou quota Google : inutile d'insister
  }
  return { erreur };
}

Deno.serve(async (req: Request) => {
  const origine = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: entetes(origine) });
  const cle = await lireCle();
  if (req.method === "GET") return rep({ ok: true, cle: Boolean(cle), modele: MODELE, langues: [...LANGUES] }, 200, origine);
  if (req.method !== "POST") return rep({ erreur: "methode" }, 405, origine);
  if (!origine || !ORIGINES.includes(origine)) return rep({ erreur: "origine" }, 403, origine);
  if (!cle) return rep({ erreur: "cle_absente" }, 503, origine);

  let corps: { cible?: string; appareil?: string } = {};
  try { corps = await req.json(); } catch { return rep({ erreur: "requete" }, 400, origine); }
  const cible = String(corps.cible ?? "");
  const appareil = String(corps.appareil ?? "").slice(0, 80);
  if (!LANGUES.has(cible) || appareil.length < 8) return rep({ erreur: "requete" }, 400, origine);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnue";
  const etat = await quota(await hacher(appareil), await hacher(ip));
  if (etat !== "ok") return rep({ erreur: etat === "indisponible" ? "indisponible" : "quota", detail: etat }, etat === "indisponible" ? 503 : 429, origine);

  const j = await creerJeton(cle, cible);
  if ("erreur" in j) {
    console.error("jeton refusé", j.erreur);
    return rep({ erreur: "google", detail: j.erreur }, 502, origine);
  }
  return rep({ jeton: j.jeton, forme: j.forme, fin: j.fin, modele: MODELE, minutes: DUREE_MIN }, 200, origine);
});
