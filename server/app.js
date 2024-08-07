import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import Web3 from 'web3';
import mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';
import subscribersRouter from './routes/subscribers.js';
import userlink from './models/userlink.js';
import userlinksRouter from './routes/userlinks.js';

const app = express(); // Initialize Express app
const PORT = process.env.PORT || 3000;
const web3 = new Web3(process.env.INFURA_URL); // Use your Infura URL

app.use(express.json());

console.log('Database URL:', process.env.DATABASE_URL); // Should output your MongoDB URL

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use('/subscribers', subscribersRouter);
app.use('/userlinks', userlinksRouter);

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
    const { name, options } = data;
    const userId = member?.user?.id || user?.id;

    if (name === 'send') {
      const amount = options.find(option => option.name === 'amount')?.value;
      const recipient = options.find(option => option.name === 'to_address')?.value;

      if (!amount || !recipient) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Please specify both amount and recipient.',
          }
        });
      }

      try {
        const senderAddress = process.env.SENDER_ADDRESS;
        const privateKey = process.env.PRIVATE_KEY;

        let recipientAddress;

        if (web3.utils.isAddress(recipient)) {
          recipientAddress = recipient;
        } else {
          recipientAddress = await getAddressFromUserId(recipient); // Resolve user ID to wallet address
        }

        if (!web3.utils.isAddress(recipientAddress)) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Invalid recipient address.',
            }
          });
        }

        const senderBalance = await web3.eth.getBalance(senderAddress);

        if (web3.utils.toWei(amount, 'ether') > senderBalance) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'Insufficient funds.',
            }
          });
        }

        const tx = {
          from: senderAddress,
          to: recipientAddress,
          value: web3.utils.toWei(amount, 'ether'),
          gas: 21000,
          gasPrice: web3.utils.toWei('10', 'gwei')
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Successfully sent ${amount} ETH to ${recipientAddress}. Transaction hash: ${receipt.transactionHash}`,
          }
        });
      } catch (error) {
        console.error(error);
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Failed to send transaction.',
          }
        });
      }
    }
  }
});

async function getAddressFromUserId(userId) {
  // Implement logic to resolve user ID to wallet address
  const userLink = await userlink.findOne({ user: userId });
  return userLink ? userLink.autolink : null; // Return wallet address if found
}

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

export default app;
