// a simple example script that plays audio files

cbl.set("voice_volume", 0.9);

cbl.script("audio", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		s.say("Hello. Would you like to *play* music?");
	});

	s.match(/play/i, () => {
		s.say("I'm playing music. Let me know if you want it to *stop* playing.");
		// see README regarding setting the audio_prefix:
		cbl.play_audio("test.mp3", { vol: 0.9, vol_if_talking: 0.25 });
	});

	s.match(/stop/i, () => {
		s.say("OK, I stopped the music.");
		cbl.stop_audio();
	});

	s.match(/stop/i, () => {
		s.say("OK, I stopped the music.");
		cbl.stop_audio();
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.")
	});

});

cbl.start("audio");
