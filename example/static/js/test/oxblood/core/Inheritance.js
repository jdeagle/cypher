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

			describe("Rosy Inheritance", function () {

				describe("SubClass Inheritance", function () {

					it("should create an instance of SubClass", function () {
						expect(new SubClass()).to.be.a(SubClass);
					});

					it("should contain vars.x with a value of 1", function () {
						var Foo = SubClass.extend({
							vars : {
								x : 1
							}
						});

						expect(new Foo().vars.x).to.equal(1);
					});

					it("should contain scoped vars.x values", function () {
						var Foo = SubClass.extend({
							vars : {
								x : 1
							}
						});

						var Bar = Foo.extend({
							vars : {
								x : 2
							}
						});

						var foo = new Foo();
						var bar = new Bar();

						expect(foo.vars.x).to.equal(1);
						expect(bar.vars.x).to.equal(2);

						bar.vars.x = 3;
						expect(foo.vars.x).to.equal(1);
					});

					it("should call super methods", function (done) {
						var SuperClass = SubClass.extend({
							testMethod : function () {
								expect(this.testMethod).to.be.a("function");
								done();
							}
						});

						var MiddleClass = SuperClass.extend({
							testMethod : function () {
								expect(this.sup).to.be.a("function");
								this.sup();
							}
						});

						var TestClass = MiddleClass.extend({
							init : function () {
								this.testMethod();
							},

							testMethod : function () {
								expect(this.sup).to.be.a("function");
								this.sup();
							}
						});

						var testInstance = new TestClass();

						expect(testInstance).to.be.a(SuperClass);
						expect(testInstance).to.be.a(MiddleClass);
						expect(testInstance).to.be.a(TestClass);
					});

					describe("Deep Copying", function () {

						var Foo = SubClass.extend({
							vars : {
								y : {
									a: 1,
									b: 2,
									c: [0, 1, 2]
								}
							}
						});

						var Bar = Foo.extend({
							vars : {
								y : {
									a: 3,
									b: 4,
									c: [5, 6, 7]
								}
							}
						});

						var foo = new Foo();
						var bar = new Bar();

						it("should deep copy objects", function () {
							expect(foo.vars.y.a).to.equal(1);
							expect(foo.vars.y.b).to.equal(2);
							expect(foo.vars.y.c[1]).to.equal(1);

							expect(bar.vars.y.a).to.equal(3);
							expect(bar.vars.y.b).to.equal(4);
							expect(bar.vars.y.c[1]).to.equal(6);
						});

						it("should deep copy jQuery objects", function (done) {
							var html = $("html");
							var body = $("body");

							html.data({
								x : true,
								y : true
							});

							body.data({
								foo : true,
								bar : true
							});

							var Foo = SubClass.extend({
								vars : {
									html : html,
									body : body
								},

								init : function () {
									expect(this.vars.html).to.eql(html);
									expect(this.vars.html.data()).to.eql(html.data());

									expect(this.vars.body).to.eql(body);
									expect(this.vars.body.data()).to.eql(body.data());
								}
							});

							var Bar = Foo.extend({
								vars : {
									html : html.data("z", true),
									body : body.data("baz", true)
								},

								init : function () {
									var htmlData = this.vars.html.data();
									var bodyData = this.vars.body.data();

									expect(this.vars.html).to.eql(html);

									expect(htmlData.x).to.be.ok();
									expect(htmlData.y).to.be.ok();
									expect(htmlData.z).to.be.ok();

									expect(this.vars.body).to.eql(body);

									expect(bodyData.foo).to.be.ok();
									expect(bodyData.bar).to.be.ok();
									expect(bodyData.baz).to.be.ok();

									done();
								}
							});

							var foo = new Foo();
							var bar = new Bar();
						});

						it("should inherit parent values", function () {
							var Baz = Bar.extend({
								vars : {
									x : true
								}
							});

							var baz = new Baz();

							expect(baz.vars.y.a).to.equal(3);
							expect(baz.vars.y.b).to.equal(4);
							expect(baz.vars.y.c[1]).to.equal(6);
						});

						it("should not manipulate parent values", function () {
							bar.vars.y.b = 9;

							expect(foo.vars.y.b).to.equal(2);
							expect(bar.vars.y.b).to.equal(9);
						});

					});

				});

			});

		});
	}
);
