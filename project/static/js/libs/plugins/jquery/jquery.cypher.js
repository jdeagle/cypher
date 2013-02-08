/*

- cypher text -

a pluggin for adding a encoding/decoding effect.

<h3 class="demo">How now brown cow</h3>
$(".demo").cypher('decode');


TODO: implement timed version
TODO: implement canvas use? Is this an issue?
TODO: add ignore spaces

*/

(function($) {

	'use strict';

	$.fn.cypher = function(options) {



		var Schemes = {
				guess : "guess",
				timed: "timed",
				offset : "offset"
			},

			// to be used with timed and offset functions.
			Animate = {
				LEFT_TO_RIGHT : "leftToRight",
				RIGHT_TO_LEFT : "rightToLeft",
				CENTER_OUT : "centerOut",
				CENTER_IN : "centerIn",
				RANDOM : "random" // Similar to guess but the timing if fixed to the length of the message rather than possible characters.
			},
			_deferred = new $.Deferred();

		if (arguments.length > 1) {
			options = arguments[1];
			options.method = arguments[0];
		}

		var config = $.extend({
			'startText' : this.text(),
			'endText' : this.text(),
			'alphabet' : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
			'digits' : "123456789",
			'method' : "decode",
			'speed'	: 50,
			'scheme' : "guess",
			'animate' : Animate.LEFT_TO_RIGHT,
			'ease' : "easeInOutQuint",
			'delay' : 0,
			'cycle' : false
		}, options),
			vars = {};

		if (config.duration) {
			config.scheme = Schemes.timed;
		}

		config.characters = (config.alphabet + config.digits).split("");


		var methods = {
			init : function () {

			},

			encode : function () {
				switch(config.scheme) {
					case Schemes.guess :
						methods.guess.apply(this);
						break;
					case Schemes.offset :
						methods.offset.apply(this);
						break;
					case Schemes.timed :
						methods.offset.apply(this);
						break;
				}
			},

			decode : function () {

				switch(config.scheme) {
					case Schemes.guess :
						methods.guess.apply(this);
						break;
					case Schemes.offset :
						methods.offset.apply(this);
						break;
					case Schemes.timed :
						console.log("timed decode");
						methods.offset.apply(this);
						break;
				}
			},
			//
			// animation methods
			//
			guess : function () {

				// Iterate through the letters sequencialy starting from letter.count.
				var str = config.startText,
					letters = vars.dictionary,
					locked = 0,
					newMessage = "";

				for (var i = 0, l = vars.dictionary.length; i < l; i++) {
					var item = letters[i];

					if (item.current === item.end) {
						// lock letter somehow
						locked++;
					} else {
						item.count = methods.getCount(item);
						item.current = config.characters[item.count];
					}

					if (item.end === " ") {
						locked++;
					}

					newMessage += item.current;
				}

				// print string
				this.text(newMessage);

				if (locked === letters.length) {
					// cancel cycle
					window.clearInterval(vars.cycle);

					this.text(config.endText);

					_deferred.resolve();
				}
			},

			offset : function () {
				// letters cycle through a fixed number of letters based on letter.cycle.
				// toggle final letter when cycle limit is reached.
				var str = config.startText,
					letters = vars.dictionary,
					locked = 0,
					newMessage = "";

				for (var i = 0, l = vars.dictionary.length; i < l; i++) {
					var item = letters[i];

					if (item.delay === 0 || item.delay === undefined) {
						if (item.count === item.cycleLimit) {
							item.current = item.end;
							locked++;
						} else {
							item.count = item.count + 1;
							item.current = config.characters[methods.getRandomInt(0, config.characters.length - 1)];
						}
					} else {
						item.delay -= 1;
					}

					newMessage += item.current;
				}

				// print string
				this.text(newMessage);

				if (locked === letters.length) {
					// cancel cycle
					window.clearInterval(vars.cycle);

					console.log(config.endText);

					this.text(config.endText);

					_deferred.resolve();
				}
			},

			cycle : function () {

				var str = config.startText,
					letters = vars.dictionary,
					locked = 0,
					newMessage = "";

				for (var i = 0, l = vars.dictionary.length; i < l; i++) {
					var item = letters[i];

					item.current = config.characters[methods.getRandomInt(0, config.characters.length - 1)];

					newMessage += item.current;
				}

				this.text(newMessage);
			},

			/*
			handleTimedStep : function (step) {
				// letters cycle through a fixed number of letters based on letter.cycle.
				// toggle final letter when cycle limit is reached.
				var str = config.startText,
					letters = vars.dictionary,
					locked = 0,
					newMessage = "";



				for (var i = 0, l = vars.dictionary.length; i < l; i++) {
					var item = letters[i];
					//console.log(item.count, item.cycleLimit);
					if (item.count === item.cycleLimit) {
						item.current = item.end;
						locked++;
					} else {
						item.count = item.count + 1;
						item.current = config.characters[methods.getRandomInt(0, config.characters.length - 1)];
					}

					newMessage += item.current;
				}

				// print string
				this.text(newMessage);

				if (locked === letters.length) {
					// cancel cycle
					window.clearInterval(vars.cycle);

					this.text(config.endText);
				}
			},
			*/
			//
			// utils
			//
			//http://javascript.info/tutorial/animation
			animate : function (opts) {

				var start = new Date(),
					id = setInterval(function () {
						var timePassed = new Date() - start,
							progress = timePassed / opts.duration,
							delta;

						progress = (progress > 1) ? 1 : progress;
						delta = opts.ease(progress);
						opts.step(delta);

						if (progress === 1) {
							clearInterval(id);
						}
					}, opts.delay || 10);
			},

			getCycleLimit : function (letter, i, max) {

				var min = 10;

				if (config.animate === Animate.LEFT_TO_RIGHT) {
					letter.cycleLimit = min + i;
				}

				if (config.animate === Animate.RIGHT_TO_LEFT) {
					letter.cycleLimit = (max + min) - i;
				}

				if (config.animate === Animate.CENTER_OUT) {
					letter.cycleLimit = min + Math.abs(Math.round(max * 0.5) - i);
				}

				if (config.animate === Animate.CENTER_IN) {
					letter.cycleLimit = max - Math.abs(Math.round(max * 0.5) - i);
				}

				if (config.animate === Animate.RANDOM) {
					letter.cycleLimit = methods.getRandomInt(min, max);
				}

			},

			getCount : function (item) {
				var count = item.count + 1;
				if (count >= config.characters.length) {
					count = 0;
				}

				return count;
			},

			getEncoded : function (str) {
				var length = str.length,
					encodedStr = [],
					characters = config.characters = this.shuffle(config.characters);

				console.log(characters);

				for (var i = 0; i < length; i++) {
					console.log(characters.length, i, length);
					if (i >= characters.length) {
						encodedStr.push(characters[methods.getRandomInt(0, characters.length - 1)].toLowerCase());
					} else {
						encodedStr.push(characters[i].toLowerCase());
					}
				}

				return encodedStr;
			},
			/**
			 * Array shuffle
			*/
			shuffle : function (arr) {
				var result = [],
					rnd;
				this.forEach(arr, $.proxy(function(val, i, arr){
		            if (!i) {
		                result[0] = val;
		            } else {
		                rnd = this.getRandomInt(0, i);
		                result[i] = result[rnd];
		                result[rnd] = val;
		            }
		        }, this));
		        return result;
		    },

		    getRandomInt : function (min, max) {
			    return Math.floor(Math.random() * (max - min + 1)) + min;
			},
		    /**
		     * Array forEach
		     */
		   	forEach : function (arr, callback, thisObj) {
		        if (arr == null) {
		            return;
		        }
		        var i = -1,
		            n = arr.length;
		        while (++i < n) {
		            // we iterate over sparse items since there is no way to make it
		            // work properly on IE 7-8. see #64
		            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
		                break;
		            }
		        }
		    }
		};

		var EASE = {
			linear : function (progress) {
				return progress;
			},
			quad : function (progress) {
				return Math.pow(progress, 2);
			},
			circ : function (progress) {
				return 1 - Math.sin(Math.acos(progress));
			}

		};

		if (config.method === "decode") {

			config.startText = methods.getEncoded(config.startText);

			vars.encodedLetters = config.startText;
			vars.decodedLetters = config.endText.toString().split("");
			vars.dictionary = [];

			for (var i = 0, l = vars.decodedLetters.length, letter; i < l; i++) {
				letter = {
					current: vars.encodedLetters[i],
					end: vars.decodedLetters[i],
					count : methods.getRandomInt(0, l)
				};

				if (config.scheme === Schemes.offset) {
					letter.count = 0;
					$.proxy(methods.getCycleLimit(letter, i, l), this);
				}

				if (config.scheme === Schemes.timed) {
					letter.count = 0;
					$.proxy(methods.getCycleLimit(letter, i, l), this);
				}

				vars.dictionary.push(letter);
			}

			if (config.scheme === Schemes.timed) {

				// Not sure how I want to implement this feature.
				// Need to define a solid use case...

				/*
				var animationConfig = {
					duration: config.duration,
					ease: EASE.linear,
					step: $.proxy(methods.handleTimedStep, this)
				};

				methods.animate(animationConfig);*/


				/*$.proxy(methods.animate, this, {
					duration: config.time,
					ease: EASE.linear,
					step: $.proxy(methods.decode, this)
				});*/
			} else if (config.cycle) {

				vars.cycle = window.setInterval($.proxy(methods.cycle, this), config.speed);

				window.setTimeout($.proxy(function () {
					window.clearInterval(vars.cycle);
					vars.cycle = window.setInterval($.proxy(methods.decode, this), config.speed);
				}, this), config.delay);

			} else {

				window.setTimeout($.proxy(function () {
					window.clearInterval(vars.cycle);
					vars.cycle = window.setInterval($.proxy(methods.decode, this), config.speed);
				}, this), config.delay);
			}
		}

		if (config.method === 'encode') {

			vars.encodedLetters = methods.getEncoded(config.startText);
			vars.decodedLetters = config.startText.toString().split("");
			vars.dictionary = [];

			config.endText = vars.encodedLetters.join("");

			for (var n = 0, len = vars.encodedLetters.length, letter; n < len; n++) {
				letter = {
					current: vars.decodedLetters[n],
					end: vars.encodedLetters[n],
					count : methods.getRandomInt(0, len)
				};

				if (config.scheme === Schemes.offset) {
					letter.count = 0;
					$.proxy(methods.getCycleLimit(letter, n, len), this);
					letter.delay = len - letter.cycleLimit;
				}

				if (config.scheme === Schemes.timed) {
					letter.count = 0;
					$.proxy(methods.getCycleLimit(letter, n, len), this);
				}

				vars.dictionary.push(letter);
			}

			if (config.cycle) {

				vars.cycle = window.setInterval($.proxy(methods.cycle, this), config.speed);

				window.setTimeout($.proxy(function () {
					window.clearInterval(vars.cycle);
					vars.cycle = window.setInterval($.proxy(methods.encode, this), config.speed);
				}, this), config.delay);

			} else {

				window.setTimeout($.proxy(function () {
					window.clearInterval(vars.cycle);
					vars.cycle = window.setInterval($.proxy(methods.encode, this), config.speed);
				}, this), config.delay);
			}

		}

		return _deferred;

	};
})( jQuery );