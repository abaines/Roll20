/* jshint undef: true */
/* globals
 state,
 sendChat,
 randomInteger,
 _,
 on
 */

var luckRecovery = luckRecovery || (function()
{
	'use strict';

	let version = '1.0', //Next version will attempt to add the value to the character sheet.

	sentAlready = false,

		/**
		 * Parses the input parameters to retrive the character name.
		 * @param inputParams
		 * @returns {T}
		 */
	getCharName = function (inputParams)
	{
	    let charName = '';
		for (let i = 0; i < inputParams.length -1; i++)
		{
		    charName = charName + ' ' + inputParams[i];
		}
		return charName;
	},

		/**
		 * Utility function to determine if a variable is a number.
		 * @param obj
		 * @returns {boolean}
		 */
	isNumeric = function(obj)
	{
		return !isNaN(obj - parseFloat(obj));
	},

		/**
		 * Display in chat the result of the luck recovery for the given character and roll.
		 * @param charName
		 * @param currLuck
		 * @param rolld100
		 * @param luck1Roll
		 * @param luck2Roll
		 * @param newluck
		 */
	showNewLuck = function(charName, currLuck, rolld100, luck1Roll, luck2Roll, newLuck)
	{
	    let luckPass = luck1Roll + 5;
	    let luckFail = luck1Roll + luck2Roll + 10;
	    let prefixMsg = charName + ' - your current luck is ' + currLuck + ". You rolled a " + rolld100 + '. ';

	    if (rolld100 <= currLuck)
	    {
	        prefixMsg = prefixMsg + '<br> You succeeded on your Luck roll; therefore, you add ' + luckPass + ' to your current luck (1d10 + 5). ';
	        prefixMsg = prefixMsg + '<br>Your d10 roll was ' + luck1Roll + ".";
	    } else
	    {
	        prefixMsg = prefixMsg + '<br> You failed on your Luck roll; therefore, you add ' + luckFail + ' to your current luck (2d10 + 10).';
	        prefixMsg = prefixMsg + '<br>Your 2d10 rolls were ' + luck1Roll + " and " + luck2Roll + ".";
	    }

		sendChat('Luck Recovery', prefixMsg);
	},

		/**
		 * Performs the actual logic to determine the luck recovery.
		 * @param fumbleParams
		 */
	parseLuckRecovery = function(inputParams)
	{
		let rolld100 = randomInteger(100); // Default to a random roll.
		let luck1Roll = randomInteger(10);
		let luck2Roll = randomInteger(10);
		let charName = getCharName(inputParams);
		let currLuck = 0;
		let newLuck = currLuck;

		// No parameters so display the default chart and a random roll.
		if (inputParams.length === 0)
		{
			//showFumble(chart, rolled);
			return;
		}

		// Single parameter that is numeric so set the roll value to the parameter and use the default fumble chart.
		if (inputParams.length >= 2 && isNumeric(inputParams[inputParams.length - 1]))
		{
			currLuck = inputParams[inputParams.length - 1];

			if (rolld100 <= currLuck){
			    newLuck += luck1Roll + 5;
			}else
			{
			    newLuck += luck1Roll + luck2Roll + 10;
			}

			showNewLuck(charName, currLuck, rolld100, luck1Roll, luck2Roll, newLuck);
		} else
		{
	        sendChat('Luck Recovery', charName + ': Invalid parameters given, or something went wrong. GM take over.'  + inputParams.length.toString() + ' ' + inputParams[inputParams.length - 1]);
		}
	},

    	/**
    	 * Handle chat events
    	 *
    	 * @param {object} msg
    	 */
	handleChatMessage = function(msg)
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

		if (msg.content.substr(0,13) !== "!luckRecovery")
		{
		    //sendChat(' returning msg.type and content', msg.type + " " + msg.content.substr(0,12));
		    //sentAlready = true;
			return;
		} else
		{
		    //sendChat(' continuing msg.type and content', msg.type + " " + msg.content);
		    //sentAlready = true;
		}

		let content = msg.content;
		let words = content.split(' '); // Split each word into an array.
		words.shift(); // Remove "!luckRecovery"
		parseLuckRecovery(words); // Parse the input parameters.
	},

	/**
	 * Start luckRecovery and handle chat events.
	 */
	init = function()
	{
		log('Starting Pulp Luck Recovery v' + version);

		on("chat:message", function(msg)
		{
			handleChatMessage(msg)
		});
	};

	return {
		init: init
	};
}());

/**
 * Fires when the page has loaded.
 */
on("ready", function()
{
	'use strict';
    log('Initializing luck recovery');
	luckRecovery.init();
});