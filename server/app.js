import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';
import subscribersRouter from './routes/subscribers.js';
import userlink from './models/userlink.js';
import userlinksRouter from './routes/userlinks.js';
import sendlink from './models/sendlink.js';
import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,} from 'discord.js';
import { getFakeProfile, fakePlayerProfiles } from './game.js';
import { paginationEmbed } from './pagination.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Web3 and ethers
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

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

        try {
            if (name === 'check') {
                let userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });

                // Find the most recent valid address
                while (userLink && userLink.address === '0x') {
                    userLink = await userlink.findOne({
                        user: userId,
                        generateTIME: { $lt: userLink.generateTIME }
                    }).sort({ generateTIME: -1 });
                }

                const content = userLink && userLink.address !== '0x'
                    ? `Your address is ${userLink.address}`
                    : 'No address connected.';

                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content, flags: 64 }
                });
            }

            if (name === 'faucet') {
                let userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });

                // Find the most recent valid address
                while (userLink && userLink.address === '0x') {
                    userLink = await userlink.findOne({
                        user: userId,
                        generateTIME: { $lt: userLink.generateTIME }
                    }).sort({ generateTIME: -1 });
                }

                if (!userLink || userLink.address === '0x') {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: 'No address connected.', flags: 64 }
                    });
                }

                const recipientAddress = userLink.address;
                const amountToSend = ethers.parseUnits("0.001", "ether");

                try {
                    const tx = await wallet.sendTransaction({
                        to: recipientAddress,
                        value: amountToSend
                    });

                    // Save the transaction details to the database
                    const sendLinkData = new sendlink({
                        user: userId,
                        sendautolink: tx.hash, // Assuming sendautolink is the transaction hash
                        generateTIME: new Date(), // You can omit this as it defaults to Date.now
                        amount: parseFloat(ethers.formatUnits(amountToSend, "ether")),
                        sender_address: wallet.address, // The sender's address (wallet address)
                        to_address: recipientAddress // The recipient's address
                    });

                    await sendLinkData.save();

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
                                            .setURL(`https://eth-sepolia.blockscout.com/tx/${tx.hash}`)
                                    )
                            ],
                            flags: 64
                        }
                    });
                } catch (error) {
                    console.error(error);
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: `Failed to send ETH. Error: ${error.message}`, flags: 64 }
                    });
                }
            }





            if (type === InteractionType.APPLICATION_COMMAND || type === InteractionType.MESSAGE_COMPONENT) {
                const { name, options, custom_id } = data;
                const userId = member?.user?.id || user?.id;

                let page = 1;

                if (type === InteractionType.MESSAGE_COMPONENT) {
                    // Extract information from the custom ID
                    const [action, commandName, actionType, pageNumber] = custom_id.split('_');
                    name = commandName;
                    page = parseInt(pageNumber, 10);
                    page = actionType === 'next' ? page + 1 : page - 1;
                } else if (options && options.length) {
                    page = parseInt(options[0].value, 10) || 1;
                }

                if (name === 'sender' || name === 'receiver') {
                    // Find the most recent valid address
                    let userLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });

                    while (userLink && userLink.address === '0x') {
                        userLink = await userlink.findOne({
                            user: userId,
                            generateTIME: { $lt: userLink.generateTIME }
                        }).sort({ generateTIME: -1 });
                    }

                    if (!userLink || userLink.address === '0x') {
                        return res.send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: { content: 'No address connected.', flags: 64 }
                        });
                    }

                    // Pagination setup
                    const recordsPerPage = 10;
                    const skip = (page - 1) * recordsPerPage;

                    // Query based on the command type
                    const query = name === 'sender'
                        ? { sender_address: userLink.address }
                        : { to_address: userLink.address };

                    // Fetch transactions (including one extra to check for next page)
                    const transactions = await sendlink.find(query)
                        .sort({ generateTIME: -1 })
                        .skip(skip)
                        .limit(recordsPerPage + 1); // Fetch one extra record to check if the next page exists

                    if (transactions.length === 0) {
                        return res.send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: { content: 'No transactions found.', flags: 64 }
                        });
                    }

                    // Create embeds for each page of transactions
                    const embeds = [];
                    for (let i = 0; i < Math.ceil(transactions.length / recordsPerPage); i++) {
                        const pageTransactions = transactions.slice(i * recordsPerPage, (i + 1) * recordsPerPage);

                        const embed = new EmbedBuilder()
                            .setTitle(`Transactions (Page ${i + 1})`)
                            .setColor(0x00AE86)
                            .addFields(
                                pageTransactions.map(trx => ({
                                    name: `Amount: ${trx.amount}`,
                                    value: `**Sender Address:** ${trx.sender_address}\n**Time:** ${trx.generateTIME.toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                                    inline: false
                                }))
                            )
                            .setFooter({ text: `Page ${i + 1} / ${Math.ceil(transactions.length / recordsPerPage)}` });

                        embeds.push(embed);
                    }

                    // Define buttons for pagination
                    const prevButton = new ButtonBuilder()
                        .setCustomId(`paginate_${name}_prev_${page}`)
                        .setLabel('Previous Page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1);

                    const nextButton = new ButtonBuilder()
                        .setCustomId(`paginate_${name}_next_${page}`)
                        .setLabel('Next Page')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(embeds.length <= 1 || transactions.length <= recordsPerPage);

                    // Use the paginationEmbed function
                    await paginationEmbed(interaction, embeds, [prevButton, nextButton]);

                    return;
                }
            }

            if (name === 'connect') {
                const sessionId = Math.random().toString(36).substring(2, 15);
                const timestamp = new Date();
                const newUserLink = new userlink({ user: userId, autolink: sessionId, generateTIME: timestamp });

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

                return res.send(response);
            }

            if (name === 'profile') {
                // Get the fake profile
                const profile = getFakeProfile(0);

                // Create an embed for the profile
                const profileEmbed = {
                    title: `${profile.username}'s Profile`,
                    fields: [
                        { name: 'Level', value: profile.stats.level, inline: true },
                        { name: 'Wins', value: profile.stats.wins, inline: true },
                        { name: 'Losses', value: profile.stats.losses, inline: true },
                        { name: 'Realms', value: profile.stats.realms, inline: true },
                        { name: 'Rank', value: profile.stats.rank, inline: true },
                        { name: 'Account Created', value: profile.createdAt, inline: true },
                        { name: 'Last Played', value: profile.lastPlayed, inline: true },
                    ],
                    color: 0x00AE86,
                };

                // Use interaction context that the interaction was triggered from
                const interactionContext = req.body.context;

                // Construct `data` for our interaction response. The profile embed will be included regardless of interaction context
                let profilePayloadData = {
                    embeds: [profileEmbed],
                };

                // If profile isn't run in a DM with the app, we'll make the response ephemeral and add a share button
                if (interactionContext !== 1) {
                    // Make message ephemeral
                    profilePayloadData['flags'] = 64;
                    // Add button to components
                    profilePayloadData['components'] = [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: 'Share Profile',
                                    custom_id: 'share_profile',
                                    style: 2,
                                },
                            ],
                        },
                    ];
                }

                // Send response
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: profilePayloadData,
                });
            }


            if (name === 'send') {
                const amount = options.find(option => option.name === 'amount')?.value;
                const to_address = options.find(option => option.name === 'to_address')?.value;

                if (!amount || !to_address) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: 'Please specify both amount and recipient.', flags: 64 }
                    });
                }

                let recipientAddress = to_address;
                if (to_address.startsWith('<@')) {
                    const mentionedUserId = to_address.replace(/[<@!>]/g, '');

                    let userLink = await userlink.findOne({ user: mentionedUserId }).sort({ generateTIME: -1 });

                    while (userLink && userLink.address === '0x') {
                        userLink = await userlink.findOne({
                            user: mentionedUserId,
                            generateTIME: { $lt: userLink.generateTIME }
                        }).sort({ generateTIME: -1 });
                    }

                    if (!userLink || userLink.address === '0x') {
                        return res.send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: { content: 'No valid address connected for the user.', flags: 64 }
                        });
                    }
                    recipientAddress = userLink.address;
                } else if (!to_address.startsWith('0x')) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: 'Invalid address or user mention.', flags: 64 }
                    });
                }

                const sessionId = Math.random().toString(36).substring(2, 15);
                const timestamp = new Date();
                let senderLink = await userlink.findOne({ user: userId }).sort({ generateTIME: -1 });

                while (senderLink && senderLink.address === '0x') {
                    senderLink = await userlink.findOne({
                        user: userId,
                        generateTIME: { $lt: senderLink.generateTIME }
                    }).sort({ generateTIME: -1 });
                }

                const senderAddress = senderLink ? senderLink.address : '0x';

                const newSendLink = new sendlink({
                    user: userId,
                    sendautolink: sessionId,
                    generateTIME: timestamp,
                    amount: amount,
                    sender_address: senderAddress,
                    to_address: recipientAddress
                });

                await newSendLink.save();

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

                return res.send(response);
            }
        } catch (error) {
            console.error(error);
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `An error occurred: ${error.message}`, flags: 64 }
            });
        }
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

export default app;


