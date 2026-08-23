# Capacitor Secure Storage

Implements `@minimalist-apps/secure-storage` with
`@aparajita/capacitor-secure-storage`. Android values are encrypted with an Android
Keystore key.

The provider deliberately rejects non-native platforms instead of invoking the plugin's
plaintext browser fallback. Capacitor apps must also list the plugin as a direct
dependency so Capacitor discovers and registers it during sync.
