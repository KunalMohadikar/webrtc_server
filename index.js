var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/',(req,res,next)=>{
    res.send('Hello World');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('msg', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg+' received');
    });

    socket.on('join room',(room)=>{
        socket.join(room);
        console.log('joined '+room);
        socket.on('offer',(data)=>{
            // io.sockets.in(room).emit('event',data);
            console.log('offer in server '+room+': '+data);
            socket.broadcast.to(room).emit('receiveOffer',data);
        });
        socket.on('answer',(data)=>{
            console.log('answer in server '+room+': '+data);
            socket.broadcast.to(room).emit('receiveAnswer',data);
        });
        socket.on('candidate',(data)=>{
            console.log('answer in server '+room+': '+data);
            socket.broadcast.to(room).emit('receiveCandidate',data);
        });
    });

});

const port = process.env.PORT || 3000;
http.listen(port, ()=>{
    console.log('listening on port 3000');
})