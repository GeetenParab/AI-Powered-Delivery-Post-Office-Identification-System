import express from "express";
import dotenv from "dotenv";
import cors from 'cors'

// import cookieParser from "cookie-parser";


const app = express();

const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(cors());

app.use(express.json());
// app.use(cookieParser());
import  uploadRoute from "./Routes/upload.js"
import  validateRoute from "./Routes/validate-pin.js"
import connectToMongoDb from "./utils/connectToDb.js";

app.use("/api/upload",uploadRoute);
app.use("/api/validate-pin",validateRoute);




app.listen(5000,()=>{
    connectToMongoDb();
    console.log(`server is running on port ${PORT}`)
});