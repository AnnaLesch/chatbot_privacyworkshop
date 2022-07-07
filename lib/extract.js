// a nodejs script for automatically extracting sentences from CBL scripts

const fs = require('fs');

var output = {};

function enableNoSuchMethod(obj) {
	return new Proxy(obj, {
		get(target, p) {
			if (p in target) {
				return target[p];
			} else if (typeof target.__noSuchMethod__ == "function") {
				return function(...args) {
					return target.__noSuchMethod__.call(target, p, args);
				};
			}
		}
	});
};

const cbl = new function() {

	var self = this;

	this.vars = {};
	this.instructions = function() {};
	this.survey = function() {};
	this.start = function() {};
	this.completed = function() {};
	this.get = function(k) { return self.vars[k]; };
	this.set = function(k, v) { self.vars[k] = v; };

	this.random_item = function() {};

	this.script = function(n, f) {
		s = new CBLSentenceExtractor();
		f(s);
	}

};

const CBLSentenceExtractor = function(s) {

	var self = this;

	this.vars = {};

	this.say = function(t, opts) {
		var voice = self.vars["voice"];
		if (opts && opts["voice"]) voice = opts["voice"];
		if (opts && opts["method"] == "browser_tts") return;
		if (!output[voice]) output[voice] = [];
		output[voice].push(t);
	};

	this.get = function(k) { return self.vars[k]; };
	this.set = function(k, v) { self.vars[k] = v; };

	this.begin = this.unknown = function(f) { f(self); }
	this.match = function(r, f) { f(self); };
	this.match_if = function(r, expr, f) { f(self); };

	this.__noSuchMethod__ = function(name, args) {
		// console.log("no such method", name)
	};

	return enableNoSuchMethod(this);

};

const file = process.argv[2];
const fileData = fs.readFileSync(file).toString();
eval(fileData);
console.log(JSON.stringify(output));
