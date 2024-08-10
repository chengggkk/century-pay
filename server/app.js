import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import {
    VerifyDiscordRequest,
    getRandomEmoji,
    sendFaucetETH,
} from "./utils.js";
import subscribersRouter from "./routes/subscribers.js";
import userlink from "./models/userlink.js";
import userlinksRouter from "./routes/userlinks.js";
import sendlink from "./models/sendlink.js";
import createlink from "./models/createlink.js";
import votelink from "./models/votelink.js";
import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    EmbedBuilder,
} from "discord.js";
import { NETWORKS } from "./network.js";

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildIntegrations,
    ],
});



const sendLinkChangeStream = sendlink.watch([
    { $match: { operationType: "update" } },
]);
sendLinkChangeStream.on("change", async (change) => {
    if (change.ns.coll === "sendlinks" && change.operationType === "update") {
        const id = change.documentKey._id;
        const sendLink = await sendlink.findById(id);
        const senderID = sendLink.user;
        const sender = await client.users.fetch(senderID);
        let userLink = await userlink
            .findOne({ address: sendLink.to_address })
            .sort({ generateTIME: -1 });

        // Loop to find the most recent valid address
        while (userLink && userLink.address === "0x") {
            userLink = await userlink
                .findOne({
                    address: sendLink.to_address,
                    generateTIME: { $lt: userLink.generateTIME }, // Find the previous record
                })
                .sort({ generateTIME: -1 });
        }
        let blockscoutLink;
        for (let n in NETWORKS) {
            if (NETWORKS[n].name === sendLink.network) {
                blockscoutLink = `${NETWORKS[n].blockscout}/tx/${sendLink.transactionHash}`;
            }
        }
        if (userLink !== null) {
            const receiver = await client.users.fetch(userLink.user);
            await receiver.send(
                `You received ${sendLink.amount} ETH!\nCheck the transaction at [Blockscout](${blockscoutLink}) 🔎`
            );
        }

        await sender.send(
            `You sent ${sendLink.amount} ETH to ${sendLink.to_address}!\nCheck the transaction at [Blockscout](${blockscoutLink}) 🔎`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

app.use("/subscribers", subscribersRouter);
app.use("/userlinks", userlinksRouter);

app.get("/", (req, res) => res.send("Express on Vercel"));

app.post("/interactions", async (req, res) => {
    const { type, data, member, user } = req.body;
    const { name, options, custom_id } = data;


    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        const userId = member?.user?.id || user?.id;

        if (name === "test") {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: "hello world " + getRandomEmoji(),
                    flags: 64,
                },
            });
        }

        if (name === "check") {
            let userLink = await userlink
                .findOne({ user: userId })
                .sort({ generateTIME: -1 });

            // Loop to find the most recent valid address
            while (userLink && userLink.address === "0x") {
                userLink = await userlink
                    .findOne({
                        user: userId,
                        generateTIME: { $lt: userLink.generateTIME }, // Find the previous record
                    })
                    .sort({ generateTIME: -1 });
            }

            if (!userLink || userLink.address === "0x") {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: `No address connected.`, flags: 64 },
                });
            } else {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Your address is ${userLink.address}`,
                        flags: 64,
                    },
                });
            }
        }

        if (name === "faucet") {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // content: `Sent 0.001 ETH to `,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("Sepolia")
                                .setLabel("Sepolia")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("OptimismSepolia")
                                .setLabel("OptimismSepolia")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("BaseSepolia")
                                .setLabel("BaseSepolia")
                                .setStyle(ButtonStyle.Primary)
                        ),
                    ],
                    flags: 64,
                },
            });
        }

        if (name === "connect") {
            const sessionId = Math.random().toString(36).substring(2, 15);
            const timestamp = new Date();
            const newUserLink = new userlink({
                user: userId,
                autolink: sessionId,
                generateTIME: timestamp,
            });

            try {
                await newUserLink.save();

                const response = {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "Connect your wallet:",
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setLabel("Connect 🔁")
                                    .setStyle(ButtonStyle.Link)
                                    .setURL(
                                        `https://century-pay-web.vercel.app/connect/${sessionId}`
                                    )
                            ),
                        ],
                        flags: 64,
                    },
                };

                res.send(response);
            } catch (error) {
                console.error(error);
                res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "Failed to save user link.", flags: 64 },
                });
            }
        }

        if (name === "createvote") {
            console.log('Channel ID:', data.id);

            const sessionId = Math.random().toString(36).substring(2, 15);
            const timestamp = new Date();
            const channelID = data.id;
        
            // 收集所有选项值并存储为数组
            const optionArray = [];
            for (let i = 1; i <= 10; i++) { // 假设最多有 10 个选项
                const option = options.find(
                    (opt) => opt.name === `option${i}`
                )?.value;
        
                if (option !== undefined) {
                    optionArray.push(option);
                }
            }
        
            const newcreateLink = new createlink({
                user: userId,
                createlink: sessionId,
                generateTIME: timestamp,
                option: optionArray, // 将选项存储为数组
                channelId: channelID,
            });

            await newcreateLink.save();
        
            // 保存投票链接到数据库
            // // 生成选项按钮数组
            // const buttons = [];
            // for (let i = 0; i < optionArray.length; i++) {
            //     buttons.push(
            //         new ButtonBuilder()
            //             .setCustomId(`candidate${i + 1}-${sessionId}`)
            //             .setLabel(`${optionArray[i]}`)
            //             .setStyle(ButtonStyle.Primary)
            //     );
            // }
        
            // // 将按钮分配到 ActionRow 中
            // const actionRows = [];
            // const maxButtonsPerRow = 5; // 每行最多 5 个按钮
            // for (let i = 0; i < buttons.length; i += maxButtonsPerRow) {
            //     const rowButtons = buttons.slice(i, i + maxButtonsPerRow);
            //     actionRows.push(
            //         new ActionRowBuilder().addComponents(rowButtons)
            //     );
            // }
        
            // 返回响应
            const buttons = [
                new ButtonBuilder()
                    .setLabel("Connect 🔁")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://century-pay-web.vercel.app/create/${sessionId}`)
            ];
        
            // 将按钮分配到 ActionRow 中
            const actionRow = new ActionRowBuilder().addComponents(buttons);
        
            // 返回响应
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Please connect:`,
                    components: [actionRow],
                    flags: 64,
                },
            });
        }
        


        if (name === "send") {
            const amount = options.find(
                (option) => option.name === "amount"
            )?.value;
            const to_address = options.find(
                (option) => option.name === "to_address"
            )?.value;

            if (!amount || !to_address) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "Please specify both amount and recipient.",
                        flags: 64,
                    },
                });
            }

            try {
                // Handle if to_address is a user mention or an Ethereum address
                let recipientAddress = to_address;
                if (to_address.startsWith("<@")) {
                    // Extract user ID from the mention
                    const userId = to_address.replace(/[<@!>]/g, "");

                    // Retrieve the most recent valid address for the user from the database
                    let userLink = await userlink
                        .findOne({ user: userId })
                        .sort({ generateTIME: -1 });

                    // Loop to find the most recent valid address
                    while (userLink && userLink.address === "0x") {
                        userLink = await userlink
                            .findOne({
                                user: userId,
                                generateTIME: { $lt: userLink.generateTIME }, // Find the previous record
                            })
                            .sort({ generateTIME: -1 });
                    }

                    if (!userLink || userLink.address === "0x") {
                        return res.send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                content:
                                    "No valid address connected for the user.",
                                flags: 64,
                            },
                        });
                    }
                    recipientAddress = userLink.address;
                } else if (to_address.startsWith("0x")) {
                    // Handle the case where to_address is a valid Ethereum address
                    recipientAddress = to_address;
                } else {
                    // Handle invalid address format
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: "Invalid address or user mention.",
                            flags: 64,
                        },
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
                    to_address: recipientAddress, // Use the resolved recipient address
                });

                await newSendLink.save(); // Save the new send link to the database

                const response = {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `${amount} ETH to ${recipientAddress}`,
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setLabel("Send 💸")
                                    .setStyle(ButtonStyle.Link)
                                    .setURL(
                                        `https://century-pay-web.vercel.app/send/${sessionId}`
                                    )
                            ),
                        ],
                        flags: 64,
                    },
                };

                res.send(response);
            } catch (error) {
                console.error(error);
                res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "Failed to save send link.", flags: 64 },
                });
            }
        }
    }
    if (type === InteractionType.MESSAGE_COMPONENT) {
        // custom_id set in payload when sending message component
        const userId = member?.user?.id || user?.id;

        if (custom_id === "Sepolia") {
            return await sendFaucetETH(res, userId, "sepolia");
        } else if (custom_id === "OptimismSepolia") {
            return await sendFaucetETH(res, userId, "optimismSepolia");
        } else if (custom_id === "BaseSepolia") {
            return await sendFaucetETH(res, userId, "baseSepolia");
        }
    }
});

async function getAddressFromUserId(userId) {
    const userLink = await userlink.findOne({ user: userId });
    return userLink ? userLink.autolink : null;
}

app.listen(PORT, () => {
    console.log("Listening on port", PORT);
});

export default app;