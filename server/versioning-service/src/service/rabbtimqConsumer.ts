import amqplib, {Channel, ChannelModel, connect} from 'amqplib';
import { VersionService } from './versionService';
import env from "dotenv";
import { AppError } from '@bug-tracker/usermiddleware';
import { Version, VersionObject } from '../types/general';
env.config();

export class RabbitMqConsumer {
    private _RABBITMQ_URL: string;
    private _channel: Channel | null;
    private _connection: ChannelModel | null;
    private _versionService: VersionService;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new AppError(`InvalidEnvData`, 500, `Invalid version service rabbitmq consumer url`);
        }
        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._channel = null;
        this._connection = null;
        this._versionService = new VersionService();
    }

    /* Initialize the rabbitmq consumer connection */
    async connection(): Promise<void> {
        try {
            /* If the connetion already exists exit */
            if (this._connection && this._channel) return;

            /* Initialize the connection based on the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the rabbitmq channel */
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new AppError(`VersionConsumerError`, 500, `Failed to initialize the rabbitmq consumer connection: ${error}`);
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

            /* If the connection fails exit */
            if (!this._connection || !this._channel) return;

            /* Initialize the version consumer queue */
            await this._channel.assertQueue(queue, {durable: true});

            /* Retrieve the version message */
            this._channel.consume(queue, async (msg) => {
                /* Check if the message was not retrieved */
                if (!msg) {
                    throw new AppError(`VersionConsumerMessageError`, 500, `Failed to retrieve the message to the version consumer`);
                }

                /* Parse the version message */
                const version: VersionObject = JSON.parse(msg.content.toString());
                

                /* Send the parsed data to the service layer to create the version */
                await this._versionService.createItemVersion(version.type, version.data);

                if (!this._channel) {
                    throw new AppError(`InvalidChannel`, 500, `Failed to listen to the version consumer channel`);
                }

                this._channel.ack(msg);
            });
        } catch (error) {
            await this.closeConnection();
            throw new AppError(`VersionConsumerQueueError`, 500, `Failed to listen to the version consumer: ${error}`);
        }
    }

    async closeConnection(): Promise<void> {
        try {
            /* If the connection is closed exit */
            if (!this._connection || !this._channel) return;
        
            await this._channel.close();
            await this._connection.close();
        } catch (error) {
            throw new AppError(`VersionConsumerConnectionErrro`, 500, `Failed to close the version consumer connection: ${error}`);
        }
    }

}