// a simple example script that says hello and goodbye

cbl.instructions(e => {

	e.html("<p>This is a short pre-survey to the Privacy Workshop. </p> <p> On the next page you are going to interact with a chatbot. To interact with the chatbot you just have to write something and click send or press enter. <b>Please type in your complete answer before sending it to the chat.</b></p><p>Now please press continue to start the interaction.</p>");

});

cbl.script("privacy-workshop", s => {

	s.begin(() => {
	    s.set("voice", "Bot");
		s.say("Hi, I'd like to ask you a few questions that help us to create realistic user personas for the privacy workshop.");
		s.say("May I start by asking you: 'How old are you?' Please choose from the options below. <br> [A] 20-30 <br>[B] 30-40<br>[C] 40-50<br>[D] >50");
	});

	s.unknown(() => {
		s.run("pipeline_subscript");
	});

	s.sub("pipeline_subscript", pipeline => {

        pipeline.begin(() => {
            s.say("Take a look at the picture above. It shows the teams that are involved in the speaker project. Please indicate what group you belong to. If you don't relate to any of those groups, please enter your current occupation.");
            $('.msgs').append('<img id="theImg" src="images/SpeakerPipeline.png" width="600" height="300" />');
        });

        pipeline.unknown(() => {
            s.say("Great! Let's talk about your job in more detail.");
            pipeline.run("job_love_subscript");
        });

        pipeline.sub("job_love_subscript", job_love => {

	        job_love.begin(() => {
	            s.say("What do you like about your job?");
	        });

            job_love.unknown(() => {
                s.say("Glad to hear that! I got two more work-related questions for you.")
                job_love.run("tools_subscript");
            });

            job_love.sub("tools_subscript", tools => {

                tools.begin(() => {
                    s.say("What software & tools do you use on a daily basis?");
                });

                tools.unknown(() => {
                    tools.run("datacycle_subscript");
                });

                tools.sub("datacycle_subscript", datacycle => {

                    datacycle.begin(() => {
                        s.say("Awesome! Let's talk about data you are working with. Data go through different stages when we process them. These stages are captured in a 'data life cycle' as shown in the picture above. Designers, engineers and managers may not be involved in each stage. In which stages are you involved in most, in which least?");
                        $('.msgs').append('<img id="theImg" src="images/data_lifecycle.png" height="230" width="230"/>');
                    });

                    datacycle.unknown(() => {
                        s.say("Thanks for your answer! Let's dive into the topic of privacy!")
                        datacycle.run("general_privacy_subscript");
                    });

                    datacycle.sub("general_privacy_subscript", general_privacy => {

                        general_privacy.begin(() => {
                            s.say("When you think about 'personal data', what types of personal data come to your mind?");
                        });

                        general_privacy.unknown(() => {
                            s.say("Interesting! I got one more privacy-related question for you.");
                            general_privacy.run("privacy_awareness_subscript");
                        });

                        general_privacy.sub("privacy_awareness_subscript", privacy_awareness => {

                            privacy_awareness.begin(() => {
                                s.say("In the past month, was there a time you decided to protect your personal data? If so, tell me about it briefly.");
                            });

                            privacy_awareness.unknown(() => {
                                privacy_awareness.run("action_subscript");
                            });

                            privacy_awareness.sub("action_subscript", action => {

                                action.begin(() => {
                                    s.say("Awesome, we are done! Thank you for your answers. Let's get ready for the privacy workshop! In the next week, pay attention to the different types of data you work with as part of your job and related privacy and security issues! Could you do that as preparation for the workshop?");
                                });

                                action.unknown(() => {
                                    action.survey("survey");
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

cbl.survey("survey", s => {

    s.section("What are you hoping to gain from this workshop?");

	s.textarea("n_feedback", "", { rows: 10 } );

	s.section("We will delete your data after we have evaluated the workshop, which we aim to do within one month after the workshop. If you'd like to delete your data earlier, you can construct a unique code by providing answers to the following questions. This code allows us to match you data with you when you contact us. If you want to delete your data just send a mail with your code to anna.leschanowsky@iis.fraunhofer.de and we'll delete them.")

    s.input_text("n_motherName", "First letter of your mother's name");
    s.input_text("n_fatherName", "First letter of your father's name");
    s.input_text("n_birthPlace", "First letter of your place of birth");
    s.input_text("n_birthyear", "Last digit of your birthyear");
    s.input_text("n_birthday", "Last digit of your birthday");
});

cbl.completed(e => {

	e.html("<p>Thank you for completing the survey, your results were sent to the workshop organisers</p>");

});

cbl.start("privacy-workshop");
