var io = require('socket.io').listen(3001);

var id = 0;
var rooms = [];

io.on('connection', function(socket)
{
	console.log('user '+socket.id+' connected');
	
	var room;
	var server = false;
	
	socket.on('create room', function(){
		if(!room)
			room = ++id;
			
		if(rooms.indexOf(room) < 0)
			rooms.push(room);
		
		server = true;
		socket.join(room);
		socket.emit('room', {success: true, room: room});
	});
	
	socket.on('join room', function(data){
		data = parseInt(data, 10);
		if(rooms.indexOf(data) > -1) {
			room = data;
			socket.join(room);
			socket.emit('room', {success: true, room: room});
			io.to(room).emit('controller');
		} else {
			socket.emit('room', {success: false, room: data});
		}
	});
	
	socket.on('position', function(data){
		if(!room)
			return;
		
		io.to(room).emit('position', data);
	});

	socket.on('disconnect', function(){
		console.log(room);
		if(room){
			var i = rooms.indexOf(room);
			if(i > -1)
				rooms.splice(i, 1);
			io.to(room).emit('logout');
			room = null;
		}
		console.log('user '+socket.id+' disconnected');
	});
});