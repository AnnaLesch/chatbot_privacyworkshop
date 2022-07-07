# ChatBot Language and Experiment Framework

## Overview

CBL is a chatbot language and experiment framework that can generate interactve chatbots as single-page HTML files which can be used as web-based chatbot experiments or Amazon Mechanical Turk HITs.

## Project Layout
  
| Directory | Description |
| --- | --- |
| cbl | chatbot scripts |
| tmpl | HTML templates |
| tmpl/js | javascript libraries |
| tmpl/css | stylesheets |
| html | compiled experiments |
| lib | miscellaneous scripts |
| etc | AWS/mturk configuration |

## Installing

**Note:** For running some of the CBL scripts (e.g. 'mturk_install.py') **Python 3.6** or higher is required.

```
$ git clone https://github.com/audiolabs/cbl
$ cd cbl
$ python3 -mvenv env
$ source env/bin/activate
$ pip install -r lib/requirements.txt
```

## Building

The build process merges the CBL script along with the HTML template, stylesheets and JavaScript libraries into a single HTML file that can be accessed from a web browser or uploaded to Amazon Mechanical Turk.

To build all of the CBL scripts, use the following commands:

```
$ source env/bin/activate
$ make
```

This will create files in the html directory named chatbot-&lt;scriptname>.html.

To build a specific script:

```
$ source env/bin/activate
$ python lib/build.py --tmpl tmpl/chatbot.html cbl/script-name.js > html/my-output.html
```

This will create your chatbot in a file named html/my-output.html.

## Testing Locally

Open the local HTML file in a web browser, for example using a URL such as:

  file:///Users/myusername/Desktop/cbl/html/chatbot-hello.js.html

## Chat Bot Language

CBL is an embedded domain-specific language with JavaScript as the host language. CBL is implemented as a JavaScript library and any JavaScript code can be used within CBL scripts. However, CBL is designed in such a way that pre-existing knowledge of JavaScript is not necessarily required in order to write useful CBL scripts. Since CBL is valid JavaScript, it can run in most web browsers.

### Scripts

CBL scripts are defined using the following syntax:

```
cbl.script("script-name", s => {

	s.begin(() => {
		s.say("The script has begun.");
	});

	s.match(/someregexp/, () => {
		s.say("This regular expression matched.");
	});

	s.unknown(() => {
		s.say("Nothing matched.");
	});

});

cbl.start("script-name");

```

#### CBL Methods

  | Method | Description |
  | --- | --- |
  | cbl.start(scriptname) | begin an experiment (see Experiment Flow) |
  | cbl.run(scriptname) | switch to another script |
  | cbl.random\_item([a, b, c, ...]) | return a random item from an array |
  | cbl.random\_num(min, max) | return a random number between min and max (inclusive) |
  | cbl.set(varname, value) | set system variable to value |
  | cbl.set\_result(colname, value) | set survey result column to value |
  | cbl.play\_audio(filename) | play an audio file |
  | cbl.stop\_audio() | stop playing audio |

#### Script Methods

  | Method | Description |
  | --- | --- |
  | s.begin(fun) | execute a function when the script begins |
  | s.match(text\|regexp, fun) | execute a function when user input matches |
  | s.match\_if(str\|regexp, expr\_fun, fun) | conditionally execute a function when user input matches and expr\_fun returns true |
  | s.unknown(fun) | execute a function when the user input is not matched |
  | s.do(text) | simulate receiving user input and attempt to match |
  | s.sub(subname, fun) | define a subscript |
  | s.ret() | return from a subscript (does not execute begin again) |
  | s.run(subname, args) | run a subscript |
  | s.set(varname, value) | set script variable to value |
  | s.get(varname) | get value of script variable |
  | s.say(text, opts) | send a message to the user. if text is an array of strings then one string is randomly selected |
  | s.pause(ms) | pause for ms milliseconds before saying more text |
  | s.ready(fun) | execute a function when all pending say/pause commands are done |
  | s.survey(surveyname) | end the chatbot session and begin a survey |
  | s.restart() | restart the current script |

#### Example: Hello World

```
cbl.script("hello-world", s => {

	s.begin(() => {
		s.set("voice", "Mary");
		s.say("Hello world, I am a chatbot.");
	});

	s.match(/hi|hello/i, () => {
		s.say("Hello again!");
	});

	s.match(/goodbye|bye/i, () => {
		s.say("Goodbye!");
	});

	s.unknown(() => {
		s.say("Sorry, I don't understand.");
	});

});
```

### Experiment Flow

  1. Instructions
  2. Chatbot/Content
  3. Survey
  4. Completed

### Instructions

If instructions are defined they will be displayed before the chatbot session. Multiple instructions sections are supported.

#### Example: Simple Instructions

```
cbl.instructions(e => {
	e.html("<p>Please talk to the chatbot and then complete a survey.</p>");
});
```

### Surveys

Surveys are defined in a similar way as scripts.

#### Survey Methods

  | Method | Description |
  | --- | --- |
  | s.section(text) | display a section header |
  | s.likert\_scale([ [label, description], ... ], opts) | display a likert scale |
  | s.sem\_diff\_scale([ [label, word1, word2], ... ], opts) | display a semantic differential scale |
  | s.select(label, description, [ [ option\_label, option\_description ], ... ]) | display a select element |
  | s.input\_range(label, description, start, end) | display a range input |
  | s.input\_text(label, description) | display a text input |
  | s.textarea(label, description) | display a textarea |

#### Example: Simple Survey

```
cbl.survey("survey-name", s => {

   s.section("Questions about the interaction:");

   s.likert_scale([
      ["n_enjoyed", "The interaction was enjoyable" ],
      ["n_continue", "I want to continue interacting with the chatbot" ],
	], { points: 7 });

   s.section("Questions about you:");

	s.select("n_gender", "Gender",
		[
			["male", "Male"],
			["female", "Female"],
			["other", "Other"],
		]);

	s.input_range("n_age", "Age", 0, 199);

})
```

### Completed

The completed section is displayed after the survey.

#### Example: Simple Completed Section

```
cbl.completed(e => {
	e.html("<p>Thanks for completing the survey!</p>");
});
```

#### Example: Completed Section with Results

For debugging and internal testing it's possible to display the results at the end of the survey:

```
cbl.completed(e => {
	e.html("<p>Thank you for completing the survey, please email the " +
		"following JSON to the experiment leader:</p><br/>" +
		"<pre>" + cbl.survey_results_json("hello-survey")) + "</pre>";
});
```

Results can be displayed with the following functions:

cbl.survey\_results\_json(surveyname)

cbl.survey\_results\_csv(surveyname)


### Interacting with the web page

CBL scripts can easily manipulate the web page using jQuery:

```
cbl.script("change-color", s => {

	s.begin(() => {
		s.say("Do you want to change the background color to *red* or *blue*?");
	});

	s.match(/red/i, () => {
		$('body').css('background-color', 'red');
	});

	s.match(/blue/i, () => {
		$('body').css('background-color', 'blue');
	});

});
```

### Capturing match groups

You can use regular expression groups (specified with parentheses) to extract portions of the user response:

```
s.match(/my favorite color is (.*)$/i, m => {
	s.say("I'm glad to hear that your favorite color is " + m[1],
		{ method: 'browser_tts' })
});

```

In the above example, if the user said "my favorite color is blue" the variable m[0] would contain "my favorite color is blue" and m[1] would contain "blue".

### Notes

  * The chatbot will use bold text when a word is surrounded by \*asterisks\* and italic text when a word is surrounded by \_underscores\_.

  * Internet Explorer is not currently supported.

## Configuring speech

CBL can speak using pre-generated audio files or with real-time TTS using the Web Speech API (if supported by the user's browser).

Using pre-generated audio files is the default (see Generating audio below). To enable browser TTS for the entire script use:

```
cbl.set("say_method", "browser_tts");
```

To enable browser TTS for only specific say commands, use:

```
s.say("my message", { method: "browser_tts" })
```

## Generating audio

In some cases audio files can be generated by extracting sentences from the CBL script and then using ttsmp3 to generate speech. For example:

```
$ node lib/extract.js cbl/hello.js > sentences.json
$ python lib/ttsmp3.py sentences.json
$ mv *.mp3 html/audio
```

For complicated scripts it may be necessary to manually create the JSON file, the following is an example JSON file that can be used with ttsmp3:

```
{"Mary":["Hello world, I am a chatbot.","Hello again!","Goodbye!","Sorry, I don't understand."],"Joe":["Hello I am Joe."]}

```

If you want to generate audio files in a different language, for example German you can use the operator --lang:

```
python lib/ttsmp3.py --lang de sentences.json
```

The ttsmp3 script uses Google Translate TTS by default. It also supports Amazon Polly (you must first set environment variables with your AWS credentials):

```
python lib/ttsmp3.py --service polly --lang en-GB sentences.json
```

Here is a list of supported voices/languages with Amazon Polly:

https://docs.aws.amazon.com/polly/latest/dg/voicelist.html

## Uploading voices

After the audio is generated it should be uploaded to a publicly accessible 
web service, such as Amazon S3. The URL prefix should be set in your CBL
script. For example:

```
cbl.set("audio_prefix",
	"https://myaudiobucket.s3.eu-central-1.amazonaws.com/");
```
**Important:**

By default the audio files are expected to be in the directory html/audio, this will only work when playing audio from your local computer.
Therefore you need to put the files in a **publicly available** web service. 
If you use Amazon S3 you need to create a bucket and uncheck the default option "Block _all_ public access". 
In addition, once you have created a S3-Bucket for storing your audio files and you have uploaded your audio files, you need to select "Actions > Make Public".


## Step-by-step guide to running a CBL experiment on Mechanical Turk

1.	Check Requirements:
    - Create a compiled html of your CBL experiment following the instructions above.
    - If you do not have a Mechanical Turk (MT) Requester Account, set one up.
    - If you do not have an AWS developer account, set one up (e.g. the free tier account).
    - If your MT and AWS accounts are not linked, link them. You need to link them both for the sandbox environment (i.e. the simulation! https://requestersandbox.mturk.com/developer) and for the regular MT environment. This is important.

Once all requirements are met, set up your CBL experiment on AWS and MT:

2.	If you use audio files in your CBL experiment move them to S3-storage on AWS (see Section 'Uploading Voices')

3.	Set Worker *Qualifications* if necessary:

    Copy the file etc/mturk_default.json to etc/yourexperiment.json, and then edit the file as appropriate. 
    
    Note that you find *key words* for the qualification type data structure here: https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html. These keywords help you to define who can work your HIT, for example only workers from Germany.
    
	Moreover you can find *examples of setting qualification types in a programmatic environment* here: https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html#ApiReference_QualificationRequirementDataStructureArticle-the-locale-qualification.
    These tutorials are useful when wanting to *exclude or include workers who took part in a previous experiment*: 
    - https://blog.mturk.com/tutorial-managing-worker-cohorts-with-qualifications-e928cd30b173
    - https://blog.mturk.com/tutorial-best-practices-for-managing-workers-in-follow-up-surveys-or-longitudinal-studies-4d0732a7319b
    Note: Use the qualification\_requirements section to prevent your HIT from being listed publicly in the sandbox environment. You will need to create a new Qualification Type and assign the Qualification to your Worker ID at https://requestersandbox.mturk.com/qualification_types and https://requestersandbox.mturk.com/workers. If you don't care about having your experiment listed publicly in the sandbox, you can remove the qualification\_requirements section from the config file.


4.	Create a shell script called 'setkeys.sh' that looks like this and insert your AWS keys and the default region:
```
$ export AWS_ACCESS_KEY_ID="..."
$ export AWS_SECRET_ACCESS_KEY="..."
$ export AWS_DEFAULT_REGION="us-east-1"
```

Now you need to run your script 'setkeys.sh' in your bash environment:

    
```
. setkeys.sh
```

Mind the full stop at the beginning of the script! This sets the keys for your bash environment, which is necessary for you to access AWS via your terminal.

5.	Install your experiment on mturk in the sandbox environment:

```
$ python lib/mturk_install.py --env sandbox etc/yourexperiment.json html/chatbot-yourchatbot.html
```

6.	Write down your HIT ID and the HIT link. 

HIT ID and HIT link should be printed in your terminal after you run step 5 and they should look like this:

```
Created HIT: 335VBRURDKMUXN1CAZ4E7DZK4BV9EE
    
You can work the HIT here:
https://workersandbox.mturk.com/mturk/preview?groupId=3KTTL66PWI7O3VE0XTMW5DEL971VHT
```

7.	Test your CBL experiment in the MT sandbox environment.

You can get results in csv format from your sandbox test runs:

```
$ python lib/mturk_results.py --env sandbox etc/yourexperiment.json your-hit-id > results.csv
```

8.	Add money to your MTurk account -> https://requester.mturk.com/account -> Purchase Prepaid HITs.

9.	Run your CBL experiment live:

**Warning:** This will charge your account based on the reward and max assignments set in the config file.

Follow the above instructions, but use "--env live" instead of "--env sandbox" for the install and results scripts.

10. Get the results from your live experiment:

After results become available you can retrieve them in CSV format:

```
$ python lib/mturk_results.py --env live etc/yourexperiment.json your-hit-id > results.csv
```

## Running your external experiment inside a CBL script on Amazon Mechanical Turk

It's possible to create a CBL script that loads an external website inside an IFRAME, this allows you to use CBL instructions and surveys and easily install your experiment on mturk as a single HTML file.

First, you need to create a CBL script that displays your external experiment. You can use the cbl/chatless-iframe.js example script as a starting point:

Compile the CBL script:

```
$ python lib/build.py --tmpl tmpl/chatbot.html cbl/chatless-iframe.js > html/yourexperiment.html
```

Then you can run the mturk\_install script, which will install the html file as an HTMLQuestion and create a HIT:

```
$ python lib/mturk_install.py --env sandbox etc/yourexperiment.json html/yourexperiment.html

```

## Running your external experiment on Amazon Mechanical Turk

The mturk\_install script can also create ExternalQuestion HITs allowing you to host your experiment on your own server instead of uploading an HTML file to mturk. Note that this method doesn't necessarily use CBL scripts at all and the externally hosted experiment is responsible for sending result data to mturk. Compiled CBL scripts do this for you automatically. Please see [This Link](https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExternalQuestionArticle.html) for more information.

```
$ python lib/mturk_install.py --env sandbox etc/yourexperiment.json https://your-url-goes-here.com/your-experiment
```

## Managing MTurk HITs with the AWS Command Line interface

These two tutorials are useful for managing MTurk HITs with the AWS Command Line interface: 

https://blog.mturk.com/tutorial-crowdsourcing-from-the-command-line-a5bee86fdaa0

https://blog.mturk.com/tutorial-managing-mturk-hits-with-the-aws-command-line-interface-56eaabb7fd4c#584c

Specificially if you want to delete a HIT you may want to use:

``` 
(aws) mturk delete-hit

``` 

or 

``` 
(aws) mturk UpdateExpirationForHIT

``` 

In addition you can approve or reject HITs using command line (refer to the tutorials for more information).


