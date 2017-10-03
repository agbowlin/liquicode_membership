"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
// var npm_exec = require('child_process').exec;

// For generating session ids and hashing passwords.
var npm_crypto = require('crypto');
var PASSWORDS_USE_SALTED_HASH = true;

// var npm_string = require('string');

// For creating a folder name from a user name.
var npm_sanitize = require('sanitize-filename');

// For some filesystem functions.
var npm_fs_extra = require('fs-extra');

// For filesystem search functions.
var npm_klaw_sync = require('klaw-sync');

// For password hashing.



module.exports = Membership;


function Membership() {
	return;
}


//---------------------------------------------------------------------
Membership.RootFolder = '../members';
Membership.ApplicationName = 'default';


//---------------------------------------------------------------------
Membership.GetMemberObject =
	function GetMemberObject(MemberName) {
		// Get the Member Object filename.
		var filename = npm_sanitize(MemberName);
		filename = npm_path.join(Membership.RootFolder, filename);
		filename = npm_path.join(filename, 'member.json');
		if (!npm_fs.existsSync(filename)) {
			return null;
		}
		// Read the Member Object.
		var member = JSON.parse(npm_fs.readFileSync(filename));
		return member;
	};


//---------------------------------------------------------------------
Membership.PutMemberObject =
	function PutMemberObject(MemberName, Member) {
		// Get the Member Object filename.
		var filename = npm_sanitize(MemberName);
		filename = npm_path.join(Membership.RootFolder, filename);
		filename = npm_path.join(filename, 'member.json');
		// Write the Member Object.
		npm_fs.writeFileSync(filename, JSON.stringify(Member, null, 4));
		return;
	};


//---------------------------------------------------------------------
Membership.GetMemberDataObject =
	function GetMemberDataObject(MemberName) {
		// Get the Member Data Object filename.
		var filename = npm_sanitize(MemberName);
		filename = npm_path.join(Membership.RootFolder, filename);
		filename = npm_path.join(filename, 'member-data.json');
		if (!npm_fs.existsSync(filename)) {
			return null;
		}
		// Read the Member Data Object.
		var member = JSON.parse(npm_fs.readFileSync(filename));
		return member;
	};


//---------------------------------------------------------------------
Membership.PutMemberDataObject =
	function PutMemberDataObject(MemberName, MemberData) {
		// Get the Member Data Object filename.
		var filename = npm_sanitize(MemberName);
		filename = npm_path.join(Membership.RootFolder, filename);
		filename = npm_path.join(filename, 'member-data.json');
		// Write the Member Data Object.
		npm_fs.writeFileSync(filename, JSON.stringify(MemberData, null, 4));
		return true;
	};


//---------------------------------------------------------------------
Membership.GetMemberApplicationPath =
	function GetMemberApplicationPath(MemberName, ApplicationName) {
		var member_name = npm_sanitize(MemberName);
		var application_name = npm_sanitize(ApplicationName);
		var folder_path = Membership.RootFolder;
		folder_path = npm_path.join(folder_path, member_name);
		folder_path = npm_path.join(folder_path, application_name);
		return folder_path;
	};


//---------------------------------------------------------------------
// FROM: https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length) {
	return npm_crypto.randomBytes(Math.ceil(length / 2))
		.toString('hex') /** convert to hexadecimal format */
		.slice(0, length); /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt) {
	var hash = npm_crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	};
};


//---------------------------------------------------------------------
Membership.MemberSignup =
	function MemberSignup(MemberName, MemberEmail, MemberPassword) {

		// Check if member already exists.
		if (Membership.GetMemberObject(MemberName)) {
			return false;
		}

		// Generate a new Member Data object.
		var member = {};
		member.credentials = {};
		member.credentials.member_name = MemberName;
		member.credentials.member_email = MemberEmail;
		if (PASSWORDS_USE_SALTED_HASH) {
			var passwordData = sha512(MemberPassword, genRandomString(16));
			member.credentials.member_password_salt = passwordData.salt;
			member.credentials.member_password_hash = passwordData.passwordHash;
		}
		else {
			member.credentials.member_password = MemberPassword;
		}

		// Create a new session.
		member.session = {};
		member.session.session_id = npm_crypto.randomBytes(16).toString("hex");

		// Write the Member object.
		Membership.PutMemberObject(MemberName, member);

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": {}
		};
	};


//---------------------------------------------------------------------
Membership.MemberLogin =
	function MemberLogin(MemberName, MemberPassword) {

		// Read the Member object.
		var member = Membership.GetMemberObject(MemberName);
		if (!member) {
			return false;
		}

		// Authenticate
		if (PASSWORDS_USE_SALTED_HASH) {
			var passwordData = sha512(MemberPassword, member.credentials.member_password_salt);
			if (member.credentials.member_password_hash != passwordData.passwordHash) {
				return false;
			}
		}
		else {
			if (MemberPassword != member.credentials.member_password) {
				return false;
			}
		}

		// Create a new session.
		member.session = {};
		member.session.session_id = npm_crypto.randomBytes(16).toString("hex");

		// Write the Member object.
		Membership.PutMemberObject(MemberName, member);

		// Read the Member data object.
		var member_data = Membership.GetMemberDataObject(MemberName);
		member_data = member_data || {};

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": member_data
		};
	};


//---------------------------------------------------------------------
Membership.MemberReconnect =
	function MemberReconnect(MemberName, SessionID) {

		// Read the Member object.
		var member = Membership.GetMemberObject(MemberName);
		if (!member) {
			return false;
		}

		// Authenticate
		if (SessionID != member.session.session_id) {
			return false;
		}

		// Read the Member data object.
		var member_data = Membership.GetMemberDataObject(MemberName);
		member_data = member_data || {};

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": member_data
		};
	};


//---------------------------------------------------------------------
Membership.MemberLogout =
	function MemberLogout(MemberName) {

		// Read the Member object.
		var member = Membership.GetMemberObject(MemberName);
		if (!member) {
			return false;
		}

		// Destroy the session.
		member.session = {};

		// Write the Member object.
		Membership.PutMemberObject(MemberName, member);

		// Return Success
		return true;
	};


//---------------------------------------------------------------------
Membership.PathList =
	function PathList(MemberName, ApplicationName, Path, Recurse) {
		var app_path = Membership.GetMemberApplicationPath(MemberName, ApplicationName, '');
		var item_root = npm_path.join(app_path, Path);
		if (item_root.indexOf(app_path) != 0) { throw "Illegal path access."; }
		var items = [];
		if (npm_fs.existsSync(item_root)) {
			if (Recurse) {
				npm_klaw_sync(item_root).forEach(
					function(path) {
						if (!path.stats.isFile()) {
							path.path += '/';
						}
						var item = path.path.slice(item_root.length);
						items.push(item);
					});
			}
			else {
				npm_fs.readdirSync(item_root).forEach(
					function(item) {
						var path = npm_path.join(item_root, item);
						var stat = npm_fs.lstatSync(path);
						if (!stat.isFile()) {
							item += '/';
						}
						items.push(item);
					});
			}
		}
		// return items;
		return {
			"path": Path,
			"items": items
		};
	};


//---------------------------------------------------------------------
Membership.PathRead =
	function PathRead(MemberName, ApplicationName, Path) {
		var app_path = Membership.GetMemberApplicationPath(MemberName, ApplicationName, '');
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw "Illegal path access."; }
		var content = npm_fs.readFileSync(item_path);
		return {
			"path": Path,
			"content": content
		};
	};


//---------------------------------------------------------------------
Membership.PathWrite =
	function PathWrite(MemberName, ApplicationName, Path, Content) {
		var app_path = Membership.GetMemberApplicationPath(MemberName, ApplicationName, '');
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw "Illegal path access."; }
		npm_fs.writeFileSync(item_path, Content);
		return {
			"path": Path,
			"sucess": true
		};
	};


//---------------------------------------------------------------------
Membership.PathMake =
	function PathClean(MemberName, ApplicationName, Path) {
		var app_path = Membership.GetMemberApplicationPath(MemberName, ApplicationName, '');
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw "Illegal path access."; }
		npm_fs_extra.ensureDirSync(item_path);
		return {
			"path": Path,
			"sucess": true
		};
	};


//---------------------------------------------------------------------
Membership.PathClean =
	function PathClean(MemberName, ApplicationName, Path) {
		var app_path = Membership.GetMemberApplicationPath(MemberName, ApplicationName, '');
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw "Illegal path access."; }
		npm_fs_extra.emptyDirSync(item_path);
		return {
			"path": Path,
			"sucess": true
		};
	};


//---------------------------------------------------------------------
Membership.PathDelete =
	function PathDelete(MemberName, ApplicationName, Path) {
		var app_path = Membership.GetMemberApplicationPath(MemberName, ApplicationName, '');
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw "Illegal path access."; }
		if ((app_path == item_path) || (app_path == (item_path + '/'))) { throw "Cannot remove root folder."; }
		npm_fs_extra.removeSync(item_path);
		return {
			"path": Path,
			"sucess": true
		};
	};


//---------------------------------------------------------------------
Membership.WireSocketEvents =
	function WireSocketEvents(Socket, Logger) {


		//=====================================================================
		//	Member Signup, Login, Reconnect, Logout
		//=====================================================================

		Socket.on('Membership.MemberSignup',
			function(MemberName, MemberEmail, MemberPassword) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberSignup] ... '); }
					var result = Membership.MemberSignup(MemberName, MemberEmail, MemberPassword);
					if (result) {
						Socket.MemberName = MemberName;
					}
					Socket.emit('Membership.MemberSignup_response', result.session_id, result.member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberSignup]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.MemberLogin',
			function(MemberName, MemberPassword) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogin] ... '); }
					var result = Membership.MemberLogin(MemberName, MemberPassword);
					if (result) {
						Socket.MemberName = MemberName;
					}
					Socket.emit('Membership.MemberLogin_response', result.session_id, result.member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogin]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.MemberReconnect',
			function(MemberName, SessionID) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberReconnect] ... '); }
					var result = Membership.MemberReconnect(MemberName, SessionID);
					if (result) {
						Socket.MemberName = MemberName;
					}
					Socket.emit('Membership.MemberReconnect_response', result.session_id, result.member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberReconnect]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.MemberLogout',
			function() {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogout] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var success = Membership.MemberLogout(Socket.MemberName);
					if (success) {
						Socket.MemberName = '';
					}
					Socket.emit('Membership.MemberLogout_response', success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogout]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Data
		//=====================================================================

		Socket.on('Membership.GetMemberData',
			function() {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.GetMemberData] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var member_data = Membership.GetMemberDataObject(Socket.MemberName);
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
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var success = Membership.PutMemberDataObject(Socket.MemberName, MemberData);
					Socket.emit('Membership.PutMemberData_response', success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PutMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Path
		//=====================================================================

		Socket.on('Membership.PathList',
			function(Path, Recurse) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathList] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var result = Membership.PathList(Socket.MemberName, Membership.ApplicationName, Path, Recurse);
					Socket.emit('Membership.PathList_response', result.path, result.items);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathList]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathRead',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathRead] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var result = Membership.PathRead(Socket.MemberName, Membership.ApplicationName, Path);
					Socket.emit('Membership.PathRead_response', result.path, result.content);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathRead]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathWrite',
			function(Path, Content) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathWrite] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var result = Membership.PathWrite(Socket.MemberName, Membership.ApplicationName, Path, Content);
					Socket.emit('Membership.PathWrite_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathWrite]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathMake',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathMake] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var result = Membership.PathMake(Socket.MemberName, Membership.ApplicationName, Path);
					Socket.emit('Membership.PathMake_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathMake]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathClean',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathClean] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var result = Membership.PathClean(Socket.MemberName, Membership.ApplicationName, Path);
					Socket.emit('Membership.PathClean_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathClean]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathDelete',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathDelete] ... '); }
					if (!Socket.MemberName) { throw 'Authentication required.'; }
					var result = Membership.PathDelete(Socket.MemberName, Membership.ApplicationName, Path);
					Socket.emit('Membership.PathDelete_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathDelete]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	End of WireSocketEvents
		//=====================================================================

		return;
	};
