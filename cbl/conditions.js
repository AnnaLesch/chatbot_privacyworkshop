// an example script using conditional statements

cbl.instructions(e => {

	e.html("<p>Please talk to the chatbot and then complete the survey.</p>");

});

cbl.script("conditions", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		s.set("number", cbl.random_item([1, 2, 3]));
		s.say("Hello, please pick a number between 1 and 3.");
	});

	s.match(/goodbye|bye/i, () => {
		s.say("Goodbye!")
		s.survey("conditions-survey");
	});

	s.match(/1|one/i, () => {
		if (s.get("number") == 1) s.do("_correct_"); else s.do("_wrong_");
	});

	s.match(/2|two/i, () => {
		if (s.get("number") == 2) s.do("_correct_"); else s.do("_wrong_");
	});

	s.match(/3|three/i, () => {
		if (s.get("number") == 3) s.do("_correct_"); else s.do("_wrong_");
	});

	s.match("_correct_", () => {
		s.say("That's right!");
		s.restart();
	});

	s.match("_wrong_", () => {
		s.say("Sorry, wrong number, try again!");
		s.restart();
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.");
	});

});

cbl.survey("conditions-survey", s => {

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
		"<pre>" + cbl.survey_results_json("conditions-survey")) + "</pre>";

});

cbl.start("conditions");
