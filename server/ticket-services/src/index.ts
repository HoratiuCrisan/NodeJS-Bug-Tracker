import express from "express";
import cors from 'cors';
import ticketRouter from "./routes/tickets";
import cron from "node-cron";
import { TicketService } from "./services/ticketService";
import { limitAccess } from "./middleware/requestsLimiter";
import { errorHandler } from "@bug-tracker/usermiddleware";
 
const app = express();
const PORT = 8000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json())

app.use(limitAccess);
app.use(errorHandler);
app.use("/api/tickets", ticketRouter);

const ticketService = new TicketService();

cron.schedule('1 * * * *', async () => {
    /* Run the schedule at minute 1 at every hour every day */
    console.log("Running scheduled task to check for upcoming ticket deadlines...");
    await ticketService.checkUpcomingTicketDeadline();
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});
