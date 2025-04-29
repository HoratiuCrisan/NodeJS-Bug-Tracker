import amqp, { ChannelModel, Channel, connect } from "amqplib";
import { LogMessage } from "../types/Log";

export class LogProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        this._RABBITMQ_URL = process.env.RABBITMQ_URL!;
        this._connection = null;
        this._channel = null;
    }

    // Establish connection and channel, with reconnection logic
    async connection(): Promise<void> {
        if (this._connection && this._channel) return;

        try {
            // Reconnect if needed
            if (!this._connection) {
                this._connection = await connect(this._RABBITMQ_URL);
            }
            if (!this._channel) {
                this._channel = await this._connection.createChannel();
                // Add event listeners to detect when the channel is closed
                this._channel.on('close', () => {
                    console.error('RabbitMQ channel closed unexpectedly!');
                    this._channel = null;
                    // Optionally, reconnect
                });
            }

            // Add connection close event listener
            this._connection.on('close', () => {
                console.error('RabbitMQ connection closed unexpectedly!');
                this._connection = null;
                this._channel = null;
                // Optionally, reconnect
            });

        } catch (error) {
            console.error(`Failed to establish RabbitMq producer connection: ${error}`);
            throw new Error(`Failed to establish RabbitMq producer connection`);
        }
    }

    // Assert the queue and send the log message
    async assertToLogQueue(queue: string, log: LogMessage) {
        await this.connection();

        try {
            // Check if channel is still open before performing operations
            if (!this._channel || !this._channel) {
                console.error('Channel is closed, cannot send message.');
                return;
            }

            await this._channel.assertQueue(queue, { durable: true });

            const messageBuffer = Buffer.from(JSON.stringify(log));

            const success = this._channel.sendToQueue(queue, messageBuffer, { persistent: true });

            if (success) {
                console.log(`Message sent to queue ${queue} successfully`);
            } else {
                console.error(`Failed to send message to queue ${queue}`);
            }
        } catch (error) {
            console.error(`Error sending message to queue ${queue}: ${error}`);
            await this.close();
        }
    }

    // Close the connection and channel gracefully
    async close(): Promise<void> {
        if (!this._connection || !this._channel) return;

        try {
            await this._channel.close();
            this._channel = null;
            await this._connection.close();
            this._connection = null;
        } catch (error) {
            console.error(`Error closing RabbitMQ connection or channel: ${error}`);
        }
    }
}
