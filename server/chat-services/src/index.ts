import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import chatRouter from './routes/chats';
import groupRouter from './routes/groups';
import { SocketService } from './service/socketService';
import { AppError, errorHandler } from '@bug-tracker/usermiddleware';
import env from "dotenv";
env.config();

/* Verify if the env data for the chat service was initialized */
if (!process.env.PORT || !process.env.CHAT_ROUTE || !process.env.GROUP_ROUTE || !process.env.CLIENT) {
    throw new AppError(`InvalidEnvData`, 500, `Invalid env data for chat service`);
}

const PORT = process.env.PORT;

/* Create a new express app and a initialize a new server */
const app = express();
const server = createServer(app);

/* Generate and initialize a new socket server */
const socketService = new SocketService();
socketService.initialize(server);

app.use(express.json());

/* Allow the client to send requests to the server */
app.use(cors({
    origin: `${process.env.CLIENT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

/* Call the api routers */
app.use(`${process.env.CHAT_ROUTE}`, chatRouter);
app.use(`${process.env.GROU_ROUTE}`, groupRouter);

/* Use the error handler middleware */
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Chat-Service listening on ${PORT}`);
});
