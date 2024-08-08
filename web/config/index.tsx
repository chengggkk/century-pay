// config/index.tsx

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import {
    base,
    baseSepolia,
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
    icons: ["https://avatars.githubusercontent.com/u/153604637"],
};

// Create wagmiConfig
const chains = [
    mainnet,
    sepolia,
    base,
    baseSepolia,
    optimism,
    optimismSepolia,
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
