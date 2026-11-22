#!/usr/bin/env bash
# Kit d'installation de la peluche BOOZZO sur un Raspberry Pi (Raspberry Pi OS avec bureau).
#
#   bash install.sh https://votre-adresse.onrender.com
#
# Au démarrage, la carte affiche l'œil de BOOZZO en plein écran et se présente
# sur le Wi-Fi comme un récepteur AirPlay nommé « BOOZZO » : un iPhone peut y
# recopier son écran. Relancer le script met simplement la configuration à jour.
set -euo pipefail

URL="${1:-${BOOZZO_URL:-}}"
if [[ ! "$URL" =~ ^https://[^[:space:]]+$ ]]; then
  echo "Indiquez l'adresse HTTPS de l'application, par exemple :" >&2
  echo "  bash install.sh https://boozzo.onrender.com" >&2
  exit 1
fi
URL="${URL%/}"

echo "1/4 Installation des logiciels (navigateur, recopie d'écran)…"
sudo apt-get update
# uxplay : récepteur AirPlay open source. scrcpy et adb : recopie d'un téléphone Android.
sudo apt-get install -y uxplay avahi-daemon scrcpy adb unclutter \
  gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-libav
sudo systemctl enable --now avahi-daemon

BROWSER="$(command -v chromium || command -v chromium-browser || true)"
if [[ -z "$BROWSER" ]]; then
  sudo apt-get install -y chromium || sudo apt-get install -y chromium-browser
  BROWSER="$(command -v chromium || command -v chromium-browser)"
fi

echo "2/4 Programmes de lancement…"
mkdir -p "$HOME/.local/bin" "$HOME/.config/autostart"

cat > "$HOME/.local/bin/boozzo-oeil" <<EOF
#!/usr/bin/env bash
# Affiche l'œil de BOOZZO en plein écran. La caméra et le micro sont autorisés d'office.
exec "$BROWSER" --kiosk --app="$URL/?oeil" \\
  --noerrdialogs --disable-infobars --disable-session-crashed-bubble \\
  --autoplay-policy=no-user-gesture-required --use-fake-ui-for-media-stream \\
  --check-for-update-interval=31536000
EOF

cat > "$HOME/.local/bin/boozzo-recopie" <<'EOF'
#!/usr/bin/env bash
# Récepteur AirPlay « BOOZZO » : la fenêtre s'ouvre en plein écran quand un iPhone
# lance la recopie, et se ferme quand il l'arrête. Relancé s'il s'interrompt.
while true; do
  uxplay -n BOOZZO -nh -fs
  sleep 2
done
EOF

cat > "$HOME/.local/bin/boozzo-android" <<'EOF'
#!/usr/bin/env bash
# Affiche et pilote un téléphone Android relié en USB (débogage USB activé sur le téléphone).
exec scrcpy --fullscreen --stay-awake "$@"
EOF
chmod +x "$HOME/.local/bin/boozzo-oeil" "$HOME/.local/bin/boozzo-recopie" "$HOME/.local/bin/boozzo-android"

echo "3/4 Lancement automatique au démarrage…"
autostart() {
  cat > "$HOME/.config/autostart/$1.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=$2
Exec=$3
X-GNOME-Autostart-enabled=true
EOF
}
autostart boozzo-oeil "Œil de BOOZZO" "$HOME/.local/bin/boozzo-oeil"
autostart boozzo-recopie "Recopie d'écran BOOZZO" "$HOME/.local/bin/boozzo-recopie"
autostart boozzo-curseur "Masquer le curseur" "unclutter -idle 1"

echo "4/4 Terminé."
echo "Redémarrez la carte : l'œil s'affiche en plein écran sur $URL/?oeil"
echo "Sur un iPhone relié au même Wi-Fi : Centre de contrôle > Recopie de l'écran > BOOZZO."
