import {WebSocket, WebSocketServer} from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import {client} from '@repo/db/client';
const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server started on ws://localhost:8080');
interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}
const users: User[] = [];
function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
    
        if (typeof decoded == "string") {
          return null;
        }
    
        if (!decoded || !decoded.userId) {
          return null;
        }
    
        return decoded.userId;
      } catch(e) {
        return null;
      }
      return null;
}
wss.on('connection',(ws,req)=>{
    const url = req.url;
    if(!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || '';
    const userId = checkUser(token);
    if(!userId) {
        ws.close();
        return null;
    }
    users.push({
        ws,
        rooms:[],
        userId
    })
    ws.on('message',async function(data){
       let parsedData;
       if(typeof data !== "string"){
           parsedData = JSON.parse(data.toString());
       } else {
         parsedData = JSON.parse(data);
       }

       if(parsedData.type === "join-room"){
        const user = users.find(user => user.ws === ws);

        user?.rooms.push(parsedData.roomId);
       }
       if(parsedData.type === "leave-room"){
        const user = users.find(user => user.ws === ws);
        if(!user){
            return;
        }
        user.rooms = user?.rooms.filter(x=> x=== parsedData.roomId);
       }
       console.log("message received")
       console.log(parsedData)
       if(parsedData.type === "chat"){
        const roomId = parsedData.roomId;
        const message = parsedData.message;
         
        await client.chat.create({
            data:{
                roomId: Number(roomId),
                message,
                userId
            }
        });    
        users.forEach(user =>{
            if(user.rooms.includes(roomId)){
                user.ws.send(JSON.stringify({
                    type: "chat",
                    roomId,
                    message:message,
                    userId
                }))
            }
        })
       }
    })
})