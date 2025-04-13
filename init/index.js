const mongoose = require("mongoose");
const initData = require("./data");
const Finance = require("../models/finance");

MONGO_URL = "mongodb://127.0.0.1:27017/Finance";

main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log("Couldn't connect to DB cause of ",err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Finance.deleteMany();
    await Finance.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();