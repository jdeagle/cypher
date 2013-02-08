/*jshint node:true*/
module.exports = function (grunt) {
	"use strict";

	var path = require("path"),
		cwd = process.cwd();

	// Project configuration.
	grunt.initConfig({
		meta: {
			projectName: "cypher",
			projectTitle: "Cypher"
		}
	});

	// Robin tasks
	// Load your custom tasks *after* these
	(function () {
		var fs = require("fs");

		var dir = path.join(cwd, ".robyn"),
			files = grunt.file.expand(path.join(dir, "*"));

		if (!files.length) {
			var d = dir.replace(cwd + "/", "");

			var warn = [
				"%s is not yet initialized".replace("%s", d),
				"Run `git submodule update --init .robyn`",
				"Then try this command again."
			].join("\n       ").trim();

			grunt.fail.warn(warn);
		}

		var robynPkg = require(path.join(dir, "package.json")),
			tasks = path.join(dir, robynPkg.config.dirs.tasks),
			helpers = path.join(tasks, "helpers");

		grunt.loadTasks(tasks);
		grunt.loadTasks(helpers);

		// Customize path in robyn.json
		var pkg = require(path.join(cwd, "robyn.json")),
			local = path.join(cwd, pkg.config.dirs.tasks);

		if (fs.existsSync(local)) {
			grunt.loadTasks(local);
		}
	}());

};
