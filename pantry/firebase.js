// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNdS3kL8MQRvJk4VOqwhDuu9LGsUv0fTo",
  authDomain: "headstarterpantryapp.firebaseapp.com",
  projectId: "headstarterpantryapp",
  storageBucket: "headstarterpantryapp.appspot.com",
  messagingSenderId: "58623559994",
  appId: "1:58623559994:web:288ddc2f4f67dbb462a803"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export {app, firestore}