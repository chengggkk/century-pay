import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';
import Web3 from 'web3';

const app = express();
const PORT = process.env.PORT || 3000;
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // Replace with your Infura project ID

// Use a Map to store user sessions
const userSessions = new Map();

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/create-wallet', async (req, res) => {
  try {
    const account = web3.eth.accounts.create();
    res.status(200).json({ address: account.address });
  } catch (error) {
    res.status(500).json({ error: 'Error creating wallet' });
  }
});

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
        data: {
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }

    if (name === 'create_wallet') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Click the button to create a wallet.',
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  custom_id: 'create_wallet',
                  label: 'Create Wallet',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }

    if (name === 'login') {
      const privateKey = options?.find(option => option.name === 'private_key')?.value;
      if (!privateKey) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Please provide a private key.',
          },
        });
      }

      try {
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        if (userId) {
          userSessions.set(userId, account); // Store user session
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Logged in as ${account.address}`,
              components: [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: 'pay_button',
                      label: 'Pay',
                      style: ButtonStyleTypes.PRIMARY,
                    },
                  ],
                },
              ],
            },
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'User ID not found.',
            },
          });
        }
      } catch (error) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Error logging in: ${error.message}`,
          },
        });
      }
    }

    if (name === 'pay') {
      const amount = options?.find(option => option.name === 'amount')?.value;
      const toAddress = options?.find(option => option.name === 'to_address')?.value;

      if (!amount || !toAddress) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Please provide both amount and recipient address.',
          },
        });
      }

      const userId = member?.user?.id || user?.id;
      const account = userSessions.get(userId);

      if (!account) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'You need to log in first.',
          },
        });
      }

      try {
        const tx = {
          from: account.address,
          to: toAddress,
          value: web3.utils.toWei(amount, 'ether'),
          gas: 2000000,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Payment of ${amount} ETH sent to ${toAddress}`,
          },
        });
      } catch (error) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Error sending payment: ${error.message}`,
          },
        });
      }
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const { custom_id } = data;

    if (custom_id === 'create_wallet') {
      try {
        const response = await fetch('http://localhost:3000/create-wallet', { method: 'POST' });
        const walletData = await response.json();
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Wallet created: ${walletData.address}`,
          },
        });
      } catch (error) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Error creating wallet: ${error.message}`,
          },
        });
      }
    }

    if (custom_id === 'pay_button') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Please provide the amount and recipient address using the /pay command.',
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
