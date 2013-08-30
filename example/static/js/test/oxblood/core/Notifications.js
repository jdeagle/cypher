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

			describe("Rosy Notifications", function () {
				var delay = 10;

				var testInstance = new SubClass();

				describe("Methods", function () {
					describe(".subscribe()", function () {

						it("subscribe should be a function", function () {
							expect(testInstance.subscribe).to.be.a("function");
						});

						it("should subscribe to a notification", function (done) {
							testInstance.subscribe("sub-test", function () {
								done();
							});

							testInstance.publish("sub-test");
						});

					});

					describe(".unsubscribe()", function () {

						it("unsubscribe should be a function", function () {
							expect(testInstance.unsubscribe).to.be.a("function");
						});

						it("should unsubscribe a notification", function (done) {
							testInstance.subscribe("unsub-test", function () {
								done("ERROR!");
							});

							testInstance.unsubscribe("unsub-test");
							testInstance.publish("unsub-test");

							done();
						});

					});

					describe(".publish()", function () {

						it("publish should be a function", function () {
							expect(testInstance.publish).to.be.a("function");
						});

						it("should publish a notification", function (done) {
							testInstance.subscribe("pub-test", function () {
								done();
							});

							testInstance.publish("pub-test");
						});

						it("should publish a notification with data", function (done) {
							testInstance.subscribe("pub-data-test", function (notification) {
								expect(notification.data).to.eql({
									x : 1,
									y : 2
								});

								done();
							});

							testInstance.publish("pub-data-test", {
								x : 1,
								y : 2
							});
						});

						it("should publish a notification with multiple arguments", function (done) {

							testInstance.subscribe("pub-args-test", function (notification, arg1, arg2, arg3) {
								expect(arg1).to.eql(1);
								expect(arg2).to.eql(2);
								expect(arg3).to.eql("z");
								expect(notification.dispatcher).to.eql(testInstance);
								done();
							});

							testInstance.publish("pub-args-test", 1, 2, "z");
						});


					});

					describe(".hold()", function () {
						var holdInstance = new SubClass();
						var doneCalled;

						it("hold should be a function", function (done) {
							testInstance.subscribe("hold-test-1", function (notification) {
								expect(notification).to.be.an("object");
								expect(notification.hold).to.be.a("function");

								done();
							});

							testInstance.publish("hold-test-1");
						});

						it("should hold a notification", function (done) {
							testInstance.subscribe("hold-test-2", function (notification) {
								notification.hold();

								window.setTimeout(function () {
									notification.release();
								}, delay);

								doneCalled = true;
								done();
							});

							holdInstance.subscribe("hold-test-2", function (notification) {
								if (!doneCalled) {
									done(false);
								}
							});

							testInstance.publish("hold-test-2");
						});

					});

					describe(".release()", function () {
						var releaseInstance = new SubClass();
						var doneCalled;

						it("release should be a function", function (done) {
							testInstance.subscribe("release-test-1", function (notification) {
								expect(notification).to.be.an("object");
								expect(notification.release).to.be.a("function");

								done();
							});

							testInstance.publish("release-test-1");
						});

						it("should release a notification", function (done) {
							testInstance.subscribe("release-test-2", function (notification) {
								notification.hold();

								window.setTimeout(function () {
									notification.release();

									if (!doneCalled) {
										done(false);
									}
								}, delay);
							});

							releaseInstance.subscribe("release-test-2", function (notification) {
								doneCalled = true;
								done();
							});

							testInstance.publish("release-test-2");
						});

					});

					describe(".cancel()", function () {
						var cancelInstance = new SubClass();

						it("cancel should be a function", function (done) {
							testInstance.subscribe("cancel-test-1", function (notification) {
								expect(notification).to.be.an("object");
								expect(notification.cancel).to.be.a("function");

								done();
							});

							testInstance.publish("cancel-test-1");
						});

						it("should cancel a notification", function (done) {
							testInstance.subscribe("cancel-test-2", function (notification) {
								notification.cancel();

								window.setTimeout(function () {
									done();
								}, delay);
							});

							cancelInstance.subscribe("cancel-test-2", function (notification) {
								done(false);
							});

							testInstance.publish("cancel-test-2");
						});
					});

					describe(".respond()", function () {
						it("respond should be a function", function (done) {
							testInstance.subscribe("respond-test-1", function (notification) {
								expect(notification).to.be.an("object");
								expect(notification.respond).to.be.a("function");

								done();
							});

							testInstance.publish("respond-test-1");
						});

						it("should respond to a notification with a callback", function (done) {
							testInstance.subscribe("respond-test-2", function (notification) {
								expect(notification).to.be.an("object");

								notification.respond({
									x : 1,
									y : 2
								});
							});

							testInstance.publish("respond-test-2", {}, function (obj) {
								expect(obj).to.eql({
									x : 1,
									y : 2
								});

								done();
							});
						});
					});
				});

				describe("Properties", function () {
					describe("n.dispatcher", function () {
						it("notification should contain dispatcher property", function (done) {
							testInstance.subscribe("dispatcher-test-1", function (notification) {
								expect(notification.dispatcher).to.be.an("object");
								done();
							});

							testInstance.publish("dispatcher-test-1");
						});

						it("should report the current target", function (done) {
							testInstance.subscribe("dispatcher-test-2", function (notification) {
								expect(notification.dispatcher).to.eql(testInstance);
								done();
							});

							testInstance.publish("dispatcher-test-2");
						});
					});
				});

			});

		});
	}
);
