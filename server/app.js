import 'dotenv/config';
import express from 'express';
import Web3 from 'web3';
import mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';
import subscribersRouter from './routes/subscribers.js';
import userlink from './models/userlink.js';
import userlinksRouter from './routes/userlinks.js';
import sendlink from './models/sendlink.js';

const app = express();
const PORT = process.env.PORT || 3000;
const web3 = new Web3(process.env.INFURA_URL);

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use('/subscribers', subscribersRouter);
app.use('/userlinks', userlinksRouter);

app.get('/', (req, res) => res.send('Express on Vercel'));




app.post('/interactions', async (req, res) => {
  const { type, data, member, user } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;
    const userId = member?.user?.id || user?.id;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'hello world ' + getRandomEmoji() },
      });
    }

    if (name === 'connect') {
      const sessionId = Math.random().toString(36).substring(2, 15);
      const timestamp = new Date();
      const newUserLink = new userlink({ user: userId, autolink: sessionId, generateTIME: timestamp });

      try {
        await newUserLink.save();
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Connect your wallet here: https://century-pay-web.vercel.app/connect/${sessionId}`
          }
        });
      } catch (error) {
        console.error(error);
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'Failed to save user link.' }
        });
      }
    }

    if (name === 'send') {
        const amount = options.find(option => option.name === 'amount')?.value;
        const to_address = options.find(option => option.name === 'to_address')?.value;
    
        if (!amount || !to_address) {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'Please specify both amount and recipient.' }
            });
        }
    
        try {
            // Fetch the latest connected address for the user
            const userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });
            
            if (!userLink) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: 'User has not connected a wallet.' }
                });
            }
    
            const senderAddress = userLink.address; // Use the connected address
    
            const sessionId = Math.random().toString(36).substring(2, 15);
            const timestamp = new Date();
    
            const newSendLink = new sendlink({
                user: userId,
                sendautolink: sessionId,
                generateTIME: timestamp,
                address: senderAddress,  // Add sender's address here
                amount: amount,
                to_address: to_address
            });
    
            await newSendLink.save();  // Save the new send link to the database
    
            res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `User ID: ${userId}\nSession ID: ${sessionId}\nTimestamp: ${timestamp}\nAmount: ${amount}\nTo Address: ${to_address}\nConnect your wallet here: https://century-pay-web.vercel.app/send/${sessionId}`
                }
            });
        } catch (error) {
            console.error(error);
            res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'Failed to save send link.' }
            });
        }
    }
    
  }
});

async function getAddressFromUserId(userId) {
  const userLink = await userlink.findOne({ user: userId });
  return userLink ? userLink.autolink : null;
}

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

export default app;
