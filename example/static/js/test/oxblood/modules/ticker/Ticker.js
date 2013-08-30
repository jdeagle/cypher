define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/modules/Module",
		"rosy/modules/ticker/Ticker"
	],

	function (OxBlood, Class, Module, Ticker) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Ticker", function () {

				describe("Ticker", function () {

					var testOptions = {
						now : new Date(),
						start : new Date(),
						end : "Mon Sep 3 11:45:00 2022"
					};

					var testInstance = new Ticker(testOptions);

					it("Ticker should be a function", function () {
						expect(Ticker).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

					describe("Notifications", function () {

						it(Ticker.START, function (done) {

							var TestClass = Class.extend({
								vars : {},

								init : function () {
									this.vars.ticker = new Ticker(testOptions);
									this.subscribe(Ticker.START, this.onStart);
								},

								onStart : function () {
									expect(this.vars.ticker).to.be.a(Ticker);
									this.destroy();

									done();
								}
							});

							var testClassInstance = new TestClass();

						});

						it(Ticker.TICK, function (done) {

							var TestClass = Class.extend({
								vars : {},

								init : function () {
									this.vars.ticker = new Ticker(testOptions);
									this.subscribe(Ticker.TICK, this.onTick);
								},

								onTick : function () {
									expect(this.vars.ticker).to.be.a(Ticker);
									this.destroy();

									done();
								}
							});

							var testClassInstance = new TestClass();

						});

						it(Ticker.COMPLETE, function (done) {

							var TestClass = Class.extend({
								vars : {},

								init : function () {
									this.vars.ticker = new Ticker({
										now : new Date(),
										start : new Date(),
										end : new Date(new Date().setSeconds(new Date().getSeconds() + 1))
									});

									this.subscribe(Ticker.COMPLETE, this.onComplete);
								},

								onComplete : function () {
									expect(this.vars.ticker).to.be.a(Ticker);
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
