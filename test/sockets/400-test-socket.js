//=====================================================================
//=====================================================================
/*
	400-test-socket.js
	
	Test SocketIO implementation (requires membership-server.js to be running).
	
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

var npm_socketio = require('socket.io-client');
var RSVP = require('rsvp');
var npm_unit = require('unit.js');

var MembershipClient = require('../MembershipClient.js');
var MembershipClientRsvp = require('../MembershipClient-RSVP.js');


describe('400-test-socket: Test SocketIO implementation (requires membership-server.js to be running).', function() {

	var result = false;
	var session_id = false;

	var server_address = 'http://localhost:3000';
	var socket = false;
	var member = false;


	beforeEach(function(done) {
		// Setup
		socket = npm_socketio.connect(server_address, {
			'reconnection delay': 0,
			'reopen delay': 0,
			'force new connection': true,
			transports: ['websocket']
		});
		socket.on('connect', function() {
			member = MembershipClient.GetMember('400-test-socket', socket);
			member.member_name = "Test Member Client";
			member.member_email = "TestMemberClient@mail.com";
			member.member_password = "Password";
			MembershipClientRsvp.WireMembershipWithRsvpPromises(member);
			console.log('connected...');
			done();
		});
		socket.on('disconnect', function() {
			console.log('disconnected...');
		});
		socket.on('server_error', function(server_error) {
			console.log('> server_error', server_error);
		});
	});

	afterEach(function(done) {
		// Cleanup
		if (socket.connected) {
			console.log('disconnecting...');
			socket.disconnect();
		}
		else {
			// There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
			console.log('no connection to break...');
		}
		done();
	});


	describe('Test session logic', function() {

		it('Test MemberSignup', function(done) {
			member.MemberSignup_Promise()
				.then(function() {
					npm_unit.assert(true);
				})
				.catch(function(error) {
					console.log('Failure!');
					npm_unit.assert(false);
				})
				.finally(function() {
					done();
				});
		});

		// it('Connect to membership-server at ' + server_address, function() {

		// 	// socket = npm_socketio.connect(server_address, { reconnect: true });
		// 	socket = npm_socketio.connect(server_address);
		// 	member = MembershipClient.GetMember('400-test-socket', socket);
		// 	member.member_name = "Test Member Client";
		// 	member.member_email = "TestMemberClient@mail.com";
		// 	member.member_password = "Password";
		// 	MembershipClientRsvp.WireMembershipWithRsvpPromises(member);

		// 	//==========================================
		// 	socket.on('connect', function() {
		// 		console.log('Connected to ' + server_address);
		// 	});


		// 	//==========================================
		// 	socket.on('server_error', function(server_error) {
		// 		console.log('> server_error', server_error);
		// 	});

		// });

		// it('Test MemberSignup', function() {
		// 	member.OnMemberSignup = function(Success) {
		// 		npm_unit.assert(Success);
		// 	};
		// 	member.MemberSignup();
		// });

		// it('Test MemberReconnect', function() {
		// 	member.OnMemberReconnect = function(Success) {
		// 		npm_unit.assert(Success);
		// 	};
		// 	member.MemberReconnect();
		// });

		// it('Test MemberLogout', function() {
		// 	member.OnMemberLogout = function(Success) {
		// 		npm_unit.assert(Success);
		// 	};
		// 	member.MemberLogout();
		// });

		// it('Test MemberLogin', function() {
		// 	member.OnMemberLogin = function(Success) {
		// 		npm_unit.assert(Success);
		// 	};
		// 	member.MemberLogin();
		// });

		// member.MemberSignup_Promise()
		// 	.then(function() {
		// 		return member.MemberReconnect_Promise();
		// 	})
		// 	.then(function() {
		// 		return member.MemberLogout_Promise();
		// 	})
		// 	.then(function() {
		// 		return member.MemberLogin_Promise();
		// 	})
		// 	.catch(function(error) {
		// 		npm_unit.assert(false);
		// 	})
		// 	.finally(function() {
		// 		npm_unit.assert(true);
		// 	});
	});


});
