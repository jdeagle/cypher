define(

	[
		"OxBlood",
		"rosy/modules/Module",
		"ChromeFrame",
		"Cookies",
		"$"
	],

	function (OxBlood, Module, ChromeFrame, Cookies, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Google Chrome Frame", function () {

				describe("ChromeFrame", function () {

					it("ChromeFrame should be an object", function () {
						expect(ChromeFrame).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(ChromeFrame).to.be.a(Module);
					});

				});

				describe("IE Specific", function () {
					if (!$.browser.msie) {
						it("should not report as Internet Explorer", function () {
							expect($.browser.msie).to.not.be.ok();
						});
					} else {
						it("should append #chrome-frame to DOM", function () {
							expect($("#chrome-frame").length).to.be.ok();
						});

						it("should set a cookie on #cf-decline click", function () {
							ChromeFrame.vars.no.trigger("click");
							expect(Cookies.get(ChromeFrame["static"].COOKIE_NAME)).to.be.ok();
							Cookies.expire(ChromeFrame.COOKIE_NAME);
						});
					}
				});

			});
		});
	}
);
