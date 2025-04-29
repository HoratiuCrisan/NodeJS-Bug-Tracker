import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { AppError } from "@bug-tracker/usermiddleware";

export class SocketService {
    private io: Server | null = null;
    private userSockets: Map<string, string> = new Map();

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["POST", "GET", "PUT", "DELETE"],
            },
        });

        this.io.on("connection", (socket) => {
            console.log("User connected: " + socket.id);
            
            socket.on("join", (userId) => {
                this.userSockets.set(userId, socket.id);
                console.log(`User ${userId} connected with socket: ${socket.id}`);
            });

            socket.on("join-room", (roomId) => {
                socket.join(roomId);
                console.log(`User ${socket.id}`);
            });

            socket.on("disconnect", () => {
                const userId = [...this.userSockets.entries()].find(
                    ([_, socketId]) => socketId === socket.id
                )?.[0];

                if (userId) {
                    this.userSockets.delete(userId);
                }
            });
        });
    }

    getIO() {
        if (!this.io) {
            throw new AppError(`SocketConnectionError`, 500, `Failed to initialize the socket connection`);
        }

        return this.io;
    }

    emitEventToUser(userId: string, event: string, data: unknown) {
        this.io = this.getIO();

        this.io.to(userId).emit(event, data);
    }

    emitEventToRoom(roomId: string, event: string, data: unknown) {
        this.io = this.getIO();

        this.io.to(roomId).emit(event, data);
    }
}