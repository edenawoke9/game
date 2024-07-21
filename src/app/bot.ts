import TelegramBot from 'node-telegram-bot-api';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
if (!process.env.TELEGRAM_BOT_API_TOKEN || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const token: string = process.env.TELEGRAM_BOT_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Conversation state for each user
const userStates: { [key: number]: { step: string; name?: string; feedback?: string; contact_Info?:string} } = {};

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
    bot.sendMessage(chatId,`${userState.name},please provide your feedback.`);
  } else if (userState.step === 'askFeedback') {
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
