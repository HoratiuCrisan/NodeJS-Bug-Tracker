import io from "socket.io";
import {Server as HttpServer} from "node:http";
import { AppError } from "@bug-tracker/usermiddleware";

export class SocketService {
    private _io: HttpServer | null;

    constructor() {
        this._io = null;
    }

    initializeIO(server: HttpServer): void {
        try {
            this._io = server;
        } catch (error) {
            console.error(`Failed to initalize io connection`);
        }
    }


    emitToRoom(roomId: string, event: string, data: unknown) {
        if (!this._io) {
            throw new AppError(`NotificationSocketConnectionError`, 300, `Failed to initialize socket connection`);
        }

    }
}