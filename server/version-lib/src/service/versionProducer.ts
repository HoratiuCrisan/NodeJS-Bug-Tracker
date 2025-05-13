import amqp, {Channel, ChannelModel, connect} from "amqplib";
import { channel } from "diagnostics_channel";
import env from "dotenv";
import { VersionMessage } from "../types/version";
env.config();

export class VersionProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new Error(`Failed to initialize the version library env data`);
        }

        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
    }

    async connection(): Promise<void> {
        /* If the connection exists, exit */
        if (this._connection && this._channel) return;

        try {
            /* Initialize the version producer connection based on the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);
            
            /* Initialize the connection channel */
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new Error(`Failed to initialize the version library producer connection`);
        }
    }

    /**
     * 
     * @param {string} queue The name of the queue, the producer listens to
     * @param {VersionMessage} version The version of the item to be created
     */
    async assertToQueue(queue: string, version: VersionMessage): Promise<void> {
        /* Initialize the connection */
        await this.connection();

        try {
            /* If the connection failed, exit */
            if (!this._connection || !this._channel) return;

            /* Assert the version queue */
            await this._channel.assertQueue(queue, {durable: true});

            /* Encode the data */
            const message = Buffer.from(JSON.stringify(version));

            /* Send the message to the queue */
            const success = this._channel.sendToQueue(queue, message);

            /* Check if an error occured during the operation */
            if (!success) {
                throw new Error(`Failed to send the version message to the consumer`);
            }
        } catch (error) {
            await this.closeConnection();
            throw new Error(`Failed to initialize the verion producer queue`);
        }
    }

    async closeConnection(): Promise<void> {
        /* If the connection is closed, exit */
        if (!this._connection || !this._channel) return;

        try {
            await this._channel.close();
            await this._connection.close();
        } catch (error) {
            throw new Error(`Failed to close the version producer conneciton`);
        }
    }
}
