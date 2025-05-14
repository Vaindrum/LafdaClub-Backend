import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(express.json());

// const corsOptions = {
//     origin: process.env.ORIGIN, 
//     methods: "GET,POST,PUT,DELETE,PATCH",
//     allowedHeaders: "Content-Type,Authorization",
//     credentials: true, 
// };

app.use(cors());

// app.options("*", cors(corsOptions));

app.get('/api/test', (req, res) => {
    res.json({ message: "Test route working!" });
});


// app.all("*",(req,res) => {
//     res.status(404).json({message: "Backend working"});
// });

app.listen(PORT, async()=>{
    console.log("server is running on port PORT: " + PORT);
    connectDB();
})