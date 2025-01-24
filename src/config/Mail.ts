import * as nodemailer from "nodemailer";

export const Transporter = nodemailer.createTransport({
    host: 'mailhog',
    port: 1025,
});