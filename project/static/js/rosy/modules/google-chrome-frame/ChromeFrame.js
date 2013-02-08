define(

	[
		"rosy/modules/Module",
		"rosy/modules/tracking/GATracking",
		"CFInstall",
		"Cookies",
		"$",
		"text!rosy/modules/google-chrome-frame/template/chrome-frame.html"
	],

	function (Module, GATracking, CFInstall, Cookies, $, html) {

		"use strict";

		var STATIC = {
			COOKIE_NAME : "noChromeFrame"
		};

		var ChromeFrame = Module.extend({
			vars : {},

			"static" : STATIC,

			init : function () {
				this.sup();

				this.setupTemplate();
				this.setDOMReferences();
				this.setupEvents();
				this.setupChromeFrame();
			},

			setupTemplate : function () {
				var isIE = $.browser.msie;
				var frame = $(html);

				if (isIE && $.browser.version < 9) {
					frame.addClass("lt-ie9");
				} else {
					frame.addClass("ie9");
				}

				frame.appendTo(document.body);

				this.vars.frame = frame;
			},

			setDOMReferences : function () {
				var frame = this.vars.frame;

				$.extend(this.vars, {
					yes : frame.find("#cf-approve"),
					no : frame.find("#cf-decline"),
					browsers : frame.find("#browsers"),
					alts : frame.find("#browsers a"),
					date : (new Date())
				});
			},

			setupEvents : function () {
				this.vars.yes.on("click", this.onClickYes);
				this.vars.no.on("click", this.onClickNo);
				this.vars.alts.on("click", this.onClickAlt);
			},

			setupChromeFrame : function () {
				CFInstall.check({
					preventPrompt : true,
					onmissing : this.onMissing,
					oninstall : this.onInstall
				});
			},

			onMissing : function () {
				if (!Cookies.get(STATIC.COOKIE_NAME)) {
					this.vars.frame.removeClass("hidden");

					this.publish(GATracking.TRACK, {
						type : "page",
						url: "/chrome-frame/"
					});
				}
			},

			onInstall : function () {
				this.publish(GATracking.TRACK, {
					type : "event",
					category : "Chrome Frame",
					action : "Installed",
					label : "Return",
					value : 1
				});
			},

			onClickNo : function (e) {
				e.preventDefault();

				this.vars.frame.addClass("hidden");
				this.vars.date.setMonth(this.vars.date.getMonth() + 1);

				Cookies.set(STATIC.COOKIE_NAME, "true", {
					expires : this.vars.date
				});

				this.publish(GATracking.TRACK, {
					type : "event",
					category : "Chrome Frame",
					action : "Don't Install",
					label : "Click",
					value : 1
				});
			},

			onClickYes : function (e) {
				e.preventDefault();

				this.publish(GATracking.TRACK, {
					type : "event",
					category : "Chrome Frame",
					action : "Install",
					label : "Click",
					value : 1
				});

				CFInstall.check({
					mode : "overlay",
					url : "http://www.google.com/chromeframe/eula.html?user=true&hl=en",
					destination : window.location.href
				});
			},

			onClickAlt : function (e) {
				var el = $(e.currentTarget);

				this.publish(GATracking.TRACK, {
					type : "event",
					category : "Chrome Frame",
					action : "Alternate Browser",
					label : el.text(),
					value : 1
				});
			},

			destroy : function () {
				this.sup();
				this.vars.frame.remove();
			}
		});

		return new ChromeFrame();
	}
);
