import { LogMessage } from "../utils/types/Log";
import admin from "../config/firebase";

const db = admin.firestore();

export class LogRepository {

    async createLog(document: string, data: LogMessage) {
        return await db.collection("Logs").doc(document).set({
            messages: admin.firestore.FieldValue.arrayUnion(data)
        });
    }

    async appendLog(document: string, data: LogMessage) {
        return await db.collection("Logs").doc(document).update({
            messages: admin.firestore.FieldValue.arrayUnion(data)
        });
    }

    async getLog(document: string) {
        return await db.collection("Logs").doc(document).get();
    }
}