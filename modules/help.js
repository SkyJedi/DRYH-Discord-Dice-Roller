function help(message, topic) {
	switch (topic) {
		case "coin":
			message.channel.send(`\`\`\`prolog
!Coin: displays the current coin pool
!Coin Set/S DDDHHH: sets the coin pool to the desired level
!Coin Add/A: adds a despair coin due to dominant pain
!Coin Despair/D -/+D/Discipline: uses a despair coin to add/remove a 6 from the specified pool
!Coin Hope/H Success/S: uses a hope coin to add a 1 to discipline pool
!Coin Hope/H: uses a hope coin
\`\`\``);
			break;
		case "roll":
			message.channel.send(`\`\`\`prolog
!Roll DiceIdentifiers
DICE IDENTIFIERS
    D/Discipline = discipline dice
    E/Exhaustion = exhaustion dice
    M/Madness = madness Dice
    P/Pain = pain dice
	A/Assistance = discipline dice from an assisting player
	    
Examples:
    !roll ddeemp (must use single character identifiers)
    !roll 2d 2e 1m (must specify a number before each identifier)
\`\`\``);
			break;
		case "poly":
			message.channel.send(`\`\`\`prolog
!Poly: rolls any combination of polyhedral dice with modifier
Examples:
    poly 1d4 2d6+1 1d100-60 
\`\`\``);
			break;
		default:
			message.channel.send(`\`\`\`prolog
type '!Help [topic]' for further information
!Poly: rolls any combination of polyhedral dice
!Ver: displays bot version
!Help: displays help for topics

!Roll: rolls any combination of dont rest your head dice
!Coin: manages Hope and Despair Pool
\`\`\`
for more information or help join the FFG NDS Assistant Bot server https://discord.gg/G8au6FH

Don't Rest your Head by Evil Hat Productions
<https://www.evilhat.com/home/dont-rest-your-head-2/>
`);
			break;
	}
}

exports.help = help;