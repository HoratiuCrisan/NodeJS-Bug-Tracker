import amqp, {Channel, ChannelModel, connect} from "amqplib";
import env from "dotenv";
import {v4} from "uuid";
env.config();

export class UserProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        if (!process.env.RABBITMQ_URL) {
            throw new Error(`Invalid user producer env. data`);
        }

        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
    }

    async initConnection(): Promise<void> {
        if (this._channel && this._connection) return;

        try {
            this._connection = await connect(this._RABBITMQ_URL);
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new Error(`Failed to initialize user producer connection: ${error}`);
        }
    }

    async assertUserQueue(queue: string, userIds: string[]): Promise<any[]> {
        await this.initConnection();
    
        try {
            // Step 1: Assert the main and reply queue
            await this._channel?.assertQueue(queue, { durable: true });
    
            // Step 2: Create a temporary exclusive reply queue
            const { queue: replyQueue } = await this._channel!.assertQueue('', {
                exclusive: true
            });
    
            const correlationId = v4();
    
            return new Promise((resolve, reject) => {
                // Step 3: Set up consumer for the reply queue
                this._channel!.consume(replyQueue, (msg) => {
                    if (msg?.properties.correlationId === correlationId) {
                        const users = JSON.parse(msg.content.toString());
                        resolve(users); // Resolve with the response
                    }
                }, {
                    noAck: true
                });
    
                // Step 4: Send the message with replyTo and correlationId
                const message = Buffer.from(JSON.stringify(userIds));
                const success = this._channel?.sendToQueue(queue, message, {
                    persistent: true,
                    replyTo: replyQueue,
                    correlationId
                });
    
                if (!success) {
                    reject(new Error('Failed to send user IDs'));
                } else {
                    console.log(`User IDs sent with correlationId ${correlationId}`);
                }
            });
    
        } catch (error) {
            await this.close();
            throw new Error(`Failed to assert user producer queue: ${error}`);
        }
    }

    async close(): Promise<void> {
        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();

            console.log(`User producer connection closed successfully`);
        } catch (error) {
            throw new Error(`Failed to close user producer connection: ${error}`);
        }
    }
}
