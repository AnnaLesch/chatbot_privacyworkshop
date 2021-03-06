/* CBL2 Intepreter */

var cbl = new function() {

	var self = this;

	self.vars = {};
	self.scripts = {};
	self.surveys = {};
	self.survey_defs = {};
	self.output = [];

	self.mturk_mode = false;

	self.instructions_funs = [];
	self.instructions_idx = 0;
	self.completed_fun = null;
	self.active_script = null;
	self.active_survey = null;

	self.get = function(k) { console.log("cbl.get", k); return self.vars[k]; };
	self.set = function(k, v) { console.log("cbl.set", k, v); self.vars[k] = v };

	self.set("audio_prefix", "audio/");
	self.set("voice_volume", 0.9);
	self.set("say_method", "audio_file");

	self.debug = true;
	self.log = function(...l) { if (self.debug) console.log(...l); };

	self.random_item = function(arr) {
		var item = arr[Math.floor(Math.random() * arr.length)];
		cbl.log("randomly selected", item);
		return item;
	};

	self.random_num = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

	// start the experiment flow
	self.start = function(scriptname) {

		cbl.log("starting " + scriptname);

		self.transcript = "";
		self.script_name = scriptname;
		self.talking = false;

		if (window.location.href.includes("mturk"))
			self.mturk_mode = true;

		if (self.mturk_mode) {

			$('#btn-finish').clone().attr('type', 'submit').insertAfter('#btn-finish').prev().remove();
	      self.workerId = turkGetParam('workerId');
	      self.assignmentId = turkGetParam('assignmentId');
	      self.hitId = turkGetParam('hitId');
	      self.answer_url = decodeURIComponent(turkGetParam('turkSubmitTo'));

			console.log("workerId", self.workerId);
			console.log("assignmentId", self.assignmentId);
			console.log("hitId", self.hitId);
			console.log("answer_url", self.answer_url);

			$('#survey_form').attr('action',
				self.answer_url + '/mturk/externalSubmit');

			$('input[name=assignmentId]').val(self.assignmentId);
			$('input[name=scriptName]').val(self.script_name);

		}

		$('#btn-finish').click(function() {
			if (self.active_survey && !self.validate_survey(self.active_survey))
				return false;
			if (self.completed_fun) {
				var s = new CBL2Completed();
				self.completed_fun(s);
			}
			$('#survey').hide();
			$('#completed').show();
			self.survey_results_csv(self.active_survey);
		});

		if (self.instructions_funs.length) {
			$('#instructions').show();
			$('#content').hide();
			$('#btn-continue').click(function() {
				if (self.instructions_idx == self.instructions_funs.length - 1) {
					self.instructions_done();
				} else {
					self.instructions_idx += 1;
					self.instructions_next();
				}
			});
			self.instructions_next();
		} else {
			self.instructions_done();
		};

	};

	self.instructions_next = function() {
		var s = new CBL2Instructions();
		self.instructions_funs[self.instructions_idx](s);
	};

	self.instructions_done = function() {
		$('#instructions').hide();
		$('#content').show();
		cbl.run(self.script_name);
	};

	// init the chat interface
	self.init_chat = function() {

      $('#btn-send').click(function() {
         var msg = $('#txt-input').val();
         self.msg_send(msg);
         $('#txt-input').val('');
      });

      $('#txt-input').keypress(function(e) {
         if (e.which == 13) {
            $('#btn-send').click();
         }
      });

	};

	// display a sent message (from the user)
   self.msg_send = function(msg) {
      self.transcript += "[user] " + msg + "; ";
      $('.msgs').append('<div class="msg-out msg-bubble msg-bubble-out"> '
			+ msg + '</div>');

      self.scroll_to_bottom();
      self.active_script.input(msg);
   };

	// display a received message (from the chatbot)
   self.msg_receive = function(name, msg, opts, cb) {

      msg = msg.replace(/\*([^*]+?)\*/g, '<b>$1</b>')
      msg = msg.replace(/\_([^*]+?)\_/g, '<i>$1</i>')

      self.transcript += "[" + name + "] " + msg + "; ";
      if (name)
         $('.msgs').append('<div class="msg-in msg-bubble msg-bubble-in">['
				+ name + '] ' + msg + '</div>')
      else
         $('.msgs').append('<div class="msg-in msg-bubble msg-bubble-in"> ' +
				msg + '</div>')

      self.scroll_to_bottom();
		self.play_voice(name, msg, opts);

   };

	// play audio file using a voice
	self.play_voice = function(name, msg, opts) {

		var method = self.get("say_method");

		if (opts && opts['method']) method = opts['method'];

		self.talking = true;

		$('#btn-send').attr("disabled", true);

		if (method == "browser_tts") {

			cbl.log("saying with browser tts", msg);

			var ttsmsg = new SpeechSynthesisUtterance(msg)
			ttsmsg.onend = function() {
				self.talking = false;
				$('#btn-send').attr("disabled", false);
				if (opts && opts['done']) opts['done']();
			};
			window.speechSynthesis.speak(ttsmsg);

		}

		if (method == "audio_file") {

			var fn = self.ttfn(name, msg);
			cbl.log("playing audio file", fn);

			if (self.audio_playing)
				self.audio_playing.volume(self.audio_playing_vit);

			var sound = new Howl({
				src: [self.get("audio_prefix") + fn],
				autoplay: true,
				loop: false,
				volume: self.get("voice_volume"),
				onend: function() {
					self.talking = false;
					if (self.audio_playing)
						self.audio_playing.volume(self.audio_playing_vol);
					$('#btn-send').attr("disabled", false);
					if (opts && opts['done']) opts['done']();
				},
				onloaderror: function() {
					self.talking = false;
					if (self.audio_playing)
						self.audio_playing.volume(self.audio_playing_vol);
					$('#btn-send').attr("disabled", false);
				}
			});

		}

	};

	self.audio_playing = null;
	self.audio_playing_vol = 0.9;
	self.audio_playing_vit = 0.9;

	// play audio file
	self.play_audio = function(fn, opts, cb) {

		self.audio_playing_vol = 0.9;
		self.audio_playing_vit = 0.9;

		if (opts && opts['vol']) self.audio_playing_vol = opts['vol'];
		if (opts && opts['vol_if_talking'])
			self.audio_playing_vit = opts['vol_if_talking'];

		if (self.audio_playing) {
			self.stop_audio();
		}

		cbl.log("playing audio file", fn);
		self.audio_playing = new Howl({
			src: [self.get("audio_prefix") + fn],
			autoplay: true,
			loop: false,
			volume: self.audio_playing_vol,
			onend: function() {
				self.audio_playing = null;
				if (cb) cb();
			},
			onloaderror: function() {
				self.audio_playing = null;
				if (cb) cb();
			}
		});

	};

	self.play_audio_volume = function(vol) {
		if (self.audio_playing) self.audio_playing.volume(vol);
		self.audio_playing_vol = vol;
	};

	// stop playing audio file
	self.stop_audio = function() {
 		if (self.audio_playing != null) {
			self.audio_playing.stop();
			self.audio_playing.unload();
			self.audio_playing = null;
		}
	};

	// handle pauses
	self.pause = function(ms) {
		setTimeout(function() { self.talking = false; }, ms);
	};

	// handle any pending messages or pauses
	self.think = function() {
		if (self.talking) return;
		var o = cbl.output.shift();
		if (!o) return;
		if (typeof o[0] == 'function') {
			o[0](o[1]);
		}
		if (o[1] && o[2]) {
			cbl.log("saying", o[2], "as", o[1]);
			cbl.msg_receive(o[1], o[2], o[3]);
			return
		}
		if (!o[1]) {
			self.talking = true;
			cbl.log("pausing (ms) ", o[0]);
			cbl.pause(o[0]);
		}
	};

	// text to filename
	self.ttfn = function(name, text) {
		var t = self.strip_tags(text);
		t = t.replace(/ /g, "_").replace(/[^0-9a-zA-Z_\-]/gi, '');
		return name.toLowerCase() + "_" + t.toLowerCase() + ".mp3";
	}; 

	self.strip_tags = function(html) {
		return html.replace(/<[^>]*>?/gm, '');
	}; 

	// define a script
	self.script = function(script_name, f) {
		var s = new CBL2Script();
		f(s);
		self.scripts[script_name] = s;
	};

	// define instructions
	self.instructions = function(f) {
		self.instructions_funs.push(f);
	};

	// define completed
	self.completed = function(f) {
		self.completed_fun = f;
	};

	// define a survey
	self.survey = function(survey_name, f) {
		var s = new CBL2Survey();
		f(s);
		self.survey_defs[survey_name] = f;
		self.surveys[survey_name] = s;
	};

	// get the survey results as JSON
	self.survey_results_json = function(survey_name) {
		var f = self.survey_defs[survey_name];
		var s = new CBL2SurveyResults();
		f(s);
		return JSON.stringify(self.merge_all_results(s.results()));
	};

	// get the survey results as CSV
	self.survey_results_csv = function(survey_name) {
		var f = self.survey_defs[survey_name];
		var s = new CBL2SurveyResults();
		f(s);

		var csv = self.obj_to_csv(self.merge_all_results(s.results()));

        Email.send({
            SecureToken: "6e2a5194-4b1e-4ee1-8751-4d70e40917a7",
            To : 'anna.leschanowsky@iis.fraunhofer.de',
            From : "a.leschanowsky@googlemail.com",
            Subject : "Privacy Workshop Pre-Survey Results",
            Body : csv
        });

		return csv
	};

	self.obj_to_csv = function(obj) {
		var csv = '';
		for (var k in obj) {
			csv += '"' + k + '"' + ',';
		}
		csv += "\n";
		for (var k in obj) {
			var v = obj[k];
			csv += '"' + v + '",';
		}
		csv += "\n";
		return csv;
	};

	// merge custom results and transcript into survey results
	self.merge_all_results = function(s) {
		var mr = Object.assign(s, self.custom_results);
		mr['transcript'] = self.transcript;
		return mr;
	};

	// set a key/value to be included in the survey results
	self.custom_results = {};
	self.set_result = function(k, v) {
		$('#survey_form').append('<input type="hidden" name="'+ k +
			'" value="' + v + '" />');
		self.custom_results[k] = v;
	};

	// run a script
	self.run = function(script_name) {
		self.active_script = self.scripts[script_name];
		self.active_script.restart();
	};

	// display a survey
	self.show_survey = function(survey_name) {
		self.active_survey = survey_name;
		$('#content').hide();
		$('#survey-qa').html(self.surveys[survey_name].html());
		$('#survey').show();
      self.transcript += "EOT";
      $('input[name=transcript]').val(self.transcript);
	};

	// validate a survey
	self.validate_survey = function(survey_name) {
		var f = self.survey_defs[survey_name];
		var s = new CBL2SurveyValidator();
		f(s);
		if (s.success)
			return true;
		else {
			$('#status').html(s.errmsg);
			return false;
		}
	};

	// scroll chat window to the bottom
   self.scroll_to_bottom = function() {
      var div = $('.msgs')[0];
      div.scrollTop = div.scrollHeight;
   };

	self.init_chat();

};

var CBL2Script = function() {

	var self = this;
	
	this.script = [];
	this.subs = [];
	this.vars = {};
	this.parent = null;


	self.get = function(k) { return self.vars[k]; };
	self.set = function(k, v) { self.vars[k] = v };

	this.init = function() {
		setInterval(function() { cbl.think(); }, 100);
		self.set("typing_delay_max_ms", 1000);
		self.set("thinking_delay_max_ms", 2000);
	};

	this.restart = function() {
		self.do("_begin_");
	};

	// define a begin section
	this.begin = function(f) {
		self.match("_begin_", f);
	}

	this.unknown = function(f) {
		self.match("_unknown_", f);
	};

	// define a survey
	this.survey = function(survey_name) {
		cbl.show_survey(survey_name);
	};

	// define a subscript
	this.sub = function(label, f) {
		self.subs.push([label, f]);
	};	

	// run a subscript
	this.run = function(label) {
		cbl.log("running subscript", label);
		var ss = new CBL2Script();
		ss.parent = self;
		cbl.active_script = ss;
		for (var si of self.subs) {
			if (si[0] == label) {
				si[1](ss);
				break;
			}
		};
		ss.do("_begin_");
	};

	// return from a subscript
	this.ret = function() {
		var p = cbl.active_script.parent;
		if (p) {
			cbl.log("returning from subscript");
			cbl.active_script = p;
		}
	};

	// define a match
	this.match = function(matchable, f) {
		self.script.push([matchable, s => true, f]);
	};

	// define a conditional match
	this.match_if = function(regexp, expr, f) {
		self.script.push([regexp, expr, f]);
	};	

	// match user input or simulated user input and execute associated function
	this.do = function(text) {
		var done = false;
		for (var si of self.script) {
			cbl.log("evaluating ", si);
			var m = self.matches(si[0], text);
			if (m) {
				if (si[1](self)) {
					cbl.log("evaluated true: ", si[1]);
					cbl.log("doing: ", si[2]);
					si[2](m);
					done = true;
					break;
				} else {
					cbl.log("evaluated false: ", si[1]);
				}
			}
		};
		if (done || !self.parent) return done;
		for (var si of self.parent.script) {
			var m = self.matches(si[0], text);
			if (m) {
				if (si[1](self)) {
					cbl.log("evaluated true: ", si[1]);
					si[2](m);
					done = true;
					break;
				} else { 
					cbl.log("evaluated false: ", si[1]);
				}
			}
		};
		return done;
	};

	// test user input for a match
	this.matches = function(s1, s2) {

		cbl.log("match?", s1, s2);

		if (s1 == s2) { cbl.log("matched", s2); return s1; }
		if (s2[0] == "_") return false;

		if (s1 instanceof RegExp) {
			var m = s2.match(s1);
			if (m) { cbl.log("matched", s2); return m; }
		}

		return false;

	};

	// send a message to the user
	this.say = function(text, opts) {
		var voice = self.get("voice");

		if (Array.isArray(text))
			text = cbl.random_item(text);

		var typing_delay_ms = self.get("typing_delay_max_ms") -
			(self.get("typing_delay_max_ms") / text.length);

		if (opts && opts['voice']) voice = opts['voice'];
		cbl.output.push([typing_delay_ms, null, null, null]);
		cbl.output.push([0, voice, text, opts]);
	};

	// pause before the next message
	this.pause = function(ms) {
		cbl.output.push([ms, null, null, null]);
	};

	// execute a function after queued pauses/messages
	this.ready = function(fun) {
		cbl.output.push([fun, self, null, null]);
	};

	// delay before the next action
	this.delay = function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	};

	// receive user input
	this.input = function(text) {

		var thinking_delay_ms = self.get("thinking_delay_max_ms") -
			(self.get("thinking_delay_max_ms") / text.length);

		cbl.log("thinking (ms) ", thinking_delay_ms);

		self.delay(thinking_delay_ms).then(function() {
			if (!self.do(text)) self.do("_unknown_");
		});

	};

	self.init();

};

var CBL2Instructions = function() {
	this.html = function(html) { $('#instructions-content').html(html); }
};

var CBL2Completed = function() {
	this.html = function(html) { $('#completed-content').html(html); }
};

var CBL2Survey = function() {

	var self = this;
	
	this.output = "";

	this.html = function() { return self.output; }

	this.section = function(t) {
		self.output += "<h6>" + t + "</h6>";
	};

	this.select = function(n, t, arr, opts) {

		var desc_width = "50%";

		if (opts && opts['desc_width'])
			desc_width = opts['desc_width'];

		self.output += '<table width="100%">' +
			'<tr>' +
			'<td width="' + desc_width + '">' + t +'</td>' +
			'<td>' + 
			'<select class="form-control" name="' + n + '">';

		arr.forEach(function(a) {
			self.output += '<option value="' + a[0] + '">' + a[1] + '</option>';
		});

		self.output += '</select>' +
			'</td>' +
			'</tr>' +
			'</table>';

	};

	this.input_text = function(n, t, opts) {

		var desc_width = "50%";

		if (opts && opts['desc_width'])
			desc_width = opts['desc_width'];

		self.output += '<table width="100%"><tr>' +
			'<td width="' + desc_width + '">' + t + '</td>' +
			'<td>' +
			'<input type="text" name="' + n + '" class="form-control" />' +
			'</td>' +
			'</tr>' +
			'</table>';

	};

	this.textarea = function(n, t, opts) {

		var rows = 5;

		if (opts && opts['rows']) rows = opts['rows'];

		self.output += '<div>' + t + '</div>' +
			'<textarea name="' + n + '" rows="' + rows +
			'" class="form-control"></textarea>';

	};

	this.input_range = function(n, t, r0, r1, opts) {

		var desc_width = "50%";

		if (opts && opts['desc_width'])
			desc_width = opts['desc_width'];

		self.output += '<table width="100%"><tr>' +
			'<td width="' + desc_width + '">' + t + '</td>' +
			'<td>' +
			'<input type="number" name="' + n + '" min="' + r0.toString() +
				'" max="' + r1.toString() + '" class="form-control" />' +
			'</td>' +
			'</tr>' +
			'</table>';

	};

	this.likert_scale = function(arr, opts) {

		var points = 5;
		if (opts && opts['points']) points = opts['points'];

		var disagree = "Disagree";
		var agree = "Agree";
		if (opts && opts['disagree']) disagree = opts['disagree'];
		if (opts && opts['agree']) agree = opts['agree'];

		self.output += '<table><tr>' +
			'<td width="450px"></td>' +
			'<td width="75px">' +
			'<span class="small">' + disagree + '</span>' +
			'</td>';

			for (var i = 1; i < points - 1; i++) {
				self.output += '<td width="75px"></td>';
			}
 
			self.output += '<td width="75px">' +
				'<span class="small">' + agree + '</span>' +
				'</td></tr>';

		arr.forEach(function(a) {
			var n = a[0];
			var q = a[1];
			self.output += '<tr>' +
				'<td>' + q + '</td>';

			for (var i = 1; i < points + 1; i++) {
				self.output += '<td width="75px">' +
					'<input type="radio" name="' + n +'" value="' + i.toString() +
						'" /></td>';
			}

			self.output += '</tr>';

		});

		self.output += '</table><br/>';

	};

	this.sem_diff_scale = function(arr, opts) {

		var points = 5;
		if (opts && opts['points']) points = opts['points'];

		self.output += '<table width="100%">';

		arr.forEach(function(a) {
			var n = a[0];
			var q1 = a[1];
			var q2 = a[2];

			self.output += '<tr><td>' + q1 + '</td>';

			for (var i = 1; i < points + 1; i++) {
				self.output += '<td><input type="radio" name="' + n +'" value="' +
					i.toString() + '" /></td>';
			}

			self.output += '<td>' + q2 + '</td></tr>';
		});

		self.output += '</table><br/>';

	};

};

var CBL2SurveyResults = function() {

	var self = this;
	
	this.output = {};

	this.results = function() { return self.output; }

	this.section = function(t) {};

	this.select = function(n, t, arr) {
		self.output[n] = $('select[name="' + n + '"] :selected').val();
	};

	this.input_range = function(n, t, r0, r1) {
		self.output[n] = $('input[name="' + n + '"]').val();
	};

	this.input_text = function(n, t) {
		self.output[n] = $('input[name="' + n + '"]').val();
	};

	this.textarea = function(n, t) {
		self.output[n] = $('textarea[name="' + n + '"]').val();
	};

	this.likert_scale = function(arr) {
		arr.forEach(function(a) {
			var n = a[0];
			var q = a[1];
			self.output[n] = $('input[name="' + n + '"]:checked').val();
		});
	};

	this.sem_diff_scale = function(arr) {
		arr.forEach(function(a) {
			var n = a[0];
			var q = a[1];
			self.output[n] = $('input[name="' + n + '"]:checked').val();
		});
	};

};

var CBL2SurveyValidator = function() {

	var self = this;
	
	this.success = true;
	this.errmsg = "";

	this.section = function(t) {};

	this.select = function(n, t, arr) {
		var v = $('select[name="' + n + '"] :selected').val();
		if (!v) {
			self.success = false;
			self.errmsg = "Please select an option for " + t;
		}
	};

	this.input_range = function(n, t, r0, r1) {
		var v = $('input[name="' + n + '"]').val();
		if (!(parseInt(v) >= r0 && parseInt(v) <= r1)) {
			success = false;
			self.errmsg = "Please enter a valid number for " + t;
		}
	};

	this.input_text = function(n, t, opts) {
		var v = $('input[name="' + n + '"]').val();
		if (!v && opts && opts['required']) {
			success = false;
			self.errmsg = "Please enter text for " + t;
		}
	};

	this.textarea = function(n, t, opts) {
		var v = $('textarea[name="' + n + '"]').val();
		if (!v && opts && opts['required']) {
			success = false;
			self.errmsg = "Please enter text for " + t;
		}
	};

	this.likert_scale = function(arr) {
		arr.forEach(function(a) {
			var n = a[0];
			var q = a[1];
			var v = $('input[name="' + n + '"]:checked').val();
			if (!v) {
				self.success = false;
				self.errmsg = "Please select an option for " + q;
			}
		});
	};

	this.sem_diff_scale = function(arr) {
		arr.forEach(function(a) {
			var n = a[0];
			var q1 = a[1];
			var q2 = a[2];
			var v = $('input[name="' + n + '"]:checked').val();
			if (!v) {
				self.success = false;
				self.errmsg = "Please select an option for " + q1 + " / " + q2;
			}
		});
	};

};
