define(

	[
		"../base/Class"
	],

	function (Class) {

		"use strict";

		var transitionSequences = {

			"sync" : [
				["transitionOut"],
				["cleanup"],
				["load"],
				["transitionIn"],
				["complete"]
			],

			"async" : [
				["load"],
				["transitionIn", "transitionOut"],
				["cleanup"],
				["complete"]
			],

			"preload" : [
				["load"],
				["transitionOut"],
				["transitionIn"],
				["cleanup"],
				["complete"]
			],

			"reverse" : [
				["load"],
				["transitionIn"],
				["transitionOut"],
				["cleanup"],
				["complete"]
			]
		};

		var TransitionManager = Class.extend({

			transition : function (view, data, transition, cb) {

				var oldView,
					newView,
					transitionObj;

				if (view.viewGroup.transitioning === true) {
					view.viewGroup.deferredTransition = {
						view : view,
						data: data,
						transition : transition,
						cb : cb
					};
					return false;
				}

				if (!transition) {
					transition = view.viewConfig.transition || (view.viewGroup.config.transition || "sync");
				}

				view.viewGroup.transitioning = true;

				oldView = view.viewGroup.currentView;

				require([view.viewClass], this.proxy(function (ViewClass) {

					newView = new ViewClass(view.viewGroup, view.viewConfig, view.params, data);
					newView.viewClass = view.viewClass;
					newView.routeRegEx = view.regex;

					view.viewGroup.newView = newView;

					transitionObj = {
						"load"			: newView.__load.bind(newView),
						"transitionIn"	: newView.__transitionIn.bind(newView),
						"transitionOut"	: oldView && oldView.__transitionOut ? oldView.__transitionOut.bind(oldView) : null,
						"cleanup"		: oldView && oldView.__cleanup ? oldView.__cleanup.bind(oldView) : null,
						"complete"		: function () {

							view.viewGroup.newView = null;
							view.viewGroup.currentView = newView;
							view.viewGroup.transitioning = false;

							if (view.viewGroup.deferredTransition && view.viewGroup.deferredTransition.view) {
								this.transitionDeferred(view.viewGroup);
							}
							if (cb) {
								cb();
							}

						}.bind(this)
					};

					this._nextInSequence(0, transition, transitionObj);
				}));

				return true;
			},

			close : function (viewGroup, cb) {

				var view,
					transitionObj;

				if (viewGroup) {

					viewGroup.newView = null;

					view = viewGroup.currentView;

					if (view) {

						viewGroup.transitioning = true;

						transitionObj = {
							"load" : null,
							"transitionIn" : null,
							"transitionOut" : view.__transitionOut.bind(view),
							"cleanup" : view.__cleanup.bind(view),
							"complete" : function () {
								viewGroup.currentRoute = null;
								viewGroup.currentView = null;
								viewGroup.transitioning = false;

								if (cb) {
									cb();
								}
							}
						};

						this._nextInSequence(0, "reverse", transitionObj);
					}

					else {
						if (cb) {
							cb();
						}
					}
				}
				else {
					throw new Error("Invalid view group.");
				}
			},

			transitionDeferred : function (viewGroup) {
				var dt = viewGroup.deferredTransition;
				viewGroup.deferredTransition = null;
				this.transition(dt.view, dt.data, dt.transition, dt.cb);
			},

			_nextInSequence : function (index, transition, transitionObj) {

				if (index >= transitionSequences[transition].length) {
					return;
				}

				var i,
					l,
					cbCount = 0,
					sequence = transitionSequences[transition],

					callFn = this.proxy(function (fn) {

						if (!fn) {
							next(true);
							return;
						}

						fn(next);
					}),

					next = this.proxy(function (force) {

						cbCount ++;

						if (cbCount >= l || force) {
							this._nextInSequence(index + 1, transition, transitionObj);
						}
					});

				for (i = 0, l = sequence[index].length; i < l; i ++) {
					callFn(transitionObj[sequence[index][i]]);
				}
			}
		});

		return new TransitionManager();
	}
);
