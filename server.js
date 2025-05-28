import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import "./lib/passport.js"; 
import session from 'express-session';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js'
import productRoutes from './routes/product.route.js'
import cartRoutes from './routes/cart.route.js'
import orderRoutes from './routes/order.route.js'
import reviewRoutes from './routes/review.route.js'
import commentRoutes from './routes/comment.route.js'
import gameRoutes from './routes/game.route.js'
import statsRoutes from './routes/stats.route.js'

dotenv.config();

const app = express();

const PORT = process.env.PORT;


app.use(express.json({limit: '50mb'}));
 
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use(express.json()); 
app.use(cookieParser());

const corsOptions = {
    origin: process.env.ORIGIN, 
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, 
};

// app.use(cors());

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
}))


app.use(passport.initialize());
app.use(passport.session());
// app.get('/api/test', (req, res) => {
//     res.json({ message: "Test route working!" });
// });

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// app.all("*",(req,res) => {
//     res.status(404).json({message: "Backend working"});
// });


app.listen(PORT, async()=>{
    console.log("server is running on port PORT: " + PORT);
    connectDB();
})