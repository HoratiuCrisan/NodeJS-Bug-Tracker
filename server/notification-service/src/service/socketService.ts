// socketService.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

class NotificationSocketService {
    private io: Server | null = null;

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "http://localhost:3000", 
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });

        this.io.on("connection", (socket) => {
            console.log("Notification socket connected:", socket.id);

            // Join personal user room
            socket.on("join", (userId: string) => {
                socket.join(userId);
                console.log(`User ${userId} joined their notification room`);
            });

            socket.on("disconnect", () => {
                console.log("Notification socket disconnected:", socket.id);
            });
        });
    }

    getIO(): Server {
        if (!this.io) {
            throw new Error("Notification Socket.IO not initialized");
        }
        return this.io;
    }

    emitToUser(userId: string, event: string, data: unknown) {
        console.log(`[Notification Emit] Event "${event}" to user ${userId}`);
        const io = this.getIO();
        io.to(userId).emit(event, {
            receiverId: userId,
            notification: data,
        });
    }
}

export const notificationSocketService = new NotificationSocketService();
