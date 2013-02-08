define(

	[
		"test/lib/trim",
		"test/lib/expect",
		"test/lib/mocha/mocha",
		"test/lib/mocha/mocha-yeti-adaptor"
	],

	function () {

		/*global mocha */

		"use strict";

		mocha.setup({
			setup: "bdd",
			reporter: "html",
			ignoreLeaks: true
		});

		return {
			tests : {
				core : [],
				routing : [],
				modules : [],
				quality : []
			},

			addCoreTests : function (tests) {
				this.tests.core.push(tests);
			},

			addRoutingTests : function (tests) {
				this.tests.routing.push(tests);
			},

			addModuleTests : function (tests) {
				this.tests.modules.push(tests);
			},

			addQualityTests : function (tests) {
				this.tests.quality.push(tests);
			},

			registerTests : function () {
				var tests = this.tests;
				var key, test, i, j;

				for (key in tests) {
					test = tests[key].sort();

					for (i = 0, j = test.length; i < j; i++) {
						test[i]();
					}
				}
			}
		};
	}
);
