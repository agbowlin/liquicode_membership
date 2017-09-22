"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_exec = require('child_process').exec;
var npm_string = require('string');
var npm_sanitize = require('sanitize-filename');


module.exports = Lib;


function Lib() {
	return;
}


//---------------------------------------------------------------------
Lib.RootFolder = '../members';


//---------------------------------------------------------------------
Lib.GetMemberFilename =
	function GetMemberFilename(MemberName) {
		var member_name = npm_sanitize(MemberName);
		var member_filename = npm_path.join(Lib.RootFolder, member_name);
		member_filename += '.json';
		return member_filename;
	};


//---------------------------------------------------------------------
Lib.IsMember =
	function IsMember(MemberName) {
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (npm_fs.existsSync(member_filename)) {
			return true;
		}
		return false;
	};


//---------------------------------------------------------------------
Lib.MemberSignup =
	function MemberSignup(MemberName, MemberEmail, MemberPassword) {
		// Create the Member File.
		// Fail if the file already exists.
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (npm_fs.existsSync(member_filename)) {
			return false;
		}

		// Generate a new Member Data object.
		var member_data = {};
		member_data.member_name = MemberName;
		member_data.member_email = MemberEmail;
		member_data.member_password = MemberPassword;

		// Write the Member Data object.
		npm_fs.writeFileSync(member_filename, JSON.stringify(member_data, null, 4));

		return member_data;
	};


//---------------------------------------------------------------------
Lib.MemberLogin =
	function MemberLogin(MemberName, MemberEmail, MemberPassword) {

		// Read the Member Data object.
		var member_data = Lib.GetMemberData(MemberName);
		
		// Authenticate
		if (!member_data) {
			return null;
		}
		if (MemberPassword != member_data.password) {
			return null;
		}

		// Return the Member Data object.
		return member_data;
	};


//---------------------------------------------------------------------
Lib.ListMembers =
	function ListMembers() {
		var list = [];

		return list;
	};


//---------------------------------------------------------------------
Lib.GetMemberData =
	function GetMemberData(MemberName) {
		// Find the Member File.
		// Fail if the file doesn't exist.
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (!npm_fs.existsSync(member_filename)) {
			return false;
		}

		// Read the Member Data object.
		var member_data_content = npm_fs.readFileSync(member_filename);
		var member_data = JSON.parse(member_data_content);

		// Return the Member Data object.
		return member_data;
	};


//---------------------------------------------------------------------
Lib.PutMemberData =
	function PutMemberData(MemberData) {
		// Find the Member File.
		// Fail if the file doesn't exist.
		var member_filename = Lib.GetMemberFilename(MemberData.member_name);
		if (!npm_fs.existsSync(member_filename)) {
			return false;
		}

		// Write the Member Data object.
		npm_fs.writeFileSync(member_filename, JSON.stringify(MemberData, null, 4));

		return true;
	};


//---------------------------------------------------------------------
Lib.WireSocketEvents =
	function WireSocketEvents(Socket, Logger) {


		//=====================================================================
		//	Member Signup
		//=====================================================================

		Socket.on('Membership.MemberSignup',
			function(MemberName, MemberEmail, MemberPassword) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberSignup] ... '); }
					var member_data = Lib.MemberSignup(MemberName, MemberEmail, MemberPassword);
					Socket.emit('Membership.MemberSignup_response', member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberSignup]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Login
		//=====================================================================

		Socket.on('Membership.MemberLogin',
			function(MemberName, MemberEmail, MemberPassword) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogin] ... '); }
					var member_data = Lib.MemberLogin(MemberName, MemberEmail, MemberPassword);
					Socket.emit('Membership.MemberLogin_response', member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogin]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Data
		//=====================================================================

		Socket.on('Membership.GetMemberData',
			function(MemberName) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.GetMemberData] ... '); }
					var member_data = Lib.GetMemberData(MemberName);
					Socket.emit('Membership.GetMemberData_response', member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.GetMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PutMemberData',
			function(MemberData) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PutMemberData] ... '); }
					var success = Lib.PutMemberData(MemberData);
					Socket.emit('Membership.PutMemberData_response', success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PutMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		return;
	};
