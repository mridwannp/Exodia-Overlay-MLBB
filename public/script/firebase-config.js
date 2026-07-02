// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBDRsU7iA5xKRgNAUKrfWLqXyHGzF0f_VU",
  authDomain: "exodia-overlay.firebaseapp.com",
  databaseURL: "https://exodia-overlay-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "exodia-overlay",
  storageBucket: "exodia-overlay.firebasestorage.app",
  messagingSenderId: "780351210373",
  appId: "1:780351210373:web:a5396e2abb736e73c2faec",
  measurementId: "G-WS9QZPBFNR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
