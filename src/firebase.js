// src/firebase.js

// import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// export { RecaptchaVerifier, signInWithPhoneNumber };

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCGgxUKz9tXt3tbVxHHPRQnjZr3ybw5CaQ",
  authDomain: "codequest-c7701.firebaseapp.com",
  projectId: "codequest-c7701",
  storageBucket: "codequest-c7701.firebasestorage.app",
  messagingSenderId: "530694315193",
  appId: "1:530694315193:web:06040eaccfbcf9ccb48f68",
  measurementId: "G-YGLMH4HS0F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber };
