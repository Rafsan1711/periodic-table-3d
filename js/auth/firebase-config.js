/**
 * Firebase Configuration
 * Initialize Firebase services
 */

// Firebase configuration (তোমার নিজের config দিয়ে replace করবে)
const firebaseConfig = {
     apiKey: "AIzaSyBW6jjj-SYrPBBoP7HtDFZrh1IfchI8XMg",
    authDomain: "periodic-table-4f7de.firebaseapp.com",
    databaseURL: "https://periodic-table-4f7de-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "periodic-table-4f7de",
    storageBucket: "periodic-table-4f7de.firebasestorage.app",
    messagingSenderId: "835795684207",
    appId: "1:835795684207:web:1f164c847fbc46a637f69a",
    measurementId: "G-8QK8RX3ZLY"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.database();
const analytics = getAnalytics(app);
console.log('✅ Firebase initialized');
