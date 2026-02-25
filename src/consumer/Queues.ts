import MailValidationConsumer from "./MailValidationConsumer";
import {ConsumeMessage} from "amqplib";
import WelcomeUserConsumer from "./WelcomeUserConsumer";

const Classes = {
    MailValidationConsumer: new MailValidationConsumer(),
    WelcomeUserConsumer: new WelcomeUserConsumer(),
};

export interface ConsumerInterface {
    name: string;
    consume: (msg: ConsumeMessage) => Promise<void> | void;
    type: string;
    queue: string;
}

export let Consumers: ConsumerInterface[] = [
    {
        name: "MailValidationQueue",
        consume: Classes.MailValidationConsumer.onNewMessage.bind(Classes.MailValidationConsumer),
        type: "MailValidationMessage",
        queue: Classes.MailValidationConsumer.queue,
    },
    {
        name: "WelcomeUserQueue",
        consume: Classes.WelcomeUserConsumer.onNewMessage.bind(Classes.WelcomeUserConsumer),
        type: "WelcomeUserMessage",
        queue: Classes.WelcomeUserConsumer.queue,
    },
];