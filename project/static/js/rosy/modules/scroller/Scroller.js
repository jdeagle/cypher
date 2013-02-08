// ## Scroller
// Creates a countdown scroller.
//
// Usage:
//
//  var scroller = new Scroller({
//      target : $('#scrollable')
//  });
//
//  this.subscribe(Scroller.TOUCHSTART, function () {
//      // on touch start
//  });
//
//  this.subscribe(Scroller.TOUCHMOVE, function () {
//      // on touch move
//  });
//
//  this.subscribe(Scroller.TOUCHEND, function () {
//      // on touch end
//  });
//
//  this.subscribe(Scroller.TOUCHINERTIA, function () {
//      // on touch inertia
//  });
define(

	[
		"../Module",
		"zynga/Scroller",
		"$"
	],

	function (Module, Scroller, $) {

		"use strict";

		var STATIC = {
			TOUCHINERTIA : "module/scroller/touchinertia",
			TOUCHSTART : "module/scroller/touchstart",
			TOUCHMOVE : "module/scroller/touchmove",
			TOUCHEND : "module/scroller/touchend"
		};

		// Extends red.Module
		return Module.extend({

			"static" : STATIC,

			vars : {},

			init : function () {
				this.setDOMReferences();
				this.setupScroller();
			},

			setDOMReferences : function () {
				this.vars.target = this.vars.target[0] || this.vars.target;
				this.vars.doc = $(document);
			},

			/* DOM-based rendering (Uses 3D when available, falls back on margin when transform not available) */
			renderingEngine : function (scope) {
				var docStyle = document.documentElement.style,
					engine, vendorPrefix, undef,
					helperElem = document.createElement("div"),
					perspectiveProperty, transformProperty,
					prevLeft, prevTop, prevZoom,
					self = this;

				/*global opera */
				if ("opera" in window && Object.prototype.toString.call(opera) === "[object Opera]") {
					engine = "presto";
				} else if ("MozAppearance" in docStyle) {
					engine = "gecko";
				} else if ("WebkitAppearance" in docStyle) {
					engine = "webkit";
				} else if (typeof navigator.cpuClass === "string") {
					engine = "trident";
				}

				vendorPrefix = {
					trident: "ms",
					gecko: "Moz",
					webkit: "Webkit",
					presto: "O"
				}[engine];

				perspectiveProperty = vendorPrefix + "Perspective";
				transformProperty = vendorPrefix + "Transform";

				if (helperElem.style[perspectiveProperty] !== undef) {

					return function (left, top, zoom) {
						if (left === prevLeft && top === prevTop && zoom === prevZoom) {
							return;
						}

						scope.style[transformProperty] = "translate3d(" + (-left) + "px," + (-top) + "px, 0) scale(" + zoom + ")";

						self.publish(STATIC.TOUCHINERTIA, {
							type: "touchinertia",
							translateX: left,
							translateY: top,
							zoom: zoom
						});

						prevLeft = left;
						prevTop = top;
						prevZoom = zoom;
					};

				} else if (helperElem.style[transformProperty] !== undef) {

					return function (left, top, zoom) {
						if (left === prevLeft && top === prevTop && zoom === prevZoom) {
							return;
						}

						scope.style[transformProperty] = "translate(" + (-left) + "px," + (-top) + "px) scale(" + zoom + ")";

						self.publish(STATIC.TOUCH, {
							translateX: left,
							translateY: top,
							zoom: zoom
						});

						prevLeft = left;
						prevTop = top;
						prevZoom = zoom;
					};

				} else {

					return function (left, top, zoom) {
						if (left === prevLeft && top === prevTop && zoom === prevZoom) {
							return;
						}

						scope.style.marginLeft = left ? (-left / zoom) + "px" : "";
						scope.style.marginTop = top ? (-top / zoom) + "px" : "";
						scope.style.zoom = zoom || "";

						self.publish(STATIC.TOUCH, {
							translateX: left,
							translateY: top,
							zoom: zoom
						});

						prevLeft = left;
						prevTop = top;
						prevZoom = zoom;
					};

				}
			},

			setupScroller : function () {
				var content = this.vars.target.getElementsByTagName("*")[0],
					scroller, key;

				// Initialize Scroller
				scroller = new Scroller(this.renderingEngine(content), this.vars);

				for (key in scroller) {
					if (!(/^__/).test(key) && typeof scroller[key] === "function") {
						this.extendProp(key, scroller);
					}
				}

				this.vars.scroller = scroller;

				this.update();
				this.setupEvents();
			},

			update : function () {
				var container = this.vars.target,
					content = container.getElementsByTagName("*")[0],
					scroller = this.vars.scroller,
					rect = container.getBoundingClientRect();

				// Setup Scroller
				scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);

				// Update Scroller dimensions for changed content
				scroller.setDimensions(container.clientWidth, container.clientHeight, content.offsetWidth, content.offsetHeight/* - 50*/);
			},

			extendProp : function (key, scroller) {
				this[key] = function () {
					return scroller[key].apply(scroller, arguments);
				};
			},

			setOption : function (key, value) {
				this.vars.scroller.options[key] = value;
			},

			onTouchStart : function (e) {
				var o = e.originalEvent || e;
				var touches = o.touches || [{}];

				// Don't react if initial down happens on a form element
				if (o.target.tagName.match(/input|textarea|select/i)) {
					return;
				}

				this.vars.scroller.doTouchStart(touches, o.timeStamp);
				this.publish(STATIC.TOUCHSTART, e);

				e.preventDefault();
			},

			onTouchMove : function (e) {
				var o = e.originalEvent || e;
				var touches = o.touches || [{}];

				this.vars.scroller.doTouchMove(touches, o.timeStamp, o.scale);
				this.publish(STATIC.TOUCHMOVE, o);
			},

			onTouchEnd : function (e) {
				var o = e.originalEvent || e;

				this.vars.scroller.doTouchEnd(o.timeStamp);
				this.publish(STATIC.TOUCHEND, o);
			},

			onMouseDown : function (e) {
				var o = e.originalEvent || e;

				// Don't react if initial down happens on a form element
				if (o.target.tagName.match(/input|textarea|select/i)) {
					return;
				}

				this.vars.scroller.doTouchStart([{
					pageX: e.pageX,
					pageY: e.pageY
				}], e.timeStamp);

				this.publish(STATIC.TOUCHSTART, e);
				this.vars.mousedown = true;
			},

			onMouseMove : function (e) {
				if (!this.vars.mousedown) {
					return;
				}

				var timeStamp = e.timeStamp || (new Date().getTime());

				this.vars.scroller.doTouchMove([{
					pageX: e.pageX || 0,
					pageY: e.pageY || 0
				}], timeStamp);

				this.publish(STATIC.TOUCHMOVE, e);
				this.vars.mousedown = true;
			},

			onMouseUp : function (e) {
				if (!this.vars.mousedown) {
					return;
				}

				this.vars.scroller.doTouchEnd(e.timeStamp);

				this.publish(STATIC.TOUCHEND, e);
				this.vars.mousedown = false;
			},

			setupEvents : function () {
				var container = $(this.vars.target),
					doc = this.vars.doc;

				// Event Handler
				if ("ontouchstart" in window) {
					container.on("touchstart", this.onTouchStart);
					doc.on("touchmove", this.onTouchMove);
					doc.on("touchend", this.onTouchEnd);
				} else {
					container.on("mousedown", this.onMouseDown);
					doc.on("mousemove", this.onMouseMove);
					doc.on("mouseup", this.onMouseUp);
				}
			},

			destroy : function () {
				var container = $(this.vars.target),
					doc = this.vars.doc;

				if (container) {
					if ("ontouchstart" in window) {
						container.off("touchstart", this.onTouchStart);
						if (doc) {
							doc.off("touchmove", this.onTouchMove);
							doc.off("touchend", this.onTouchEnd);
						}
					} else {
						container.off("mousedown", this.onMouseDown);
						if (doc) {
							doc.off("mousemove", this.onMouseMove);
							doc.off("mouseup", this.onMouseUp);
						}
					}
				}

				this.sup();
			}
		});
	}
);
