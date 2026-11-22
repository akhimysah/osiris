"""Génère les voix de BOOZZO : un fichier audio par phrase de ui/paroles.js.

Voix : Piper « fr-siwis-medium » (moteur Piper open source ; voix sous licence CC BY 4.0,
jeu de données SIWIS — mention de l'auteur requise). Les fichiers sont générés une fois pour
toutes ; l'application ne fait que les lire. À relancer après toute modification des textes.

    # Piper : https://github.com/rhasspy/piper/releases (piper_linux_x86_64.tar.gz)
    # Voix  : https://github.com/rhasspy/piper/releases/tag/v0.0.2 (voice-fr-siwis-medium.tar.gz)
    node tools/phrases.mjs > phrases.json
    python tools/voix.py phrases.json chemin/vers/piper chemin/vers/fr-siwis-medium.onnx ui/voix

ffmpeg doit être installé.
"""
import json, pathlib, subprocess, sys, tempfile

phrases_file, piper, model, out = sys.argv[1:5]
out = pathlib.Path(out)
out.mkdir(parents=True, exist_ok=True)
phrases = json.load(open(phrases_file, encoding="utf8"))
for key, sentence in phrases:
    # Prononciation du nom : il s'écrit BOOZZO et se dit « bozo ».
    spoken = sentence.replace("BOOZZO", "Bozo")
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        # length_scale > 1 ralentit légèrement la voix, pour un ton plus posé.
        subprocess.run([piper, "--model", model, "--length_scale", "1.08", "--output_file", wav.name], input=spoken.encode("utf8"), check=True, capture_output=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav.name, "-af", "apad=pad_dur=0.25", "-ac", "1", "-b:a", "64k", str(out / f"{key}.mp3")], check=True)
    print(key, sentence[:60])
# Liste des fichiers disponibles, chargée par la page.
keys = sorted(key for key, _ in phrases)
(out / "liste.js").write_text("// Phrases qui ont un enregistrement (généré par tools/voix.py, voix Piper fr-siwis-medium, CC BY 4.0).\nconst VOICE_FILES = new Set(" + json.dumps(keys) + ");\n", encoding="utf8")
print(len(keys), "fichiers")
