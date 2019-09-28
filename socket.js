const socketIO = require('socket.io');
const http = require('http');

const { app } = require('./app');
const httpServer = http.createServer(app);

const io = socketIO(httpServer);

io.use(async (socket, next)=>{
    const { username, password } = socket.handshake.query;
    const user = await User.findOne({username , password})
    if(user){
        user.online = socket.id;
        await user.save();
        socket.userId = user._id.toString();
        socket.currentUser = user.toObject();
        return next();
    }
    return next(new Error('Could not found user'))
});

io.on('connection', (socket)=>{
    console.log('new connect from server');
    socket.broadcast.emit('newFriendOnline', {newUserid: socket.userId, socketID: socket.id});
    socket.emit('currentUser', {user: socket.currentUser})

    socket.on('sendNewMessage', async (data)=>{
        const { fromUser, text, toUserId, fromUserId, socketID } = data;
        console.log(socketID);
        // save message into database
        const messageInfor = { from: fromUserId, to: toUserId, text}
        const newMessage = await messageController.createMessage(messageInfor);
        if(newMessage){
            io.to(socketID).emit('newMessage', newMessage);
        }else{

        }
    })
})


module.exports = { httpServer };

