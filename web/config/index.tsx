// config/index.tsx

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import {
    base,
    baseSepolia,
    Chain,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "wagmi/chains";

// Your WalletConnect Cloud project ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

// Create a metadata object
const metadata = {
    name: "Century Pay",
    description: "A discord bot that makes onchain payments easy",
    url: "https://github.com/chengggkk/century-pay", // origin must match your domain & subdomain
    icons: ["https://i.imgur.com/QYfsdUE.png"],
};

export const metal2 = {
    id: 1740,
    name: "Metal L2",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.metall2.com"] },
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer.metall2.com",
        },
    },
} as const satisfies Chain;

export const metal2testnet = {
    id: 1740,
    name: "Metal L2 Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://testnet.rpc.metall2.com"] },
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://testnet.explorer.metall2.com",
        },
    },
} as const satisfies Chain;

// Create wagmiConfig
const chains = [
    mainnet,
    sepolia,
    base,
    baseSepolia,
    optimism,
    optimismSepolia,
    metal2,
    metal2testnet,
] as const;
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,
    auth: {
        email: true, // default to true
        socials: [
            "google",
            "x",
            "github",
            "discord",
            "apple",
            "facebook",
            "farcaster",
        ],
        showWallets: true, // default to true
        walletFeatures: true, // default to true
    },
    storage: createStorage({
        storage: cookieStorage,
    }),
    //   ...wagmiOptions // Optional - Override createConfig parameters
});
