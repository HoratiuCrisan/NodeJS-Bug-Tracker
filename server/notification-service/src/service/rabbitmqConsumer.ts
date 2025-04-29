import amqp, {ChannelModel, Channel, connect} from "amqplib";
import { NotificationService } from "./notificationService";
import { AppError } from "@bug-tracker/usermiddleware";
import { NotificationMessage } from "@bug-tracker/usermiddleware/node_modules/@bug-tracker/notification-lib/src";

export class RabbitMqConsumer {
    private _RABBITMQ_URL: string | undefined;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;
    private _notificationService: NotificationService;

    constructor() {
        this._RABBITMQ_URL = "amqp://localhost/";
        this._connection = null;
        this._channel = null;
        this._notificationService = new NotificationService();
    }

    async connection(): Promise<void> {
        try {
            if (this._connection && this._channel) return;

            if (!this._RABBITMQ_URL) {
                console.error(`Invalid rabbit mq url`);
                return;
            }

            this._connection = await connect(this._RABBITMQ_URL);

            this._channel = await this._connection.createChannel();
        } catch (error) {
            console.error(`Failed to create connection to notification consumer`);
        }
    }

    async listenToQueue(queue: string): Promise<void> {
        try {
            await this.connection();

            if (!this._connection || !this._channel) return;

            await this._channel.assertQueue(queue, {durable: true});

            this._channel.consume(queue, async (msg) => {
                if (!msg) {
                    console.error(`Notification message missing`);
                    return;
                }

                const notification: NotificationMessage = JSON.parse(msg.content.toString());
                
                await this._notificationService.createNotification(notification);

                if (!this._channel) {
                    throw new Error(``);
                }
                
                this._channel.ack(msg);
            });           
        } catch (error) {
            await this.closeConnection();
            console.error(`Failed to listen to queue`);
        }
    }

    async closeConnection() {
        try {
            if (!this._channel || !this._connection) return;
            
            await this._channel.close();
            await this._connection.close();
            console.log(`RabbitMq consumer connection closed`);
        } catch (error) {
            console.error(`Error closing RabbitMq connection: `, error);
        }
    }
}