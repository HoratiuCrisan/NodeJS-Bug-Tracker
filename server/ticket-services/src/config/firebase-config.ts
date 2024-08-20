const {getFirestore} = require('firebase-admin/firestore')
import firestore from 'firebase-admin/auth'
import * as admin from 'firebase-admin';
import * as serviceAccount from "./serviceAccount.json"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://first-react-project-d49fb-default-rtdb.europe-west1.firebasedatabase.app"
});

export default admin;
 
 