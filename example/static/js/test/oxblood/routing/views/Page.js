define(

	[
		"rosy/views/View"
	],

	function (View) {

		"use strict";

		return View.extend({

			init : function () {

			},

			load : function () {
				this.setTimeout(this.loadComplete, 0);
			},

			transitionIn : function () {
				this.setTimeout(this.transitionInComplete, 0);
			},

			transitionOut : function () {
				this.setTimeout(this.transitionOutComplete, 0);
			},

			cleanup : function () {
				this.unsubscribe();
				this.setTimeout(this.cleanupComplete, 0);
			},

			loadComplete : function () {
				this.sup();
			},

			transitionInComplete : function () {
				this.sup();
			},

			transitionOutComplete : function () {
				this.sup();
			},

			cleanupComplete : function () {
				this.sup();
			}

		});
	}
);
