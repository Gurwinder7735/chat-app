const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')

const socket = io();
//GET Username and room
const {username, room} = Qs.parse(location.search.replace('?', ''), {
	ignoreQueryPrefix: true,
});

// Join Chatrom
socket.emit('joinRoom', {username, room})

//Get room and Users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputRoomUsers(users)
})


// Message from Server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message Submit
chatForm.addEventListener('submit', (e) => {

    e.preventDefault();

    // Get Message Text
    const msg = e.target.elements[0].value
    
    //Emit Message to server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements[0].value = ''
})


const outputMessage = (message) => {
    const div = document.createElement('div')
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoomName = (room) => {
    document.getElementById('room-name').innerText = room
}

const outputRoomUsers = (users) => {
    console.log(users);
    document.getElementById('users').innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}