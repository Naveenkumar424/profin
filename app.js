const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// Import Firebase modules correctly
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword } = require("firebase/auth");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBuivDdvluDDClxATsuBmIvzSB9d4QL3Yk",
    authDomain: "profin-af77e.firebaseapp.com",
    projectId: "profin-af77e",
    storageBucket: "profin-af77e.appspot.com",
    messagingSenderId: "726610950490",
    appId: "1:726610950490:web:7a1278a30981e815dc1b63",
    measurementId: "G-QS2ESZ7T59"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);

// Use the initialized Firebase instance to create Firestore and Auth instances
const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);

// ✅ Corrected Sign-In Route
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Signed in user:", user);
            res.redirect("/home");
        })
        .catch((error) => {
            console.error("Error signing in:", error.code, error.message);
            res.status(401).send("Invalid credentials: " + error.message);
        });
});


// ✅ Corrected Sign-Up Route
app.post("/signup", (req, res) => {
    const { email, password } = req.body;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("New user created:", user);
            res.redirect("/home");
        })
        .catch((error) => {
            console.error("Error signing up:", error.code, error.message);
            res.status(400).send("Error creating account: " + error.message);
        });
});

const isAuthenticated = (req, res, next) => {
    const user = auth.currentUser; // Firebase stores the currently signed-in user

    if (user) {
        return next();
    } else {
        res.status(401).send(`<script>alert("You must be signed in first!"); window.location.href='/profin';</script>`);
    }
};



app.get("/profin",(req,res)=>{
    res.render("./finance/index.ejs");
});

app.get("/home",isAuthenticated,(req,res)=>{
    res.render("./finance/profin.ejs");
});

app.listen(8080,(req,res)=>{
    console.log("Server is running on port 8080");
});