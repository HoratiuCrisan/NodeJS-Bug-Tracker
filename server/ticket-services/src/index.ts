require('dotenv').config()
import { Response, Request, NextFunction } from "express"
import express from "express"
import cors from 'cors'
import admin from "./config/firebase-config";
import ticketRouter from "./routes/tickets";
import { Ticket } from "./utils/interfaces/Ticket";
const db = require("firebase-admin").firestore();
import cron from "node-cron"
import { createServer } from "http";
import { Server } from "socket.io";
 
const app = express();
const PORT = 8000;
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json())

const accessCounts = new Map<string, { count: number, timestamp: number }>();

// Middleware function to limit access
function limitAccess(req: Request, res: Response, next: NextFunction) {
    const userIp = req.ip; // Retrieve user IP address
    const method = req.method;
    const route = req.originalUrl;

    const key = `${userIp}-${method}-${route}`;

    // Check if the user has accessed the route before
    if (!accessCounts.has(key)) {
        accessCounts.set(key, {
            count: 1,
            timestamp: Date.now()
        });
    } else {
        const accessData = accessCounts.get(key);
        const currentTime = Date.now();

        if (accessData === undefined) 
            return

        // Check if the time limit has elapsed
        if (currentTime - accessData.timestamp > 60000) { // 60 seconds
            accessCounts.set(key, {
                count: 1,
                timestamp: currentTime
            });
        } else {
            // Check if the access count has exceeded the limit
            if (accessData.count >= 10) {
                return res.status(429).json({ error: 'Too many requests. Try again later.' });
            } else {
                accessCounts.set(key, {
                    count: accessData.count + 1,
                    timestamp: accessData.timestamp
                });
            }
        }
    }

    next();
}

const checkUpcomingTicketDeadlines = async () => {
    const currentTime = new Date();
    const upcomingTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    try {
        const ticketsSnapshot = await db.collection('Tickets').get();

        if (!ticketsSnapshot.empty) {
            ticketsSnapshot.forEach(async (ticketDoc: any) => {
                const ticketData: Ticket = ticketDoc.data();
                const deadline = new Date(ticketData.Deadline);

                if (deadline >= currentTime && deadline <= upcomingTime && ticketData.Status !== 'Completed' && ticketData.HandlerId) {
                    const handlerId = ticketData.Handler;

                    if (handlerId) {
                        const notificationRef = db.collection('Notifications').doc(handlerId);

                        const notification = {
                            senderId: 'system',
                            message: `The deadline for the ticket ${ticketData.Title} is approaching.`,
                            timestamp: admin.firestore.FieldValue.serverTimestamp(),
                            read: false
                        };

                        await notificationRef.set(
                            {
                                notifications: admin.firestore.FieldValue.arrayUnion(notification)
                            },
                            { merge: true }
                        );
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error checking upcoming deadlines: ", error);
    }
};




app.use(limitAccess)
app.use("/api/tickets/", ticketRouter);

app.get("/api/users", async (req: Request, res: Response) => {
    try {
        const userList = await admin.auth().listUsers()

        res.status(200).json(userList)
    } catch (error) {
        console.error("Failed to retrieve users from db", error)
        res.send(500).json({ error: 'Internal Server Error' });
    }
});

io.on('connection', (socket) => {
    console.log(`${socket.id} connected to the server`);

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected from the ticketing service`);
    });
});

/* Set the socket for the router */
app.set('socketio', io);

cron.schedule('0 * * * *', () => {
    console.log("Running scheduled task to check for upcoming ticket deadlines...");
    checkUpcomingTicketDeadlines();
})

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})