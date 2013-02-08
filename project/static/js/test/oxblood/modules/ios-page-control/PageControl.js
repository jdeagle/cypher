define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/modules/Module",
		"rosy/modules/ios-page-control/PageControl",
		"$"
	],

	function (OxBlood, Class, Module, PageControl, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: iOS Page Controller", function () {

				var testInstance = new PageControl({
					parent : $("<div>"),
					list : $("<div>"),
					items : $("<div>")
				});

				describe("PageControl", function () {

					it("PageControl should be a function", function () {
						expect(PageControl).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

					describe("Notifications", function () {

						it(PageControl.TOUCHEND, function () {});

						it(PageControl.PAGINATE, function () {});

					});

				});

			});

		});
	}
);
