const amqp = require('amqplib');

const queue = 'test';

// Set your config here...
let config = {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
    locale: 'en_US',
    frameMax: 0,
    heartbeat: 0,
    vhost: '/',
};

async function start() {
    try {
        const conn = await createConnection(config);
        console.log("Connected to AMQP server.");
        let channel = await conn.createChannel();
        await channel.assertQueue(queue, {durable: true});

        startPollingForMessages(channel);
    } catch (err) {
        console.error("start: Connection error:", err.message);
    }
}

async function createConnection(config) {
    const conn = await amqp.connect(config);

    conn.on("error", function (err) {
        console.error("Connection error:", err.message);
    });

    conn.on("close", function () {
        console.error("Connection closed:", err.message);
    });

    return conn;
}

async function sendMessage(channel, queue, messageContent) {
    console.log(`sendMessage: sending message: ${messageContent}...`);
    return channel.sendToQueue(queue, Buffer.from(messageContent))
}

function startPollingForMessages(ch) {
    ch.consume(queue, (msg) => {
        onNewMessage(msg);
        ch.ack(msg);
    });
}

function onNewMessage(msg) {
    // Do your database stuff or whatever here....
    console.log("On new message:", msg.content.toString())
}

start();