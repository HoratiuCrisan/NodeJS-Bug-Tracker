import express from "express";
import cors from "cors";
import router from "./routes/notification";
import { AppError, errorHandler } from "@bug-tracker/usermiddleware";
import cron from "node-cron";
import { NotificationService } from "./service/notificationService";
import { RabbitMqConsumer } from "./service/rabbitmqConsumer";
import env from "dotenv";
env.config();

/* Verify if the env data was initialized */
if (!process.env.PORT || !process.env.ROUTE || !process.env.CLIENT || !process.env.RABBITMQ_QUEUE) {
    throw new AppError(`InvalidEnvData`, 500, `Invalid env route and port data`);
}

/* Create a new express */
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

/* Allow the client to send requests to the server */
app.use(cors({
    origin: `${process.env.CLIENT}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
}));

/* Call the service router */
app.use(`${process.env.ROUTE}`, router);

/* Implemente the error handling middleware */
app.use(errorHandler);

/* Initialize the notification service */
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

app.listen(PORT, () => {
    console.log(`Notification system running on port: ${PORT}`);
});

