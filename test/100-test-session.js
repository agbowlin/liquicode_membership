//=====================================================================
//=====================================================================
/*
	100-test-session.js
	
	Test basic session logic.
	
	Run with: mocha -R spec
	
	Does the following:
		- MemberSignup
		- MemberReconnect
		- MemberLogout
		- MemberLogin
		- MemberReconnect
		- MemberLogout
		- MemberReconnect
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


describe('100-test-session: Test basic session logic.', function() {

	var result = false;
	var session_id = false;

	it('Test MemberSignup', function() {
		result = Membership.MemberSignup("Test Member", "TestMember@mail.com", "Password");
		npm_unit.object(result).isNot(false);
		npm_unit.string(result.session_id);
		session_id = result.session_id;
	});

	it('Test MemberReconnect', function() {
		result = Membership.MemberReconnect("Test Member", session_id);
		npm_unit.object(result).isNot(false);
		npm_unit.assert.equal(result.session_id, session_id, "Reconnected to a different session.");
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

	it('Test MemberReconnect', function() {
		result = Membership.MemberReconnect("Test Member", session_id);
		npm_unit.object(result).isNot(false);
		npm_unit.assert.equal(result.session_id, session_id, "Reconnected to a different session.");
	});

	it('Test MemberLogout', function() {
		result = Membership.MemberLogout("Test Member");
		npm_unit.bool(result);
		npm_unit.assert.equal(result, true, "MemberLogout did not return true.");
	});

	it('Test MemberReconnect', function() {
		result = Membership.MemberReconnect("Test Member", session_id);
		npm_unit.bool(result);
		npm_unit.assert.equal(result, false, "Reconnected to a stale session.");
	});

});
