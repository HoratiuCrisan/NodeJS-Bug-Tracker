import { AppError } from "@bug-tracker/usermiddleware";
import { User } from "../types/User";
import { UserService } from "./userService";
import amqpl, { ChannelModel, Channel, connect} from "amqplib";
import env from "dotenv";
env.config();

export class UserConsumer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;
    private _userService: UserService;

    constructor() {
        /* Verify if the env rabbitmq url was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid user consumer env data`);
        }

        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
        this._userService = new UserService();
    }

    async connection(): Promise<void> {
        /* If the connection exists, exit */
        if (this._connection && this._channel) return;

        try {
            /* Initialize the connection to the rabbitmq url */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the connection channel */
            this._channel = await this._connection.createChannel();

            
        } catch (error) {
            throw new AppError(`UserConsumerConnectionError`, 400, `Failed to initialize user consumer connection: ${error}`);
        }
    }

    /**
     * 
     * @param {string} queue The name of the queue the consummer listens to 
     */
    async listenToUserQueue(queue: string): Promise<void> {
        /* Initialize the connection */
        await this.connection();

        try {
            /* Check if the channle or the connection are not initialized */
            if (!this._channel || !this._connection) {
                throw new AppError(`ConnectUserConsumerError`, 400, `Failed to connect the user consumer`);
            }

            /* Initialize the channel queue */
            await this._channel.assertQueue(queue, {durable: true});

            this._channel.consume(queue, async (msg) => {
                /* Check if the message was not retrieved */
                if (!msg) {
                    throw new AppError(`UserConsumerMessageMissing`, 404, `Failed to receive user producer message`);
                }

                /* Parse the message into the list of user IDs */
                const userIds: string[] = JSON.parse(msg.content.toString());

                /* Send the list of user IDs to the service layer to retrieve the data of each user */
                const users: User[] = await this._userService.getUsersData(userIds);

                /* Initialize a temporary reply queue to return the list of users data */
                this._channel?.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(users)),
                    { correlationId: msg.properties.correlationId }
                );

                this._channel?.ack(msg);
            });
        } catch (error) {
            this.close();
            throw new AppError(`ListenToUserQueueError`, 500, `User consumer failed to listen to users queue: ${error}`)
        }
    }

    async close(): Promise<void> {
        /* If the connection is closed exit */
        if (!this._channel || !this._connection) return;

        try {
            /* Close the channel and the consumer connection */
            await this._channel.close();
            await this._connection.close();

            console.log(`User consumer connection closed`);
        } catch (error) {
            throw new AppError(`CloseUserConsumerConnectionError`, 500, `Failed to close user consumer conneciton: ${error}`);
        }
    }
}
