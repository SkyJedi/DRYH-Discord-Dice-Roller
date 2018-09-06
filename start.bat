@echo off
TITLE DRYH Dice Rolling Bot
if exist node_modules (
	node index.js
) else (
	npm install
	node index.js
)
pause