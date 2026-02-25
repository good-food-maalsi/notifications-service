import { ConsumeMessage } from "amqplib";
import { createClient } from "redis";
import { Transporter } from "../config/Mail";

const REDIS_SET_KEY = "welcome:emails";

let redisClient: any = null;
let redisConnectingPromise: Promise<any> | null = null;

async function getRedisClient(): Promise<any> {
    if (redisClient) {
        return redisClient;
    }

    if (redisConnectingPromise) {
        return redisConnectingPromise;
    }

    const redisHost = process.env.REDIS_HOST || "redis";
    const redisPort = process.env.REDIS_PORT || "6379";
    const redisUrl = process.env.REDIS_URL || ("redis://" + redisHost + ":" + redisPort);

    const client = createClient({ url: redisUrl });
    client.on("error", function (err: any) {
        console.error("Redis client error:", err && err.message ? err.message : err);
    });

    redisConnectingPromise = client.connect().then(function () {
        console.log("Connected to Redis:", redisUrl);
        redisClient = client;
        return client;
    });

    return redisConnectingPromise;
}

export default class WelcomeUserConsumer {
    public queue = "WelcomeUserQueue";

    public async onNewMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg) {
            console.log("WelcomeUserConsumer: message is null");
            return;
        }

        const payload = JSON.parse(msg.content.toString()) as WelcomeUserMessageInterface;
        if (!payload || !payload.email) {
            throw new Error("WelcomeUserConsumer: invalid payload");
        }

        const client = await getRedisClient();
        await client.sAdd(REDIS_SET_KEY, payload.email);

        await Transporter.sendMail({
            from: "contact@good-food.fr",
            to: payload.email,
            subject: "Welcome to Good Food",
            text: "Welcome " + (payload.username || "there") + "! Your account has been created.",
            html:
                "<p>Welcome <strong>" +
                (payload.username || "there") +
                "</strong>! Your account has been created.</p>",
        });

        console.log(
            "WelcomeUserConsumer: user welcome processed for email:",
            payload.email,
        );
    }
}

interface WelcomeUserMessageInterface {
    userId?: string;
    username: string;
    email: string;
    createdAt?: string;
}
