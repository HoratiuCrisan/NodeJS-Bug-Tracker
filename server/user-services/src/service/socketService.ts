import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { UserRepository } from "../repository/userRepository";

class SocketService {
    private io: Server | null = null;
    private socketToUserMap = new Map<string, string>();
    private userConnectionCount = new Map<string, number>();
    private _userRepository = new UserRepository();

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true,
            },
        });

        this.io.on("connection", (socket) => {
            console.log("Socket connected: ", socket.id);

            socket.on("join",async  (userId) => {
                socket.join(userId);
                this.socketToUserMap.set(socket.id, userId);

                const count = this.userConnectionCount.get(userId) || 0;
                this.userConnectionCount.set(userId, count + 1);

                if (count === 0) {
                    console.log(`User ${userId} is now online`);
                }

                console.log(`User ${userId} joind personal room ${userId}`);
            });

            socket.on("disconnect", async () => {
                const userId = this.socketToUserMap.get(socket.id);

                if (userId) {
                    this.socketToUserMap.delete(socket.id);

                    const count = (this.userConnectionCount.get(userId) || 1) - 1;
                    if (count <= 0) {
                        this.userConnectionCount.delete(userId);
                        console.log(`User ${userId} is now offline`);
                    } else {
                        this.userConnectionCount.set(userId, count);
                    }

                    const user = await this._userRepository.updateUserStatus(userId, "offline");
                    const status = user.status;

                    this.emitEventToAll("user-status-change", {userId, status});
                }
                console.log("Socket disonnected: ", socket.id);
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

    emitEventToAll(event: string, data: unknown) {
        const io = this.getIO();
        io.emit(event, data);
    }
}

export const socketService = new SocketService();