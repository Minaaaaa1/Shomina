#!/data/data/com.termux/files/usr/bin/bash
export JAVA_HOME=$PREFIX
export ANDROID_HOME=$HOME/android-sdk

echo ">>> بصلح aapt2 ..."
pkg install aapt2 aapt -y > /dev/null 2>&1
mkdir -p ~/android-sdk/build-tools/35.0.0 ~/android-sdk/build-tools/34.0.0
cp $PREFIX/bin/aapt2 ~/android-sdk/build-tools/35.0.0/aapt2
cp $PREFIX/bin/aapt2 ~/android-sdk/build-tools/34.0.0/aapt2
chmod +x ~/android-sdk/build-tools/35.0.0/aapt2 ~/android-sdk/build-tools/34.0.0/aapt2
sed -i '/aapt2FromMavenOverride/d' gradle.properties

for i in 1 2 3 4 5; do
  echo ""
  echo ">>> محاولة بناء رقم $i ..."
  ./gradlew assembleDebug --no-daemon
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    cp app/build/outputs/apk/debug/app-debug.apk ~/storage/downloads/Shomina.apk
    ls -lh ~/storage/downloads/Shomina.apk
    termux-notification --title "Shomina" --content "الـ APK اتبنى بنجاح!" --button1 "تثبيت" --button1-action "termux-open ~/storage/downloads/Shomina.apk"
    exit 0
  fi
  echo ">>> فشل بسبب النت، هجرب تاني بعد 5 ثواني..."
  sleep 5
done

echo "❌ فشل بعد 5 محاولات، ابعتلي آخر سكرين"
