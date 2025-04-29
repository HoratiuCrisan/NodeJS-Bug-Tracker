import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import chatRouter from './routes/chats';
import groupRouter from './routes/groups';
import { SocketService } from './service/socketService';
import { errorHandler } from '@bug-tracker/usermiddleware';

const port = 8003;

const app = express();
const server = createServer(app);

const socketService = new SocketService();
socketService.initialize(server);

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use("/api/conversations", chatRouter);
app.use("/api/groups", groupRouter);

app.use(errorHandler);

server.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
