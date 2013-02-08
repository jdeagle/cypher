define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/base/DOMClass",
		"./SubClass",
		"$"
	],

	function (OxBlood, Class, DOMClass, SubClass, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addCoreTests(function () {

			describe("Rosy Teardown", function () {

				describe("Class Destruction", function () {

					var _getEvents = function (el) {
						return $._data(el.get(0), "events");
					};

					it("should teardown the created Class", function (done) {
						var TestClass = SubClass.extend({
							vars : {
								x : 1,
								y : 2,
								z : 3
							},

							init : function () {
								this.vars.initialized = true;
							},

							destroy : function () {
								for (var key in this.vars) {
									delete this.vars[key];
								}

								expect(this.vars.x).to.not.be.ok();
								expect(this.vars.y).to.not.be.ok();
								expect(this.vars.z).to.not.be.ok();
								expect(this.vars.initialized).to.not.be.ok();

								done();
							}
						});

						var testInstance = new TestClass();

						expect(testInstance).to.be.a(SubClass);
						expect(testInstance).to.be.a(Class);

						testInstance.destroy();
					});

					it("should unsubscribe all notifications", function (done) {
						var TestClass = SubClass.extend({

							vars : {
								x : 0
							},

							init : function () {
								this.subscribe("test-1", function () {
									this.vars.x = 1;
								});
								this.subscribe("test-2", function () {
									this.vars.y = 2;
								});
								this.subscribe("test-3", function () {
									this.vars.z = 3;
								});
							},

							destroy : function () {
								this.sup();

								this.publish("test-1");
								this.publish("test-2");
								this.publish("test-3");

								expect(this.vars.x).to.not.be.ok();
								expect(this.vars.y).to.not.be.ok();
								expect(this.vars.z).to.not.be.ok();

								done();
							}
						});

						var testInstance = new TestClass();

						expect(testInstance).to.be.a(SubClass);
						expect(testInstance).to.be.a(Class);

						testInstance.destroy();
					});

					it("should unbind all events", function (done) {
						var TestClass = DOMClass.extend({
							vars : {},

							init : function () {
								this.sup();

								var dummy = $('<div></div>').appendTo("body");

								$.extend(this.vars, {
									body : $("body"),
									dummy : dummy,
									foo : {
										html : $("html")
									}
								});

								this.setupEvents();
							},

							setupEvents : function () {
								this.vars.body.on("click", "div", this.proxy(this.onClickTwo));

								this.vars.dummy.on({
									click : this.proxy(this.onClickTwo),
									scroll : this.proxy(this.onScrollTwo)
								});

								this.vars.foo.html.on("click", this.proxy(this.onClickTwo));
							},

							onClickTwo : function () {},

							onScrollTwo : function () {},

							destroy : function () {
								var body = this.vars.body;
								var dummy = this.vars.dummy;
								var html = this.vars.foo.html;

								expect(_getEvents(body)).to.be.an("object");
								expect(_getEvents(dummy)).to.be.an("object");
								expect(_getEvents(html)).to.be.an("object");

								this.sup();

								expect(_getEvents(body)).to.not.be.ok();
								expect(_getEvents(dummy)).to.not.be.ok();
								expect(_getEvents(html)).to.not.be.ok();

								done();
							}
						});

						var testInstance = new TestClass();
						expect(testInstance).to.be.a(DOMClass);
						testInstance.destroy();
					});

					it("should not unbind sibling class events", function (done) {
						var TestClass = DOMClass.extend({
							vars : {},

							init : function () {
								this.sup();

								this.vars.body = $("body");

								this.setupEvents();
							},

							setupEvents : function () {
								this.vars.body.on("click", "div", this.proxy(this.onClick));
							},

							onClick : function () {}
						});

						var TestSiblingClass = DOMClass.extend({
							vars : {},

							init : function () {
								this.sup();

								this.vars.body = $("body");

								this.setupEvents();
							},

							setupEvents : function () {
								this.vars.body.on("click", "div", this.proxy(this.onClick));
							},

							onClick : function () {},

							destroy : function () {
								var body = this.vars.body;

								expect(_getEvents(body)).to.be.an("object");

								this.sup();

								var bodyEvents = _getEvents(body);

								expect(bodyEvents).to.be.an("object");
								expect(bodyEvents).to.have.property("click");
								expect(bodyEvents.click).to.have.length(1);

								var clickEvent = bodyEvents.click[0];

								expect(clickEvent).to.be.ok();
								expect(clickEvent.type).to.equal("click");
								expect(clickEvent.guid).to.equal(testInstance.onClick.guid);

								done();
							}
						});

						var testInstance = new TestClass();
						var testSiblingInstance = new TestSiblingClass();

						expect(testInstance).to.be.a(DOMClass);
						expect(testSiblingInstance).to.be.a(DOMClass);

						testSiblingInstance.destroy();
					});

				});

			});

		});
	}
);
