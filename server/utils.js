import "dotenv/config";
import { ethers } from "ethers";
import { verifyKey } from "discord-interactions";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import userlink from "./models/userlink.js";
import { NETWORKS } from "./network.js";

export function VerifyDiscordRequest(clientKey) {
    return function (req, res, buf, encoding) {
        const signature = req.get("X-Signature-Ed25519");
        const timestamp = req.get("X-Signature-Timestamp");

        const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
        if (!isValidRequest) {
            res.status(401).send("Bad request signature");
            throw new Error("Bad request signature");
        }
    };
}

export async function DiscordRequest(endpoint, options) {
    const url = "https://discord.com/api/v10/" + endpoint;
    if (options.body) options.body = JSON.stringify(options.body);
    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            "Content-Type": "application/json; charset=UTF-8",
            "User-Agent":
                "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
        },
        ...options,
    });
    if (!res.ok) {
        const data = await res.json();
        console.log(res.status);
        throw new Error(JSON.stringify(data));
    }
    return res;
}

export async function InstallGlobalCommands(appId, commands) {
    const endpoint = `applications/${appId}/commands`;
    try {
        await DiscordRequest(endpoint, { method: "PUT", body: commands });
    } catch (err) {
        console.error(err);
    }
}

export function getRandomEmoji() {
    const emojiList = [
        "😭",
        "😄",
        "😌",
        "🤓",
        "😎",
        "😤",
        "🤖",
        "😶‍🌫️",
        "🌏",
        "📸",
        "💿",
        "👋",
        "🌊",
        "✨",
    ];
    return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function sendFaucetETH(res, userId, network) {
    let userLink = await userlink
        .findOne({ user: userId })
        .sort({ generateTIME: -1 });
    // Find the most recent valid address
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
    }

    const recipientAddress = userLink.address;
    const amountToSend = "1000000000000000"; // 0.001 ETH in Wei

    // Load wallet from private key in .env
    const provider = new ethers.JsonRpcProvider(NETWORKS[network].url);
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
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel("blockscout🔎")
                            .setStyle(ButtonStyle.Link)
                            .setURL(
                                `${NETWORKS[network].blockscout}/tx/${tx.hash}`
                            )
                    ),
                ],
                flags: 64,
            },
        });
    } catch (error) {
        console.error(error);
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Failed to send ETH. Error: ${error.message}`,
            },
        });
    }
}
