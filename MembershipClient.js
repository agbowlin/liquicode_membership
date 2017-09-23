/* global $ */


"use strict";

// module.exports = MembershipClient;


function MembershipClient()
{
	return;
}


//---------------------------------------------------------------------
MembershipClient.GetMember =
	function GetMember(ScopeName, socket, $cookies)
	{

		var Member = {};

		//=====================================================================
		//	Initialize
		//=====================================================================

		Member.member_logged_in = $cookies.get(ScopeName + '.member_logged_in') || false;
		Member.member_name = $cookies.get(ScopeName + '.member_name') || '';
		// Member.member_email = $cookies.get(ScopeName + '.member_email') || '';
		Member.session_id = $cookies.get(ScopeName + '.session_id') || '';
		Member.member_password = '';
		Member.member_data = null;
		Member.status_message = '';

		//=====================================================================
		//	Member Signup
		//=====================================================================

		//==========================================
		Member.MemberSignup = function MemberSignup()
		{
			if (!Member.member_name)
			{
				Member.status_message = "No membership credentials provided.";
				return;
			}

			Member.status_message = "Generating membership ...";

			// Authenticate the member with the server.
			socket.emit('Membership.MemberSignup', Member.member_name, Member.member_email, Member.member_password);
			return;
		};
		Member.OnMemberSignup = function OnMemberSignup() {};
		socket.on('Membership.MemberSignup_response', function(SessionID, MemberData)
		{
			if (!SessionID)
			{
				Member.status_message = "Unable to retrieve membership data.";
				Member.OnMemberSignup(false);
				return;
			}
			Member.status_message = "Signup succeeded for [" + Member.member_name + "].";
			Member.member_logged_in = true;
			Member.session_id = SessionID;
			Member.member_data = MemberData;
			$cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
			$cookies.put(ScopeName + '.member_name', Member.member_name);
			// $cookies.put(ScopeName + '.member_email', Member.member_email);
			$cookies.put(ScopeName + '.session_id', Member.session_id);
			Member.OnMemberSignup(true);
			return;
		});


		//=====================================================================
		//	Member Login
		//=====================================================================

		//==========================================
		Member.MemberLogin = function MemberLogin()
		{
			Member.status_message = "Authenticating membership credentials ...";
			if (!Member.member_name)
			{
				Member.status_message = "No membership credentials provided.";
				return;
			}

			// Authenticate the member with the server.
			socket.emit('Membership.MemberLogin', Member.member_name, Member.member_password);
			return;
		};
		Member.OnMemberLogin = function OnMemberLogin(Success) {};
		socket.on('Membership.MemberLogin_response', function(SessionID, MemberData)
		{
			if (!SessionID)
			{
				Member.member_logged_in = false;
				Member.status_message = "Login failed.";
				Member.OnMemberLogin(false);
				return;
			}
			Member.status_message = "Logged in as [" + Member.member_name + "].";
			Member.member_logged_in = true;
			Member.session_id = SessionID;
			Member.member_data = MemberData;
			$cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
			$cookies.put(ScopeName + '.member_name', Member.member_name);
			// $cookies.put(ScopeName + '.member_email', Member.member_email);
			$cookies.put(ScopeName + '.session_id', Member.session_id);
			Member.OnMemberLogin(true);
			return;
		});


		//==========================================
		Member.MemberLogout = function MemberLogout()
		{
			Member.status_message = "Logging out ...";
			socket.emit('Membership.MemberLogout', Member.session_id, Member.member_name);
			return;
		};
		Member.OnMemberLogout = function OnMemberLogout(Success) {};
		socket.on('Membership.MemberLogout_response', function(Success)
		{
			if (!Success)
			{
				Member.status_message = "Logout failed.";
				Member.OnMemberLogout(false);
				return;
			}
			Member.status_message = "Logged out [" + Member.member_name + "].";
			Member.member_logged_in = false;
			Member.session_id = '';
			Member.member_password = '';
			Member.member_data = null;
			$cookies.remove(ScopeName + '.member_logged_in');
			$cookies.remove(ScopeName + '.session_id');
			Member.OnMemberLogout(true);
			return;
		});


		//=====================================================================
		//	Member Data
		//=====================================================================

		//==========================================
		Member.GetMemberData = function GetMemberData()
		{
			Member.status_message = "Retrieving membership data ...";
			socket.emit('Membership.GetMemberData', Member.session_id, Member.member_name);
			return;
		};
		Member.OnGetMemberData = function OnGetMemberData(Success) {};
		socket.on('Membership.GetMemberData_response', function(MemberData)
		{
			if (!MemberData)
			{
				Member.status_message = "Unable to retrieve membership data.";
				Member.OnGetMemberData(false);
				return;
			}
			Member.status_message = "Retrieved membership data for [" + Member.member_name + "].";
			Member.member_data = MemberData;
			Member.OnGetMemberData(true);
			return;
		});


		//==========================================
		Member.PutMemberData = function PutMemberData()
		{
			Member.status_message = "Updating membership data ...";
			socket.emit('Membership.PutMemberData', Member.session_id, Member.member_name, Member.member_data);
			return;
		};
		Member.OnPutMemberData = function OnPutMemberData(Success) {};
		socket.on('Membership.PutMemberData_response', function(Success)
		{
			if (!Success)
			{
				Member.status_message = "Unable to update membership data.";
				Member.OnPutMemberData(false);
				return;
			}
			Member.status_message = "Updated membership data for [" + Member.member_name + "].";
			Member.OnPutMemberData(true);
			return;
		});


		return Member;
	};




//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined')
{
	window['MembershipClient'] = MembershipClient;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined')
{
	exports.MembershipClient = MembershipClient;
}
