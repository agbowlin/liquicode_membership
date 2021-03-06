

liquicode_membership
==========================================

A NodeJS library providing rudimentary membership services
(e.g. Signup, Login, GetData, PutData).


Installation
------------------------------------------

Using NPM for installation
```
npm install liquicode_membership
```
or: Clone the source code
```
git clone https://github.com/agbowlin/liquicode_membership.git
```
or: Download the source code
```
https://github.com/agbowlin/liquicode_membership/archive/master.zip
```


Getting Started
------------------------------------------

The `liquicode_membership` package contains source files required for
both server and client operation.

Server will be running Socket.IO on top of NodeJS and will include the
`Membership.js` file.

Clients will include the `MembershipClient.js` file.

### Using on NodeJS (Server)

Instantiate and configure the Membership module.
```javascript
var Membership = require('liquicode_membership/Membership.js');
Membership.RootFolder = npm_path.resolve(__dirname, '../members');
```

Wire the Membership module into a newly connected Socket.IO socket.
```javascript
SocketIo.on('connection',
	function(Socket) {
		// ...
		Membership.WireSocketEvents(Socket, null);
		// ...
	});
```


### Using on Browser (Client)

Include the Membership module into your html source file.
```html
<script src="/node_modules/liquicode_membership/MembershipClient.js"></script>
```

Instantiate and configure the Membership module.
```javascript
var socket = io.connect();
var cookies = SomeBrowserCookiesImplementation();

// Initialize the Membership object.
var Member = MembershipClient.GetMember('MyExampleApp', socket, cookies);
// Member will be preloaded with any membership info from browser cookies.
// i.e. Member.member_logged_in, Member.member_name, Member.session_id
```

Manipulate the Membership object to authenticate and use the Membership service.
```javascript
Member.member_name = 'john';
Member.member_password = 'john-password';
Member.MemberLogin();
Member.OnMemberLogin = function(Success)
{
	console.log('OnMemberLogin returned ' + Success + ' for ' + Member.member_name);
};
```


Membership Security
------------------------------------------

By default, user passwords are stored in json files as salted hashes where each
user has a unique and random salt.

This functionality is controlled by an internal flag within `Membership.js`
called `PASSWORDS_USE_SALTED_HASH`.
This is initially set to `true` within the code.
Change this setting to `false` if you want to store passwords in plain text.


Membership Client API
------------------------------------------

- `MemberSignup(MemberName, MemberEmail, MemberPassword)` :
	Register a new member name and email with the server.
	A member data file is created on the server.
	A new session will be created for the member (i.e. member will be logged in).
	Returns the new session id and the member data object.
	- `MemberName` (required) : The member name to register.
	- `MemberEmail` (optional) : The email address to be associated with this member.
		This is needed to further authenticate a member in the case of lost password.
	- `MemberPassword` (required) : The password used to authenticate this member.
- `MemberLogin(MemberName, MemberEmail, MemberPassword)` :
	Authenticates a member and creates a new session.
	Returns the new session id and the member data object.
	- `MemberName` (required) : The name of the member to log in.
	- `MemberPassword` (required) : The password used to authenticate this member.
- `MemberLogout(SessionID, MemberName)` :
	Destroys any existing session for the member.
	Returns `true` if successful.


- `GetMemberData(SessionID, MemberName)`
	Retrieves the member data object for a member.
	- `SessionID` (required) : An active session id obtained from `MemberSignup` or `MemberLogin`.
	- `MemberName` (required) : The name of the member.
- `PutMemberData(SessionID, MemberName, MemberData)`
	Updates the member data object for a member.
	- `SessionID` (required) : An active session id obtained from `MemberSignup` or `MemberLogin`.
	- `MemberName` (required) : The name of the member.
	- `MemberData` (required) : The new member data object to store.


- `PathList(Path, Recurse)` :
	Lists all folders and files found under `Path`.
	Folder names will always end with a `/`.
- `PathRead(Path)` :
	Reads content from the file specified by `Path` and returns it.
- `PathWrite(Path, Content)` :
	Write `Content` to the file specified by `Path`.
	`Path` is created if it does not exist.
- `PathMake(Path)` :
	Creates a new path.
	Creates any required parent folders.
- `PathClean(Path)` :
	Removes all files and subfolders from a folder.
	Does not delete the folder itself.
- `PathDelete(Path)` :
	Deletes the file or folder specified by `Path`.
	If `Path` is a folder, then it will be cleaned first.


### Working with the Membership Client

The client implementation (to be included in your web pages) creates a
`Membership` object containing a set fields and functions for invoking
membership functions on the server.

Your code can use the `Membership` object authenticate users.
Once a user has been authenticated via `MemberSignup` or `MemberLogin`, the
resulting session id can be used to read and write user specific data
to the server.

To invoke `Membership` functions, set the appropriate fields within a `Membership`
object and then call one or more functions. For example, to call the `MemberLogin`
function, set the `member_name` and `member_password` fields and then call
`MemberLogin()` without any parameters.

Here is a list of API parameters and the `Membership` field which corresponds to it:

API Parameter Name		| Membership field
------------------------|------------------------
MemberName				| member_name
MemberEmail				| member_email
MemberPassword			| member_password
SessionID				| session_id
MemberData				| member_data

In code:
```javascript
Membership.OnMemberLogin = function(Success) { console.log('Login status: ' + Success); };
Membership.member_name = 'john';
Membership.member_password = 'john-password';
Membership.MemberLogin();
```


Dependencies
------------------------------------------

## Server: Membership.js

- NodeJS
- socket.io
- sanitize-filename [(http://travis-ci.org/parshap/node-sanitize-filename)](http://travis-ci.org/parshap/node-sanitize-filename)
- fs-extra [(https://www.npmjs.org/package/fs-extra)](https://www.npmjs.org/package/fs-extra)
- node-klaw-sync [(https://www.npmjs.com/package/klaw-sync)](https://www.npmjs.com/package/klaw-sync)


## Client: MembershipClient.js

The Membership client currently relies on AngularJS and its cookies implementation.



