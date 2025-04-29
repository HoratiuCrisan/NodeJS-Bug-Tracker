import express from 'express';
import cors from 'cors';
import router from './routes/users';
import { errorHandler } from '@bug-tracker/usermiddleware';
import { SocketService } from './service/socketService';
import { createServer } from 'http';
import { UserConsumer } from './service/userConsumer';

const port = 8002;

const app = express();
const server = createServer(app);

const socketService = new SocketService();
socketService.initialize(server);

const corsOptions = {
    origin: "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', router);
app.use(errorHandler);

const userConsumer = new UserConsumer();
userConsumer.listenToUserQueue("users").catch((err) => console.error(err));

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})