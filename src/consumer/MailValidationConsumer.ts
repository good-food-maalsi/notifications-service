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
            text: `Button : ` + mailValidationMessage.magicToken,
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
    email:string,
    magicToken: string,
}