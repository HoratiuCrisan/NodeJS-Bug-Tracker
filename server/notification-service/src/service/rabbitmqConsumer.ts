import amqp, {ChannelModel, Channel, connect} from "amqplib";
import { NotificationService } from "./notificationService";
import { AppError } from "@bug-tracker/usermiddleware";
import { NotificationMessage } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/notification-lib/src";

export class RabbitMqConsumer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;
    private _notificationService: NotificationService;

    constructor() {
        /* Verify the env data */
        if (!process.env.RABBITMQ_URL) {
            throw new AppError(`InvalidEnvData`, 500, `Invalid rabbitmq url for the notification consumer`)
        }
        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
        this._notificationService = new NotificationService();
    }

    /* Initialize the rabbitmq consumer connection */
    async connection(): Promise<void> {
        try {
            /* If the connection already exists exit */
            if (this._connection && this._channel) return;

            /* Initialize the connection based on the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the rabbitmq channel */
            this._channel = await this._connection.createChannel(); 
        } catch (error) {
            throw new AppError(`NotificationConsumerError`, 500, `Failed to initialize rabbitmq consumer connection: ${error}`);
        }
    }

    /**
     * 
     * @param queue The name of the queue the consumer listens to 
     */
    async listenToQueue(queue: string): Promise<void> {
        try {
            /* Establish the consumer connection */
            await this.connection();

            /* If the connection failed exist */
            if (!this._connection || !this._channel) return;

            /* Initialize the notification consumer queue */
            await this._channel.assertQueue(queue, {durable: true});

            /* Retrieve the notification message */
            this._channel.consume(queue, async (msg) => {
                /* Check if the message was not retrieved */
                if (!msg) {
                    throw new AppError(`NotificationConsumerMessageError`, 500, `Failed to retrieve the message to the notification consumer`);
                }

                /* Parse the notification message */
                const notification: NotificationMessage = JSON.parse(msg.content.toString());

                /* Send the notification message to the service layer */                
                await this._notificationService.createNotification(notification);

                if (!this._channel) {
                    throw new AppError(`InvalidChannel`, 500, `Failed to listen to the consumer channel`);
                }
                
                this._channel.ack(msg);
            });           
        } catch (error) {
            await this.closeConnection();
            throw new AppError(`NotificationConsumerQueueError`, 500, `Failed to listen to the notification consumer: ${error}`);
        }
    }

    /**
     * 
     * Close the consumer connection
     */
    async closeConnection() {
        try {
            /* If the connection is closed exit */
            if (!this._channel || !this._connection) return;
            
            await this._channel.close();
            await this._connection.close();
            console.log(`RabbitMq consumer connection closed`);
        } catch (error) {
            throw new AppError(`NotificationConsumerConnectionError`, 500, `Failed to close the notification consumer connection: ${error}`);
        }
    }
}