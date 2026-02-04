import * as amqp from 'amqplib';
import {ConsumerInterface, Consumers} from "./Queues";

interface amqpConfig {
    vhost: string;
    protocol: string;
    hostname: string;
    password: string;
    frameMax: number;
    port: number;
    heartbeat: number;
    locale: string;
    username: string
}

let config: amqpConfig = {
    protocol: 'amqp',
    hostname: 'rabbitmq',
    port: 5672,
    username: 'guest',
    password: 'guest',
    locale: 'en_US',
    frameMax: 0,
    heartbeat: 0,
    vhost: '/',
};

function handle() {
    async function start(): Promise<void> {
        try {
            const conn = await createConnection(config);

            for (const consumer of Consumers) {
                let channel = await conn.createChannel();
                await channel.assertQueue(consumer.queue, {durable: true});
                startPollingForMessages(channel, consumer);
            }

        } catch (err) {
            console.error("start: Connection error:", err.message);
        }
    }

    start();
}


async function createConnection(config: amqpConfig) {
    const conn = await amqp.connect(config);

    conn.on("error", function (err) {
        console.error("Connection error:", err.message);
    });

    conn.on("close", function (err) {
        console.error("Connection closed:", err.message);
    });

    return conn;
}

// async function sendMessage(channel, queue, messageContent) {
//     console.log(`sendMessage: sending message: ${messageContent}...`);
//     return channel.sendToQueue(queue, Buffer.from(messageContent))
// }

function startPollingForMessages(ch: amqp.Channel, consumer: ConsumerInterface) {
    ch.consume(consumer.queue, (msg) => {
        consumer.consume(msg);
        ch.ack(msg);
    }).then(() => {
    });
}

handle();