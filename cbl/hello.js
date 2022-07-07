// a simple example script that says hello and goodbye

cbl.instructions(e => {

	e.html("<p>Please talk to the chatbot and then complete the survey.</p>");

});

cbl.script("hello-world", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		s.say("Hello world, I am a chatbot.");
	});

	s.match(/hi|hello/i, () => {
		s.say("Hello again!");
	});

	s.match(/goodbye|bye/i, () => {
		s.say("Goodbye!")
		s.survey("hello-survey");
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.")
	});

});

cbl.survey("hello-survey", s => {

	s.section("Questions about the interaction:");

	s.likert_scale([
		["n_enjoyed", "I enjoyed this interaction" ],
		["n_again", "I would like to talk to this chatbot again" ],
	], { points: 7, agree: "Yes!", disagree: "No!" });

	s.section("Questions about you:");

	s.select("n_gender", "Gender",
		[
			["male", "Male"],
			["female", "Female"],
			["other", "Other"]
		]);

	s.input_range("n_age", "Age", 0, 199);

	s.section("More questions:");

	s.textarea("n_feedback", "Optional Feedback", { rows: 10 } );

});

cbl.completed(e => {

	e.html("<p>Thank you for completing the survey, please email the "+
		"following JSON to the experiment leader:</p><br/>" +
		"<pre>" + cbl.survey_results_csv("hello-survey")) + "</pre>";

});

cbl.start("hello-world");
