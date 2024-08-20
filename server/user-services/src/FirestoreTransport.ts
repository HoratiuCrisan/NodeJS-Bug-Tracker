import admin from "../config/firebase";
import TransportStream from "winston-transport";
const db = require("firebase-admin").firestore();

interface FirestoreTransportOptions extends TransportStream.TransportStreamOptions {
    collectionName: string;
  }
  
  class FirestoreTransport extends TransportStream {
    private collectionName: string;
  
    constructor(options: FirestoreTransportOptions) {
      super(options);
      this.collectionName = options.collectionName;
    }
  
    async log(info: any, callback: () => void) {
      setImmediate(() => {
        this.emit('logged', info);
      });
  
      const { level, message, timestamp } = info;
      try {
        await db.collection(this.collectionName).add({
          level,
          message,
          timestamp: timestamp || new Date(),
        });
        callback();
      } catch (error) {
        console.error('Error writing log to Firestore:', error);
        callback();
      }
    }
  }
  
  export default FirestoreTransport;