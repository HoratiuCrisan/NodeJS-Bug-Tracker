import FirestoreTransport from "./FirestoreTransport";
import winston from "winston";

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });
  
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      customFormat
    ),
    transports: [
      new winston.transports.Console(),
      new FirestoreTransport({
        collectionName: 'Logs',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ],
  });
  
  export default logger;