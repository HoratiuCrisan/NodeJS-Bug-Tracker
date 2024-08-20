import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from '../config/firebase';
import notificationRouter from "./routes/notifications"

const db = admin.firestore();
const app = express();
const port = 8004;

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use("/api/notifications", notificationRouter(io));

io.on('connection', (socket) => {
    console.log(`${socket.id} connected to the notification service`);

    socket.on('new-message-notification', async ({receiverId, text, senderId}) => {
        console.log(`New message received by ${receiverId} from ${senderId}`);
        console.log(`Sender: ${senderId}, Test: ${text}`);

        try {
            const notification = {
                senderId: senderId ? senderId : 'System',
                message: text,
                timestamp: new Date(),
                read: false,
            };

            await db.runTransaction(async (transaction) => {
                const notificationRef = db.collection("Notifications").doc(receiverId);

                const doc = await transaction.get(notificationRef);
                
                if (!doc.exists) {
                    transaction.set(notificationRef, { notifications: [notification] });
                } else {
                    transaction.update(notificationRef, {
                        notifications: admin.firestore.FieldValue.arrayUnion(notification)
                    });
                }
            });

            io.emit('new-notification', {
                receiverId,
                notification
            })
        } catch (error) {
            console.error("Error handling the new message: ", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected from the notification service`);
    });
});




server.listen(port, () => {
    console.log(`Server listening on ${port}`);
})