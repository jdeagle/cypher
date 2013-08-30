require.config({

	paths : {
		"$" : "libs/jquery",
		"$plugin" : "libs/plugins/amd/jquery-plugin",
	},

	waitSeconds : 15,

	shim : {
		"$" : {
			exports : "jQuery"
		}
	}
});
