define(

	[
		"../base/DOMClass",
		"./ViewNotification"
	],

	function (DOMClass, ViewNotification) {

		"use strict";

		/*jshint es5:true */

		/**
		* MAX_WAIT_TIME is used to try and catch uncompleted/improperly
		* implemented transitions. If a corresponding transitionInComplete(),
		* transitionOutComplete(), loadComplete() or cleanupComplete()
		* method is not called within MAX_WAIT_TIME, then an Error is thrown.
		**/

		var MAX_WAIT_TIME = 10000,
			ERROR_HANDLER = function (e) { throw e; };

		return DOMClass.extend({

			config : null,
			data : null,
			params : null,
			viewGroup : null,
			viewClass : null,
			routeRegEx : null,

			_loadCB : null,
			_inCB : null,
			_outCB : null,
			_cleanupCB : null,

			_loadTimeout : null,
			_inTimeout : null,
			_outTimeout : null,
			_cleanupTimeout : null,

			"static" : {
				setMaxWaitTime : function (ms) {
					MAX_WAIT_TIME = ms;
				},
				setErrorHandler : function (fn) {
					ERROR_HANDLER = fn;
				}
			},

			/**
			* View has it's own init() method, but it's clunky to have
			* to call this.sup() with a bunch of arguments.
			*
			* Because of this, we implement a little magic to call
			* View's own native init() function first.
			*
			* You should never be instantiating a view manually,
			* but you can use init() to do anything you need to do
			* when the View is instantiated. this.params and this.data
			* will be set with appropriate values by the time init() is called.
			**/

			init : function () {

			},

			/**
			* update() will receive the new params and data objects.
			* update() is only called if the view is already open
			* and a route maps to the same view that is currently opened.
			*
			* You don't have to copy the values to this.params, that happens
			* automatically after update() has finished.
			* However, you can return `true` or `false`.
			*
			* If you return false, then the update won't take.
			* Meaning, `this.params` and `this.data` will not be updated
			* Also, the pending route change will be cancelled.
			**/

			update : function (params, data) {
				return true;
			},

			/**
			* canClose();
			* Returning `false` will cancel the pending route change.
			**/

			canClose : function (viewData) {
				return true;
			},

			/**
			*
			* REQUIRED METHOD
			*
			* Do any async loading/compilation of templates in the load() method.
			* You can either do DOM manipulation here or in transitionIn, whatever
			* makes the most sense for your use case.
			*
			* Be sure to call this.loadComplete() when you are done
			**/

			load : function () {
				ERROR_HANDLER(new Error(this.viewClass + " must implement the load() method."));
			},

			/**
			*
			* REQUIRED METHOD
			*
			* Be sure to call this.transitionInComplete() when the transition has finished.
			**/

			transitionIn : function () {
				ERROR_HANDLER(new Error(this.viewClass + " must implement the transitionIn() method."));
			},

			/**
			*
			* REQUIRED METHOD
			*
			* Be sure to call this.transitionOutComplete() when the transition has finished.
			**/

			transitionOut : function () {
				ERROR_HANDLER(new Error(this.viewClass + " must implement the transitionOut() method."));
			},

			/**
			*
			* REQUIRED METHOD
			*
			* Called automatically by default on cleanup().
			* Remove listeners and do any other garbage collection type stuff here.
			**/

			destroy : function () {
				ERROR_HANDLER(new Error(this.viewClass + " must implement the destroy() method."));
			},

			/**
			* In most cases, you'll just want to implement destroy(). However, in the fringe case
			* that you need to do some sort of async cleanup, implement this method.
			*
			* Be sure to call this.cleanupComplete() when you are done.
			**/

			cleanup : function () {
				this.destroy();
				this.cleanupComplete();
			},

			changeRoute : function () {
				this.viewGroup.viewManager.changeRoute.apply(null, arguments);
			},

			updateTitle : function (title) {
				this.viewGroup.viewManager.updateTitle(title);
			},

			closeViewGroup : function () {
				this.viewGroup.close.apply(null, arguments);
			},

			/**
			* Shouldn't have to override the below complete methods.
			* However, if you do, just make sure to call this.sup()
			**/

			loadComplete : function () {

				if (this._loadTimeout) {
					clearTimeout(this._loadTimeout);
					this._loadTimeout = null;
				}

				this.publish(ViewNotification.VIEW_LOAD_COMPLETED, {
					view : this,
					viewGroup: this.viewGroup
				});

				return this._loadCB ? this._loadCB() : null;
			},

			transitionInComplete : function () {

				if (this._inTimeout) {
					clearTimeout(this._inTimeout);
					this._inTimeout = null;
				}

				this.publish(ViewNotification.VIEW_IN_COMPLETED, {
					view : this,
					viewGroup: this.viewGroup
				});

				return this._inCB ? this._inCB() : null;
			},

			transitionOutComplete : function () {

				if (this._outTimeout) {
					clearTimeout(this._outTimeout);
					this._outTimeout = null;
				}

				this.publish(ViewNotification.VIEW_OUT_COMPLETED, {
					view : this,
					viewGroup: this.viewGroup
				});

				return this._outCB ? this._outCB() : null;
			},

			cleanupComplete : function () {

				if (this._cleanupTimeout) {
					clearTimeout(this._cleanupTimeout);
					this._cleanupTimeout = null;
				}

				this.__destroy();

				this.publish(ViewNotification.VIEW_CLEANUP_COMPLETED, {
					view : this,
					viewGroup: this.viewGroup
				});

				return this._cleanupCB ? this._cleanupCB() : null;
			},

			/**
			* DO NOT OVERRIDE THE BELOW METHODS.
			* Any method that starts with "__" is internal and is not meant to be extended.
			**/

			__init : function (viewGroup, config, params, data) {

				this.data = {};
				this.params = {};

				this.viewGroup = viewGroup;
				this.config = config;
				this.__update(params, data, true);

				this.init();

				this.publish(ViewNotification.VIEW_INITIALIZED, {
					view : this,
					viewGroup: this.viewGroup
				});
			},

			__canClose : function (viewData) {
				var can = this.canClose(viewData);

				if (!can) {
					this.publish(ViewNotification.VIEW_CHANGE_CANCELLED, {
						view : this,
						viewGroup: this.viewGroup
					});
				}

				return can;
			},

			__update : function (params, data, isInit) {

				var p;

				if (!isInit) {
					if (this.update(params, data) === false) {
						this.publish(ViewNotification.VIEW_UPDATE_CANCELLED, {
							view : this,
							viewGroup: this.viewGroup
						});

						return false;
					}
				}

				for (p in params) {
					this.params[p] = params[p];
				}

				for (p in data) {
					this.data[p] = data[p];
				}

				this.publish(ViewNotification.VIEW_UPDATED, {
					view : this,
					viewGroup: this.viewGroup
				});
			},

			__load : function (cb) {

				this._loadTimeout = this.setTimeout(function () {
					ERROR_HANDLER(new Error(this.viewClass + " : loadComplete() was never called."));
				}, MAX_WAIT_TIME);

				this._loadCB = cb;

				this.publish(ViewNotification.VIEW_LOAD_STARTED, {
					view : this,
					viewGroup: this.viewGroup
				});

				this.load.call(this);
			},

			__transitionIn : function (cb) {

				this._inTimeout = this.setTimeout(function () {
					ERROR_HANDLER(new Error(this.viewClass + " : transitionInComplete() was never called."));
				}, MAX_WAIT_TIME);

				this._inCB = cb;

				this.publish(ViewNotification.VIEW_IN_STARTED, {
					view : this,
					viewGroup: this.viewGroup
				});

				this.transitionIn.call(this);
				this.viewGroup.activate();
			},

			__transitionOut : function (cb) {

				this._outTimeout = this.setTimeout(function () {
					ERROR_HANDLER(new Error(this.viewClass + " : transitionOutComplete() was never called."));
				}, MAX_WAIT_TIME);

				this._outCB = cb;

				this.publish(ViewNotification.VIEW_OUT_STARTED, {
					view : this,
					viewGroup: this.viewGroup
				});

				this.transitionOut.call(this);
			},

			__cleanup : function (cb) {

				this._cleanupTimeout = this.setTimeout(function () {
					ERROR_HANDLER(new Error(this.viewClass + " : cleanupComplete() was never called."));
				}, MAX_WAIT_TIME);

				this._cleanupCB = cb;

				this.publish(ViewNotification.VIEW_CLEANUP_STARTED, {
					view : this,
					viewGroup: this.viewGroup
				});

				this.cleanup.call(this);
			},

			__destroy : function () {

				this.config = null;
				this.data = null;
				this.params = null;

				this._loadCB = null;
				this._inCB = null;
				this._outCB = null;

				this.unbindEvents();
				this.unsubscribe();
			}
		});
	}
);
