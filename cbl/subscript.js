// an example of using scripts and subscripts

cbl.script("my-main-script", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		s.say("Hi. Would you like to *enter* the subscript or run " +
			"a *new* script?");
	});

	s.match(/hi|hello/i, () => {
		s.say("Hi from outside the subscript.");
		s.say("Would you like to *enter* the subscript?");
	});

	s.match(/enter/i, () => {
		s.say("Entering the subscript ...");$
		// run the subscript
		s.run("my-subscript");
	});

	s.match(/new/i, () => {
		s.say("Running the new script ...");$
		// switch to a new script
		cbl.run("my-new-script");
	});

	s.sub("my-subscript", ss => {

		ss.begin(() => {
			s.say("Hi, we are inside the subscript. Would you like to *return*?");
		});

		ss.match(/hi|hello/i, () => {
			s.say("Hi from inside the subscript.");
		});

		ss.match(/enter/i, () => {
			s.say("We're already inside the subscript.");
		});

		ss.match(/return/i, () => {
			s.say("Exiting the subscript ... (try saying hi again)");
			// return from the subscript to the main script
			s.ret();
		});

	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.");
	});

});

cbl.script("my-new-script", s => {

	s.begin(() => {
		s.set("voice", "Joe");
		s.say("Hi. This is an entirely different script. Would you like to go " +
		"*back* to the other script?");
	});

	s.match(/back/i, () => {
		s.say("OK, returning to the other script ...");$
		// run the main script again
		cbl.run("my-main-script");
	});

	s.unknown(() => {
		s.say("I don't know what that means!");
	});

});

cbl.start("my-main-script");
