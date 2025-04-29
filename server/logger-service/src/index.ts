import express from 'express';
import cors from 'cors';
import { RabbitMqConsumer } from './service/rabbitMqConsumer';
import logsRouter from './routes/loggs'
import { errorHandler } from "@bug-tracker/usermiddleware";

const app = express();
const PORT = 8005;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use("/api/logs/", logsRouter);
app.use(errorHandler);

const rabbitMq = new RabbitMqConsumer();
rabbitMq.listenToQueue("logger").catch((err) => console.error(err));

app.listen(PORT, () => {
    console.log(`Logging service running on port: ${PORT}`);
});
