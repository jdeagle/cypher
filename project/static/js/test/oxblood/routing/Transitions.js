define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/views/ViewManager",
		"rosy/views/ViewNotification",
		"./routes"
	],

	function (OxBlood, Class, ViewManager, ViewNotification, routes) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		var transitions = {

			sync : [
				"transitionOut",
				"transitionOutComplete",
				"cleanup",
				"cleanupComplete",
				"load",
				"loadComplete",
				"transitionIn",
				"transitionInComplete"
			],

			async : [
				"load",
				"loadComplete",
				"transitionIn",
				"transitionOut",
				"transitionInComplete",
				"transitionOutComplete",
				"cleanup",
				"cleanupComplete"
			],

			preload : [
				"load",
				"loadComplete",
				"transitionOut",
				"transitionOutComplete",
				"transitionIn",
				"transitionInComplete",
				"cleanup",
				"cleanupComplete"
			],

			reverse : [
				"load",
				"loadComplete",
				"transitionIn",
				"transitionInComplete",
				"transitionOut",
				"transitionOutComplete",
				"cleanup",
				"cleanupComplete"
			]
		};

		var mappings = {
			"load"                  : ViewNotification.VIEW_LOAD_STARTED,
			"transitionIn"          : ViewNotification.VIEW_IN_STARTED,
			"transitionOut"         : ViewNotification.VIEW_OUT_STARTED,
			"cleanup"               : ViewNotification.VIEW_CLEANUP_STARTED,
			"loadComplete"          : ViewNotification.VIEW_LOAD_COMPLETED,
			"transitionInComplete"  : ViewNotification.VIEW_IN_COMPLETED,
			"transitionOutComplete" : ViewNotification.VIEW_OUT_COMPLETED,
			"cleanupComplete"       : ViewNotification.VIEW_CLEANUP_COMPLETED
		};

		var positions = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eigth"];


		return function () {

			function testTransition(name) {

				var i,
					steps = [],
					subscriber,
					transition = transitions[name];

				function testTransitionStep(i) {
					it("should call " + transition[i] + " " + positions[i], function (done) {
						expect(steps[i]).to.equal(transition[i]);
						done();
					});
				}

				function subscribeToStep(m) {
					subscriber.subscribe(mappings[m], function (n) {
						steps.push(m);
						subscriber.unsubscribe(mappings[m]);
					});
				}

				describe(name, function () {

					before(function (done) {

						subscriber = new Class();

						for (var m in mappings) {
							subscribeToStep(m);
						}

						ViewManager.changeRoute("/transition/" + name,  name, function () {
							done();
						});
					});

					after(function (done) {
						steps = [];
						subscriber.unsubscribe();
						subscriber.destroy();
						done();
					});

					for (i = 0; i < transition.length; i ++) {
						testTransitionStep(i);
					}
				});
			}

			describe("Transitions", function () {

				before(function (done) {
					ViewManager.getViewGroup("main").config.useHistory = false;
					ViewManager.changeRoute("/test1", "sync", done);
				});

				for (var transition in transitions) {
					testTransition(transition);
				}
			});
		};
	}
);
