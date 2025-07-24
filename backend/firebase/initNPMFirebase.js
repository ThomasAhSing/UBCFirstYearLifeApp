// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIkbBeKYx_xouaQMFF-7M_pija2maoTXM",
  authDomain: "ubcfirstyearlifeapp.firebaseapp.com",
  projectId: "ubcfirstyearlifeapp",
  storageBucket: "ubcfirstyearlifeapp.firebasestorage.app",
  messagingSenderId: "962800030316",
  appId: "1:962800030316:web:a27a0972b2fa2e0f853e49",
  measurementId: "G-F2CNJJX2J3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


/////////////////// DO npm install firebase ///////////////