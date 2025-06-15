import express from "express";
import cors from "cors";
import router from "./routes/notification";
import { AppError, errorHandler } from "@bug-tracker/usermiddleware";
import cron from "node-cron";
import { notificationSocketService } from "./service/socketService";
import { NotificationService } from "./service/notificationService";
import { RabbitMqConsumer } from "./service/rabbitmqConsumer";
import {createServer} from "http";
import env from "dotenv";
env.config();

/* Verify if the env data was initialized */
if (!process.env.PORT || !process.env.ROUTE || !process.env.CLIENT || !process.env.RABBITMQ_QUEUE) {
    throw new AppError(`InvalidEnvData`, 500, `Invalid env route and port data`);
}

const PORT = process.env.PORT;

/* Create a new express */
const app = express();
const server = createServer(app);
notificationSocketService.initialize(server);

app.use(express.json());

/* Allow the client to send requests to the server */
app.use(cors({
    origin: `${process.env.CLIENT}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

/* Call the service router */
app.use(`${process.env.ROUTE}`, router);

/* Implemente the error handling middleware */
app.use(errorHandler);


const notificationService = new NotificationService();

/* Initialize the rabbitmq consumer */
const rabbitmqConsumer = new RabbitMqConsumer();

/* Listen to the queue for notifications */
rabbitmqConsumer.listenToQueue(process.env.RABBITMQ_QUEUE).catch((err) => console.error(err));

/* Generate a schedule to delete notifications that are older than 30 days */
/* Each checking is done at local time midnight */
cron.schedule("0 0 * * *", async () => notificationService.deleteNotifications(30), {
    timezone: "UTC",
});

server.listen(PORT, () => {
    console.log(`Notification system running on port: ${PORT}`);
});

