import amqp from 'amqplib';
import { LogMessage } from './utils/types/Log';
import { LogService } from './service/logService';

export class RabbitMqConsumer {
    private RABBITMQ_URL = "amqp://localhost/";
    private EXCHANGE_NAME = "log-exchange";
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private patterns: string[] = ["log.audit.#", "log.monitor.#", "log.error.#"];

    async connect(): Promise<amqp.Channel> {
        if (!this.connection) {
            this.connection = await amqp.connect(this.RABBITMQ_URL);
        }

        if (!this.channel) {
            this.channel = await this.connection.createChannel();
        }

        return this.channel;
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }

    async listenToLogs() {
        try {
            if (!this.channel) {
                this.channel = await this.connect();
            }
            
            await this.channel.assertExchange(this.EXCHANGE_NAME, "topic", {durable: true});

            const auditQueue = "log-queue";

            await this.channel.assertQueue(auditQueue, {durable: true});

            this.patterns.forEach(async (pattern) => {
                if (!this.channel) {
                    this.channel = await this.connect();
                }

                await this.channel.bindQueue(auditQueue, this.EXCHANGE_NAME, pattern);

                this.channel.consume(auditQueue, async (msg) => {
                    if (msg) {
                        const data: string = JSON.parse(msg.content.toString());

                        new LogService().createLog(JSON.parse(data));

                        this.channel?.ack(msg);
                    }
                });
            });
        } catch (error) {
            console.error("Error at setting up log consumer", error);
        }

    }
    
}