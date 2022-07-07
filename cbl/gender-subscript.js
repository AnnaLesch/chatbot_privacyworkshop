// an example gender experiment using subscripts instead of modes

cbl.instructions(e => {

	e.html("<p>Please talk to the chatbot and then complete the survey.</p>");

});

cbl.script("gender", s => {

	s.begin(() => {
		// randomly select which subscript to run
		s.run(cbl.random_item(["gender-female", "gender-male"]));
	});

	s.sub("gender-female", ss => {

		ss.begin(() => {
			s.set("voice", "Mary");
			s.say("Hi, I am your assistant, *Mary*. You can *change* to another assistant or *continue* with me.");
		});

		ss.match(/change/i, () => {
			s.say("OK, here are two other assistants ...");
			s.say("Hi, I am *Patricia*.", { voice: "Patricia" });
			s.say("Hi, I am *Jennifer*.", { voice: "Jennifer" });
			s.say("Who do you want to talk to?");
		});

		ss.match(/cont|mary/i, () => {
			s.set("voice", "Mary");
			s.say("Hi, I am Mary, good to meet you!");
			s.do("_done_");
		});

		ss.match(/pat/i, () => {
			s.set("voice", "Patricia");
			s.say("Hi, I am Patricia, good to meet you!");
			s.do("_done_");
		});

		ss.match(/jen/i, () => {
			s.set("voice", "Jennifer");
			s.say("Hi, I am Jennifer, good to meet you!");
			s.do("_done_");
		});

	});

	s.sub("gender-male", ss => {

		ss.begin(() => {
			s.set("voice", "James");
			s.say("Hi, I am your assistant, *James*. You can *change* to another assistant or *continue* with me.");
		});

		ss.match(/change/i, () => {
			s.say("OK, here are two other assistants ...");
			s.say("Hi, I am *John*.", { voice: "John" });
			s.say("Hi, I am *Robert*.", { voice: "Robert" });
			s.say("Who do you want to talk to?");
		});

		ss.match(/cont|james/i, () => {
			s.set("voice", "James");
			s.say("Hi, I am James, good to meet you!");
			s.do("_done_");
		});

		ss.match(/john/i, () => {
			s.set("voice", "John");
			s.say("Hi, I am John, good to meet you!");
			s.do("_done_");
		});

		ss.match(/rob/i, () => {
			s.set("voice", "Robert");
			s.say("Hi, I am Robert, good to meet you!");
			s.do("_done_");
		});

	});

	s.match("_done_", () => {
		s.say("We're done, please complete a short survey in a few seconds ...");
		s.delay(5000).then(() => {
			s.survey("gender-survey");
		});
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.");
	});

});

cbl.survey("gender-survey", s => {

	s.section("Questions about the interaction:");

	s.likert_scale([
		["n_enjoyed", "The interaction was enjoyable" ],
		["n_continue", "I want to continue interacting with the chatbot" ],
		["n_liked_last", "I liked the voice at the end more than the beginning" ],
		["n_quality_first", "Voice quality at the beginning was better than at the end" ],
		["n_recommend", "I would recommend the chatbot to friends" ],
		["n_quality_last", "Voice quality at the end was better than at the begining" ],
		["n_annoying", "The interaction was annoying" ],
		["n_liked_first", "I liked the voice at the beginning more than the end" ],
	]);

	s.select("n_hear", "I was able to hear the voices of the chatbot",
		[
			["yes", "Yes"],
			["no", "No"],
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
		"<pre>" + cbl.survey_results_json("gender-survey")) + "</pre>";

});

cbl.start("gender");
