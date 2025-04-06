import {WebSocketServer} from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server started on ws://localhost:8080');

wss.on('connection',(ws,req)=>{
    ws.on('message',function(message){
        ws.send(`Server received: ${message}`);
    })
})