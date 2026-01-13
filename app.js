import express from "express";
import cors from "cors";
import { PORT, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";


const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.use('/api/v1/auth', authRouter);
console.log('✅ Auth routes registered at /api/v1/auth');

app.use(errorHandler);



app.get("/", (req, res) => {
    res.json({
        status : "active",
        version : '1.0.0',
        message : "Taskflow-API is Running"
    })
})

app.post('/test', (req, res) => {
  res.json({ message: 'POST works!', body: req.body });
});

app.listen(PORT, async() => {
    console.log(`Server is listening on http://localhost:${PORT}`);
    await connectToDatabase();
})