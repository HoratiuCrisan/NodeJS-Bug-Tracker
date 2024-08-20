import express, { Request, Response } from 'express';
import cors from 'cors';
import admin from '../config/firebase';
import logger from './logger';

const db = admin.firestore();
const app = express();
const port = 8005;

app.use(express.json());

app.use(cors({
    origin: 'https://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.post("api/logs", (req: Request, res: Response) => {
    const { microservice, message } = req.body;

    if (!microservice || !message) {
        return res.status(400).send({error: 'Microservice and message are required'});
    }

    logger.info(`[${microservice}] ${message}`);
    res.status(200).send('Log entry created');
});

app.get("/api/logs", async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('Logs').get();
        const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data()}));
        res.status(200).send({logs});
    } catch (error) {
        console.error("Failed to fetch logs");
        res.status(500).send({error: "Error at fetching logs."});
    }
});

app.listen(port, () => {
    //logger.info(`Logger is listening on port ${port}`);
});
