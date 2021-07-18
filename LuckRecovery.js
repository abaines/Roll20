/* jshint undef: true */
/*
globals
state,
sendChat,
randomInteger,
_,
on
 */

var luckRecovery = luckRecovery || (function ()
	{
		'use strict';

		let version = '1.0'; //Next version will attempt to add the value to the character sheet.

		let sentAlready = false;

		/**
		 * Parses the input parameters to retrive the character name.
		 * @param inputParams
		 * @returns {T}
		 */
		let getCharName = function (inputParams)
		{
			let charName = '';
			for (let i = 0; i < inputParams.length - 1; i++)
			{
				charName = charName + ' ' + inputParams[i];
			}
			return charName.trim();
		}

		/**
		 * Utility function to determine if a variable is a number.
		 * @param obj
		 * @returns {boolean}
		 */
		let isNumeric = function (obj)
		{
			return !isNaN(obj - parseFloat(obj));
		}

		/**
		 * Display in chat the result of the luck recovery for the given character and roll.
		 * @param charName
		 * @param currLuck
		 * @param rolld100
		 * @param luck1Roll
		 * @param luck2Roll
		 * @param newluck
		 */
		let showNewLuck = function (charName, currLuck)
		{
			log("showNewLuck `" + charName + "` `" + currLuck + "`");

			let rolld100 = randomInteger(100); // Default to a random roll.
			let luck1Roll = randomInteger(10);
			let luck2Roll = randomInteger(10);
			let luck3Roll = randomInteger(10);

			let luckPass = luck1Roll + 5;
			let luckFail = luck1Roll + luck2Roll + 10;

			let prefixMsg = '<br>Your starting luck is ' + currLuck + ".";
			prefixMsg += "<br>You rolled a " + rolld100 + '.';

			let newLuck = currLuck;

			if (rolld100 <= currLuck)
			{
				newLuck += luckPass;
				prefixMsg = prefixMsg + '<br>👎 You succeeded on your Luck roll;<br> ∴ you add ' + luckPass + ' (1d10 + 5) to your current luck. ';
				prefixMsg = prefixMsg + '<br>Your d10 roll was ' + luck1Roll + ".";
			}
			else
			{
				newLuck += luckFail;
				prefixMsg = prefixMsg + '<br>👍 You failed on your Luck roll;<br> ∴ you add ' + luckFail + ' (2d10 + 10) to your current luck.';
				prefixMsg = prefixMsg + '<br>Your 2d10 rolls were ' + luck1Roll + " and " + luck2Roll + ".";
			}

			prefixMsg += "<br>🎲 Your new luck value is <b>" + newLuck + "</b>.";

			// lucky trait
			prefixMsg = prefixMsg + '<br>If you have the Lucky Trait, your d10 roll was ' + luck3Roll + ".";
			var luckyNewLuck = newLuck + luck3Roll;
			prefixMsg += "<br>🍀 Your Lucky Trait new luck is <b>" + luckyNewLuck + "</b>.";

			sendChat(charName + "\'s Luck Recovery", prefixMsg);
		}

		/**
		 * Performs the actual logic to determine the luck recovery.
		 * @param fumbleParams
		 */
		let parseLuckRecovery = function (inputParams)
		{
			let charName = getCharName(inputParams);

			let paramslen = inputParams.length;

			// No parameters so display the default chart and a random roll.
			if (paramslen === 0)
			{
				//showFumble(chart, rolled);
				return;
			}

			let lastParam = inputParams[paramslen - 1];

			// Single parameter that is numeric so set the roll value to the parameter and use the default fumble chart.
			if (paramslen >= 2 && isNumeric(lastParam))
			{
				let currLuck = parseFloat(lastParam);

				showNewLuck(charName, currLuck);
			}
			else
			{
				let msg = charName + ': Invalid parameters given, or something went wrong. GM take over. ' + paramslen + ' ' + lastParam;
				sendChat('Luck Recovery', msg);
			}
		}

		/**
		 * Handle chat events
		 *
		 * @param {object} msg
		 */
		let handleChatMessage = function (msg)
		{
			// For runtime debugging
			if (sentAlready)
			{
				return;
			}

			// Is the message the `!fumble` command?
			if (msg.type !== "api")
			{
				return;
			}

			if (msg.content.substr(0, 13) !== "!luckRecovery")
			{
				//sendChat(' returning msg.type and content', msg.type + " " + msg.content.substr(0,12));
				//sentAlready = true;
				return;
			}
			else
			{
				//sendChat(' continuing msg.type and content', msg.type + " " + msg.content);
				//sentAlready = true;
			}

			let content = msg.content;
			let words = content.split(' '); // Split each word into an array.
			words.shift(); // Remove "!luckRecovery"
			parseLuckRecovery(words); // Parse the input parameters.
		}

		/**
		 * Start luckRecovery and handle chat events.
		 */
		let init = function ()
		{
			log('Starting Pulp Luck Recovery v' + version);

			on("chat:message", function (msg)
			{
				handleChatMessage(msg)
			}
			);
		};

		log('luckRecovery object');

		let ret =
		{
			init: init
		};

		return ret;
	}
		());

/**
 * Fires when the page has loaded.
 */
on("ready", function ()
{
	'use strict';
	log('Initializing luck recovery');
	luckRecovery.init();
	log('init ready');
}
);
