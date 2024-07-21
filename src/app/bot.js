"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const token = process.env.TELEGRAM_BOT_API_TOKEN || '';
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const feedback = msg.text || '';
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Feedback from Telegram Bot',
        text: `Feedback: ${feedback}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return bot.sendMessage(chatId, 'Error sending feedback. Please try again.');
        }
        bot.sendMessage(chatId, 'Thank you for your feedback!');
    });
});
console.log('Bot is running...');
