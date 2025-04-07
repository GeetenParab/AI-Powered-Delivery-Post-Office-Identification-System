import express from "express";
import dotenv from "dotenv";

// import cookieParser from "cookie-parser";

// import connectToMongoDb from "./Db/connectToDb.js";


const app = express();

const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(express.json());
// app.use(cookieParser());
import  uploadRoute from "./Routes/upload.js"


app.use("/api/upload",uploadRoute);

app.listen(5000,()=>{
    // connectToMongoDb();
    console.log(`server is running on port ${PORT}`)
});