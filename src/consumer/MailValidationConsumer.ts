import {ConsumeMessage} from "amqplib";
import {Transporter} from "../config/mail";

export default class MailValidationConsumer {

    public queue = "MailValidationQueue";

    public onNewMessage(msg: ConsumeMessage | null): void {
        console.log(`onNewMessage: received message: ${msg.content.toString()}`);

        if (!msg) {
            console.log("onNewMessage: message is null");
            return;
        }

        const mailValidationMessage = JSON.parse(msg.content.toString()) as MailValidationMessageInterface;

        const mailOptions = {
            from: 'contact@good-food.fr',
            to: mailValidationMessage.email,
            subject: `Your subject`,
            templateLayoutName: "MailValidationLayout",
            templateLayoutSlots: {
                header: "partials/header",
                footer: "partials/footer",
            },
            templateData: {
                content: {
                    imageURL: "http://5vph.mj.am/img/5vph/b/1g8pi/068ys.png",
                    magicToken: mailValidationMessage.magicToken,
                    username: mailValidationMessage.username,
                }
            }
        };

        Transporter.sendMail(mailOptions, function (error, info) {
            console.log('sendMail: sending email...');
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

}

interface MailValidationMessageInterface {
    username: string,
    email: string,
    magicToken: string,
}