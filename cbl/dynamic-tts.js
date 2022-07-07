// an example script that uses a combination of audio files and browser TTS.

// uncomment the line below to use browser TTS for the entire script:
// cbl.set("say_method", "browser_tts");

// multiple instructions sections are allowed:

cbl.instructions(e => {

	e.html("<p>The experiment is about to begin.</p>");

});

cbl.instructions(e => {

	// all possible instructions
	var instructions = [
		"Please enter your name and then continue to the chatbot.",
		"Please continue to the chatbot after entering your name."
	];

	// hide the continue button until talking is done
	$('#btn-continue').hide();

	// randomly choose which instructions to show
	var which = cbl.random_num(0, instructions.length - 1);

	// save the random choice as a result in the output data
	cbl.set_result("instructions_num", which);

	// display the chosen instructions and the input box
	e.html('<p>' + instructions[which] + '</p>' +
		'<input id="txt-username" type="text" class="form-control" ' +
		' placeholder="Enter your name here." /><br/>');

	// speak the instructions and then show the continue button when done
	cbl.play_voice("Mary", instructions[which], {
		method: 'browser_tts',
		done: () => { $('#btn-continue').show(); }
	});

	// update the global username variable with their name
	$('#txt-username').change(function() {
		cbl.set("username", $('#txt-username').val());
	});

});

cbl.script("dynamic-tts", s => {

	s.begin(() => {

		s.set("voice", "Mary");

		// choose a random color and set a script variable:
		s.set("color", cbl.random_item(["red", "blue", "green"]));

		// speak the username with browser TTS:
		s.say("Hello " + cbl.get("username") + ", I am a chatbot.",
			{ method: 'browser_tts' });

		// speak the contents of a script variable with browser TTS:
      s.say("My favorite color is " + s.get("color"),
			{ method: 'browser_tts' });

		// speak from an audio file (if it exists):
		s.say("What's your favorite color?");

   });

	// in case they specify what they're answering, capture the color:
	s.match(/my favorite color is (.*)$/i, m => {
		s.say("I'm glad to hear that your favorite color is " + m[1],
			{ method: 'browser_tts' })
	});

	// this will capture all other responses
	s.match(/^(.*)$/, m => {
		s.say("I'm glad to hear that your favorite color is " + m[1],
			{ method: 'browser_tts' })
	});

	// note: no 'unknown' section is necessary because we've already handled
	// all possible responses

});

cbl.start("dynamic-tts");
