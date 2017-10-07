//=====================================================================
//=====================================================================
/*
	200-test-data.js
	
	Test server hosted member data.
	
	Run with: mocha -R spec
	
	Does the following:
		- MemberLogin
		- PutMemberDataObject
		- MemberLogout
		- MemberLogin
		- GetMemberDataObject
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


describe('200-test-data: Test server hosted member data.', function() {

	var result = false;
	var session_id = false;
	var member_data = false;

	it('Test MemberLogin', function() {
		result = Membership.MemberLogin("Test Member", "Password");
		npm_unit.object(result);
		session_id = result.session_id;
		member_data = result.member_data;
	});

	it('Test PutMemberDataObject', function() {
		member_data.my_field = 'This is a string value.';
		result = Membership.PutMemberDataObject("Test Member", member_data);
		npm_unit.assert(result);
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
		npm_unit.object(result.member_data).is(member_data);
	});

	it('Test GetMemberDataObject', function() {
		result = Membership.GetMemberDataObject("Test Member");
		npm_unit.object(result).isNot(false);
		npm_unit.object(result).is(member_data);
	});

});
