import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
const app = express();
import {CreateUserSchema} from '@repo/common/types';
const PORT = process.env.PORT || 3000;

app.post('/signup', (req, res) => {
    //db call
    res.send({
        userId:123
    })
});

app.post('/signin', (req, res) => {
     const token = jwt.sign({
        //@ts-ignore
       userId: 123
     },JWT_SECRET);
    res.send({
        token
    });
});
app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`);
});
