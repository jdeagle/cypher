define(

	[
		"OxBlood",
		"rosy/modules/Module",
		"rosy/modules/custom-form-field/CustomFormField",
		"$"
	],

	function (OxBlood, Module, CustomFormField, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			describe("Module: Custom Form Field", function () {

				var testInstance = new CustomFormField({
					field : $('<input type="checkbox" />')
				});

				describe("CustomFormField", function () {

					it("CustomFormField should be a function", function () {
						expect(CustomFormField).to.be.a("function");
					});

					it("should instantiate the class", function () {
						expect(testInstance).to.be.an("object");
					});

					it("should be an instance of Module", function () {
						expect(testInstance).to.be.a(Module);
					});

				});

			});

		});
	}
);
