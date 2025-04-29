import { Channel, ChannelModel, connect } from "amqplib";
import { NotificationMessage } from "../types/notification";

export class NotificationProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        this._RABBITMQ_URL = "amqp://localhost/";
        this._connection = null;
        this._channel = null;
    }

    async initConnection(): Promise<void> {
        if (this._channel && this._connection) return;

        if (!this._RABBITMQ_URL) {
            throw new Error("Invalid RabbitMQ URL");
        }

        try {
            this._connection = await connect(this._RABBITMQ_URL);
            this._channel = await this._connection.createChannel();
        } catch (error) {
            console.error("RabbitMQ connection error:", error instanceof Error ? error.message : error);
            throw error;
        }
    }

    async assertQueue(queue: string, notification: NotificationMessage): Promise<void> {
        await this.initConnection();

        try {
            await this._channel!.assertQueue(queue, { durable: true });

            const message = Buffer.from(JSON.stringify(notification));
            const success = this._channel!.sendToQueue(queue, message, { persistent: true });

            if (success) {
                console.log("Notification sent successfully");
            } else {
                console.error("Failed to send notification");
            }
        } catch (error) {
            await this.close();
            throw new Error(`Failed to assert the notification queue: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async close(): Promise<void> {
        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();

            console.log("Notification producer connection closed successfully");
        } catch (error) {
            console.error("Failed to close the notification producer connection:", error instanceof Error ? error.message : error);
        }
    }
}
