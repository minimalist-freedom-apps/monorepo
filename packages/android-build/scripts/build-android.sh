#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
TARGET_APP_DIR="${APP_DIR:-$PWD}"
APP_DIR_NAME="$(basename "$TARGET_APP_DIR")"

cd "$TARGET_APP_DIR"

echo "Building web assets…"
vite build

echo "Syncing Capacitor…"
bunx cap sync android

echo "Generating icons…"
(cd "$WORKSPACE_ROOT" && requirements-fix --filter "$APP_DIR_NAME" --only 'has generated icons')

echo "Building APK (release)…"
cd android
chmod +x gradlew
./gradlew assembleRelease
