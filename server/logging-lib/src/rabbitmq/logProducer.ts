import amqp, { ChannelModel, Channel, connect } from "amqplib";
import { LogMessage } from "../types/Log";

export class LogProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        console.log(process.env.RABBITMQ_URL);
        /* Verify if the env data was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new Error(`Failed to initialize the logging library env data`);
        }
        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
    }

    async connection(): Promise<void> {
        /* If the connection exists, exit */
        if (this._connection && this._channel) return;

        try {
            /* Initialize the connection based on the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the rabbitmq channel */
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new Error(`Failed to initialize the logging library producer conneciton: ${error}`);
        }
    }

    /**
     * 
     * @param {string} queue The name of the queue the producer listens to
     * @param {LogMessage} log The log message
    */
    async assertToLogQueue(queue: string, log: LogMessage): Promise<void> {
        /* Initialize the connection */
        await this.connection();

        try {
            /* If the connection failed, exit */
            if (!this._connection || !this._channel) return;

            /* Initialize the logging queue */
            await this._channel.assertQueue(queue, { durable: true });

            /* Encode the log message */
            const messageBuffer = Buffer.from(JSON.stringify(log));
            
            /* Send the message to the logging consumer */
            const success = this._channel.sendToQueue(queue, messageBuffer, { persistent: true });

            if (!success) {
                throw new Error(`Failed to send the log message to the consumer`);
            }
        } catch (error) {
            await this.close();
            throw new Error(`Failed to initialize the log producer queue: ${error}`);            
        }
    }

    async close(): Promise<void> {
        /* If the connection is closed, exit */
        if (!this._connection || !this._channel) return;

        try {
            await this._channel.close();
            await this._connection.close();
        } catch (error) {
            console.error(`Error closing RabbitMQ connection or channel: ${error}`);
        }
    }
}
