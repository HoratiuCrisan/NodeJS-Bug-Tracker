import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from '../config/firebase';
import chatRouter from "./routes/chats";

const db = admin.firestore();
const app = express();
const port = 8003;

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
});

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
}));

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    const userId = socket.handshake.query.userId;

    if (typeof userId === 'string') {
        console.log(userId);
        (async () => {
            try {
                await db.collection('Users').doc(userId).update({
                    status: 'online',
                    lastConnected: admin.firestore.FieldValue.serverTimestamp(),
                });
                io.emit('user-status-changed'); // Emit event to all clients
            } catch (error) {
                console.error('Error updating user status to online:', error);
            }
        })();

        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`);

            (async () => {
                try {
                    await db.collection('Users').doc(userId).update({
                        status: 'offline',
                        lastDisconnected: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    io.emit('user-status-changed'); // Emit event to all clients
                } catch (error) {
                    console.error('Error updating user status to offline:', error);
                }
            })();
        });

        socket.on('send-message', async ({ conversationId, senderId, text, mediaUrl }) => {
            console.log(conversationId, senderId, text, mediaUrl);
            const timestamp = admin.firestore.Timestamp.now();
            const mediaType = mediaUrl ? (mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) ? 'image' : 'video') : null;
    
            try {
                const message = {
                    messageId: `${Date.now()}-${senderId}`,
                    senderId,
                    text,
                    timestamp, // This now holds a concrete timestamp value
                    mediaUrl: mediaUrl || null,
                    mediaType: mediaType || null
                };
    
                const conversationRef = db.collection('Conversations').doc(conversationId);
                await conversationRef.update({
                    lastMessage: text,
                    lastMessageTimestamp: timestamp, // Separate field for the last message timestamp
                    messages: admin.firestore.FieldValue.arrayUnion(message) // Correct field name for array
                });

                io.to(conversationId).emit('new-message', {
                    conversationId,
                    message
                });

                /* Trigger the notification system that a new message has been received */
                io.to('notification-services').emit('new-message-notification', {
                    conversationId,
                    senderId,
                    text,
                    mediaUrl
                });

                io.emit('new-message', {
                    conversationId,
                    message,
                });
            } catch (error) {
                console.error("Error sending message: ", error);
            }
        });
    } else {
        console.error('User ID is not a valid string:', userId);
    }
});

app.use("/api/chat", chatRouter);

server.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
