const socketIO = require('socket.io');
const http = require('http');

const { app } = require('./app');
const httpServer = http.createServer(app);

const io = socketIO(httpServer);

io.on('connect', (socket)=>{
    console.log(`New connection from Client `, socket.id);
});


module.exports = { httpServer };

