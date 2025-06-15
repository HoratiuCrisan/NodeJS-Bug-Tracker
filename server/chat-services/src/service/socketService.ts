// socketService.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

class SocketService {
    private io: Server | null = null;

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });

        this.io.on("connection", (socket) => {
            console.log("Socket connected:", socket.id);

            socket.on("join", (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined personal room ${userId}`);
            });

            socket.on("join-room", (roomId) => {
                socket.join(roomId);
                console.log(`Socket ${socket.id} joined room ${roomId}`);
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected:", socket.id);
            });
        });
    }

    getIO(): Server {
        if (!this.io) {
            throw new Error("Socket.IO not initialized");
        }
        return this.io;
    }

    emitEventToRoom(roomId: string, event: string, data: unknown) {
        console.log(`[Socket Emit] Emitting event ${event} to room ${roomId}`);
        const io = this.getIO();
        io.to(roomId).emit(event, data);
    }
}

export const socketService = new SocketService(); // Export singleton
