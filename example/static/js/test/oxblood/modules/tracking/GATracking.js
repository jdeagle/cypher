define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/modules/Module",
		"rosy/modules/tracking/GATracking"
	],

	function (OxBlood, Class, Module, GATracking) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Google Analytics Tracking", function () {

				describe("GATracking", function () {

					var testInstance;

					beforeEach(function () {
						testInstance = new GATracking();
					});

					afterEach(function () {
						testInstance.destroy();
					});

					it("GATracking should be a function", function () {
						expect(GATracking).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

					describe("Notifications", function () {

						it(GATracking.TRACK, function (done) {

							var TestClass = Class.extend({
								init : function () {
									this.subscribe(GATracking.TRACK, this.onTrack);
									this.publish(GATracking.TRACK, {
										type : "test",
										category : "test",
										action : "test",
										label : "test"
									});
								},

								onTrack : function (n) {
									expect(n.data).to.be.ok();
									expect(n.data).to.be.an("object");
									expect(n.data).to.have.keys("type", "category", "action", "label");

									this.destroy();
									done();
								}
							});

							var testClassInstance = new TestClass();

						});

					});

				});

			});

		});
	}
);
