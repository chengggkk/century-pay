import 'dotenv/config';
import { ethers } from "ethers";
import { NETWORKS } from "./network.js";
console.log(ethers.providers); // Should log the available providers if imported correctly

import express from 'express';
import mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';
import subscribersRouter from './routes/subscribers.js';
import userlink from './models/userlink.js';
import userlinksRouter from './routes/userlinks.js';
import sendlink from './models/sendlink.js';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';


const app = express();
const PORT = process.env.PORT || 3000;


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
                data: { 
                    content: 'hello world ' + getRandomEmoji() ,
                    flags: 64
                }
            });
        }

        if (name === 'check') {
            let userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });

            // Loop to find the most recent valid address
            while (userLink && userLink.address === '0x') {
                userLink = await userlink.findOne({
                    user: userId,
                    generateTIME: { $lt: userLink.generateTIME } // Find the previous record
                }).sort({ generateTIME: -1 });
            }

            if (!userLink || userLink.address === '0x') {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `No address connected.`,
                    flags: 64
                     }
                });
            } else {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `Your address is ${userLink.address}` ,
                    flags: 64
                }
                });
            }
        }

        if (name === 'faucet') {
            const network = options.find(option => option.name === 'network')?.value;
            if (network !== 'sepolia' && network !== 'optimismSepolia' && network !== 'baseSepolia') {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `Current newtwork is not supported. Current supported networks are: \`sepolia\`, \`optimismSepolia\`, \`baseSepolia\`` ,
                    flags: 64
                }
                });
            }
            let userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });
            // Find the most recent valid address
            while (userLink && userLink.address === '0x') {
                userLink = await userlink.findOne({
                    user: userId,
                    generateTIME: { $lt: userLink.generateTIME } // Find the previous record
                }).sort({ generateTIME: -1 });
            }
        
            if (!userLink || userLink.address === '0x') {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `No address connected.`, flags: 64 }
                });
            }
        
            const recipientAddress = userLink.address;
            const amountToSend = "1000000000000000"; // 0.001 ETH in Wei
            
            // Load wallet from private key in .env
            const provider = new ethers.JsonRpcProvider(NETWORKS[network].url); // Ensure .env contains INFURA_URL
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
            try {
                const tx = await wallet.sendTransaction({
                    to: recipientAddress,
                    value: amountToSend,
                });        

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { 
                        content: `Sent 0.001 ETH to ${recipientAddress}.`,
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel('blockscout🔎')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`${NETWORKS[network].blockscout}/tx/${tx.hash}`)
                                )
                        ],
                        flags: 64
                    }
                });
            } catch (error) {
                console.error(error);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `Failed to send ETH. Error: ${error.message}` }
                });
            }
        }
        


        if (name === 'connect') {
            const sessionId = Math.random().toString(36).substring(2, 15);
            const timestamp = new Date();
            const newUserLink = new userlink({ user: userId, autolink: sessionId, generateTIME: timestamp });

            try {
                await newUserLink.save();

                const response = {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'Connect your wallet:',
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel('Connect 🔁')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`https://century-pay-web.vercel.app/connect/${sessionId}`)
                                )
                        ],
                        flags: 64
                    }
                };

                res.send(response);

            } catch (error) {
                console.error(error);
                res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: 'Failed to save user link.',
                    flags: 64
                     }
                });
            }
        }

        if (name === 'send') {
            const amount = options.find(option => option.name === 'amount')?.value;
            const to_address = options.find(option => option.name === 'to_address')?.value;



            if (!amount || !to_address) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: 'Please specify both amount and recipient.',
                    flags: 64
                     }
                });
            }

            try {
                // Handle if to_address is a user mention or an Ethereum address
                let recipientAddress = to_address;
                if (to_address.startsWith('<@')) {
                    // Extract user ID from the mention
                    const userId = to_address.replace(/[<@!>]/g, '');

                    // Retrieve the most recent valid address for the user from the database
                    let userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });

                    // Loop to find the most recent valid address
                    while (userLink && userLink.address === '0x') {
                        userLink = await userlink.findOne({
                            user: userId,
                            generateTIME: { $lt: userLink.generateTIME } // Find the previous record
                        }).sort({ generateTIME: -1 });
                    }

                    if (!userLink || userLink.address === '0x') {
                        return res.send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: { content: 'No valid address connected for the user.',
                            flags: 64
                             }
                        });
                    }
                    recipientAddress = userLink.address;
                } else if (to_address.startsWith('0x')) {
                    // Handle the case where to_address is a valid Ethereum address
                    recipientAddress = to_address;
                } else {
                    // Handle invalid address format
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: 'Invalid address or user mention.',
                            flags: 64
                         }
                    });
                }

                // Create a new send link
                const sessionId = Math.random().toString(36).substring(2, 15);
                const timestamp = new Date();

                const newSendLink = new sendlink({
                    user: userId, // Use the correct user ID if available
                    sendautolink: sessionId,
                    generateTIME: timestamp,
                    amount: amount,
                    to_address: recipientAddress // Use the resolved recipient address
                });

                await newSendLink.save(); // Save the new send link to the database

                const response = {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${amount} ETH to ${recipientAddress}`,
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setLabel('Send 💸')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(`https://century-pay-web.vercel.app/send/${sessionId}`)
                                )
                        ],
                        flags: 64
                    }
                };

                res.send(response);

            } catch (error) {
                console.error(error);
                res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: 'Failed to save send link.',
                    flags: 64
                     },
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
