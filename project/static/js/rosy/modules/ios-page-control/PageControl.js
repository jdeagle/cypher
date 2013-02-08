// ## PageControl
// An iOS-style Page Control.
//
// Usage:
//
//  var control = PageControl({
//      parent : $("#controller"),
//      list : $("#controller > ul"), // optional, assumes parent child as list
//      items : $("#controller > ul > li") // optional, assumes list children as items
//  });
//
//  this.subscribe(PageControl.PAGINATE, function (e) {
//      console.log(e);
//  });
//
//  this.subscribe(PageControl.TOUCHEND, function (e) {
//      console.log(e);
//  });
define(

	[
		"../Module", "$"
	],

	function (Module, $) {

		"use strict";

		var STATIC = {
			TOUCHEND : "module/page-control/touchend",
			PAGINATE : "module/page-control/paginate"
		};

		// Extends red.Module
		return Module.extend({

			"static" : STATIC,

			vars : {
				className : "page-control",
				parent : null,
				list : null,
				items : null
			},

			init : function (vars) {
				this.sup(vars);
				this.setupPageControl();
			},

			// Applies a matrix value to the target element
			setTransform : function (el, matrix) {
				el.css("-webkit-transform", matrix);
			},

			// Resets transition duration to a specific value (or zero)
			resetTransition : function (el, duration, timing, delay) {
				duration += (typeof duration === "number") ? "ms" : "";
				timing += (typeof duration === "number") ? "ms" : "";
				delay += (typeof duration === "number") ? "ms" : "";

				el.css({
					"-webkit-transition-duration" : duration,
					"-webkit-transition-timing-function" : timing,
					"-webkit-transition-delay" : delay
				});
			},

			// Returns the target element matrix
			getMatrix : function (el) {
				el = el[0] || el;

				var transform = window.getComputedStyle(el, null).webkitTransform,
					matrix = new window.WebKitCSSMatrix(transform);

				return matrix;
			},

			// Setup page control functionality
			setupPageControl : function () {
				this.vars.list = this.vars.list || this.vars.parent.children();
				this.vars.items = this.vars.items || this.vars.list.children();

				if (this.vars.items.length < 2) {
					return;
				}

				this.vars.icons = this.createPageIndicators();

				this.prepForTransforms();
				this.setupTouchEvents();
				this.sizeToFit();
				this.flagActiveItem();
				this.enable();
			},

			// Hardware accelerate everything.
			// Enables smooth animation effects while swiping
			prepForTransforms : function () {
				this.vars.parent.find("*").andSelf().css({
					"-webkit-transform" : "translate3d(0, 0, 0)"
				});
			},

			// Where the magic happens.
			// Sets up touch event listeners for swipe handling.
			setupTouchEvents : function () {

				// Shared variables
				var control = this.vars.parent,
					list = this.vars.list,
					matrix, touch, startX, currX, diffX,
					startY, currY, diffY, touches,
					directionX, oldX, touchMoveFired, touchEndFired, activeElement,
					elementWidth, elementThreshold, lockHorizontal,
					controlRect, listRect;

				list.on({

					// - Reset shared variables on touchstart.
					// - Reset transition duration to 350ms.
					// - Reset transform values.
					// - Cache as much information as possible to avoid overloading touchmove event (much more expensive)
					touchstart : this.proxy(function (e) {
						if (!("ontouchstart" in window)) {
							e.stopPropagation();
							e.preventDefault();
						}

						activeElement = this.getActiveElement(list, e.target);

						if (!activeElement || !activeElement.length) {
							return;
						}

						matrix = this.getMatrix(list);

						this.resetTransition(list, 350);
						this.setTransform(list, matrix.translate(0, 0, 0));

						touchEndFired = false;
						lockHorizontal = false;

						currX = null;
						diffX = null;

						currY = null;
						diffY = null;

						touches = 0;

						touch = this.getTouchObject(e);

						startX = touch.pageX;
						startY = touch.pageY;

						elementWidth = elementWidth || activeElement.outerWidth(true);
						elementThreshold = elementThreshold || elementWidth / 4;
					}),

					// - Detect if user is swiping horizontally
					// - Lock x-axis, track user swipe
					// - Set CSS transform based on user movement
					// - Reset CSS transition duration to 0 (don't want it to interfere with user movement)
					touchmove : this.proxy(function (e) {
						if (!touch || touchEndFired || !activeElement || !activeElement.length) {
							return;
						}

						touch = this.getTouchObject(e);

						currX = touch.pageX;
						currY = touch.pageY;

						directionX = (currX > oldX) ? "left" : "right";
						oldX = currX;

						diffX = (currX - startX);
						diffY = (currY - startY);

						if (!lockHorizontal && Math.abs(diffY) > 10) {
							activeElement = null;
							return;
						} else {
							lockHorizontal = true;
							e.preventDefault();
						}

						listRect = list[0].getBoundingClientRect();
						controlRect = control[0].getBoundingClientRect();

						if (listRect.left >= controlRect.left || listRect.right <= controlRect.right) {
							diffX *= 0.5;
						}

						this.setTransform(list, matrix.translate(diffX, 0, 0));

						if (!touchMoveFired) {
							this.resetTransition(list, 0);
						}

						touchMoveFired = true;
					}),

					// - Calculate total user movement
					// - If movement threshold is reached, snap to prev/next sibling
					// - Else snap to current element
					// - Triggers touchend event
					touchend : this.proxy(function () {
						if (!activeElement || !activeElement.length) {
							return;
						}

						touchEndFired = true;
						touchMoveFired = false;

						var element = activeElement,
							difference = Math.abs(diffX),
							getSibling = (difference > elementThreshold);

						if (getSibling) {
							element = this.findSibling(activeElement, diffX < 0);
						}

						this.flagActiveItem(element);
						this.animateTo(element, control, list);

						this.publish(STATIC.TOUCHEND);
					}),

					// A safety catcher for CSS transitions.
					// Nutshell: in some cases transitions are offset by ~1px.
					// This listener fires at the end of a transition event and makes sure the values end on a round number.
					webkitTransitionEnd : this.proxy(this.roundMatrixValues)
				});
			},

			// Returns the first touch object in touch array.
			// Fallback to default event object if no touch object found.
			getTouchObject : function (e) {
				e = e.originalEvent || e;
				return e.touches ? e.touches[0] : e;
			},

			// Bubbles up to immediate parent child node.
			// Prevents accidental event delegation.
			getActiveElement : function (list, target) {
				var parent = list.get(0);

				while (target && target.parentNode !== parent) {
					target = target.parentNode;
				}

				return $(target);
			},

			// - Applies clearfix to parent node
			// - Floats child nodes
			// - Calculates individual node width
			// - Resizes parent node to total child node width value.
			sizeToFit : function () {
				var width = 0,
					items = this.vars.items,
					i, j, el, itemWidth;

				this.vars.parent.css("overflow", "hidden");

				for (i = 0, j = items.length; i < j; i++) {
					el = $(items[i]);
					itemWidth = el.width();

					el.css("float", "left");
					el.width(el.width());

					width += itemWidth;
				}

				this.vars.list.width(width);
			},

			// Creates a page indicator for each found child node.
			createPageIndicators : function () {
				var control = this.vars.parent,
					items = this.vars.items,
					controller = $('<div class="page-indicators"></div>'),
					controlList = $('<ul></ul>'),
					i, j, icon;

				for (i = 0, j = items.length; i < j; i++) {
					icon = $('<li></li>');

					if (i === 0) {
						icon.addClass(this.vars.className + "-active");
					}

					controlList.append(icon);
				}

				controller.append(controlList);
				control.append(controller);

				return controlList.children();
			},

			// Finds prev/next available sibling element.
			// Defaults to current element if none found.
			findSibling : function (element, next) {
				var sib = element;

				if (next) {
					sib = element.next();
				} else {
					sib = element.prev();
				}

				return sib.get(0) ? sib : element;
			},

			// - Calculates difference between current position and destination.
			// - Resets transition duration to 350ms.
			// - Animates to destination.
			animateTo : function (element, control, list) {
				element = element[0] || element;

				var matrix = this.getMatrix(list),
					elementOffset = element.getBoundingClientRect().left - control.offset().left;

				this.resetTransition(list, 350);
				this.setTransform(list, matrix.translate(-(elementOffset), 0, 0));
			},

			// Looks through target element matrix and rounds each available value.
			// This resolves the ~1px offset issue when animating with CSS transforms.
			// Triggers paginate event when finished.
			roundMatrixValues : function (e) {
				if (e.target === e.currentTarget) {
					var el = $(e.currentTarget),
						matrix = this.getMatrix(el),
						key;

					for (key in matrix) {
						if (typeof matrix[key] === "number") {
							matrix[key] = Math.floor(matrix[key]);
						}
					}

					this.resetTransition(el, 0);
					this.setTransform(el, matrix);

					this.publish(STATIC.PAGINATE);
				}
			},

			// Flags item as active.
			// Removes active class name from siblings.
			flagActiveItem : function (element) {
				element = element || this.vars.items.first();

				var items = this.vars.items,
					icons = this.vars.icons,
					index = items.index(element);

				if (icons.get(index)) {
					icons.removeClass(this.vars.className + "-active");
					icons.eq(index).addClass(this.vars.className + "-active").siblings();
				}
			},

			// Sets default classes.
			// Used in required page-control.css
			enable : function () {
				this.vars.list.addClass(this.vars.className + "-list");
				this.vars.items.addClass(this.vars.className + "-items");

				this.vars.parent.addClass(this.vars.className);
				this.vars.parent.addClass(this.vars.className + "-enabled");
			},

			destroy : function () {
				var events = "touchstart touchmove touchend webkitTransitionEnd";

				if (this.vars.list) {
					this.vars.list.off(events);
				}
				this.sup();
			}
		});
	}
);
