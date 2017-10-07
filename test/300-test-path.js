//=====================================================================
//=====================================================================
/*
	300-test-path.js
	
	Test member application folders.
	
	Run with: mocha -R spec
	
	Does the following:
		- MemberLogin
		- PathList
		- PathMake
		- PathList
		- PathWrite
		- MemberLogout
		- MemberLogin
		- PathList
		- PathRead
		- PathClean
		- PathList
		- PathDelete
		- PathList
*/
//=====================================================================
//=====================================================================

"use strict";

// var npm_process = require('process');
// var npm_fs = require('fs');
var npm_path = require('path');
// var npm_mocha = require('mocha');
var npm_unit = require('unit.js');
var npm_fs_extra = require('fs-extra');

var Membership = require('../Membership.js');

Membership.RootFolder = npm_path.resolve(__dirname, 'members');
Membership.ApplicationName = 'local-test';


describe('300-test-path: Test member application folders.', function() {

	var result = false;
	var session_id = false;
	var path = 'test-data';
	var test_data = {
		A: 1,
		B: 2,
		C: 3
	};

	it('Test MemberLogin', function() {
		result = Membership.MemberLogin("Test Member", "Password");
		npm_unit.object(result);
		session_id = result.session_id;
	});

	it('Test PathList', function() {
		result = Membership.PathList("Test Member", '', true);
		npm_unit.assert(result);
		npm_unit.assert(result.items.length == 0);
	});

	it('Test PathMake', function() {
		result = Membership.PathMake("Test Member", path);
		npm_unit.object(result);
		npm_unit.assert(result.success);
	});

	it('Test PathList', function() {
		result = Membership.PathList("Test Member", '', true);
		npm_unit.assert(result);
		npm_unit.assert(result.items.length == 1);
	});

	it('Test PathWrite', function() {
		var filename = npm_path.join(path, 'data-abc.json');
		result = Membership.PathWrite("Test Member", filename, test_data);
		npm_unit.object(result);
		npm_unit.assert(result.success);
	});

	it('Test MemberLogout', function() {
		result = Membership.MemberLogout("Test Member");
		npm_unit.bool(result);
		npm_unit.assert.equal(result, true, "MemberLogout did not return true.");
	});

	it('Test MemberLogin', function() {
		result = Membership.MemberLogin("Test Member", "Password");
		npm_unit.object(result);
		npm_unit.string(result.session_id).isNot(session_id);
		npm_unit.assert.notEqual(result.session_id, session_id, "Reconnected to the same session.");
		session_id = result.session_id;
	});

	it('Test PathList', function() {
		result = Membership.PathList("Test Member", '', true);
		npm_unit.assert(result);
		npm_unit.assert(result.items.length == 2);
	});

	it('Test PathRead', function() {
		var filename = npm_path.join(path, 'data-abc.json');
		result = Membership.PathRead("Test Member", filename);
		npm_unit.object(result);
		npm_unit.string(result.path);
		npm_unit.object(result.content).is(test_data);
	});

	it('Test PathClean', function() {
		result = Membership.PathClean("Test Member", path);
		npm_unit.object(result);
		npm_unit.assert(result.success);
	});

	it('Test PathList', function() {
		result = Membership.PathList("Test Member", '', true);
		npm_unit.assert(result);
		npm_unit.assert(result.items.length == 1);
	});

	it('Test PathDelete', function() {
		result = Membership.PathDelete("Test Member", path);
		npm_unit.object(result);
		npm_unit.assert(result.success);
	});

	it('Test PathList', function() {
		result = Membership.PathList("Test Member", '', true);
		npm_unit.assert(result);
		npm_unit.assert(result.items.length == 0);
	});

});
