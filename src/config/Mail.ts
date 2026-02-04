import * as nodemailer from "nodemailer";
import nodemailerMjmlPlugin from "nodemailer-mjml";
import {join} from "path";

export const Transporter = nodemailer.createTransport({
    host: 'mailhog',
    port: 1025,
}).use(
    'compile',
    nodemailerMjmlPlugin({templateFolder: join(__dirname, "templates")})
);

