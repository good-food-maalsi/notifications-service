const amqp = require('amqplib');
var nodemailer = require('nodemailer');

// const mailhog = require('mailhog')({
//     host: 'mailhog'
// })

const queue = 'test';

// Set your config here...
let config = {
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

const express = require('express');
const app = express();

app.get('/notification', (req, res) => {
    res.send('Hello');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});


const transporter = nodemailer.createTransport({
    host: 'mailhog',
    port: 1025,
});

const mailOptions = {
    from: 'test@test.test',
    to: 'test@test.test',
    subject: `Your subject`,
    text: `Your text content`
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
    console.log(`onNewMessage: received message: ${msg.content.toString()}`);
    transporter.sendMail(mailOptions, function (error, info) {
        console.log('sendMail: sending email...');
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

start();