import express from "express";
import cors from "cors";
import { PORT, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import teamRouter from "./routes/team.routes.js";
import taskRouter from "./routes/tasks.routes.js";


const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/teams', teamRouter);
app.use("/api/v1/tasks", taskRouter);


app.use(errorHandler);



app.get("/", (req, res) => {
    res.json({
        status : "active",
        version : '1.0.0',
        message : "Taskflow-API is Running"
    })
})

app.listen(PORT, async() => {
    console.log(`Server is listening on http://localhost:${PORT}`);
    await connectToDatabase();
})