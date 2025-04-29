import  { ChannelModel, Channel, connect } from "amqplib";
import { LogService } from "./logService";
import { LogMessage } from "@bug-tracker/logging-lib";

export class RabbitMqConsumer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;
    private _logService: LogService;

    constructor() {
        this._RABBITMQ_URL = "amqp://localhost/";
        this._connection = null;
        this._channel = null;
        this._logService = new LogService();
    }

    async connection(): Promise<void> {
        if (this._connection && this._channel) return;

        try {
            this._connection = await connect(this._RABBITMQ_URL);
            console.log(`RabbitMQ consumer connected`);

            this._channel = await this._connection.createChannel();
            console.log(`Consumer connected to the channel`);
        } catch (error) {
            console.error(`RabbitMQ connection error:`, error);
            throw error; // Ensure the caller knows the connection failed
        }
    }

    async listenToQueue(queue: string) {
        await this.connection(); 

        try {
            await this._channel?.assertQueue(queue, { durable: true });

            this._channel?.consume(queue, async (msg) => {
                if (!msg) {
                    console.error(`Failed to get the log data`);
                    return;
                }

                try {
                    console.log("Consuming message...");

                    const log = JSON.parse(msg.content.toString()) as LogMessage;
                    console.log(log);
                    await this._logService.createLog(log);

                    this._channel?.ack(msg); // Acknowledge only if processing succeeds
                } catch (error) {
                    console.error(`Error processing log message:`, error);
                    
                    // Decide what to do with failed messages
                    // this._channel?.nack(msg, false, true); // Requeue message
                    this._channel?.ack(msg); // Discard failed message
                }
            });

            console.log(`Listening to queue: ${queue}`);
        } catch (error) {
            console.error(`Failed to listen to queue ${queue}:`, error);
        }
    }

    async closeConnection() {
        try {
            await this._channel?.close();
            await this._connection?.close();
            console.log(`RabbitMQ consumer connection closed`);
        } catch (error) {
            console.error(`Error closing RabbitMQ connection:`, error);
        }
    }
}
