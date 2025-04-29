import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { AppError } from "@bug-tracker/usermiddleware";
import { eventBus } from "../utils/eventBus";

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

            socket.on("user-online", async ({ userId }) => {
                if (!userId) return;
                eventBus.emit("user-status-changed", userId, "online");

                // Remove any existing socket for the user before adding the new one
                this.userSockets.delete(userId);
                this.userSockets.set(userId, socket.id);
            });

            socket.on("disconnect", async () => {
                // Find user by socket ID
                const userId = [...this.userSockets.entries()].find(
                    ([_, socketId]) => socketId === socket.id
                )?.[0];

                if (userId) {
                    eventBus.emit("user-status-changed",userId, "offline");
                    this.userSockets.delete(userId);
                }
            });
        });
    }

    getIO() {
        if (!this.io) {
            throw new AppError(`SocketConnectionError`, 500, `Failed to initialized the socket connection`);
        }

        return this.io;
    }

    emitToUser(userId: string, event: string, data: unknown) {
        this.io = this.getIO();

        this.io.to(userId).emit(event, data);
    }
}