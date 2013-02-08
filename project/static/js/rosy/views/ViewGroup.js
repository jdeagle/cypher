define(

	[
		"../base/Class"
	],

	function (Class) {

		"use strict";

		return Class.extend({

			viewManager : null,

			id : null,
			config : {},
			routes: [],

			history : null,
			currentRoute : null,

			currentView : null,
			transitioning : false,
			deferredTransition : null,

			init : function (obj, viewManager) {
				this.history = [];
				this.id = obj.config.id || null;
				this.currentView = null;
				this.config = obj.config;
				this.routes = obj.routes;

				this.viewManager = viewManager;
			},

			activate : function () {
				this.viewManager.activate(this.currentRoute);
			},

			deactivate : function () {
				this.viewManager.deactivate(this.currentRoute);
			},

			close : function () {

				var viewGroup = arguments.length > 1 ? arguments[0] : this,
					cb = arguments.length > 1 ? arguments[1] : arguments[0];

				this.deactivate();
				this.__updateRoute(null);

				this.viewManager.closeViewGroup(viewGroup, cb);
			},

			__updateRoute : function (route) {
				this.currentRoute = route;
				this.history.push(this.currentRoute);
			}
		});
	}
);
