import express from "express";
import cors from "cors";
import { PORT, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";

const app = express();

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