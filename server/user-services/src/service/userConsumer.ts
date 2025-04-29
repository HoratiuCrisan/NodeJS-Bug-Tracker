import { AppError } from "@bug-tracker/usermiddleware";
import { User } from "../types/User";
import { UserService } from "./userService";
import amqpl, { ChannelModel, Channel, connect} from "amqplib";
import env from "dotenv";
env.config();

export class UserConsumer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        if (!process.env.RABBITMQ_URL) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid user consumer env data`);
        }

        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
    }

    async connectionInit(): Promise<void> {
        if (this._connection && this._channel) return;

        try {
            this._connection = await connect(this._RABBITMQ_URL);
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new AppError(`UserConsumerConnectionError`, 400, `Failed to initialize user consumer connection`);
        }
    }

    async listenToUserQueue(queue: string): Promise<void> {
        await this.connectionInit();

        try {
            if (!this._channel || !this._connection) {
                throw new AppError(`ConnectUserConsumerError`, 400, `Failed to connect the user consumer`);
            }

            await this._channel.assertQueue(queue, {durable: true});

            this._channel.consume(queue, async (msg) => {
                if (!msg) {
                    throw new AppError(`UserConsumerMessageMissing`, 404, `Failed to receive user producer message`);
                }

                const userIds: string[] = JSON.parse(msg.content.toString());

                const userService = new UserService();

                const users: User[] = await userService.getUsersData(userIds);

                this._channel?.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(users)),
                    { correlationId: msg.properties.correlationId }
                );

                this._channel?.ack(msg);
            });
        } catch (error) {
            this.close();
            throw new AppError(`ListenToUserQueueError`, 500, `User consumer failed to listen to users queue`)
        }
    }

    async close(): Promise<void> {
        if (!this._channel || !this._connection) return;

        try {
            await this._channel.close();
            await this._connection.close();

            console.log(`User consumer connection closed`);
        } catch (error) {
            throw new AppError(`CloseUserConsumerConnectionError`, 500, `Failed to close user consumer conneciton`);
        }
    }
}
