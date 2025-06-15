const { initializeApp } = require("firebase/app");
const {getAuth, signInWithEmailAndPassword} = require("firebase/auth");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getIdToken(email, password) {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();
    return token;
}

async function createAccount(account) {
    try {
        const user = await admin.auth().createUser({
            email: account.email,
            password: account.password,
            displayName: account.displayName,
        });

        return user;
    } catch (error) {
        console.error(error);
        return;
    }
}

async function getAccountId(account) {
    try {
        const user = await admin.auth().getUserByEmail(account.email);
        return user.uid;
    } catch (error) {
        console.error(error);
        return;
    }
}

module.exports = { getIdToken, createAccount, getAccountId};