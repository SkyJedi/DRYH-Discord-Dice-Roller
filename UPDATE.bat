@echo off
if not exist \backup mkdir backup
copy config.js backup\config.js
powershell -Command "Invoke-WebRequest https://github.com/SkyJedi/NRYH-Discord-Dice-Roller/archive/master.zip -OutFile master.zip"
powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('master.zip', 'NRYH-Discord-Dice-Roller-master'); }"
del /f master.zip
xcopy NRYH-Discord-Dice-Roller-master\* .\ /e /q /y
rmdir NRYH-Discord-Dice-Roller-master\ /s /q
copy backup\config.js config.js
npm update
pause
