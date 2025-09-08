// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue, push, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

//Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAnN00X8vQkJr1MGwhYLOhIIkJp67fR9Y4",
    authDomain: "lawglitch-chat.firebaseapp.com",
    databaseURL: "https://lawglitch-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "lawglitch-chat",
    storageBucket: "lawglitch-chat.firebasestorage.app",
    messagingSenderId: "627352226661",
    appId: "1:627352226661:web:8542fd84b187a776ff2f8c",
    measurementId: "G-4ZLS34EP4Z"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
