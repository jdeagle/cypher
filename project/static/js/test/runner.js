(function () {

	/*jshint node: true, bitwise: false */
	/*global process */

	"use strict";

	var optimist = require("optimist");
	var union = require("union");
	var ecstatic = require("ecstatic");
	var path = require("path");
	var fs = require("fs");
	var cp = require("child_process");

	var argv = optimist.argv;
	var mode = argv.m || argv.mode;

	var port = 8765;
	var ip = "localhost";

	var root = "./" + (argv.r || argv.root || "");
	var autoIndex = true;
	var cache = 3600;

	var host = "http://%i:%p".replace("%i", ip).replace("%p", port);
	var webpage = "%s/test/runner.html".replace("%s", host);
	var runner = path.join(root, "test/runner.html");

	var server = union.createServer({
		before : [
			ecstatic(root, {
				autoIndex : autoIndex,
				cache : cache
			})
		]
	});

	server.listen(port, ip, function () {
		var child;

		if (mode === "browser") {
			child = cp.spawn("open", [webpage], {
				env: null,
				setsid: true,
				stdio: "inherit"
			});
		} else {
			var type = process.env.CI ? "tap" : "spec";
			child = cp.spawn("mocha-phantomjs", ["-R", type, webpage], {
				stdio: [0, 1, "pipe"]
			});

			child.stderr.on("data", function (data) {
				if (~ data.toString().indexOf("No such file or directory")) {
					console.error("Are you missing PhantomJS? Install via `brew install phantomjs`");
				}

				process.exit(1);
			});

			child.addListener("exit", function (code) {
				server.close();
				process.exit(code);
			});
		}

	});

}());
