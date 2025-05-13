import express from 'express';
import cors from 'cors';
import router from './routes/users';
import { AppError, errorHandler } from '@bug-tracker/usermiddleware';
import { SocketService } from './service/socketService';
import { createServer } from 'http';
import { UserConsumer } from './service/userConsumer';
import env from "dotenv";
env.config();

/* Verify if the env data was initialized */
if (!process.env.CLIENT || !process.env.PORT || !process.env.RABBITMQ_QUEUE || !process.env.ROUTE) {
    throw new AppError(`InvalidEnvData`, 500, `Invalid user service env data`);
}

const PORT = process.env.PORT;

/* Create a new express app and initialize a server */
const app = express();
const server = createServer(app);

/* Create a new socket server and initialize it with the express server */
const socketService = new SocketService();
socketService.initialize(server);

/* Allow the client to send requests to the server */
const corsOptions = {
    origin: `${process.env.CLIENT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

/* Call the user service router */
app.use(`${process.env.ROUTE}`, router);

/* Call the error handler middleware */
app.use(errorHandler);

/* Generate the rabbitmq user consumer */
const userConsumer = new UserConsumer();

/* Listen to the users queue for messages */
userConsumer.listenToUserQueue(`${process.env.RABBITMQ_QUEUE}`).catch((err) => console.error(err));

app.listen(PORT, () => {
    console.log(`User service is listening on port ${PORT}`);
})