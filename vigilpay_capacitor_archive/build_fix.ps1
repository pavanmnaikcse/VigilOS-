$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"

Write-Host "Building React..."
npm run build

Write-Host "Syncing Capacitor..."
npx cap sync android

Write-Host "Fixing Reparse Points in android/app/src/main/assets/public..."
Get-ChildItem -Path .\android\app\src\main\assets\public -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $p = $_.FullName
    Write-Host "Fixing $p"
    $c = [System.IO.File]::ReadAllBytes($p)
    Remove-Item $p -Force
    [System.IO.File]::WriteAllBytes($p, $c)
}

cd android
Write-Host "Building APK..."
.\gradlew assembleDebug
cd ..
Write-Host "Done!"
