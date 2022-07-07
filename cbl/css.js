// an example script for changing how the web page looks based on user input

cbl.instructions(e => {

	e.html("<p>Please talk to the chatbot and then complete the survey.</p>");

});

cbl.script("css", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		s.set("mode", "welcome");
		s.say("Hello, would you like to *change* the background color?");
	});

	s.match(/goodbye|bye/i, () => {
		s.say("Goodbye!")
		s.survey("css-survey");
	});

	// this will only match in "welcome" mode
	s.match_if(/change/i, s => s.get("mode") == "welcome", () => {
		s.say("Would you like to change the background to *red* or *blue*?");
		s.set("mode", "change");
	});

	// this will only match in "change" mode
	s.match_if(/red/i, s => s.get("mode") == "change", () => {
		$('body').css('background-color', 'red');
		s.restart();	
	});

	// this will only match in "change" mode
	s.match_if(/blue/i, s => s.get("mode") == "change", () => {
		$('body').css('background-color', 'blue');
		s.restart();	
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.");
	});

});

cbl.survey("css-survey", s => {

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
		"<pre>" + cbl.survey_results_json("css-survey")) + "</pre>";

});

cbl.start("css");
