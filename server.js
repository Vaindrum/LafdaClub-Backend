import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js'
import productRoutes from './routes/product.route.js'

dotenv.config();

const app = express();

const PORT = process.env.PORT;


app.use(express.json({limit: '50mb'}));
 
 app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use(express.json()); 
app.use(cookieParser());

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

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);


// app.all("*",(req,res) => {
//     res.status(404).json({message: "Backend working"});
// });

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
}))

app.listen(PORT, async()=>{
    console.log("server is running on port PORT: " + PORT);
    connectDB();
})