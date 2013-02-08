define(

	[
		"OxBlood",
		"./SubClass"
	],

	function (OxBlood, SubClass) {

		/*jshint es5:true*/
		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addCoreTests(function () {

			describe("Pseudo Events", function () {
				var delay = 10;

				var testInstance = new SubClass();

				describe("Methods", function () {
					describe(".on()", function () {

						it("on should be a function", function () {
							expect(testInstance.subscribe).to.be.a("function");
						});

						it("should listen for an event", function (done) {
							testInstance.on("evt-test", function (e) {
								expect(e).to.be.eql("evt-test");
								done();
							});

							testInstance.trigger("evt-test");
						});

					});

					describe(".off()", function () {

						it("off should be a function", function () {
							expect(testInstance.off).to.be.a("function");
						});

						it("should remove an event listener", function (done) {
							testInstance.on("off-test", function () {
								done("ERROR!");
							});

							testInstance.off("off-test");
							testInstance.trigger("off-test");

							done();
						});

					});

					describe(".trigger()", function () {

						it("trigger should be a function", function () {
							expect(testInstance.trigger).to.be.a("function");
						});

						it("should trigger an event", function (done) {
							testInstance.on("trigger-test", function () {
								done();
							});

							testInstance.trigger("trigger-test");
						});

						it("should trigger an event with args", function (done) {
							testInstance.on("trigger-args-test", function (e, instance, arg1, arg2) {

								expect(e).to.eql("trigger-args-test");
								expect(instance).to.eql(testInstance);
								expect(arg1).to.eql("a");
								expect(arg2).to.eql("b");

								done();
							});

							testInstance.trigger("trigger-args-test", "a", "b");
						});

					});
				});

			});

		});
	}
);
