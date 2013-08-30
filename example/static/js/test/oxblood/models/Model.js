define(

	[
		"OxBlood",
		"rosy/base/Model",
	],

	function (OxBlood, Model) {

		/*global describe, expect, it, before, beforeEach, after, afterEach */

		"use strict";

		OxBlood.addCoreTests(function () {

			describe("Rosy Models", function () {

				describe("single setters", function () {
					var model = new Model();

					it("should not start with a value", function (done) {
						expect(model.get('a')).to.eql(undefined);

						done();
					});

					it("should set a value", function (done) {
						model.set('a', 1);

						expect(model.get('a')).to.eql(1);

						done();
					});

					it("should change a value", function (done) {
						model.set('a', 2);

						expect(model.get('a')).to.eql(2);

						done();
					});
				});

				describe("multiple setters", function () {
					var model = new Model();
					model.set({
						a : 1000,
						b : 2000,
						c : 3000
					});

					it("should allow setting multiple values", function (done) {
						expect(model.get('a')).to.eql(1000);
						expect(model.get('b')).to.eql(2000);
						expect(model.get('c')).to.eql(3000);

						done();
					});
				});

				describe("getters", function () {
					var model = new Model();

					model.set('a', 10);
					model.set('b', 20);
					model.set('c', 30);

					it("should get values", function (done) {
						expect(model.get('a')).to.eql(10);
						expect(model.get('b')).to.eql(20);
						expect(model.get('c')).to.eql(30);

						done();
					});
				});

				describe("defaults", function () {
					var model = new Model({
						a : 100,
						b : 200,
						c : 300
					});

					it("should allow default values", function (done) {
						expect(model.get('a')).to.eql(100);
						expect(model.get('b')).to.eql(200);
						expect(model.get('c')).to.eql(300);

						done();
					});
				});

				describe("change events", function () {
					var model = new Model(),
						didCallChange = false,
						didCallChangeA = false;

					model.on('change', function () {
						didCallChange = true;
					});

					model.on('change:a', function () {
						didCallChangeA = true;
					});

					model.set('a', 1);

					it("should trigger change events", function (done) {
						expect(didCallChange).to.eql(true);
						expect(didCallChangeA).to.eql(true);

						done();
					});
				});

				describe("change events when same", function () {
					var model = new Model({a : 1}),
						didCallChange = false,
						didCallChangeA = false;

					model.on('change', function () {
						didCallChange = true;
					});

					model.on('change:a', function () {
						didCallChangeA = true;
					});

					model.set('a', 1);

					it("should not trigger change events if not changing", function (done) {
						expect(didCallChange).to.eql(false);
						expect(didCallChangeA).to.eql(false);

						done();
					});
				});

				describe("getting keys", function () {
					var model = new Model({
						a : 1,
						b : 2
					});

					it("should return the keys", function (done) {
						expect(model.keys()).to.eql(['a', 'b']);

						done();
					});

					it("should return the changed keys", function (done) {
						model.set('c', 3);

						expect(model.keys()).to.eql(['a', 'b', 'c']);

						done();
					});
				});

				describe("getting data", function () {
					var model = new Model({
							a : 1,
							b : 2
						});

					it("should return the raw data", function (done) {
						var data = model.get();

						expect(data.a).to.eql(1);
						expect(data.b).to.eql(2);

						done();
					});

					it("should not change when you change the data", function (done) {
						var data = model.get();

						data.a = 4;
						data.b = 5;

						expect(model.get('a')).to.eql(1);
						expect(model.get('b')).to.eql(2);

						done();
					});
				});

			});

		});
	}
);
