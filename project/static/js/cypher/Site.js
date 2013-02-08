define(

	[
		"rosy/base/Class",
		"$"
	],

	function (Class, $) {

		"use strict";

		var Site = Class.extend({

			initialized : false,

			initialize : function () {

				if (!this.initialized) {


					this.initialized = true;

					//$(".demo").cypher('decode');
				}
			}
		});

		return new Site();
	}
);
