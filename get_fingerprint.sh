#!/bin/bash

# APK'dan SHA-256 Fingerprint Çıkarma Scripti

echo "=== APK'dan SHA-256 Fingerprint Çıkarma ==="
echo ""

# APK dosyası yolunu al
if [ -z "$1" ]; then
    echo "Kullanım: ./get_fingerprint.sh /path/to/app-release.apk"
    echo ""
    echo "Veya keystore'dan fingerprint çıkarmak için:"
    echo "keytool -list -v -keystore credentials/android/keystore.jks"
    exit 1
fi

APK_PATH="$1"

if [ ! -f "$APK_PATH" ]; then
    echo "Hata: APK dosyası bulunamadı: $APK_PATH"
    exit 1
fi

echo "APK Dosyası: $APK_PATH"
echo ""

# apksigner ile dene
if command -v apksigner &> /dev/null; then
    echo "apksigner ile fingerprint çıkarılıyor..."
    apksigner verify --print-certs "$APK_PATH" | grep -A 1 "SHA-256" || echo "SHA-256 bulunamadı"
    echo ""
fi

# jarsigner ile dene
if command -v jarsigner &> /dev/null; then
    echo "jarsigner ile fingerprint çıkarılıyor..."
    jarsigner -verify -verbose -certs "$APK_PATH" 2>&1 | grep -i "SHA-256" || echo "SHA-256 bulunamadı"
    echo ""
fi

# keytool ile APK'dan çıkarmayı dene (APK bir JAR dosyası gibi)
echo "keytool ile fingerprint çıkarılıyor..."
unzip -q -o "$APK_PATH" -d /tmp/apk_extract 2>/dev/null
if [ -f /tmp/apk_extract/META-INF/*.RSA ] || [ -f /tmp/apk_extract/META-INF/*.DSA ]; then
    CERT_FILE=$(find /tmp/apk_extract/META-INF -name "*.RSA" -o -name "*.DSA" | head -1)
    if [ -n "$CERT_FILE" ]; then
        keytool -printcert -file "$CERT_FILE" | grep -A 1 "SHA256:"
    fi
fi
rm -rf /tmp/apk_extract

echo ""
echo "=== Keystore'dan Fingerprint Çıkarma ==="
echo "Keystore'dan fingerprint çıkarmak için:"
echo "keytool -list -v -keystore credentials/android/keystore.jks"
echo ""





