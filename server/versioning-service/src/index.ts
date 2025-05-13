import express from "express";
import cors from "cors";
import router from "./routes/versioning";
import { AppError, errorHandler } from "@bug-tracker/usermiddleware";
import { RabbitMqConsumer } from "./service/rabbtimqConsumer";
import env from "dotenv";
env.config();

/* Verify if the env data was initialized */
if (!process.env.PORT || !process.env.ROUTE || !process.env.CLIENT || !process.env.VERSIONS_QUEUE) {
    throw new AppError(`InvalidEnvData`, 500, `Failed to initialize version service env data`);
}

/* Create a new express application */
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

/* Allow the client to send requests to the server */
app.use(cors({
    origin: `${process.env.CLIENT}`,
    methods: ["POST", "GET", "PUT", "DELETE"],
}));

/* Call the version service router */
app.use(`${process.env.ROUTE}`, router);

/* Call the error handler middleware */
app.use(errorHandler);

const versionConsumer = new RabbitMqConsumer();
versionConsumer.listenToQueue(`${process.env.VERSIONS_QUEUE}`).catch((error) => console.error(error));

app.listen(PORT, () => {
    console.log(`Versioning system running on port: ${PORT}`);
});