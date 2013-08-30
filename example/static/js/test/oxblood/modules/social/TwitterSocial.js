define(

	[
		"OxBlood",
		"rosy/modules/Module",
		"rosy/modules/social/TwitterSocial",
		"$"
	],

	function (OxBlood, Module, TwitterSocial, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Twitter Social", function () {

				describe("TwitterSocial", function () {

					var testInstance = new TwitterSocial();

					it("TwitterSocial should be a function", function () {
						expect(TwitterSocial).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

					describe("Notifications", function () {

						it(TwitterSocial.POST, function () {});

						it(TwitterSocial.RENDER, function () {});

						it(TwitterSocial.LOGIN, function () {});

						it(TwitterSocial.LOGOUT, function () {});

						it(TwitterSocial.HANDLE_LOGIN, function () {});

						it(TwitterSocial.HANDLE_LOGOUT, function () {});

						it(TwitterSocial.GET_STATUS, function () {});

						it(TwitterSocial.POST_STATUS, function () {});

					});

				});

			});

		});
	}
);
