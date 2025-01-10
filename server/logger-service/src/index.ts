import express from 'express';
import cors from 'cors';
import { RabbitMqConsumer } from './rabbitMqConsumer';
import logsRouter from './routes/loggs'

const app = express();
const PORT = 8005;

app.use(express.json());

app.use(cors({
    origin: 'https://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use("/api/loggs/", logsRouter);

const rabbitMq = new RabbitMqConsumer();
rabbitMq.listenToLogs().catch((err) => console.error(err));

app.listen(PORT, () => {
    console.log(`Logging service running on port: ${PORT}`);
});
