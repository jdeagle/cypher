require.config({

	paths : {
		"$" : "libs/jquery",
		"CFInstall" : "//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min",
		"ChromeFrame" : "rosy/modules/google-chrome-frame/ChromeFrame",
		"Cookies" : "libs/cookies",
		"Handlebars" : "libs/handlebars",
		"zynga" : "libs/zynga",
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
