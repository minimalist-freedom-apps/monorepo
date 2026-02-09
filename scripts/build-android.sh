#!/usr/bin/env bash
set -euo pipefail

echo "Building web assets…"
vite build

echo "Syncing Capacitor…"
npx cap sync android

echo "Generating icons…"
requirements-fix

echo "Building APK…"
cd android
chmod +x gradlew
./gradlew assembleRelease
