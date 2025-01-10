import env from "dotenv";
import { Logger } from "#/utils/logger";
import amqp, {Connection, Channel}  from "amqplib";


export class RabbitMqRepository {
    private _RABBITMQ_URL: string | undefined; /* RabbitMq server url */
    private _LOG_EXCHANGE: string | undefined; /* The name of the exchange that receives messages from the publisher */
    private _NOTIFY_EXCHANGE: string | undefined /* The name of the exchange name that receives notification messages */
    private _connection: Connection | null; /* RabbitMq connection */
    private _channel: Channel | null; /* RabbitMq communication channel */
    private _connectionDelay: number; /* The delay of performing actions */
    private _logger: Logger; /* Instance of the Logger class */

    constructor () {
        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._LOG_EXCHANGE = process.env.LOG_EXCHANGE;
        this._NOTIFY_EXCHANGE= process.env.NOTIFY_EXCHANGE;
        this._connection = null;
        this._channel = null;
        this._connectionDelay = 5000;
        this._logger = new Logger();
    }

    /**
     * 
     * @returns {Promise<amqp.Channel>}- The RabbitMq channel if the connection was established successfully
     */
    async connect(): Promise<amqp.Channel> {
        try {
                /* If the RabbitMq URL is not valid log the error */
            if (!this._RABBITMQ_URL) {
                this._logger.error(`Failed to access the RabbitMq URL`);
                throw new Error(`Faield to access the RabbitMq URL`);
            }

            /* If the connection was not established,
                create a new connection to the RabbitMq server */
            if (!this._connection) {
                this._logger.log(`Attempting to connect to RabbitMQ server...`);
                this._connection = await amqp.connect(this._RABBITMQ_URL);

                /* If there was an error while connecting to the server,
                    log the error, delete the connection and the channel,
                    and restart the connection */
                this._connection.on("error", (err: Error) => {
                    this._logger.error(`RabbitMq connection error: ${err.message}`);
                    this.cleanup();
                    this.reconnect();
                });

                /* If there was an error while closing the connection,
                    log the error, delete the connection and the channel,
                    and restart the connection */
                this._connection.on("close", () => {
                    this._logger.error(`RabbitMq connection closed. Attempting to reconnect...`);
                    this.cleanup();
                    this.reconnect();
                });
            }

            /* Create a new channel if none is present */
            if (!this._channel) {
                this._logger.log(`Creating a new RabbitMq channel...`);
                this._channel = await this._connection.createChannel();
            }

            /* Reset the delay timer */
            this._connectionDelay = 5000;
            
            this._logger.log(`Channel created successfully`);
            return this._channel;
        } catch (error) {
            this._logger.error(`Failed to establish RabbitMQ connection: ${error}`);
            this.cleanup();
            this.reconnect();
            throw new Error(`Failed to establish RabbitMQ connection: ${error}`);
        }
    }

    /**
     * 
     * @param routingKey - The route to the RabbitMq queue
     * @param message - The message sent to the exchanger
     */
    async publishMessage(routingKey: string, message: string): Promise<void> {
        try {
            /* Check for the name of the exchanger */
            if (!this._LOG_EXCHANGE) {
                this._logger.error(`Invalid log exchange`)
                throw new Error(`Invalid log exchange`);
            }

            /* Create a new connection if there is none */
            if (!this._channel) {
                this._channel = await this.connect();
            }

            /* Connect to the exchanger */
            await this._channel.assertExchange(this._LOG_EXCHANGE, "topic", {durable: true});

            /* Send the message to the queue using the publishing function */
            const publishedMessage: boolean = this._channel.publish(
                this._LOG_EXCHANGE,
                routingKey,
                Buffer.from(message),
                {persistent: true}, /* Try to not lose the message if the connection is lost */
            );

            /* Wait for the message to be published */
            setTimeout(() => {}, this._connectionDelay);

            /* If the message was not published, log the error,
                and try again */
            if (!publishedMessage) {
                this._logger.error(`Failed to publish the message`);

                setTimeout(async () => {
                    this._logger.log(`Trying to send the message to the queue again...`);
                    await this.publishMessage(routingKey, message);
                }, this._connectionDelay);

                throw new Error(`Failed to publish the message`);
            }

            /* Remove the connecction */
            setTimeout(async () => {
                await this.cleanup();
            }, 1000);
        } catch (error) {
            /* Log the error into the local error file */
            this._logger.error(`Error at publishing message to RabbitMQ: ${error}`);
            /* Try to republish the message back to the Logging queue */
            setTimeout(async () => {
                this._logger.log(`Trying to send the message to the queue again...`);
                await this.publishMessage(routingKey, message);
            }, this._connectionDelay);
        }
    } 

    /**
     * 
     * @param {string[]} users - a collection of users that will be sent the message 
     * @param {"info" | "audit" | "error"} type - The type of the message
     * @param {object} message - The messages to be sent to the users
     */
    async sendNotification(users: string[], type: "info" | "audit" | "error", message: object): Promise<void> {
        try {
            /* Check if the exchange notification name exits */
            if (!this._NOTIFY_EXCHANGE) {
                this._logger.error(`Invalid notify exchange`);
                throw new Error(`Invalid nofify exchange`);
            }

            /* If the channel does not exist, create a new connection */
            if (!this._channel) {
                this._channel = await this.connect();
            }

            /* Connect to the notification exchanger */
            await this._channel.assertExchange(this._NOTIFY_EXCHANGE, "fanout", {durable: true});

            for (const user of users) {
                if (!user) 
                    continue;

                /* For each user publish the notification */
                this._channel.publish(
                    this._NOTIFY_EXCHANGE,
                    user, 
                    Buffer.from(JSON.stringify(message)),
                    {persistent: true},
                );

                /* Log each notification to the local audit logger */
                this._logger.log(`Notification sent to ${user}`);
                setTimeout(() => {}, 500);
            }

            /* Remove the connection */
            setTimeout(async () => {
                await this.cleanup();
            }, 1000);
        } catch (error) {
            /* Try to publish the notifications after a delay timer */
            this._logger.error(`Failed to notify users`);
            setTimeout(async () => {
                this._logger.log(`Trying to notify users again...`);
                await this.sendNotification(users, type, message);
            }, this._connectionDelay);
        }
    }

    /**
     * Checks if a channel already exists and deletes it
     * Checks if a connection already exits and deletes it
     */
    private async cleanup(): Promise<void> {
        /* Delete the existing channel */
        if (this._channel) {
            await this._channel.close().catch((err: Error) => {
                this._logger.error(`Error closing the channel: ${err.message}`);
            });
            this._channel = null;
        }

        /* Delete the existing connection */
        if (this._connection) {
            await this._connection.close().catch((err: Error) => {
                this._logger.error(`Error closing the connection: ${err.message}`);
            });
            this._connection = null;
        }
    }

    /**
     * Tries to create a new connection
     * The connection delay doubles each time the reconnection is required
     */
    private reconnect(): void {
        /* Reconnect to the server */
        this._logger.log(`Reconnecting to RabbitMq in ${this._connectionDelay / 1000} seconds...`);
        setTimeout(() => {
            /* Every time a reconnection is called double the delay timer,
                but cap it at 60 seconds */
            this._connectionDelay = Math.min(this._connectionDelay * 2, 60000);
            this.connect().catch((err: Error) => {
                this._logger.error(`Reconnection attempt failed: ${err.message}`);
            });
        }, this._connectionDelay);
    }
}