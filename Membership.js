"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_exec = require('child_process').exec;
var npm_crypto = require('crypto');
// var npm_string = require('string');
var npm_sanitize = require('sanitize-filename');


module.exports = Lib;


function Lib()
{
	return;
}


//---------------------------------------------------------------------
Lib.RootFolder = '../members';


//---------------------------------------------------------------------
Lib.GetMemberFilename =
	function GetMemberFilename(MemberName)
	{
		var member_name = npm_sanitize(MemberName);
		var member_filename = npm_path.join(Lib.RootFolder, member_name);
		member_filename += '.json';
		return member_filename;
	};


//---------------------------------------------------------------------
Lib.IsMember =
	function IsMember(MemberName)
	{
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (npm_fs.existsSync(member_filename))
		{
			return true;
		}
		return false;
	};


//---------------------------------------------------------------------
Lib.MemberSignup =
	function MemberSignup(MemberName, MemberEmail, MemberPassword)
	{
		// Create the Member File.
		// Fail if the file already exists.
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (npm_fs.existsSync(member_filename))
		{
			return false;
		}

		// Generate a new Member Data object.
		var member = {};
		member.credentials = {};
		member.credentials.member_name = MemberName;
		member.credentials.member_email = MemberEmail;
		member.credentials.member_password = MemberPassword;
		member.member_data = {};

		// Create a new session.
		member.session = {};
		// member.session.session_id = 'abc';
		member.session.session_id = npm_crypto.randomBytes(16).toString("hex");

		// Write the Member object.
		npm_fs.writeFileSync(member_filename, JSON.stringify(member, null, 4));

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": member.member_data
		};
	};

//---------------------------------------------------------------------
Lib.MemberLogin =
	function MemberLogin(MemberName, MemberPassword)
	{
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (!npm_fs.existsSync(member_filename))
		{
			return null;
		}

		// Read the Member object.
		var member = JSON.parse(npm_fs.readFileSync(member_filename));

		// Authenticate
		if (!member)
		{
			return false;
		}
		if (MemberPassword != member.credentials.member_password)
		{
			return false;
		}

		// Create a new session.
		member.session = {};
		// member.session.session_id = 'abc';
		member.session.session_id = npm_crypto.randomBytes(16).toString("hex");

		// Write the Member object.
		npm_fs.writeFileSync(member_filename, JSON.stringify(member, null, 4));

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": member.member_data
		};
	};


//---------------------------------------------------------------------
Lib.MemberLogout =
	function MemberLogout(SessionID, MemberName)
	{
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (!npm_fs.existsSync(member_filename))
		{
			return null;
		}

		// Read the Member object.
		var member = JSON.parse(npm_fs.readFileSync(member_filename));
		if (!member)
		{
			return false;
		}

		// Authenticate the session.
		// if (!member.session)
		// {
		// 	return false;
		// }
		// if (member.session.session_id != SessionID)
		// {
		// 	return false;
		// }

		// Destroy the session.
		member.session = {};

		// Write the Member object.
		npm_fs.writeFileSync(member_filename, JSON.stringify(member, null, 4));

		// Return Success
		return true;
	};


//---------------------------------------------------------------------
Lib.GetMemberData =
	function GetMemberData(SessionID, MemberName)
	{
		// Find the Member File.
		// Fail if the file doesn't exist.
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (!npm_fs.existsSync(member_filename))
		{
			return null;
		}

		// Read the Member object.
		var member = JSON.parse(npm_fs.readFileSync(member_filename));
		if (!member)
		{
			return false;
		}

		// Authenticate the session.
		if (!member.session)
		{
			return false;
		}
		if (member.session.session_id != SessionID)
		{
			return false;
		}

		// Return the Member Data object.
		return member.member_data;
	};


//---------------------------------------------------------------------
Lib.PutMemberData =
	function PutMemberData(SessionID, MemberName, MemberData)
	{
		// Find the Member File.
		// Fail if the file doesn't exist.
		var member_filename = Lib.GetMemberFilename(MemberName);
		if (!npm_fs.existsSync(member_filename))
		{
			return false;
		}

		// Read the Member object.
		var member = JSON.parse(npm_fs.readFileSync(member_filename));
		if (!member)
		{
			return false;
		}

		// Authenticate the session.
		if (!member.session)
		{
			return false;
		}
		if (member.session.session_id != SessionID)
		{
			return false;
		}

		// Write the new Member Data object.
		member.member_data = MemberData || {};
		npm_fs.writeFileSync(member_filename, JSON.stringify(member, null, 4));

		// Return Success
		return true;
	};


//---------------------------------------------------------------------
Lib.WireSocketEvents =
	function WireSocketEvents(Socket, Logger)
	{


		//=====================================================================
		//	Member Signup
		//=====================================================================

		Socket.on('Membership.MemberSignup',
			function(MemberName, MemberEmail, MemberPassword)
			{
				try
				{
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberSignup] ... '); }
					var result = Lib.MemberSignup(MemberName, MemberEmail, MemberPassword);
					Socket.emit('Membership.MemberSignup_response', result.session_id, result.member_data);
				}
				catch (err)
				{
					if (Logger) { Logger.LogError('Error in [Membership.MemberSignup]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Login
		//=====================================================================

		Socket.on('Membership.MemberLogin',
			function(MemberName, MemberPassword)
			{
				try
				{
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogin] ... '); }
					var result = Lib.MemberLogin(MemberName, MemberPassword);
					Socket.emit('Membership.MemberLogin_response', result.session_id, result.member_data);
				}
				catch (err)
				{
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogin]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Logout
		//=====================================================================

		Socket.on('Membership.MemberLogout',
			function(SessionID, MemberName)
			{
				try
				{
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogout] ... '); }
					var success = Lib.MemberLogout(SessionID, MemberName);
					Socket.emit('Membership.MemberLogout_response', success);
				}
				catch (err)
				{
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogout]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Data
		//=====================================================================

		Socket.on('Membership.GetMemberData',
			function(SessionID, MemberName)
			{
				try
				{
					if (Logger) { Logger.LogTrace('Processing [Membership.GetMemberData] ... '); }
					var member_data = Lib.GetMemberData(SessionID, MemberName);
					Socket.emit('Membership.GetMemberData_response', member_data);
				}
				catch (err)
				{
					if (Logger) { Logger.LogError('Error in [Membership.GetMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PutMemberData',
			function(SessionID, MemberName, MemberData)
			{
				try
				{
					if (Logger) { Logger.LogTrace('Processing [Membership.PutMemberData] ... '); }
					var success = Lib.PutMemberData(SessionID, MemberName, MemberData);
					Socket.emit('Membership.PutMemberData_response', success);
				}
				catch (err)
				{
					if (Logger) { Logger.LogError('Error in [Membership.PutMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		return;
	};
