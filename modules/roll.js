const dice = require('../functions').dice;
const config = require('../config');
const order = ['discipline', 'madness', 'exhaustion', 'pain', 'assistance'];
const _ = require('lodash');
const jsonfile = require('jsonfile');
const file = 'data/diceResult.json';

const roll = (message, params) => {
	let diceResult, diceOrder;
	if (!diceResult) diceResult = initDiceResult();
	if (!params[0]) {
		message.reply('No dice rolled.');
		return;
	}
	//process each identifier and set it into an array
	diceOrder = processType(message, params);
	if (!diceOrder) return;
	//rolls each die and begins rollResults
	diceOrder.forEach(die => {
		if (!diceResult.roll[die]) diceResult.roll[die] = [];
		diceResult.roll[die].push(dice(6));
		diceResult.roll[die].sort().reverse();
	});

	//get dominant
	diceResult.results.dominant = getDominant(diceResult.roll);

	//counts the symbols rolled and builds the results text
	diceResult.results = countSymbols(message, diceResult);
	//write diceResult to file
	jsonfile.writeFileSync(file, diceResult);
	printResults(message, diceResult.results);
};

//init diceResult
const initDiceResult = () => {
	return {
		roll: {
			discipline: [],
			exhaustion: [],
			madness: [],
			pain: [],
			assistance: [],
		},
		results: {
			success: 0,
			dominant: '',
			text: '',
		}
	};
};

const processType = (message, params) => {
	let diceOrder = [], finalOrder = [];
	if (params.length > 0) {
		if ((params[0]).match(/\d+/g)) {
			for (let i = 0; i < params.length; i++) {
				let diceQty = +(params[i]).replace(/\D/g, "");
				let color = params[i].replace(/\d/g, "");
				if (diceQty > +config.maxRollsPerDie) {
					message.reply('Roll exceeds max roll per die limit of ' + config.maxRollsPerDie + ' . Please try again.');
					return false;
				}
				for (let j = 0; j < diceQty; j++) {
					diceOrder.push(color);
				}
			}
		} else {
			params = params.join('');
			for (let i = 0; i < params.length; i++) {
				diceOrder.push(params[i]);
			}
		}
	} else {
		message.reply('No dice rolled.');
		return false;
	}

	diceOrder.forEach(die => {
		switch (die) {
			case 'discipline':
			case 'd':
			case 'white':
			case 'w':
				finalOrder.push('discipline');
				break;
			case 'exhaustion':
			case 'e':
			case 'black':
			case 'k':
				finalOrder.push('exhaustion');
				break;
			case 'madness':
			case 'm':
			case 'red':
			case 'r':
				finalOrder.push('madness');
				break;
			case 'pain':
			case 'p':
			case 'blue':
			case 'b':
				finalOrder.push('pain');
				break;
			case 'a':
			case 'assist':
			case 'assistance':
				finalOrder.push('assistance');
				break;
			default:
				break;
		}
	});
	return finalOrder;
};

const countSymbols = (message, diceResult) => {
	let results = {dominant: diceResult.results.dominant, success: 0, text: ''};
	diceResult = diceResult.roll;
	Object.keys(diceResult).sort((a, b) => order.indexOf(a) - order.indexOf(b)).forEach(type => {
		if (diceResult[type].length > 0) {
			results.text += `**${_.upperFirst(type)}:** \`(${diceResult[type].join(', ')})\`\n`;
			if (type !== 'pain') results.success += diceResult[type].filter(die => die < 4).length;
			else results.success -= diceResult[type].filter(die => die < 4).length;
		}
	});

	if (results.success >= 0) results.text += `**Player** succeeds with **${results.success}**, `;
	else results.text += `**GM** succeeds with **${-results.success}**, `;

	results.text += `**${_.upperFirst(results.dominant)}** is dominant.`;

	if (results.text.length > 1500) results.text = 'Too many dice to display.';
	return results;
};

const getDominant = (diceResult) => {
	let maxLength = [];
	order.slice(0, -1).forEach(type => maxLength.push(diceResult[type].length));
	maxLength = Math.max(...maxLength);

	let currentArray = order.slice(0, -1);
	for (let i = 0; maxLength >= i; i++) {
		let compare = [], nextArray = [];
		currentArray.forEach(type => diceResult[type][i] && compare.push(diceResult[type][i]));
		compare = Math.max(...compare);

		currentArray.forEach(type => (diceResult[type][i] >= compare) && nextArray.push(type));

		if (1 === nextArray.length) return [...nextArray];

		if (!nextArray.length) {
			switch (true) {
				case currentArray.includes('discipline'):
					return 'discipline';
				case currentArray.includes('madness'):
					return 'madness';
				case currentArray.includes('exhaustion'):
					return 'exhaustion';
				case currentArray.includes('pain'):
					return 'pain';
				default:
					break;
			}
			break;
		}
		currentArray = nextArray
	}
};

const printResults = (message, diceResult) => {
	if (diceResult.text) message.channel.send(diceResult.text).catch(error => console.error(error));
	else message.reply("No dice rolled.");
};

module.exports = {roll, countSymbols, getDominant, printResults};


