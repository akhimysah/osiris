"""Génère les voix de BOOZZO : un fichier audio par phrase de ui/paroles.js.

Voix : Kokoro « ff_siwis » (open source, Apache-2.0), synthétisée ici une fois pour toutes ;
l'application ne fait que lire les fichiers. À relancer après toute modification des textes.

    pip install kokoro-onnx soundfile          # et ffmpeg installé
    # modèle et voix : https://github.com/thewh1teagle/kokoro-onnx/releases (kokoro-v1.0.int8.onnx, voices-v1.0.bin)
    node tools/phrases.mjs > phrases.json
    python tools/voix.py phrases.json kokoro-v1.0.int8.onnx voices-v1.0.bin ui/voix
"""
import json, pathlib, subprocess, sys, tempfile

import soundfile as sf
from kokoro_onnx import Kokoro

phrases_file, model, voices, out = sys.argv[1:5]
out = pathlib.Path(out)
out.mkdir(parents=True, exist_ok=True)
kokoro = Kokoro(model, voices)
phrases = json.load(open(phrases_file, encoding="utf8"))
for key, sentence in phrases:
    # Prononciation du nom, écrit en capitales dans les textes.
    spoken = sentence.replace("BOOZZO", "Bouzo")
    samples, rate = kokoro.create(spoken, voice="ff_siwis", speed=0.92, lang="fr-fr")
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        sf.write(wav.name, samples, rate)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav.name, "-af", "apad=pad_dur=0.25", "-ac", "1", "-b:a", "64k", str(out / f"{key}.mp3")], check=True)
    print(key, round(len(samples) / rate, 1), "s", sentence[:50])
# Liste des fichiers disponibles, chargée par la page.
keys = sorted(key for key, _ in phrases)
(out / "liste.js").write_text("// Phrases qui ont un enregistrement (généré par tools/voix.py).\nconst VOICE_FILES = new Set(" + json.dumps(keys) + ");\n", encoding="utf8")
print(len(keys), "fichiers")
