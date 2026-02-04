import MailValidationConsumer from "./MailValidationConsumer";
import {ConsumeMessage} from "amqplib";

const Classes = {
    MailValidationConsumer: new MailValidationConsumer()
};

export interface ConsumerInterface {
    name: string;
    consume: (msg: ConsumeMessage) => void;
    type: string;
    queue: string;
}

export let Consumers: [ConsumerInterface] = [
    {
        name: "MailValidationQueue",
        consume: Classes.MailValidationConsumer.onNewMessage,
        type: "MailValidationMessage",
        queue: Classes.MailValidationConsumer.queue,
    }
];