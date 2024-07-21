"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate environment variables
if (!process.env.TELEGRAM_BOT_API_TOKEN || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing environment variables. Please check your .env file.');
    process.exit(1);
}
const token = process.env.TELEGRAM_BOT_API_TOKEN;
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Conversation state for each user
const userStates = {};
// Handle /start command
bot.onText(/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'please, provide a contact information');
    userStates[chatId] = { step: 'askName' };
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    if (!userStates[chatId]) {
        bot.sendMessage(chatId, 'Please type /start to begin again.');
        return;
    }
    const userState = userStates[chatId];
    if (userState.step === 'askName') {
        userState.name = text;
        userState.step = 'askFeedback';
        bot.sendMessage(chatId, `${userState.name},please provide your feedback.`);
    }
    else if (userState.step === 'askFeedback') {
        userState.feedback = text;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Change this if you want to send to another address
            subject: 'New Feedback from Telegram Bot',
            text: `Name: ${userState.name}\nFeedback: ${userState.feedback}`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return bot.sendMessage(chatId, 'Error sending feedback. Please try again.');
            }
            bot.sendMessage(chatId, 'Thank you for your feedback!');
            delete userStates[chatId]; // Clear the state after feedback is sent
        });
    }
});
console.log('Bot is running...');
