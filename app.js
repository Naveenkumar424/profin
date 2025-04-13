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
    console.log("Couldn't connect to database");
});


async function main(){
    await mongoose.connect(MONGO_URL);
}

//root
app.get("/",(req,res)=>{
    res.redirect("/finance");
});

// Index route
app.get('/finance',async(req,res)=>{
    const Finances = await Finance.find();
    res.render("./finance/index",{finances:Finances});
});

//new route
app.get("/finance/new",(req,res)=>{
    res.render("./finance/new");
});


//create route
app.post("/finance",async(req,res)=>{
    const newFinance = new Finance(req.body.finance);
    await newFinance.save().then(()=>{
        console.log("New Finance Created");
    }).catch((err)=>{
        console.log("Error:",err);
    });
    res.redirect("/finance");
});

//delete route
app.delete("/finance/:id",async(req,res)=>{
    const {id} = req.params;
    await Finance.findByIdAndDelete(id);
    res.redirect("/finance");
});



app.get('/finance/goals',(req,res)=>{
    res.send("Welcome ,Here you can set your goals...");
});

app.get('/finance/tax',(req,res)=>{
    res.send("Welcome ,Here you can calculate your tax...");
});

app.listen('8080',()=>{
    console.log("App listening on Port 8080");
});