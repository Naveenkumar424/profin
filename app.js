const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Finance = require("./models/finance");
const path = require("path");
const methodOverride = require("method-override");
const ejs_mate = require("ejs-mate");
const { url } = require("inspector");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejs_mate);
app.use(express.static(path.join(__dirname,"public")));

MONGO_URL = "mongodb://127.0.0.1:27017/Finance";

main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("Error:",err);
});


async function main(){
    await mongoose.connect(MONGO_URL);
}

// Index route
app.get('/finance',async(req,res)=>{
    const Finances = await Finance.find();
    res.render("./finance/index",{finances:Finances});
});

app.listen('8080',()=>{
    console.log("App listening on Port 8080");
});