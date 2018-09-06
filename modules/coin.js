const _ = require('lodash');
const jsonfile = require('jsonfile');
const file = 'data/coinPool.json';
const diceResultFile = 'data/diceResult.json';
const functions = require('./');
const order = ['discipline', 'madness', 'exhaustion', 'pain', 'assistance'];

const coin = async (message, params) => {
	let command = params[0], coinBalance, text = '';
	try {
		coinBalance = jsonfile.readFileSync(file);
	} catch (e) {
		console.error(e);
	}

	if (!coinBalance) coinBalance = initCoinBalance();

	//!coin commands
	switch (command) {
		//Sets Coin balance per color
		case 'set':
		case 's':
			coinBalance = initCoinBalance();
			//check if numbers are used
			if (params.length > 1) {
				if (params[1].match(/\d+/g)) {
					for (let i = 0; i < params.length; i++) {
						let color = params[i].replace(/\d/g, "");
						let amount = params[i].replace(/\D/g, "");
						switch (color) {
							case 'h':
								coinBalance.hope = amount;
								break;
							case 'd':
								coinBalance.despair = amount;
								break;
							default:
								break;
						}
					}
				} else {
					for (let i = 0; i < params[1].length; i++) {
						let color = params[1][i];
						switch (color) {
							case 'h':
								coinBalance.hope = coinBalance.hope + 1;
								break;
							case 'd':
								coinBalance.despair = coinBalance.despair + 1;
								break;
							default:
								break;
						}
					}
				}
			}
			break;

		//Reset the Coin pool
		case 'reset':
			coinBalance = initCoinBalance();
			text += ` resets the Coin Pool`;
			break;
		//Add a coin to the pool as the result of Pain dominant
		case 'add':
		case 'a':
			coinBalance.despair++;
			text += ` adds a Despair coin`;
			break;
		//Use a hope coin from the Coin pool
		case 'hope':
		case 'h':
			[coinBalance, text] = useHope(message, params[1], coinBalance);
			break;
		//Use a despair coin from the Coin pool
		case 'despair':
		case 'd':
			[coinBalance, text] = useDespair(message, params[1], coinBalance);
			break;
		default:
			break;
	}
	message.reply(text);
	//Prints out coin pool to channel
	printCoinBalance(message, coinBalance);
	jsonfile.writeFileSync(file, coinBalance);
};

const initCoinBalance = () => {
	return {hope: 0, despair: 0, text: ''};
};

const printCoinBalance = (message, coinBalance) => {
	coinBalance.text = '';
	for (let i = 1; i <= coinBalance.hope; i++) coinBalance.text += ':sunny:';
	for (let i = 1; i <= coinBalance.despair; i++) coinBalance.text += ':cyclone:';
	if (!coinBalance.text) coinBalance.text = 'Coin pool is empty';
	if (coinBalance.text.length > 1500) coinBalance.text = `Too many Coins to display.`;
	message.channel.send(coinBalance.text).catch(error => console.error(error));

};

const useHope = (message, target, coinBalance) => {
	if (coinBalance.hope <= 0) return [coinBalance, `no Hope coins available, request will be ignored`];
	if (target === 's' || target === 'success') {
		let diceResult;
		try {
			diceResult = jsonfile.readFileSync(diceResultFile);
		} catch (e) {
			console.error(e);
			return [coinBalance, `error retrieving previous roll.`]
		}
		diceResult.roll.discipline.push(1);
		calcRoll(message, diceResult);
	}
	coinBalance.hope--;
	return [coinBalance, ` uses a Hope coin`];
};

const useDespair = (message, target, coinBalance) => {
	if (coinBalance.despair <= 0) return [coinBalance, ' no Despair coins available, request will be ignored'];
	if (!target) return [coinBalance, ' no pool targeted'];
	let diceResult;
	try {
		diceResult = jsonfile.readFileSync(diceResultFile);
	} catch (e) {
		console.error(e);
		return [coinBalance, `error retrieving previous roll.`]
	}
	let type = target.replace(/[^a-zA-Z]/g, '');

	switch (type) {
		case 'e':
			type = 'exhaustion';
			break;
		case 'd':
			type = 'discipline';
			break;
		case 'p':
			type = 'pain';
			break;
		case 'm':
			type = 'madness';
			break;
		case 'a':
			type = 'assistance';
			break;
		default:
			break;
	}

	if (!order.includes(type)) return [coinBalance, `${type} is not a valid pool`];

	if (target.includes('-')) {
		if (!diceResult.roll[type].includes(6)) return [coinBalance, `${type} does not have a 6 to remove`];
		diceResult.roll[type] = _.drop(diceResult.roll[type]);
	} else diceResult.roll[type].unshift(6);

	calcRoll(message, diceResult);

	coinBalance.despair--;
	coinBalance.hope++;
	return [coinBalance, ` uses a Despair coin`];
};

const calcRoll = (message, diceResult) => {
	diceResult.results.dominant = functions.getDominant(diceResult.roll);

	diceResult.results = functions.countSymbols(message, diceResult);

	jsonfile.writeFileSync(diceResultFile, diceResult);

	functions.printResults(message, diceResult.results);
};

module.exports = coin;
