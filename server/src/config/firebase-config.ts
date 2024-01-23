const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccount");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://first-react-project-d49fb-default-rtdb.europe-west1.firebasedatabase.app"
});
 