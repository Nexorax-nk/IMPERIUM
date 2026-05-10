import express from "express";
import dotenv from "dotenv";
import { ConnectDB } from "./db/db.js";

dotenv.config();

const app = express();

//get/post functions and stuff
app.get("/", (req, res) => {
    res.send("home page");
});

//other functions
function generateRandomPass(){
    const teamid = "124";
    return teamid;
}

app.listen(8080, () => {
    ConnectDB();
    console.log("sever is now running");
});