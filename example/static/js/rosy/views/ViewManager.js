define(

	[
		"../base/Class",
		"../utils/Utils",
		"./View",
		"./ViewGroup",
		"./ViewRouter",
		"./TransitionManager",
		"./ViewNotification",
		"$"
	],

	function (Class, Utils, View, ViewGroup, ViewRouter, TransitionManager, ViewNotification, $) {

		/*jshint eqnull:true*/

		"use strict";

		var HISTORY_SUPPORTED = window.history && window.history.pushState,
			HASH_VALUE,
			ERROR_HANDLER = function (e) { throw e; };

		var ViewManager = Class.extend({

			_pollInterval : null,
			_router : null,
			_viewGroups : [],
			_activeElements : {},

			/**
			*	SUPPORTED FALLBACK MODES:
			*
			*	soft	- If the History API is not supported, changes state without url change.
			*	hard	- If the History API is not supported, forces hard reloads on all links.
			*	hash|#	- If the History API is not supported, falls back to hash tags.
			**/

			fallbackMode : "hard",
			aliases : [],
			selectors : ["[data-route]", "a[href^='#']", "a[href^='/']"],
			hijackLinks : true,
			clickEvents : ["click"],
			activeClass : "active",
			disabledClass : "disabled",
			bubble : false,
			container : null,
			initialized : false,

			/**
			*	CONFIG OPTIONS:
			*
			*	viewGroups			:	Array
			*	fallbackMode		:	hard|soft|hash
			*	aliases				:	Array
			*	selectors			:	Array
			*	hijackLinks			:	Boolean
			*	clickEvents			:	Array
			*	bubble				:	true|false
			*	container			:	String|DOMElement
			*	defaultRoute		:	String
			*	activeClass			:	String
			*	disabledClass		:	String
			*	TransitionManager	:	Class
			**/

			initialize : function (config) {

				if (this.initialized) {
					ERROR_HANDLER(new Error("ViewManager has already been initialized."));
				}

				var i,
					l,
					viewGroup,
					viewGroups = config.viewGroups,
					defaultRoute = config.defaultRoute || null;

				config.fallbackMode = config.fallbackMode === "hash" ? "#" : config.fallbackMode;

				TransitionManager	=	config.TransitionManager || TransitionManager;

				this.fallbackMode	=	config.fallbackMode || this.fallbackMode;
				this.aliases		=	config.aliases || this.aliases;
				this.selectors		=	config.selectors || this.selectors;
				this.hijackLinks	=	config.hijackLinks || this.hijackLinks;
				this.clickEvents	=	config.clickEvents || this.clickEvents;
				this.activeClass	=	config.activeClass || this.activeClass;
				this.bubble			=	config.bubble || this.bubble;
				this.container		=	$(config.container || document);

				if (config.maxWaitTime) {
					View.setMaxWaitTime(config.maxWaitTime);
				}

				if (config.errorHandler) {
					ERROR_HANDLER = config.errorHandler;
					View.setErrorHandler(config.errorHandler);
				}

				for (i = 0, l = viewGroups.length; i < l; i ++) {
					viewGroup = new ViewGroup(viewGroups[i], this);

					viewGroup.config = viewGroup.config || {};
					viewGroup.config.useHistory = viewGroup.config.useHistory === "hash" ? "#" : viewGroup.config.useHistory;
					this._viewGroups.push(viewGroup);

					if (viewGroup.config.useHistory === "#" && this.fallbackMode === "#") {
						ERROR_HANDLER(new Error("You can't use the 'hash' fallback mode in conjunction with useHistory = 'hash'"));
					}
				}

				this._router = new ViewRouter(this._viewGroups);
				this._setHashValue();

				if (HISTORY_SUPPORTED) {
					window.addEventListener('popstate', this._onStateChange);
				}

				else {
					if (this.fallbackMode === "#") {
						this._pollInterval = this.setInterval(this._pollForHashChange, 100);
					}
				}

				if (this.hijackLinks) {
					this.container.on(this.clickEvents.join(" "), this.selectors.join(","), this._onLinkClick);
				}

				if (HASH_VALUE) {
					this._gotoRoute({route : HASH_VALUE, hashOnly : true});
				}

				this._gotoRoute({route : defaultRoute || window.location.pathname + window.location.search, updateHistory : false});

				this.initialized = true;
			},

			changeRoute : function (route/*, data|transition, cb*/) {

				var data = Utils.isObject(arguments[1]) ? arguments[1] : {};
				data.route = route;

				data.transition = typeof arguments[1] === "string" ? arguments[1] : null;
				data.cb = Utils.isFunction(arguments[1]) ? arguments[1] : (arguments[2] || null);

				this._gotoRoute(data);
			},

			updateTitle : function (title) {

				if (HISTORY_SUPPORTED) {
					history.replaceState(null, title, window.location.href);
				}

				document.title = title;
				this.publish(ViewNotification.TITLE_CHANGED, {title : title});
			},

			closeViewGroup : function (viewGroup, cb) {

				cb = typeof cb === "function" ? cb : null;
				viewGroup = (typeof viewGroup === "string") ? this.getViewGroup(viewGroup) : viewGroup;

				TransitionManager.close(viewGroup, cb);

				if (viewGroup.config.useHistory === "#") {
					this._setHashValue("");
				}
			},

			getViewGroup : function (id) {

				var i,
					l,
					viewGroup;

				for (i = 0, l = this._viewGroups.length; i < l; i ++) {
					viewGroup = this._viewGroups[i];
					if (viewGroup.id === id) {
						return viewGroup;
					}
				}

				return false;
			},

			activate : function (/*route1, route2, route3, ...*/) {

				var i,
					l,
					j,
					l2,
					k,
					l3,
					m,
					m2,
					$el,
					route,
					elRoute,
					regexes,
					toCheck = [],
					$elements = this.container.find(this.selectors.join(","));

				for (i = 0, l = arguments.length; i < l; i ++) {
					route = arguments[i];
					regexes = this._router.getRouteRegexes(route);

					toCheck.push({route : route, regexes: regexes});
				}

				for (i = 0, l = $elements.length; i < l; i ++) {

					$el = $($elements[i]);

					if ($el.data("active-disabled") == null && !$el.hasClass(this.activeClass)) {

						elRoute = $el.data("route") || $el.attr("href");

						for (j = 0, l2 = toCheck.length; j < l2; j ++) {
							route = toCheck[j].route;
							regexes = toCheck[j].regexes;

							for (k = 0, l3 = regexes.length; k < l3; k ++) {
								m = regexes[k].exec(route);
								m2 = regexes[k].exec(elRoute);

								if (m2) {
									if (this._regexMatch(m, m2)) {
										$el.addClass(this.activeClass);
										this._activeElements[route] = this._activeElements[route] || [];
										this._activeElements[route].push($el);
									}
								}
							}
						}
					}
				}
			},

			deactivate : function (/*route1, route2, route3, ...*/) {

				var i,
					l,
					j,
					l2,
					route;

				for (i = 0, l = arguments.length; i < l; i ++) {
					route = arguments[i];

					if (this._activeElements[route]) {

						for (j = 0, l2 = this._activeElements[route].length; j < l2; j ++) {
							$(this._activeElements[route][j]).removeClass(this.activeClass);
						}

						this._activeElements[route] = null;
					}
				}
			},

			_onLinkClick : function (e) {

				var $el = $(e.currentTarget),
					data = $el.data();

				if (!$el.attr("target")) {

					if ($el.hasClass(this.disabledClass)) {
						e.preventDefault();
						return false;
					}

					data.route = data.route || $el.attr("href");

					if (data.route) {

						if (!$el.attr("href") || (HISTORY_SUPPORTED || this.fallbackMode !== "hard") || data.route.indexOf("#") > -1) {

							data.event = e;
							data.eventReturn = true;
							this._gotoRoute(data);

							if (!this.bubble) {
								return data.eventReturn;
							}
						}
					}
				}
			},

			_pollForHashChange : function () {

				var hash = this._getHash();

				if (hash !== HASH_VALUE) {

					this._setHashValue();
					this._gotoRoute({route : HASH_VALUE, hashOnly : true}, null, true);
				}
			},

			_onStateChange : function () {
				this._gotoRoute({route : (window.location.pathname + window.location.search) || "/", updateHistory : false});
			},

			_gotoRoute : function (data) {

				var i,
					l,
					cb,
					skipped = 0,
					matchedView,
					matchedViews,
					viewGroup,
					currentView,
					viewData,
					didRoute = false;

				// If data.route is null and data.hashOnly is set to true, then
				// this should signify we want to close all view groups that
				// have useHistory = "#"
				if (!data.route && data.hashOnly) {

					for (i = 0, l = this._viewGroups.length; i < l; i ++) {
						viewGroup = this._viewGroups[i];
						if (viewGroup.config.useHistory === "#") {
							this.closeViewGroup(viewGroup);
						}
					}
				}

				// Force all routes to begin with a "/" and have no hashtag
				data.route = data.route.replace("#", "");
				data.route = ((data.route.substr(0, 1) !== "/") ? "/" : "") + data.route;

				// If this route is an alias, grab the alias value
				data.route = this.aliases[data.route] || data.route;

				if (data.cb) {
					cb = data.cb;
					data.cb = null;
					delete data.cb;
				}

				matchedViews = this._router.getViewsByRoute(data.route);

				if (matchedViews) {

					if (data.event) {
						data.event.preventDefault();
						data.eventReturn = false;
					}

					/**
					* First we loop through all matched view groups to make sure
					* we can actually change to the route in question.
					**/

					for (i = 0, l = matchedViews.length; i < l; i ++) {

						matchedView = matchedViews[i];
						viewGroup = matchedView.viewGroup;
						currentView = matchedView.viewGroup.currentView;

						if (matchedView.viewGroup.currentRoute !== data.route) {

							if (currentView && !viewGroup.transitioning) {

								if (currentView.routeRegEx === matchedView.regex) {
									if (currentView.__update(matchedView.params, data) === false) {
										if (cb) {
											cb();
										}
										return false;
									}
								}

								else {

									viewData = Utils.extend({}, data, matchedView);

									viewData.viewGroup = null;
									delete viewData.viewGroup;

									if (!currentView.__canClose(viewData)) {

										if (cb) {
											cb();
										}
										return false;
									}
								}
							}
						}
					}

					/**
					* If we made it here, we know we can change the route.
					* Loop through all matches and update route accordingly.
					**/

					for (i = 0; i < l; i ++) {

						matchedView = matchedViews[i];
						viewGroup = matchedView.viewGroup;
						currentView = matchedView.viewGroup.newView || matchedView.viewGroup.currentView;

						if (viewGroup.currentRoute !== data.route) {

							this.deactivate(viewGroup.currentRoute);

							if ((!data.hashOnly || data.hashOnly && viewGroup.config.useHistory === "#") && (!data.viewGroup || viewGroup.id === data.viewGroup)) {

								viewGroup.__updateRoute(data.route);

								// If a route maps to a View, and that View's ViewGroup has useHistory = true
								if (viewGroup.config.useHistory && data.updateHistory !== false) {
									this._updateHistory(data.title || "", data.route, viewGroup.config.useHistory === "#");
								}

								if (!currentView || currentView.routeRegEx !== matchedView.regex) {
									this._changeView(matchedView, data, cb);
									didRoute = true;
								}

								else if (currentView) {
									skipped ++;
								}
							}
						}

						else {
							skipped ++;
						}
					}

					/**
					* Lastly, loop through all view groups and activate all active routes
					**/

					for (i = 0, l = this._viewGroups.length; i < l; i ++) {
						this.activate(this._viewGroups[i].currentRoute);
					}

					if (skipped === l) {
						if (cb) {
							cb();
						}
						return false;
					}

					return didRoute;
				}

				return false;
			},

			_changeView : function (matchedView, data, cb) {

				data = data || {};

				if (matchedView.viewClass) {

					require([matchedView.viewClass], this.proxy(function () {

						TransitionManager.transition(matchedView, data, data.transition, this.proxy(function () {

							this.publish(ViewNotification.VIEW_CHANGED, {view : matchedView, viewGroup : matchedView.viewGroup});

							if (cb) {
								cb();
							}
						}));
					}));
				}
				else {

					TransitionManager.close(matchedView.viewGroup, this.proxy(function () {

						this.publish(ViewNotification.VIEW_CLOSED, {view : matchedView, viewGroup : matchedView.viewGroup});

						if (cb) {
							cb();
						}
					}));
				}
			},

			_updateHistory : function (title, route, useHash) {

				var url = route + (HASH_VALUE ? "#" + HASH_VALUE : "");

				if (HISTORY_SUPPORTED && !useHash && url !== window.location.href) {
					history.pushState(null, title || "", url);
				}

				else if (useHash || this.fallbackMode === "#") {

					if (!this._pollInterval) {
						HASH_VALUE = HASH_VALUE || this._getHash();
						this._pollInterval = this.setInterval(this._pollForHashChange, 100);
					}

					this._setHashValue(route);
				}
			},

			_regexMatch : function (m, m2) {

				var i,
					l;

				m = m.concat();
				m2 = m2.concat();

				m.splice(0, 1);
				m2.splice(0, 1);

				for (i = 0, l = m.length; i < l; i ++) {
					if (m[i] !== m2[i] && typeof m2[i] !== "undefined") {
						return false;
					}
				}

				return true;
			},

			_getHash : function () {
				return window.location.hash.replace("#", "");
			},

			_setHashValue : function (val) {

				var hash;

				if (typeof val !== "undefined") {

					HASH_VALUE = val;

					hash = this._getHash();

					if (hash || val && hash !== val) {
						window.location.hash = val;
					}
				}

				else {
					HASH_VALUE = window.location.hash.replace("#", "");
				}
			}
		});

		return new ViewManager();
	}
);
