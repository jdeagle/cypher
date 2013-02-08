define(

	function () {

		/*jshint eqeqeq:false, noempty:false, eqnull:true */

		"use strict";

		function extend(target) {

			var deep, options, name, src, copy, copyIsArray, clone, i, length;

			// Handle case when target is a string or something (possible in deep copy)
			if (typeof target !== "object" && !isFunction(target)) {
				target = {};
			}

			i = isObject(arguments[1]) ? 1 : 2;
			deep = (arguments[1] === true);

			for (length = arguments.length; i < length; i ++) {

				// Only deal with non-null/undefined values
				if ((options = arguments[i]) != null) {

					// Extend the base object
					for (name in options) {

						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {

							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];

							}

							else {
								clone = src && isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = extend(clone, deep, copy);
						}

						// Don't bring in undefined values
						else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		}

		function isObject(obj) {

			var objectTypes = {
				'function': true,
				'object': true,
				'unknown': true
			};

			return obj ? !!objectTypes[typeof obj] : false;
		}

		function isFunction(obj) {
			return typeof obj == "function";
		}

		var isArray = Array.isArray || function (obj) {
			if (obj && obj.toString) {
				return obj.toString() == "[object Array]";
			}
			return false;
		};

		function isPlainObject(obj) {

			var hasOwn = Object.prototype.hasOwnProperty;

			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if (!obj || !isObject(obj) || obj.nodeType || obj === window) {
				return false;
			}

			try {
				// Not own constructor property must be Object
				if (obj.constructor &&
					!hasOwn.call(obj, "constructor") &&
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")
				) {
					return false;
				}
			}
			catch (e) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.

			var key;
			for (key in obj) {}

			return key === undefined || hasOwn.call(obj, key);
		}

		return {

			extend : extend,
			isArray : isArray,
			isFunction : isFunction,
			isObject : isObject,
			isPlainObject : isPlainObject
		};
	}
);
