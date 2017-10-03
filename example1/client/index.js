/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */


var app = angular.module('TheApplication', ['ngCookies']);

app.controller('TheController',
	function TheController($scope, $cookies) {
		var socket = io.connect();


		//=====================================================================
		//=====================================================================
		//
		//		Socket.IO Messages
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		socket.on('connect', function() {
			$scope.notice = "... connected";
			$scope.$apply();
		});


		$scope.errors = [];


		//==========================================
		socket.on('server_error', function(server_error) {
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


		$scope.Member.OnMemberSignup = function(Success) {
			if (!Success) {
				$scope.$apply();
				return;
			}
			// `$scope.Member.member_data` has been updated.
			var date = new Date();
			$scope.Member.member_data.signup_time = date.toISOString();
			$scope.Member.PutMemberData();
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberLogin = function(Success) {
			if (!Success) {
				$scope.$apply();
				return;
			}
			// `$scope.Member.member_data` has been updated.
			var date = new Date();
			$scope.Member.member_data.login_time = date.toISOString();
			$scope.Member.PutMemberData();
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberReconnect = function(Success) {
			if (!Success) {
				$scope.$apply();
				return;
			}
			// `$scope.Member.member_data` has been updated.
			$scope.Member.PathList('/', true);
			$scope.$apply();
			return;
		};

		$scope.Member.OnMemberLogout = function(Success) {
			$scope.$apply();
			return;
		};

		$scope.Member.OnGetMemberData = function(Success) {
			if (!Success) {
				$scope.$apply();
				return;
			}
			// `$scope.Member.member_data` has been updated.
			$scope.$apply();
			return;
		};

		$scope.Member.OnPutMemberData = function(Success) {
			$scope.$apply();
			return;
		};

		$scope.Member.OnPathList = function(Path, List) {
			$scope.current_path = Path;
			$scope.path_list = List;
			$scope.$apply();
			return;
		};

		$scope.Member.OnPathRead = function(Path, Content) {
			$scope.$apply();
			return;
		};

		$scope.Member.OnPathWrite = function(Path, Success) {
			$scope.$apply();
			return;
		};

		$scope.Member.OnPathMake = function(Path, Success) {
			$scope.$apply();
			return;
		};

		$scope.Member.OnPathClean = function(Path, Success) {
			$scope.$apply();
			return;
		};

		$scope.Member.OnPathDelete = function(Path, Success) {
			$scope.$apply();
			return;
		};


		/* global RSVP */

		var PathWrite_Promise = function(Member, Path, Content) {
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

		var PathRead_Promise = function(Member, Path) {
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

		var PathDelete_Promise = function(Member, Path) {
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

		// Get the user data if our login is cached.
		if ($scope.Member.member_logged_in && !$scope.Member.member_data) {
			// $scope.Member.GetMemberData();
			$scope.Member.MemberReconnect();

			// Test the path functions.
			PathWrite_Promise($scope.Member, '/example1-test.dat', "This is my test data.")
				.then(function() {
					return PathRead_Promise($scope.Member, '/example1-test.dat');
				})
				.then(function(Content) {
					console.log("Content 1: " + Content);
				})
				.then(function() {
					return PathWrite_Promise($scope.Member, '/example1-test.dat', [1, 3, 5, 7, 11]);
				})
				.then(function() {
					return PathRead_Promise($scope.Member, '/example1-test.dat');
				})
				.then(function(Content) {
					console.log("Content 2: " + Content);
				})
				.then(function() {
					return PathDelete_Promise($scope.Member, '/example1-test.dat');
				})
				.catch(function(error) {
					console.log("Error: " + error);
				})
				.finally(function() {});

		}


	});
