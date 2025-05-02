
// public/js/auth.js
// Firebase Authentication
alert("Firebase authentication running..");
document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBuivDdvluDDClxATsuBmIvzSB9d4QL3Yk",
        authDomain: "profin-af77e.firebaseapp.com",
        projectId: "profin-af77e",
        storageBucket: "profin-af77e.firebasestorage.app",
        messagingSenderId: "726610950490",
        appId: "1:726610950490:web:7a1278a30981e815dc1b63",
        measurementId: "G-QS2ESZ7T59"
    };

  
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Reference to auth and firestore
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('index.html') || currentPage === '/') {
          // Redirect to dashboard if on login page
          window.location.href = 'dashboard.html';
        } else if (currentPage.includes('dashboard.html')) {
          // Set user display name in dashboard
          const userDisplayName = document.getElementById('userDisplayName');
          if (userDisplayName) {
            userDisplayName.textContent = user.displayName || user.email;
          }
          
          // Load user's transactions
          if (typeof loadTransactions === 'function') {
            loadTransactions();
          }
        }
      } else {
        // No user is signed in
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('dashboard.html')) {
          // Redirect to login page if on dashboard
          window.location.href = 'index.html';
        }
      }
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        auth.signInWithEmailAndPassword(email, password)
          .then(() => {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          })
          .catch(error => {
            alert('Error: ' + error.message);
          });
      });
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
          .then(userCredential => {
            // Update user profile with name
            return userCredential.user.updateProfile({
              displayName: name
            });
          })
          .then(() => {
            // Create user document in Firestore
            return db.collection('users').doc(auth.currentUser.uid).set({
              name: name,
              email: email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          })
          .then(() => {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          })
          .catch(error => {
            alert('Error: ' + error.message);
          });
      });
    }
    
    // Google login
    const googleLogin = document.getElementById('googleLogin');
    if (googleLogin) {
      googleLogin.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(() => {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          })
          .catch(error => {
            alert('Error: ' + error.message);
          });
      });
    }
    
    // Google signup
    const googleSignup = document.getElementById('googleSignup');
    if (googleSignup) {
      googleSignup.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(result => {
            // Check if user is new
            if (result.additionalUserInfo.isNewUser) {
              // Create user document in Firestore
              return db.collection('users').doc(auth.currentUser.uid).set({
                name: result.user.displayName,
                email: result.user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            }
          })
          .then(() => {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
          })
          .catch(error => {
            alert('Error: ' + error.message);
          });
      });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        auth.signOut()
          .then(() => {
            window.location.href = 'index.html';
          })
          .catch(error => {
            alert('Error: ' + error.message);
          });
      });
    }
  });
  