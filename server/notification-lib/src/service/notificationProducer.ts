import { Channel, ChannelModel, connect } from "amqplib";
import { NotificationMessage } from "../types/notification";
import env from "dotenv";
env.config();

export class NotificationProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new Error(`Failed to initialize the env data for the notification library`);
        }
        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
    }

    async connection(): Promise<void> {
        /* If the connection exists, exit */
        if (this._channel && this._connection) return;

        try {
            /* Initialize the producer connection based on the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the channel for the connection */
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new Error(`Failed to initialize the notification library rabbitmq producer connection: ${error}`);
        }
    }

    /**
     * 
     * @param {string} queue The name of the queue the producer listens to
     * @param {NotificationMessage} notification The notification to be send to the notification service 
     */
    async assertQueue(queue: string, notification: NotificationMessage): Promise<void> {
        /* Initialize the producer connection */
        await this.connection();

        try {
            /* If the connection was not initialized, exit */
            if (!this._channel || !this._connection) return;

            /* Listen to the notifications queue */
            await this._channel.assertQueue(queue, { durable: true });

            /* Encode the notification message */
            const message = Buffer.from(JSON.stringify(notification));

            /* Send the message to the notification queue */
            const success = this._channel.sendToQueue(queue, message, { persistent: true });

            /* Check if the notification message was sent successfully */
            if (!success) {
                throw new Error(`Failed to send notifiaction to the consumer`);
            }
        } catch (error) {
            await this.close();
            throw new Error(`Failed to assert the notification queue: ${error}`);
        }
    }

    async close(): Promise<void> {
        /* If the connection is closed, exit */
        if (!this._channel || !this._connection) return;

        try {
            /* Close the channel and the connection */
            await this._channel.close();
            await this._connection.close();
        } catch (error) {
            throw new Error(`Failed to close the notification producer connection: ${error}`);
        }
    }
}
