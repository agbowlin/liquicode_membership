//=====================================================================
//=====================================================================
/*
	Adds RSVP promises to the Membership Client API.
	
	Include this file and call WireMembershipWithRsvpPromises()
	on new Member objects.
*/
//=====================================================================
//=====================================================================

"use strict";

/* global RSVP */
// var RSVP = require('rsvp');


function MembershipClientRsvp() {
	return;
}

MembershipClientRsvp.WireMembershipWithRsvpPromises =
	function WireMembershipWithRsvpPromises(Member) {

		Member.MemberSignup_Promise = function() {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.OnMemberSignup = function(Success) {
						if (Success) {
							resolve(true, "MemberSignup() succeeded.");
						}
						else {
							reject(false, "MemberSignup() failed.");
						}
					};
					Member.MemberSignup();
				}
			);
		};

		Member.MemberLogin_Promise = function() {
			return new Promise(
				function(resolve, reject) {
					Member.MemberLogin();
					Member.OnMemberLogin = function(Success) {
						if (Success) {
							resolve(true, "MemberLogin() succeeded.");
						}
						else {
							reject(false, "MemberLogin() failed.");
						}
					};
				}
			);
		};

		Member.MemberReconnect_Promise = function() {
			return new Promise(
				function(resolve, reject) {
					Member.MemberReconnect();
					Member.OnMemberReconnect = function(Success) {
						if (Success) {
							resolve(true, "MemberReconnect() succeeded.");
						}
						else {
							reject(false, "MemberReconnect() failed.");
						}
					};
				}
			);
		};

		Member.MemberLogout_Promise = function() {
			return new Promise(
				function(resolve, reject) {
					Member.MemberLogout();
					Member.OnMemberLogout = function(Success) {
						if (Success) {
							resolve(true, "MemberLogout() succeeded.");
						}
						else {
							reject(false, "MemberLogout() failed.");
						}
					};
				}
			);
		};

		Member.GetMemberData_Promise = function() {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.GetMemberData();
					Member.OnGetMemberData = function(Success) {
						if (Success) {
							resolve(true, "GetMemberData() succeeded.");
						}
						else {
							reject(false, "GetMemberData() failed.");
						}
					};
				}
			);
		};

		Member.PutMemberData_Promise = function() {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PutMemberData();
					Member.OnPutMemberData = function(Success) {
						if (Success) {
							resolve(true, "PutMemberData() succeeded.");
						}
						else {
							reject(false, "PutMemberData() failed.");
						}
					};
				}
			);
		};

		Member.PathList_Promise = function(Path, Recurse) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathList(Path, Recurse);
					Member.OnPathList = function(Path, Items) {
						if (Items) {
							resolve(true, "PathList( " + Path + " ) succeeded.");
						}
						else {
							reject(false, "PathList( " + Path + " ) failed.");
						}
					};
				}
			);
		};

		Member.PathRead_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathRead(Path);
					Member.OnPathRead = function(Path, Content) {
						if (Content) {
							resolve(Content, "PathRead( " + Path + " ) succeeded.");
						}
						else {
							reject(false, "PathRead( " + Path + " ) failed.");
						}
					};
				}
			);
		};

		Member.PathWrite_Promise = function(Path, Content) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathWrite(Path, Content);
					Member.OnPathWrite = function(Path, Success) {
						if (Success) {
							resolve(true, "PathWrite( " + Path + " ) succeeded.");
						}
						else {
							reject(false, "PathWrite( " + Path + " ) failed.");
						}
					};
				}
			);
		};

		Member.PathMake_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathMake(Path);
					Member.OnPathMake = function(Path, Success) {
						if (Success) {
							resolve(true, "PathMake( " + Path + " ) succeeded.");
						}
						else {
							reject(false, "PathMake( " + Path + " ) failed.");
						}
					};
				}
			);
		};

		Member.PathClean_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathClean(Path);
					Member.OnPathClean = function(Path, Success) {
						if (Success) {
							resolve(true, "PathClean( " + Path + " ) succeeded.");
						}
						else {
							reject(false, "PathClean( " + Path + " ) failed.");
						}
					};
				}
			);
		};

		Member.PathDelete_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathDelete(Path);
					Member.OnPathDelete = function(Path, Success) {
						if (Success) {
							resolve(true, "PathDelete( " + Path + " ) succeeded.");
						}
						else {
							reject(false, "PathDelete( " + Path + " ) failed.");
						}
					};
				}
			);
		};

	};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['MembershipClientRsvp'] = MembershipClientRsvp;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof module.exports != 'undefined') {
	module.exports = MembershipClientRsvp;
}
