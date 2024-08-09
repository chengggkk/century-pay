import "dotenv/config";
import { ethers } from "ethers";

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
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

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

    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name, options } = data;
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
        const { name, options, custom_id } = data;
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
