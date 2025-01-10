require('dotenv').config();
import express from "express";
import cors from 'cors';
import ticketRouter from "./routes/tickets";
import cron from "node-cron";
import { createServer } from "http";
import { TicketController } from "./controllers/ticketController";
import {limitAccess} from '#/middleware/requestsLimiter'
 
const app = express();
const PORT = 8000;
const server = createServer(app);

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json())

app.use(limitAccess)
app.use("/api/tickets/", ticketRouter);


cron.schedule('30 * * * *', async () => {
    /* Run the scheduler every 30 minutes and check for upcoming ticket deadlines */
    console.log("Running scheduled task to check for upcoming ticket deadlines...");
    TicketController.checkUpcomingTicketDeadline();
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});
