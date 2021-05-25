const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { formatMessage } = require('./helpers/message');
const { getCurrentUser, userJoin, userLeave, getRoomUsers } = require('./helpers/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname,'public')))


io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {
        

        const user = userJoin(socket.id, username, room)

        socket.join(user.room);
		//Welcome Current User
		socket.emit('message', formatMessage('Admin', 'Welcome to ChatCord!'));

		//Broadcast WHwnn a User conne  cts
        socket.broadcast.to(user.room).emit('message', formatMessage('Admin', `${user.username} has joined the chat`));
        
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
	});

	// Listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        
		io.to(user.room).emit('message', formatMessage(user.username, msg));
	});

	//Runs on disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        // console.log(user);
        if (user) {
            io.to(user[0].room).emit('message', formatMessage('Admin', `${user[0].username} has left!`));
             io.to(user[0].room).emit('roomUsers', {
					room: user[0].room,
					users: getRoomUsers(user[0].room),
				});
        }		
	});
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});