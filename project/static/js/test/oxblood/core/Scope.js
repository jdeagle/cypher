define(

	[
		"OxBlood",
		"./SubClass",
		"$"
	],

	function (OxBlood, SubClass, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addCoreTests(function () {

			describe("Rosy Scope", function () {
				describe("scope", function () {
					afterEach(function () {
						$("body").off();
					});

					it("should report 'this' as Class without .proxy()", function (done) {
						var TestClass = SubClass.extend({
							init : function () {
								this.setupEvents();
							},

							setupEvents : function () {
								var body = $("body");

								body.on({
									click : this.onClick,
									scroll : this.onScroll
								});

								this.setTimeout(function () {
									this.testScope.call(window);
									this.testScope.apply(document);

									body.trigger("click");
									body.trigger("scroll");
								}, 0);
							},

							testScope : function () {
								expect(this).to.eql(testInstance);
							},

							onClick : function () {
								expect(this).to.eql(testInstance);
							},

							onScroll : function () {
								expect(this).to.eql(testInstance);
								done();
							}
						});

						var testInstance = new TestClass();
						expect(testInstance).to.be.a(TestClass);
					});

					it("should accept data parameters via e.data", function (done) {
						var TestClass = SubClass.extend({
							init : function () {
								this.setupEvents();
							},

							setupEvents : function () {
								var body = $("body");

								body.on({
									click : this.onClick,
									scroll : this.onScroll
								});

								body.on("click", {
									foo : "bar",
									x : 1
								}, this.testDataParams);

								this.setTimeout(function () {
									this.testScope.call(window);
									this.testScope.apply(document);

									body.trigger("click");
									body.trigger("scroll");
								}, 0);
							},

							testDataParams : function (e) {
								expect(e.data).to.eql({
									foo : "bar",
									x : 1
								});
							},

							testScope : function () {
								expect(this).to.eql(testInstance);
							},

							onClick : function () {
								expect(this).to.eql(testInstance);
							},

							onScroll : function () {
								expect(this).to.eql(testInstance);
								done();
							}
						});

						var testInstance = new TestClass();
						expect(testInstance).to.be.a(TestClass);
					});

					it("should respect autoProxy option", function (done) {
						var TestClass = SubClass.extend({
							opts : {
								autoProxy : false
							},

							init : function () {
								this.setupEvents();
							},

							setupEvents : function () {
								var body = $("body");

								body.on({
									click : this.onClick,
									scroll : this.onScroll
								});

								this.setTimeout(function () {
									body.trigger("click");
									body.trigger("scroll");
								}, 0);
							},

							onClick : function () {
								expect(this).to.not.eql(testInstance);
							},

							onScroll : function () {
								expect(this).to.not.eql(testInstance);
								done();
							}
						});

						var testInstance = new TestClass();
						expect(testInstance).to.be.a(TestClass);
					});
				});

				describe(".proxy()", function () {
					var TestClass = SubClass.extend({
						opts : {
							autoProxy : false
						}
					});

					var testInstance = new TestClass();

					it("proxy should be a function", function () {
						expect(testInstance.proxy).to.be.a("function");
					});

					it("should report scope as itself", function (done) {
						testInstance.proxy(function () {
							expect(this).to.eql(testInstance);
							done();
						})();
					});

				});

			});

		});
	}
);
