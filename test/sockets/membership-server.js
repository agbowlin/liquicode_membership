//=====================================================================
//=====================================================================
/*
	membership-server.js

	A simple example of how to use the liquicode_membership module.
	Used for testing.
	
	Run with: nodejs membership-server.js {port}
*/
//=====================================================================
//=====================================================================

"use strict";

// Enable socket.io logging.
// process.env['DEBUG'] = 'socket.io* node myapp';

// Standard Includes
// var npm_path = require('path');
// var npm_fs = require('fs');
var npm_http = require('http');

// 3rd Party Includes
// var npm_express = require('express');
var npm_socketio = require('socket.io');

// Include the membership module.
var Membership = require('../Membership.js');
Membership.ApplicationName = 'membership-server';

// Include the SocketIO layer of the membership module.
var MembershipSocketIO = require('../Membership-SocketIO.js');


//=====================================================================
//=====================================================================
//
//		HTTP Server
//
//=====================================================================
//=====================================================================


var HttpServer = npm_http.createServer(
	function(req, res) {
		res.write('membership-server.js');
		res.end();
	});


//=====================================================================
//=====================================================================
//
//		Socket.IO Connections
//
//=====================================================================
//=====================================================================


// Socket.IO uses HttpServer as a transport.
var SocketIo = npm_socketio.listen(HttpServer);

// Maintain a list of connected sockets.
var HttpSockets = [];


//=====================================================================
//	Initialize a socket connection.
SocketIo.on('connection',
	function(Socket) {

		// Register this socket connection.
		HttpSockets.push(Socket);

		// Socket disconnection.
		Socket.on('disconnect',
			function() {
				HttpSockets.splice(HttpSockets.indexOf(Socket), 1);
			});

		// Add the membership functions.
		MembershipSocketIO(Membership, Socket, null);

	});


//=====================================================================
//	Broadcast a message to all connected sockets.
function broadcast(event, data) {
	HttpSockets.forEach(
		function(socket) {
			socket.emit(event, data);
		});
}


//=====================================================================
//=====================================================================
//
//		Run Http Server
//
//=====================================================================
//=====================================================================


// NodeJS startup settings.
var NodeJS_Address = "localhost";
var NodeJS_Port = 3000;


//==========================================
// Begin accepting connections.
HttpServer.listen(
	NodeJS_Port, NodeJS_Address,
	function() {
		var addr = HttpServer.address();
		console.log("Server listening at", addr.address + ":" + addr.port);
		console.log('Access application here: ' + addr.address + ":" + addr.port + '/index.html');
	});
