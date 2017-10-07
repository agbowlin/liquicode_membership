//=====================================================================
//=====================================================================
/*
	000-test-reset.js
	
	Reset the test environment.
	
	Run with: mocha -R spec
	
	Does the following:
		- Reset the members folder
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


describe('000-test-reset: Reset the test environment.', function() {

	it('Reset the members folder', function() {
		npm_fs_extra.ensureDirSync(Membership.RootFolder);
		npm_fs_extra.emptyDirSync(Membership.RootFolder);
	});

});
