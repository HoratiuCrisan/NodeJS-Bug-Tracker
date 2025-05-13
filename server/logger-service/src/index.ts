import express from 'express';
import cors from 'cors';
import { RabbitMqConsumer } from './service/rabbitMqConsumer';
import logsRouter from './routes/loggs'
import { errorHandler, AppError } from "@bug-tracker/usermiddleware";
import env from "dotenv";
env.config();

/* Verify if the env data was initialized */
if (!process.env.PORT || !process.env.CLIENT || !process.env.ROUTE || !process.env.RABBITMQ_QUEUE) {
    throw new AppError(`InvalidEnvData`, 500, `Invalid log service env data`);
}

/* Generate a new express server */
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

/* Allow the client to send requests */
app.use(cors({
    origin: `${process.env.CLIENT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

/* Call the router */
app.use(`${process.env.ROUTE}`, logsRouter);
app.use(errorHandler);

/* Initialized the rabbitmq log consumer */
const rabbitMq = new RabbitMqConsumer();
rabbitMq.listenToQueue(`${process.env.RABBITMQ_QUEUE}`).catch((err) => console.error(err));

app.listen(PORT, () => {
    console.log(`Logging service running on port: ${PORT}`);
});
