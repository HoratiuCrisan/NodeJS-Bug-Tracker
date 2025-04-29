import express from "express";
import cors from "cors";
import router from "./routes/notification";
import { errorHandler } from "@bug-tracker/usermiddleware";
import cron from "node-cron";
import { NotificationService } from "./service/notificationService";
import { RabbitMqConsumer } from "./service/rabbitmqConsumer";

const app = express();
const PORT = 8004;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET", "PUT", "DELETE"],
}));

app.use("/api/notifications", router);
app.use(errorHandler);

const notificationService = new NotificationService();
const rabbitmqConsumer = new RabbitMqConsumer();

rabbitmqConsumer.listenToQueue("notifications").catch((err) => console.error(err));

cron.schedule("0 0 * * *", async () => notificationService.deleteNotifications(30), {
    timezone: "UTC",
});

app.listen(PORT, () => {
    console.log(`Notification system running on port: ${PORT}`);
});

