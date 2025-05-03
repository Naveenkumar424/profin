const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejs_mate = require("ejs-mate");
const axios = require("axios");
const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");

// Initialize Express app
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejs_mate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "firebase")));

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
if (!firebase.apps.length()) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    const user = auth.currentUser;
    if (user) {
        req.user = user;
        next();
    } else {
        res.redirect('/profin');
    }
};

// Authentication routes
app.get('/profin', (req, res) => {
    res.render("./finance/auth");
});

// Dashboard route
app.get('/finance', isAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const financesSnapshot = await db.collection('finances')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .get();
        
        const finances = [];
        financesSnapshot.forEach(doc => {
            finances.push({
                _id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            });
        });

        res.render("./finance/index", { finances, user });
    } catch (error) {
        console.error("Error fetching finances:", error);
        res.status(500).send("Error fetching finances");
    }
});

// New transaction form
app.get("/finance/new", isAuthenticated, (req, res) => {
    res.render("./finance/new");
});

// Create new transaction
app.post("/finance", isAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const { name, amount, date, category } = req.body.finance;
        
        const newFinance = {
            name,
            amount: Number(amount),
            date: new Date(date),
            category,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('finances').add(newFinance);
        res.redirect("/finance");
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).send("Error creating transaction");
    }
});

// Delete transaction
app.delete("/finance/:id", isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        // Verify ownership
        const doc = await db.collection('finances').doc(id).get();
        if (!doc.exists || doc.data().userId !== user.uid) {
            return res.status(403).send("Not authorized");
        }
        
        await db.collection('finances').doc(id).delete();
        res.redirect("/finance");
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).send("Error deleting transaction");
    }
});

// Goals route
app.get('/finance/goals', isAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const goalsSnapshot = await db.collection('goals')
            .where('userId', '==', user.uid)
            .get();
        
        const goals = [];
        goalsSnapshot.forEach(doc => {
            goals.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.render("./finance/goals", { goals, user });
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).send("Error fetching goals");
    }
});

// Create new goal
app.post("/finance/goals", isAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const { title, targetAmount, deadline, currentAmount } = req.body.goal;
        
        const newGoal = {
            title,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount) || 0,
            deadline: new Date(deadline),
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('goals').add(newGoal);
        res.redirect("/finance/goals");
    } catch (error) {
        console.error("Error creating goal:", error);
        res.status(500).send("Error creating goal");
    }
});

// Tax route - fetch and display tax information
app.get('/finance/tax', isAuthenticated, async (req, res) => {
    try {
        // Fetch tax regime data from an API
        const taxData = await fetchTaxRegimeData();
        
        // Get user's financial data for tax calculations
        const user = req.user;
        const financesSnapshot = await db.collection('finances')
            .where('userId', '==', user.uid)
            .where('name', '==', 'credit')
            .get();
        
        let totalIncome = 0;
        financesSnapshot.forEach(doc => {
            totalIncome += doc.data().amount;
        });
        
        res.render("./finance/tax", { taxData, totalIncome, user });
    } catch (error) {
        console.error("Error fetching tax data:", error);
        res.status(500).send("Error fetching tax data");
    }
});

// Function to fetch tax regime data from an API
async function fetchTaxRegimeData() {
    try {
        // For demo purposes, we'll use a mock API response
        // In a real application, you would use something like:
        // const response = await axios.get('https://api.example.com/tax-regimes');
        // return response.data;
        
        // Mockup tax data based on India's current tax regime
        return {
            regimes: [
                {
                    name: "New Tax Regime",
                    slabs: [
                        { income: "Up to ₹3,00,000", rate: "0%" },
                        { income: "₹3,00,001 to ₹6,00,000", rate: "5%" },
                        { income: "₹6,00,001 to ₹9,00,000", rate: "10%" },
                        { income: "₹9,00,001 to ₹12,00,000", rate: "15%" },
                        { income: "₹12,00,001 to ₹15,00,000", rate: "20%" },
                        { income: "Above ₹15,00,000", rate: "30%" }
                    ]
                },
                {
                    name: "Old Tax Regime",
                    slabs: [
                        { income: "Up to ₹2,50,000", rate: "0%" },
                        { income: "₹2,50,001 to ₹5,00,000", rate: "5%" },
                        { income: "₹5,00,001 to ₹10,00,000", rate: "20%" },
                        { income: "Above ₹10,00,000", rate: "30%" }
                    ],
                    deductions: [
                        { name: "Standard Deduction", amount: "₹50,000" },
                        { name: "Section 80C", amount: "Up to ₹1,50,000" },
                        { name: "Section 80D", amount: "Up to ₹25,000" },
                        { name: "Section 80TTA", amount: "Up to ₹10,000" }
                    ]
                }
            ],
            lastUpdated: "May 2025"
        };
    } catch (error) {
        console.error("Error fetching tax data:", error);
        return {
            regimes: [],
            error: "Failed to fetch tax data"
        };
    }
}

app.listen('8080', () => {
    console.log("App listening on Port 8080");
});