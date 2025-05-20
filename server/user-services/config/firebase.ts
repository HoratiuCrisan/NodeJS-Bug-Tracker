import admin from 'firebase-admin';
const serviceAccount = require('./serviceAccount.json') as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://first-react-project-d49fb-default-rtdb.europe-west1.firebasedatabase.app"
});

export default admin;
 