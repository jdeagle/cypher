define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/modules/Module",
		"rosy/modules/tracking/OmnitureTracking"
	],

	function (OxBlood, Class, Module, OmnitureTracking) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Omniture Tracking", function () {

				describe("OmnitureTracking", function () {

					var testInstance = new OmnitureTracking();

					it("OmnitureTracking should be a function", function () {
						expect(OmnitureTracking).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

					describe("Notifications", function () {

						it(OmnitureTracking.TRACK, function (done) {

							var TestClass = Class.extend({
								init : function () {
									this.subscribe(OmnitureTracking.TRACK, this.onTrack);
									this.publish(OmnitureTracking.TRACK, {
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
