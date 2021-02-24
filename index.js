var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var rooms = {};



app.get('/',(req,res,next)=>{
    res.send('Hello World');
});

io.on('connection', (socket) => {
    console.log(socket.id+' user connected');

    socket.on('msg', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg+' received');
    });
    socket.on('socketId',(id)=>{
        console.log('id: '+id);
        rooms.push(id);
        console.log(users);
    });
    
    // user joining room
    socket.on('join room',(data)=>{

        var dataObj = JSON.parse(data);
        var room = dataObj.room;
        socket.join(dataObj.room);
        socket.broadcast.to(rooms[dataObj.room]).emit('newUser',socket.id);
        io.sockets.to(socket.id).emit('getSocketId',socket.id);
        // socket.broadcast.to(dataObj.room).emit('userDisconnectedd',socket.id);

        socket.on('disconnect', () => {
            console.log(socket.id+' user disconnected');
            var rm = dataObj.room;
            console.log(rm);
            var socketId = socket.id;
            const index = rooms[rm].indexOf(socketId);
            console.log(index);
            if (index > -1) {
                console.log(rooms[rm]);
                rooms[rm].splice(index, 1);
            }
            if(rooms[rm].length == 0){
                delete rooms[rm];
            }
            console.log(rooms);
            socket.broadcast.to(dataObj.room).emit('userDisconnectedd',socket.id);
        });


        var rm = dataObj.room;
        if(!rooms.hasOwnProperty(dataObj.room)){
            rooms[rm] = [socket.id];
        }
        else{
            rooms[rm].push(socket.id);
        }
        console.log(rooms);

        socket.on('offer',(data)=>{
            // io.sockets.in(room).emit('event',data);
            var offerObj = JSON.parse(data);
            console.log('offer in server: '+data);
            // socket.broadcast.to(room).emit('receiveOffer',offerObj.offer);
            io.sockets.to(offerObj.toSocketId).emit('receiveOffer',data);
        });
        socket.on('answer',(data)=>{
            var answerObj = JSON.parse(data);
            console.log('answer in server '+room+': '+data);

            io.sockets.to(answerObj.toSocketId).emit('receiveAnswer',data);
        });
        socket.on('candidate',(data)=>{
            var candObj = JSON.parse(data);
            console.log('candidate in server '+room+': '+data);
            io.sockets.to(candObj.toSocketId).emit('receiveCandidate',data);
        });
    });

});

const port = process.env.PORT || 3000;
http.listen(port, ()=>{
    console.log('listening on port 3000');
})