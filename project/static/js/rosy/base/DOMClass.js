define(

	[
		"../base/Class",
		"$"
	],

	function (Class, $) {

		"use strict";

		function _matchJQueryGUIDs(instance, jqObj, events) {
			var type, i, j, event;
			var func;
			var f;

			for (type in events) {
				for (i = 0, j = events[type].length; i < j; i++) {
					if (!events[type]) {
						break;
					}

					event = events[type][i];

					if (!event) {
						break;
					}

					for (func in instance) {
						f = instance[func];

						if (f && f.guid && typeof f === "function") {
							if (f.guid === event.handler.guid) {
								jqObj.off(type, f);
							}
						}
					}
				}
			}
		}

		function _unbindFromObject(instance, obj) {
			if (!obj) {
				return;
			}

			var key, jqObj, events;

			for (key in obj) {
				jqObj = obj[key];

				if (jqObj instanceof $) {

					var i, j, el;

					for (i = 0, j = jqObj.length; i < j; i++) {
						el = jqObj[i];
						events = $._data(el, "events");

						if (events) {
							_matchJQueryGUIDs(instance, jqObj.eq(i), events);
						}
					}
				} else if ($.isPlainObject(jqObj)) {
					_unbindFromObject(instance, jqObj);
				}
			}
		}

		return Class.extend({

			/**
			* Middleware preventDefault method. A shortcut to avoid delegation for a simple task.
			*/
			preventDefault : function (e) {
				e.preventDefault();
			},

			/**
			* Shorthand for $.proxy(func, this)
			*/
			proxy : function (fn) {
				return $.proxy(fn, this);
			},

			destroy : function () {
				this.unbindEvents();
				this.sup();
			},

			unbindEvents : function () {
				for (var key in this) {
					if ($.isPlainObject(this[key])) {
						_unbindFromObject(this, this[key]);
					}
				}
			}

		});
	}
);
