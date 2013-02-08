var fs = require("fs");
var wrench = require("wrench");
var pages = require("./pages.js");
var globals = require("./globals.js");
var build = require("./build.js");
var cp = require("child_process");

var exec = function (exec, args, cwd, suppress, doneCB) {
	process.stdin.resume();

	var child = cp.spawn(exec, args || [], {
		cwd: cwd,
		env: null,
		setsid: true,
		stdio: (suppress) ? null : "inherit"
	});

	child.addListener("exit", function (code) {
		doneCB(!code);
	});
};

module.exports = {

	source_dir : "../../../project", // `source_dir` is the directory where all your source files are.
	output_dir: "../../../deploy", // `output_dir` is the directory you want to compile your static site to.

	template_engine : "swig", // the npm package name of the template engine, only engines supported by consolidate.js will work
	template_dir : "../../../project/templates", // Only relevant if using swig : The directory where all your templates are.

	/*
		Literal regexes here. Statix won't include anything, unless it matches an `include_pattern` and also does
		not match an `exclude_pattern`. Checks against the full path, i.e. /Users/your.name/some/dir/site/blah.html
	*/

	include_patterns : [
		/^(.*)$/
	],

	exclude_patterns : [
		/^(.*)(base\.html{1})$/,
		/^(.*)(\/templates{1})(.*)$/
	],

	/*
		An array of the pages to be rendered with the template engine.

		`output` is where your page will eventually live, in the static version of the site. I.e. "{output_dir}/{page.output}"

		`source` is where your template lives. I.e. "{source_dir}{page.source}"

		`data` is an object of variables you want to pass through to the template when it gets rendered.
	*/

	pages : pages,

	/*
		`global_data` is an object that gets passed to all pages. Note, if you set `global_data.someProp` to something
		and also have `page.data.someProp`, the latter will take precedence.
	*/

	global_data: globals,

	/*
		Like `global_data`, but `build_data` only gets passed to the renderer when you build, not when viewing locally through the webserver.
		`build_data` properties take precedence over `global_data` properties.
	*/

	build_data : build,

	/*
		If you need to process some things before you're ready to generate the pages (either through the web server or compilation),
		you can use this `ready` method. Common use case, you need to grab a bunch of data from a database, and are using asynch i/o
		Statix, does nothing until the `callback` passed to this method is called, so once you are done with everything you need to do,
		simply call `callback();`
	*/

	ready : function (callback) {
		callback();
	},

	/*
		Statix gives you a hook to do whatever you want before the build actually happens. You can use this method to minify js/css,
		compile scss stylesheets, etc. Just be sure to invoke the `done()` function when you are ready for Statix to do it's thing.
	*/

	preBuild : function (done) {
		exec("grunt", ["build"], null, false, function (success) {
			if (success) {
				done();
			}
			else {
				console.log("");
				console.error("There was an error running grunt build...");
				console.log("");
				process.exit();
			}
		});
	},

	/*
		Just like `preBuild()` but this method gets called after Statix has generated the static site. You can use this to
		cleanup some files, git commit/push, or whatever you feel like. Just be sure to invoke the `done()` function afterwards.
	*/
	postBuild : function (done) {

		function moveFiles(from, to) {

			from = (from[0] == "/") ? from : process.cwd() + "/" + from;
			to = (to[0] == "/") ? to : process.cwd() + "/" + to;

			var fromStats = fs.statSync(from);
			var fromName = from.substr(from.lastIndexOf("/"));

			if (fromStats.isDirectory()) {

				if (!fs.existsSync(to)) {
					wrench.mkdirSyncRecursive(to);
				}

				var files = fs.readdirSync(from);
				for(var i = 0; i < files.length; i ++){
					moveFiles(from + "/" + files[i], to + "/" + files[i]);
				}

				wrench.rmdirSyncRecursive(from);
			}

			else {
				if (fs.existsSync(to)) {
					fs.unlinkSync(to);
				}

				fs.linkSync(from, to);
			}
		}

		moveFiles.bind(this);
		moveFiles(this.output_dir + "/static/local", this.output_dir);

		done();
	}

}
