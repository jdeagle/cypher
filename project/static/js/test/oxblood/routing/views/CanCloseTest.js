define(

	[
		"./Page",
		"$"
	],

	function (Page, $) {

		"use strict";

		return Page.extend({

			canClose : function () {
				return !this.locked;
			},

			load : function () {
				this.sup();
			},

			transitionIn : function () {
				this.sup();
			},

			transitionOut : function () {
				this.sup();
			},

			destroy : function () {
				this.sup();
			}
		});
	}
);
