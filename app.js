// JavaScript Document

var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');

var server = http.createServer(function(request,response)
{
	response.writeHead(200,{'Content-type':'text/html'});
	response.end(fs.readFileSync('newcp.html'));
});

server.listen(8888);
console.log("Server has started!\n");

var io = socketio.listen(server);
io.set('log level', 1);

var usernames = {};
var rooms=['Room1', 'Room2', 'Room3'];
io.sockets.on('connection', function(socket)
{
	socket.on('adduser', function(data)
	{
		usernames[data] = data;
		socket.username = data;
		socket.room = 'Room1';
		socket.join('Room1');
		console.log(data+" has connected to Room1");
		socket.emit('update', "You have entered Room1");
		
		socket.broadcast.to('Room1').emit('update', data+" has entered Room1");
		socket.emit('roomupdate',rooms,'Room1');
			
		
	});
	socket.on('switchroom', function(value)
	{
		socket.broadcast.to(socket.room).emit('update',socket.username+" has left "+socket.room);
		socket.leave(socket.room);
		socket.join(value);
		socket.room = value;
		console.log(socket.username+" has connected to "+value);
		socket.emit('update', "You have joined "+value);
		socket.broadcast.to(value).emit('update', socket.username+" has joined "+value);
		socket.emit('roomupdate', rooms, value);
	});
	socket.on('leave',function()
	{
		console.log(socket.username+" disconnected from "+socket.room);
		socket.broadcast.to(socket.room).emit('update', socket.username+" has left Room1");
		socket.leave(socket.room);
		
		
	});
	socket.on('message', function(data)
	{
		console.log(socket.username+" : "+data);
		io.sockets.in(socket.room).emit('message', {'name':socket.username,'msg':data});
	});
	
		
});