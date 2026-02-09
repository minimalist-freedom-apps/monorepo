#!/usr/bin/env bash
set -euo pipefail

APK_DIR="android/app/build/outputs/apk/release"

APK=$(find "$APK_DIR" -name '*.apk' -print -quit 2>/dev/null || true)
if [ -z "$APK" ]; then
  echo "No APK found in $APK_DIR"
  exit 1
fi

STORE_FILE=$(grep storeFile android/keystore.properties | cut -d= -f2)
KEY_ALIAS=$(grep keyAlias android/keystore.properties | cut -d= -f2)

APKSIGNER=$(find "$ANDROID_HOME/build-tools" -name apksigner -type f 2>/dev/null | sort -V | tail -1)
if [ -z "$APKSIGNER" ]; then
  echo "apksigner not found — check ANDROID_HOME"
  exit 1
fi

"$APKSIGNER" sign --ks "$STORE_FILE" --ks-key-alias "$KEY_ALIAS" "$APK"
echo "Signed: $APK"
