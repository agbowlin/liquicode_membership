/* global $ */


"use strict";

// module.exports = MembershipClient;


function MembershipClient() {
	return;
}


//---------------------------------------------------------------------
MembershipClient.WireMembership =
	function WireMembership(ScopeName, $scope, socket, $cookies) {


		//=====================================================================
		//	Initialize
		//=====================================================================

		//==========================================
		$scope.MembershipClientInitialize = function MembershipClientInitialize() {
			$scope.member_logged_in = $cookies.get(ScopeName + '.member_logged_in');
			if ($scope.member_logged_in == undefined) { $scope.member_logged_in = false }
			$scope.member_name = $cookies.get(ScopeName + '.member_name');
			$scope.member_email = $cookies.get(ScopeName + '.member_email');
			$scope.member_data = null;
			if ($scope.member_name && $scope.member_logged_in) {
				// Retrieve the member data from the server.
				$scope.GetMemberData();
			}
			return;
		};

		//=====================================================================
		//	Member Signup
		//=====================================================================

		//==========================================
		$scope.MemberSignup = function MemberSignup(MemberName, MemberEmail, MemberPassword) {
			if (!MemberName) {
				$scope.notice = "No membership credentials provided.";
				return;
			}

			$scope.notice = "Generating membership ...";
			$scope.errors = [];

			// Authenticate the member with the server.
			socket.emit('Membership.MemberSignup', MemberName, MemberEmail, MemberPassword);
			return;
		};
		socket.on('Membership.MemberSignup_response', function(MemberData) {
			if (!MemberData) {
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_logged_in = true;
			$scope.member_name = MemberData.member_name;
			$scope.member_email = MemberData.member_email;
			$scope.member_password = MemberData.member_password;
			$scope.member_data = MemberData;
			$cookies.put(ScopeName + '.member_logged_in', true);
			$cookies.put(ScopeName + '.member_name', $scope.member_name);
			$cookies.put(ScopeName + '.member_email', $scope.member_email);
			$scope.$apply();
			return;
		});


		//=====================================================================
		//	Member Login
		//=====================================================================

		//==========================================
		$scope.MemberLogin = function MemberLogin(MemberName, MemberEmail, MemberPassword) {
			$scope.notice = "Authenticating membership credentials ...";
			$scope.errors = [];
			if (!MemberName) {
				$scope.notice = "No membership credentials provided.";
				return;
			}

			// Authenticate the member with the server.
			socket.emit('Membership.MemberLogin', MemberName, MemberEmail, MemberPassword);
			return;
		};
		socket.on('Membership.MemberLogin_response', function(MemberData) {
			if (!MemberData) {
				$scope.member_logged_in = false;
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_logged_in = true;
			$scope.member_name = MemberData.member_name;
			$scope.member_email = MemberData.member_email;
			$scope.member_data = MemberData;
			$scope.item_list = null;
			$cookies.put(ScopeName + '.member_logged_in', true);
			$cookies.put(ScopeName + '.member_name', $scope.member_name);
			$cookies.put(ScopeName + '.member_email', $scope.member_email);
			$scope.$apply();
			return;
		});


		//==========================================
		$scope.MemberLogout = function MemberLogout() {
			$scope.notice = "Logging out ...";
			$cookies.remove(ScopeName + '.member_logged_in');
			$scope.member_logged_in = false;
			$scope.member_data = null;
			$scope.member_password = null;
			return;
		};


		//=====================================================================
		//	Member Data
		//=====================================================================

		//==========================================
		$scope.GetMemberData = function GetMemberData() {
			$scope.notice = "Retrieving membership data ...";
			$scope.errors = [];
			socket.emit('Membership.GetMemberData', $scope.member_name);
			return;
		};
		socket.on('Membership.GetMemberData_response', function(MemberData) {
			if (!MemberData) {
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_data = MemberData;
			$scope.$apply();
			return;
		});


		//==========================================
		$scope.PutMemberData = function PutMemberData() {
			$scope.notice = "Updating membership data ...";
			$scope.errors = [];
			socket.emit('Membership.PutMemberData', $scope.member_data);
			return;
		};
		socket.on('Membership.PutMemberData_response', function(Success) {
			if (!Success) {
				$scope.notice = "Unable to update membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Updated membership data for [" + $scope.member_name + "].";
			$scope.$apply();
			return;
		});


		return;
	};




//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['MembershipClient'] = MembershipClient;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports.MembershipClient = MembershipClient;
}
