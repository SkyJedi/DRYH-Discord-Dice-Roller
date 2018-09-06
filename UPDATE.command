cd "`dirname "$0"`"
[ -d backup ] || mkdir backup
cp -rf config.js backup/config.js
curl -lko master.zip https://github.com/SkyJedi/DRYH-Discord-Dice-Roller/archive/master.zip
unzip master.zip
rm -rf master.zip
cp -af DRYH-Discord-Dice-Roller-master/ ./
rm -r DRYH-Discord-Dice-Roller-master/
cp -rf backup/config.js config.js
npm update
