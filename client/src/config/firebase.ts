import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
//import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwuUXLMw0FgcQeV5muthGiVcT53ow6ILQ",
  authDomain: "first-react-project-d49fb.firebaseapp.com",
  databaseURL: "https://first-react-project-d49fb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "first-react-project-d49fb",
  storageBucket: "first-react-project-d49fb.appspot.com",
  messagingSenderId: "1028392121065",
  appId: "1:1028392121065:web:08dbc80cc2e44123677678",
  measurementId: "G-5X2034PV8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
//const analytics = getAnalytics(app);