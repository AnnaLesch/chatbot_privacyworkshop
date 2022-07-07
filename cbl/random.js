// an example script for randomly selecting responses

cbl.instructions(e => {

	e.html("<p>Please talk to the chatbot and then complete the survey.</p>");

});

cbl.script("random-coins", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		// say a randomly selected greeting
		s.say([
			"Hello, would you like to *flip* a coin?",
			"Hi, would you like to *flip* a coin?",
			"Would you like to *flip* a coin today?",
			"Let me know if you want to *flip* a coin.",
		]);
	});

	s.match(/goodbye|bye/i, () => {
		s.say("Goodbye!")
		s.survey("random-coins-survey");
	});

	s.match(/flip/i, () => {
		s.do(cbl.random_item(["_heads_", "_tails_"]));
	});

	s.match("_heads_", () => {
		s.say("Heads!");
		if (s.get("coin") == "heads") s.say("Wow, two heads in a row!");
		s.set("coin", "heads");
	});

	s.match("_tails_", () => {
		s.say("Tails!");
		if (s.get("coin") == "tails") s.say("Wow, two tails in a row!");
		s.set("coin", "tails");
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.")
	});

});

cbl.survey("random-coins-survey", s => {

	s.section("Questions about the interaction:");

	s.likert_scale([
		["n_enjoyed", "I enjoyed this interaction" ],
		["n_again", "I would like to talk to this chatbot again" ],
	]);

	s.section("Questions about you:");

	s.select("n_gender", "Gender",
		[
			["male", "Male"],
			["female", "Female"],
			["other", "Other"]
		]);

	s.input_range("n_age", "Age", 0, 199);

});

cbl.completed(e => {

	e.html("<p>Thank you for completing the survey, please email the "+
		"following JSON to the experiment leader:</p><br/>" +
		"<pre>" + cbl.survey_results_json("hello-survey")) + "</pre>";

});

cbl.start("random-coins");
