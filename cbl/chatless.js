// a simple example script for using the CBL framework without a chatbot

cbl.instructions(e => {

	e.html("<p>Please interact with the page and then complete the survey.</p>");

});

cbl.script("chatless", s => {

	s.begin(() => {

		// this replaces the chat interface. instead of changing the HTML here,
		// you can copy tmpl/chatbot.html to a new HTML file in the tmpl
		// directory and put your HTML inside the DIV with the ID 'content'.
		$('#content').html('<p>This is not a chatbot.</p>' +
			'<button id="mybtn">Continue To Survey</button>');

		// go to the survey when the button is clicked
		$('#mybtn').click(function() {
			s.survey("chatless-survey");
		});

	});

});

cbl.survey("chatless-survey", s => {

	s.section("Questions about the interaction:");

	s.likert_scale([
		["n_enjoyed", "I enjoyed this interaction" ],
	], { points: 7 });

	s.section("Questions about you:");

	s.select("n_gender", "Gender",
		[
			["male", "Male"],
			["female", "Female"],
			["other", "Other"]
		]);

	s.input_range("n_age", "Age", 0, 199);

});

// this is only used for local testing, it's ignored on mturk
cbl.completed(e => {

	e.html("<p>Thank you for completing the survey, please email the "+
		"following JSON to the experiment leader:</p><br/>" +
		"<pre>" + cbl.survey_results_json("chatless-survey")) + "</pre>";

});

cbl.start("chatless");
