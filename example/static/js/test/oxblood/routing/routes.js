define(

	[
		"module"
	],

	function (module) {

		"use strict";

		var prefix = module.id.split("/");
		prefix.splice(prefix.length - 3, 2, "");
		prefix = prefix.join("/");

		return {

			"aliases" : {

			},

			"viewGroups" : [
				{
					"config" : {
						"id" : "main",
						"selector" : "#main",
						"useHistory" : false, // true|false|"#"
						"transition" : "sync" // sync|async|preload|reverse
					},

					"routes" : [
						{
							"viewClass" : prefix + "views/Test1",
							"route" : "/test1",
							"config" : {
								"test" : "test1"
							}
						},
						{
							"viewClass" : prefix + "views/Test2",
							"route" : "/test2",
							"config" : {
								"test" : "test2"
							}
						},
						{
							"viewClass" : prefix + "views/Test3",
							"route" : "/test3",
							"config" : {
								"test" : "test3"
							}
						},
						{
							"viewClass" : prefix + "views/Test4",
							"route" : "/test4",
							"config" : {
								"test" : "test4"
							}
						},
						{
							"viewClass" : prefix + "views/Test5",
							"route" : "/test5",
							"config" : {
								"test" : "test5"
							}
						},
						{
							"viewClass" : prefix + "views/Test1",
							"route" : new RegExp("(testRegEx)([a-zA-Z0-9_-]+)(/?)$"),
							"config" : {
								"test" : "testRegEx"
							}
						},
						{
							"viewClass" : null,
							"route" : "/nothing"
						},
						{
							"viewClass" : prefix + "views/UpdateTest",
							"route" : "/update/:something?"
						},
						{
							"viewClass" : prefix + "views/CanCloseTest",
							"route" : "/canClose"
						},
						{
							"viewClass" : prefix + "views/Sync",
							"route" : "/transition/sync"
						},
						{
							"viewClass" : prefix + "views/Async",
							"route" : "/transition/async"
						},
						{
							"viewClass" : prefix + "views/Preload",
							"route" : "/transition/preload"
						},
						{
							"viewClass" : prefix + "views/Reverse",
							"route" : "/transition/reverse"
						}
					]
				}
			]
		};
	}
);
