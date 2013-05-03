require.config({

	paths : {
		"$" : "libs/jquery",
		"Cookies" : "libs/cookies",
		"Handlebars" : "libs/handlebars",
		"templates" : "../../templates",
		"json" : "libs/json3",
		"$plugin" : "libs/plugins/amd/jquery-plugin",
		"jsonFile" : "libs/plugins/amd/jsonFile",
		"text" : "libs/plugins/amd/text"
	},

	waitSeconds : 15,

	shim : {
		"$" : {
			exports : "jQuery"
		},

		"zynga/Scroller" : {
			exports : "Scroller",
			deps : ["zynga/Animate"]
		},

		"CFInstall" : {
			exports : "CFInstall"
		},

		"Handlebars" : {
			exports : "Handlebars"
		}
	}
});
