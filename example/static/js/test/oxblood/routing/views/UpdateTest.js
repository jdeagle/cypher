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

				params.something = parseInt(params.something, 10);

				if (!isNaN(params.something) && params.something > 0 && params.something <= 10) {
					return true;
				}

				return false;
			},

			destroy : function () {
				this.sup();
			}
		});
	}
);
