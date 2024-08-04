import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import {
    InteractionType,
    InteractionResponseType,
    MessageComponentTypes,
    ButtonStyleTypes,
} from "discord-interactions";
import { VerifyDiscordRequest, getRandomEmoji } from "./utils.js";
import Web3 from "web3";

const app = express();
const PORT = process.env.PORT || 3000;
const web3 = new Web3(process.env.INFURA_URL); // Replace with your Infura project ID

// Use a Map to store user sessions
const userSessions = new Map();

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.get("/", (req, res) => res.send("Express on Vercel"));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
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
                },
            });
        }

        if (name === "create_wallet") {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: "Click the button to create a wallet.",
                    components: [
                        {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: [
                                {
                                    type: MessageComponentTypes.BUTTON,
                                    custom_id: "create_wallet",
                                    label: "Create Wallet",
                                    style: ButtonStyleTypes.PRIMARY,
                                },
                            ],
                        },
                    ],
                },
            });
        }

        if (name === "login") {
            const privateKey = options?.find(
                (option) => option.name === "private_key"
            )?.value;
            if (!privateKey) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "Please provide a private key.",
                    },
                });
            }

            try {
                const account =
                    web3.eth.accounts.privateKeyToAccount(privateKey);
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
                                            custom_id: "pay_button",
                                            label: "Pay",
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
                            content: "User ID not found.",
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
    }

    if (type === InteractionType.MESSAGE_COMPONENT) {
        const { custom_id } = data;

        if (custom_id === "create_wallet") {
            try {
                const account = web3.eth.accounts.create();
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Wallet created: ${account.address}`,
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

        if (custom_id === "pay_button") {
            const userId = member?.user?.id || user?.id;
            if (!userId || !userSessions.has(userId)) {
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "You need to log in first.",
                    },
                });
            }

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content:
                        "Please provide the amount and recipient address using the /pay command.",
                },
            });
        }
    }
});

app.listen(PORT, () => {
    console.log("Listening on port", PORT);
});

export default app;
