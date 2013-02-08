define(

	[
		"OxBlood",
		"rosy/base/Class",
		"rosy/modules/Module",
		"rosy/modules/caboose/Caboose",
		"$"
	],

	function (OxBlood, Class, Module, Caboose, $) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addModuleTests(function () {

			var dummy = $("#caboose"),
				animationDuration = dummy.css("animation-duration");

			if (!animationDuration) {
				return;
			}

			describe("Module: Caboose", function () {

				describe("Caboose", function () {

					it("Caboose should be an object", function () {
						expect(Caboose).to.be.an("object");
					});

					function _toCamelCase(string) {
						return string.replace(/(\-[a-z])/g, function ($1) {
							return $1.toUpperCase().replace("-", "");
						});
					}

					describe("easings", function () {
						var easings = Caboose.easings;

						var matches = {
							"linear":            "cubic-bezier(0.250, 0.250, 0.750, 0.750)",
							"ease":              "cubic-bezier(0.250, 0.100, 0.250, 1.000)",

							"ease-in":           "cubic-bezier(0.420, 0.000, 1.000, 1.000)",
							"ease-out":          "cubic-bezier(0.000, 0.000, 0.580, 1.000)",
							"ease-in-out":       "cubic-bezier(0.420, 0.000, 0.580, 1.000)",

							"ease-in-quad":      "cubic-bezier(0.550, 0.085, 0.680, 0.530)",
							"ease-out-quad":     "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
							"ease-in-out-quad":  "cubic-bezier(0.455, 0.030, 0.515, 0.955)",

							"ease-in-cubic":     "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
							"ease-out-cubic":    "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
							"ease-in-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1.000)",

							"ease-in-quart":     "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
							"ease-out-quart":    "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
							"ease-in-out-quart": "cubic-bezier(0.770, 0.000, 0.175, 1.000)",

							"ease-in-quint":     "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
							"ease-out-quint":    "cubic-bezier(0.230, 1.000, 0.320, 1.000)",
							"ease-in-out-quint": "cubic-bezier(0.860, 0.000, 0.070, 1.000)",

							"ease-in-sine":      "cubic-bezier(0.470, 0.000, 0.745, 0.715)",
							"ease-out-sine":     "cubic-bezier(0.390, 0.575, 0.565, 1.000)",
							"ease-in-out-sine":  "cubic-bezier(0.445, 0.050, 0.550, 0.950)",

							"ease-in-expo":      "cubic-bezier(0.950, 0.050, 0.795, 0.035)",
							"ease-out-expo":     "cubic-bezier(0.190, 1.000, 0.220, 1.000)",
							"ease-in-out-expo":  "cubic-bezier(1.000, 0.000, 0.000, 1.000)",

							"ease-in-circ":      "cubic-bezier(0.600, 0.040, 0.980, 0.335)",
							"ease-out-circ":     "cubic-bezier(0.075, 0.820, 0.165, 1.000)",
							"ease-in-out-circ":  "cubic-bezier(0.785, 0.135, 0.150, 0.860)"
						};

						var setupTest = function (key) {
							it(key, function () {
								var ccKey = _toCamelCase(key);
								expect(easings[ccKey]).to.be.a("string");
								expect(easings[ccKey]).to.equal(matches[key]);

								expect(easings.css[key]).to.be.a("string");
								expect(easings.css[key]).to.equal(matches[key]);
							});
						};

						for (var key in matches) {
							setupTest(key);
						}
					});

					describe("animationDuration", function () {
						var obj = Caboose.animationDuration;

						it("should return an object", function () {
							expect(obj).to.be.an("object");
						});

						it("should report value as a Number", function () {
							expect(obj.value).to.be.a("number");
							expect(obj.value).to.eql(0.75);
						});

						it("should report correct time unit", function () {
							expect(obj.unit).to.eql("s");
						});

						it("should report original CSS value", function () {
							expect(obj.toString()).to.be.a("string");
							expect(obj.toString()).to.eql("0.75s");
						});

					});

					describe("animationEasing", function () {
						var obj = Caboose.animationEasing;

						it("should return an object", function () {
							expect(obj).to.be.an("object");
						});

						it("should report value as an Array", function () {
							expect(obj.value).to.be.a("array");
							expect(obj.value).to.have.length(4);
							expect(obj.value).to.eql(["0.23", "1", "0.32", "1"]);
						});

						it("should not report a time unit", function () {
							expect(obj.unit).to.not.be.ok();
						});

						it("should report original CSS value", function () {
							expect(obj.toString()).to.be.a("string");
							expect(obj.toString()).to.eql("cubic-bezier(0.23, 1, 0.32, 1)");
						});

					});

					describe("animationDelay", function () {
						var obj = Caboose.animationDelay;

						it("should return an object", function () {
							expect(obj).to.be.an("object");
						});

						it("should report value as a Number", function () {
							expect(obj.value).to.be.a("number");
							expect(obj.value).to.eql(0.1875);
						});

						it("should report correct time unit", function () {
							expect(obj.unit).to.eql("s");
						});

						it("should report original CSS value", function () {
							expect(obj.toString()).to.be.a("string");
							expect(obj.toString()).to.eql("0.1875s");
						});

					});

				});

			});

		});
	}
);
