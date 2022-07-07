// example script for using the CBL framework with an external web page

// replace this with the URL of your experiment:
const external_url = "https://webaudioapi.com/samples/room-effects/";

cbl.script("chatless-iframe", s => {

	s.begin(() => {

		// this replaces the chat interface with an external web page
		// inside of an iframe
		$('#main').html('<iframe src="' + external_url + '"></iframe>');
		$('#main').css('margin', '0px');
		$('#main').css('padding', '0px');
		$('#main').css('height', '100%');
		$('#main').css('width', '100%');
		$('iframe').css('position', 'absolute');
		$('iframe').css('padding', '0px');
		$('iframe').css('border', 'none');
		$('iframe').css('height', '100%');
		$('iframe').css('width', '100%');

	});

});

cbl.start("chatless-iframe");
