import  { ChannelModel, Channel, connect } from "amqplib";
import { LogService } from "./logService";
import { LogMessage } from "@bug-tracker/logging-lib";
import { AppError } from "@bug-tracker/usermiddleware";
import env from "dotenv";
env.config();

export class RabbitMqConsumer {
    private _RABBITMQ_URL: string;
    private _connection: ChannelModel | null;
    private _channel: Channel | null;
    private _logService: LogService;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.RABBITMQ_URL) {
            throw new AppError(`InvalidEvnData`, 500, `Invalid log consumer rabbitmq url`);
        }
        this._RABBITMQ_URL = process.env.RABBITMQ_URL;
        this._connection = null;
        this._channel = null;
        this._logService = new LogService();
    }

    async connection(): Promise<void> {
        /* If the connection exists exit */
        if (this._connection && this._channel) return;

        try {
            /* Initialize the rabbitmq log consumer connection */
            this._connection = await connect(this._RABBITMQ_URL);

            /* Initialize the connection channel */
            this._channel = await this._connection.createChannel();
        } catch (error) {
            throw new AppError(`LogConsumerConnectionError`, 500, `Failed to initialize rabbitmq consumer connection: ${error}`);
        }
    }

    /**
     * 
     * @param queue The name of the log queue
     */
    async listenToQueue(queue: string) {
        /* Initialize the consumer connection */
        await this.connection(); 

        try {
            /* Initialize the consumer */
            await this._channel?.assertQueue(queue, { durable: true });
            
            this._channel?.consume(queue, async (msg) => {
                /* Check if the log message was not retrieved */
                if (!msg) {
                    throw new AppError(`InvalidLogMessage`, 500, `Failed to retrieve the log consumer message`);
                }

                try {
                    /* Parse the log message */
                    const log: LogMessage = JSON.parse(msg.content.toString());
                    
                    /* Send the log to the service layer to create a new log message */
                    await this._logService.createLog(log);

                    this._channel?.ack(msg);
                } catch (error) {
                    /* Discard the failed message */
                    this._channel?.ack(msg);

                    throw new AppError(`AssertLogConsumerError`, 500, `Failed to initialize the rabbitmq log consumer: ${error}`);
                }
            });

            console.log(`Listening to queue: ${queue}`);
        } catch (error) {
            console.error(`Failed to listen to queue ${queue}:`, error);
        }
    }

    async closeConnection() {
        try {
            /* If the connection is closed exit */
            if (!this._channel && !this.connection) return;

            await this._channel?.close();
            await this._connection?.close();
            console.log(`RabbitMQ consumer connection closed`);
        } catch (error) {
            throw new AppError(`LogConsumerConnectionError`, 500, `Failed to close the rabbitmq consumer connection: ${error}`);
        }
    }
}
