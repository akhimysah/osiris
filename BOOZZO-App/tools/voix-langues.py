"""Génère les voix anglaises et espagnoles des histoires et réponses de ui/langue.js, puis complète voix/liste.js.

Voix Piper : en-us-amy-low (anglais) et es-mls_10246-low (espagnol, CC BY 4.0), publiées avec Piper v0.0.2.
    node tools/phrases-langues.mjs > phrases-langues.json
    python tools/voix-langues.py phrases-langues.json chemin/vers/piper en.onnx es.onnx ui/voix
"""
import json, pathlib, re, subprocess, sys, tempfile
phrases_file, piper, en, es, out = sys.argv[1:6]
out = pathlib.Path(out)
data = json.load(open(phrases_file, encoding="utf8"))
keys = set(json.loads(re.search(r"new Set\((\[.*?\])\)", (out / "liste.js").read_text(encoding="utf8"), re.S).group(1)))
for lang, model in (("en", en), ("es", es)):
    for key, sentence in data[lang]:
        spoken = sentence.replace("BeyaBear’s", "Beya Bears" if lang == "en" else "Beya Bers")
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
            subprocess.run([piper, "--model", model, "--length_scale", "1.1", "--output_file", wav.name], input=spoken.encode("utf8"), check=True, capture_output=True)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav.name, "-af", "apad=pad_dur=0.25", "-ac", "1", "-b:a", "64k", str(out / f"{key}.mp3")], check=True)
        keys.add(key)
(out / "liste.js").write_text("// Phrases qui ont un enregistrement (voix Piper : fr-siwis-medium, en-us-amy-low, es-mls_10246-low).\nconst VOICE_FILES = new Set(" + json.dumps(sorted(keys)) + ");\n", encoding="utf8")
print(len(keys), "fichiers")
