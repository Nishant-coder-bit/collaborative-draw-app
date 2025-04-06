import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import {client} from '@repo/db/client';
const app = express();
app.use(express.json());
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from '@repo/common/types';
import { middleware } from './middleware';
const PORT =  3001;

app.post('/signup', async(req, res) => {
    //db call
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message:"Incorrect data",
        })
        return;
    }
    try{
        const user = await client.user.create({
            data:{
                email: parsedData.data?.username,
                //Todo hash the pw
                password: parsedData.data?.password,
                name: parsedData.data?.name,
            }
        })
        res.json({
            userId:user.id
        })

    }
    catch(e){
        console.log(e);
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
 
});

app.post('/signin', async(req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message:"Incorrect data",
        })
        return;
    }
    // Todo: Compare the hashed pws here
    const user = await client.user.findFirst({
        where:{
            email: parsedData.data.username,
            password: parsedData.data.password,
        }
    });
    if(!user) {
        res.status(401).json({
            message: "Invalid credentials"
        })
        return;
    }
     const token = jwt.sign({
        //@ts-ignore
       userId: user.id
     },JWT_SECRET);
    res.send({
        token
    });
});

app.post('/room',middleware, async(req, res) => {
     const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message:"Incorrect data",
        })
        return;
    }
    // @ts-ignore : Todo fix this
    const userId = req.userId;
    try{
      const room = await client.room.create({
        data:{
            slug: parsedData.data.name,
            adminId: userId
        }
    });
     res.json({
        roomId: room.id
     })
    }catch(e){
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
});

app.get('/room/:roomId',middleware, async(req, res) => {
     try{
       const roomId = Number(req.params.roomId);
       console.log(req.params.roomId);
       const messages = await client.chat.findMany({
        where:{
            roomId: roomId
        },
        orderBy:{
            id:"desc"
        },
        take: 100
       });
       res.json({
        messages
       })
     }catch(e){
        console.log(e);
        res.json({
            message:[]
        })
     }
});


app.listen(PORT, () => {
 console.log(`Server is running again on http://localhost:${PORT}`);
});
