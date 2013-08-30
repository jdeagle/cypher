define(

	[
		"module"
	],

	function (module) {

		"use strict";

		var prefix = module.id.split("/");
		prefix.splice(prefix.length - 2, 2, "");
		prefix = prefix.join("/");

		return {

			"aliases" : {
				"/" : "/index.html"
			},

			"viewGroups" : [
				{
					"config" : {
						"id" : "main",
						"selector" : "#main",
						"useHistory" : true, // true|false|"#"
						"transition" : "async" // sync|async|preload|reverse
					},

					"routes" : [
						{
							"viewClass" : prefix + "views/Home",
							"route" : "/index.html",
							"config" : {
								"bodyClass" : "home",
								"title" : "Home"
							}
						},
						{
							"viewClass" : prefix + "views/About",
							"route" : "/about.html",
							"config" : {
								"bodyClass" : "about",
								"title" : "About"
							}
						},
						{
							"viewClass" : prefix + "views/Contact",
							"route" : "/contact.html",
							"config" : {
								"bodyClass" : "contact",
								"title" : "Contact"
							}
						}
					]
				}
			]
		};
	}
);
