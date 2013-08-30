define(

	[
		"./Page",
		"$"
	],

	function (Page, $) {

		"use strict";

		return Page.extend({

			load : function () {
				this.sup();
			},

			transitionIn : function () {
				this.sup();
			},

			transitionOut : function () {
				this.sup();
			},

			update : function (params, data) {

			},

			destroy : function () {
				this.sup();
			}
		});
	}
);
