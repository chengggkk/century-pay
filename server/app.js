import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';
import Web3 from 'web3';
import mongoose from 'mongoose';
import subscribersRouter from './routes/subscribers.js';
import userlink from './models/userlink.js';
import userlinksRouter from './routes/userlinks.js';

const app = express(); // 初始化 Express 应用
const PORT = process.env.PORT || 3000;
const web3 = new Web3(process.env.INFURA_URL); // 使用你的 Infura URL

app.use(express.json());

console.log('Database URL:', process.env.DATABASE_URL); // 应该输出你的 MongoDB URL

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

app.use('/subscribers', subscribersRouter);
app.use('/userlinks', userlinksRouter); 

// 使用 Map 存储用户会话
const userSessions = new Map();

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.get('/', (req, res) => res.send('Express on Vercel'));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async (req, res) => {
  const { type, data, member, user } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    const userId = member?.user?.id || user?.id;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }

    if (name === 'connect') {
      const userId = member.user.id;

      let sessionId;
      let isUnique = false;

      // 循环生成唯一的 sessionId
      while (!isUnique) {
        sessionId = Math.random().toString(36).substring(2, 15);
        const existingLink = await userlink.findOne({ autolink: sessionId });
        if (!existingLink) {
          isUnique = true;
        }
      }

      const timestamp = new Date();

      const newUserLink = new userlink({
        user: userId,
        autolink: sessionId,
        generateTIME: timestamp,
      });

      try {
        await newUserLink.save();
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `User ID: ${userId}\nSession ID: ${sessionId}\nTimestamp: ${timestamp}\nConnect your wallet here: https://connect-wallet/${sessionId}`
          }
        });
      } catch (error) {
        console.error(error);
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to save user link.'
          }
        });
      }
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

export default app;
