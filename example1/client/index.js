/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */


var app = angular.module('TheApplication', ['ngCookies']);

app.controller('TheController',
	function TheController($scope, $cookies)
	{
		var socket = io.connect();


		//=====================================================================
		//=====================================================================
		//
		//		Socket.IO Messages
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		socket.on('connect', function()
		{
			$scope.notice = "... connected";
			$scope.$apply();
		});


		$scope.errors = [];


		//==========================================
		socket.on('server_error', function(server_error)
		{
			console.log('> server_error', server_error);
			$scope.errors.push(server_error);
			$scope.$apply();
			return;
		});


		//=====================================================================
		//=====================================================================
		//
		//		Membership Messages
		//
		//=====================================================================
		//=====================================================================


		$scope.Member = MembershipClient.GetMember('Example1', socket, $cookies);


		$scope.Member.OnMemberSignup = function(Success)
		{
			if (!Success) { return; }
			// `$scope.Member.member_data` has been updated.
			var date = new Date();
			$scope.Member.member_data.signup_time = date.toISOString();
			$scope.Member.PutMemberData();
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberLogin = function(Success)
		{
			if (!Success) { return; }
			// `$scope.Member.member_data` has been updated.
			var date = new Date();
			$scope.Member.member_data.login_time = date.toISOString();
			$scope.Member.PutMemberData();
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberLogout = function(Success)
		{
			$scope.$apply();
			return;
		};

		$scope.Member.OnGetMemberData = function(Success)
		{
			if (!Success) { return; }
			// `$scope.Member.member_data` has been updated.
			$scope.$apply();
			return;
		};

		$scope.Member.OnPutMemberData = function(Success)
		{
			return;
		};


		// Get the user data if our login is cached.
		if ($scope.Member.member_logged_in && !$scope.Member.member_data)
		{
			$scope.Member.GetMemberData();
		}


	});
