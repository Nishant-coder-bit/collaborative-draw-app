import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { client } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await client.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    // const parsedData = Sign.safeParse(req.body);
    // if (!parsedData.success) {
    //     res.json({
    //         message: "Incorrect inputs"
    //     })
    //     return;
    // }
    const parsedData = req.body;
    // TODO: Compare the hashed pws here
    let user = await client.user.findFirst({
        where: {
            email: parsedData.email,
            password: parsedData.password
        }
    })

    if (!user) {
        user = await client.user.create({
            data: {
                email: parsedData.email,
                // TODO: Hash the pw
                password: parsedData.password,
                name:"nishant"
            }
        }) 
    }
 console.log("user inside signin",user);
    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET, { expiresIn: '1h' });

    res.json( {
        id: user.id,
        name: user.name,
        email: user.email,
        acessToken:token,
      });
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;
    console.log("inside create room",userId);
    try {
        const room = await client.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await client.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await client.room.findFirst({
        where: {
            id:Number(slug)
        }
    });
     console.log("inside http backend get room id",room);
    res.json({
        room
    })
})

app.listen(3001);