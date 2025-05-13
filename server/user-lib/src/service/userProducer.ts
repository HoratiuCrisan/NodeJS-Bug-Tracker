import amqp, {Channel, ChannelModel, connect} from "amqplib";
import env from "dotenv";
import {v4} from "uuid";
env.config();

export class UserProducer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new Error(`Invalid user producer env. data`);
        }

        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
    }

    async connection(): Promise<void> {
        /* If the connection exists, exit */
        if (this._channel && this._connection) return;

        try {
            /* Initialize the connection based on the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the channel using the connection */
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new Error(`Failed to initialize user producer connection: ${error}`);
        }
    }

    /**
     * 
     * @param {string} queue The name of the queue the producer listens to
     * @param {string[]} userIds The list with the IDs of the users
     * @returns {Promise<unknown[]>} The list of users data
     */
    async assertUserQueue(queue: string, userIds: string[]): Promise<any[]> {
        /* Initialize the connection */
        await this.connection();
    
        try {
            /* If the channel of the connection failed, exit */
            if (!this._connection || !this._channel) return [];

            /* Initialize the producer to listen to the queue */
            await this._channel.assertQueue(queue, { durable: true });
    
            /* Generate a temporary queue for the response */
            const { queue: replyQueue } = await this._channel!.assertQueue('', {
                exclusive: true
            });
            
            /* Generate a correlation ID using uuid */
            const correlationId = v4();
    
            /* Return a promise that is responisble for listening to the queue,
                and replying to the temporary queue with the users data */
            return new Promise((resolve, reject) => {
                /* If the connection of channel are not initialized, exit */
                if (!this._channel || !this._connection) return [];

                /* Retrieve the message from the temporary queue */
                this._channel.consume(replyQueue, (msg) => {
                    /* Check if the correlationID of the matches matches with the one created above */
                    if (msg?.properties.correlationId === correlationId) {
                        const users = JSON.parse(msg.content.toString());

                        /* Resolve the response */
                        resolve(users); 
                    }
                }, {
                    noAck: true
                });
    
                /* Encode the list of users */
                const message = Buffer.from(JSON.stringify(userIds));

                /* Send the list of users to the users queue with the correlation ID */
                const success = this._channel?.sendToQueue(queue, message, {
                    persistent: true,
                    replyTo: replyQueue,
                    correlationId
                });
                
                /* Check if the operation succeded */
                if (!success) {
                    reject(new Error('Failed to send user IDs'));
                }
            });
    
        } catch (error) {
            await this.close();
            throw new Error(`Failed to assert user producer queue: ${error}`);
        }
    }

    async close(): Promise<void> {
        try {
            /* If the connection is closed exit */
            if (!this._channel || !this._connection) return;

            await this._channel.close();
            await this._connection.close();
        } catch (error) {
            throw new Error(`Failed to close user producer connection: ${error}`);
        }
    }
}
