// ### Part of the [Rosy Framework](http://github.com/ff0000/rosy)
/* omniture.tracking.js */

/**
 * Omniture and GA tracking event wrappers
 * REQUIRES
	- ssla-analytics/  (this file loads ssla-analytics/analytics.min.js)

 */
define(

	[
		"../Module",
		// we don't need an AMD reference to the scroller file,
		// but we do need it to be included in the build
		"./ssla-analytics/analytics.min"
	],

	function (Module) {

		"use strict";

		var STATIC = {
			TRACK : "module/tracking/omniture/track"
		};

		return Module.extend({

			"static" : STATIC,

			_tracker : null,

			vars : {
				debug : true // set to false for production
			},

			init : function () {
				this.subscribe(STATIC.TRACK, this.track);
			},

			track : function (n) {
				var data = n.data;
			},

			onReady : function () {
				var i,
					account;

				this.tracker = new window.ssla.analytics.Omniture({}, window.s); // pass in an optional Library object

				if (this.vars.accounts) { // set account relationships passed in init()
					for (i = this.vars.accounts.length - 1; i >= 0; i--) {
						account = this.vars.accounts[i];
						window.ssla.analytics.Omniture.addAccount(account[0], account[1]);
					}
				}
			},

			destroy : function () {
				this.tracker = null;
				this.vars = null;

				this.sup();
			}

		});
	}
);
