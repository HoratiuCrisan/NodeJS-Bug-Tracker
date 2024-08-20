import express from 'express';
import cors from 'cors';
import router from './routes/users';

const app = express();
const port = 8002;

const corsOptions = {
    origin: "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', router);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})