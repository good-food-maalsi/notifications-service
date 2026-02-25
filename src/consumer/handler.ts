import * as amqp from "amqplib";
import { ConsumerInterface, Consumers } from "./Queues";

const RETRY_DELAY_MS = parseInt(process.env.RABBITMQ_RETRY_MS || "5000", 10);

function safeErrorMessage(err: any): string {
    if (err && err.message) {
        return err.message;
    }

    return String(err);
}

function buildRabbitMqUrl(): string {
    if (process.env.RABBITMQ_URL) {
        return process.env.RABBITMQ_URL;
    }

    const protocol = process.env.RABBITMQ_PROTOCOL || "amqp";
    const username = process.env.RABBITMQ_USERNAME || process.env.RABBITMQ_USER || "guest";
    const password = process.env.RABBITMQ_PASSWORD || "guest";
    const configuredHost = process.env.RABBITMQ_HOST || "localhost";
    const configuredPort = process.env.RABBITMQ_PORT || "5672";
    let vhost = process.env.RABBITMQ_VHOST || "/";

    if (vhost.charAt(0) !== "/") {
        vhost = "/" + vhost;
    }

    let host = configuredHost;
    if (host.indexOf("amqp://") === 0 || host.indexOf("amqps://") === 0) {
        host = host.replace("amqp://", "").replace("amqps://", "");
    }

    const hostParts = host.split("@");
    host = hostParts[hostParts.length - 1];

    if (host.indexOf(":") === -1) {
        host = host + ":" + configuredPort;
    }

    return (
        protocol +
        "://" +
        encodeURIComponent(username) +
        ":" +
        encodeURIComponent(password) +
        "@" +
        host +
        vhost
    );
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function startPollingForMessages(ch: amqp.Channel, consumer: ConsumerInterface): Promise<void> {
    return ch.consume(
        consumer.queue,
        async (msg) => {
            if (!msg) {
                return;
            }

            try {
                await Promise.resolve(consumer.consume(msg));
                ch.ack(msg);
            } catch (err) {
                console.error("Consumer processing error:", safeErrorMessage(err));
                ch.nack(msg, false, false);
            }
        },
        { noAck: false },
    ).then(() => {});
}

async function startConsumers(connection: amqp.ChannelModel): Promise<void> {
    for (const consumer of Consumers) {
        const channel = await connection.createChannel();
        await channel.assertQueue(consumer.queue, { durable: true });
        await channel.prefetch(1);
        await startPollingForMessages(channel, consumer);
        console.log("Consumer started on queue:", consumer.queue);
    }
}

async function runWithReconnect(): Promise<void> {
    const rabbitUrl = buildRabbitMqUrl();
    console.log("Notifications consumer booting...");

    while (true) {
        try {
            console.log("Connecting to RabbitMQ...");
            const conn = await amqp.connect(rabbitUrl);
            console.log("Connected to RabbitMQ:", rabbitUrl);

            conn.on("error", function (err) {
                console.error("RabbitMQ connection error:", safeErrorMessage(err));
            });

            const closedPromise = new Promise<void>((resolve) => {
                conn.on("close", function () {
                    console.error("RabbitMQ connection closed. Reconnecting...");
                    resolve();
                });
            });

            await startConsumers(conn);
            await closedPromise;
        } catch (err) {
            console.error("RabbitMQ startup error:", safeErrorMessage(err));
        }

        await wait(RETRY_DELAY_MS);
    }
}

runWithReconnect().catch((err) => {
    console.error("Unhandled consumer error:", safeErrorMessage(err));
    process.exit(1);
});
