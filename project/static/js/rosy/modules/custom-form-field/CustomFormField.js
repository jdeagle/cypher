// ### Part of the [Rosy Framework](http://github.com/ff0000/rosy)
/* custom-form-field.js */

define(

	[
		"../Module", "$"
	],

	function (Module, $) {

		"use strict";

		// Extends red.Module
		return Module.extend({

			vars : {
				namespace : "customfield",
				field : null,
				customSelect : true,
				showForMobile : false,
				isMobile : (/iP(hone|ad|od)|Android/).test(window.navigator.userAgent)
			},

			// Home  page level functionality
			init : function (vars) {
				this.sup(vars);

				this.setDOMReferences();
				this.setupCustomFormField();
			},

			setDOMReferences : function () {
				$.extend(this.vars, {
					type : this.setFieldType()
				});
			},

			setFieldType : function () {
				var field = this.vars.field,
					type = field.is("input") ? field.attr("type") : field[0].nodeName.toLowerCase();

				return type;
			},

			setupCustomFormField : function () {
				if (!this.vars.showForMobile && this.vars.isMobile) {
					$("html").addClass("mobile");

					if (this.vars.type === "select") {
						return;
					}
				}

				if (this.vars.field.is("[type='hidden']")) {
					return;
				}

				this.addCustomWrapper();
			},

			addCustomWrapper : function () {
				var type = this.vars.type,
					name = this.vars.namespace,
					callee = "setup" + type.charAt(0).toUpperCase() + type.slice(1);

				this.vars.wrap = $("<span></span>").addClass(name);

				this.vars.wrap.addClass(this.vars.field.attr("class"));
				this.vars.wrap.addClass(name + "-" + type);

				this.vars.wrap.insertAfter(this.vars.field);
				this.vars.wrap.append(this.vars.field);

				if (type && typeof this[callee] === "function") {
					this[callee]();
				}

				this.setupLabel();
				this.setupEvents();
			},

			setupLabel : function () {
				this.vars.label = $("label[for='" + this.vars.field.attr("id") + "']");
				this.vars.label.on("mouseenter mouseleave mousedown mouseup click", this.onLabelAction);
			},

			onLabelAction : function (e) {
				this.vars.wrap.trigger(e.type);
			},

			setupEvents : function () {
				var wrap = this.vars.wrap,
					name = this.vars.namespace,
					hover = name + "-hover",
					active = name + "-active";

				wrap.on({
					mouseenter : function (e) {
						wrap.addClass(hover);
						e.stopPropagation();
					},

					mouseleave : function (e) {
						wrap.removeClass(hover);
						wrap.removeClass(active);
						e.stopPropagation();
					},

					mousedown : function (e) {
						wrap.addClass(active);
						e.stopPropagation();
					},

					mouseup : function (e) {
						wrap.removeClass(active);
						e.stopPropagation();
					}
				});
			},

			setupCheckbox : function () {
				var checked = this.vars.namespace + "-checked";

				if (this.vars.field.is(":checked")) {
					this.vars.wrap.addClass(checked);
				}

				this.setupCheckboxEvents();
			},

			setupCheckboxEvents : function () {
				var wrap = this.vars.wrap,
					field = this.vars.field,
					name = this.vars.namespace,
					checked = name + "-checked";

				wrap.on("click", function (e) {
					var radios;

					// Clickage.
					field.trigger("click", true);

					if (field.is(":checked")) {
						wrap.addClass(checked);
					} else {
						wrap.removeClass(checked);
					}

					if (field.is(":radio")) {
						radios = field.closest("form").find(":radio[name='" + field.attr("name") + "']");
						radios = radios.not(field).closest("." + name);

						radios.removeClass(checked);
					}
					e.stopPropagation();
				});

				// Prevent recursive propagation loop.
				field.on("click", function (e, triggered) {
					if (!triggered) {
						wrap.trigger("click");
					}

					e.stopPropagation();
				});
			},

			setupRadio : function () {
				return this.setupCheckbox();
			},

			setupSelect : function () {
				var select = this.vars.field,
					options = select.find("option"),
					index = select[0].selectedIndex,
					active = options.eq(index);

				this.vars.current = $('<span></span>').addClass(this.vars.namespace + "-current");
				this.vars.current.appendTo(this.vars.wrap);

				this.setActiveOption(active);

				if (this.vars.customSelect) {
					this.buildCustomSelect(select);
				} else {
					this.setupSelectEvents();
				}
			},

			buildCustomSelect : function (select) {
				var wrap = this.vars.wrap,
					html = select.html(),
					list = $('<ul></ul>');

				html = html.replace(/option/mg, "li");
				html = html.replace(/value/mg, "data-value");
				html = html.replace(/selected/mg, "data-selected");

				list.html(html);
				this.setupCustomSelectEvents(list);

				$.extend(this.vars, {
					list : list,
					items : list.children()
				});

				wrap.append(list);
				wrap.addClass(this.vars.namespace + "-custom-select");
			},

			setActiveOption : function (option) {
				var current = this.vars.current,
					value = option.attr("value") || option.data("value"),
					items = this.vars.items, relative;

				current.data("value", value);
				current.text(option.text());

				if (items) {
					relative = items.filter("[data-value='" + value + "']");

					items.removeAttr("data-selected");
					relative.attr("data-selected", "selected");
				}
			},

			setupSelectEvents : function () {
				this.vars.field.on("change", this.onSelectChange);
			},

			setupCustomSelectEvents : function () {
				$(document).on("click", this.onDocumentClick);
			},

			onSelectChange : function (e) {
				var select, option;

				select = e.currentTarget;
				option = $(select.options[select.selectedIndex]);

				this.setActiveOption(option);
			},

			onDocumentClick : function (e) {
				var el = $(e.target),
					wrap = this.vars.wrap,
					scope = el.closest(wrap),
					active = this.vars.namespace + "-select-active",
					field;

				if (!scope.length) {
					if (wrap.hasClass(active)) {
						wrap.removeClass(active);
					}

					return;
				}

				field = this.vars.field;

				if (el.is(this.vars.current) || el.is(this.vars.field)) {
					wrap.toggleClass(active);
				} else if (wrap.hasClass(active)) {
					wrap.removeClass(active);
				}

				if (el.is("li") && this.vars.current.data("value") !== el.data("value")) {
					field[0].selectedIndex = el.parent().children().index(el);
					field.trigger("change");

					this.setActiveOption(el);
				}
			},

			destroy : function () {
				var events = "mouseenter mouseleave mousedown mouseup click";

				if (this.vars.label) {
					this.vars.label.off(events, this.onLabelAction);
				}

				if (this.vars.wrap) {
					this.vars.wrap.off(events);
				}

				if (this.vars.field) {
					this.vars.field.off(events);
				}

				$(document).off("click", this.onDocumentClick);

				this.sup();
			}
		});
	}
);
