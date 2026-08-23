# Secure Storage

Provides string storage backed by native platform protection. Android values use the
Capacitor secure-storage plugin, which encrypts them with an Android Keystore key.

The browser adapter is intentionally memory-only because the plugin's web fallback uses
plaintext `localStorage`. Native apps must also list the Capacitor plugin as a direct
dependency so Capacitor discovers and registers it during sync.
