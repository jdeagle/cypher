define(

	[
		"../Module",
		"./libs/Easings",
		"$"
	],

	function (Module, Easings, $) {

		"use strict";

		var Caboose = Module.extend({

			init : function () {
				return this.setupCaboose();
			},

			prep : function (prop) {
				if (!prop) {
					return {};
				}

				var num = parseFloat(prop),
					unit = prop.replace(num, "");

				return {
					unit : unit,
					value : num,
					originalValue : prop,
					toString : function () {
						return this.originalValue;
					}
				};
			},

			prepBezier : function (prop) {
				if (!prop) {
					return {};
				}

				var obj = this.prep(prop);

				var curves = prop.match(/cubic-bezier\((.*)\)/);
				curves = (curves && curves[1]) ? curves[1].split(", ") : prop;

				obj.value = curves;
				obj.unit = null;

				return obj;
			},

			setupCaboose : function () {
				var caboose = $("#caboose");

				return {
					easings : Easings,
					animationDuration : this.prep(caboose.css("animation-duration")),
					animationEasing : this.prepBezier(caboose.css("animation-timing-function")),
					animationDelay : this.prep(caboose.css("animation-delay"))
				};
			},

			destroy : function () {
				this.sup();
			}
		});

		return new Caboose();
	}
);
