import "dotenv/config";

if (!process.env.ALCHEMY_KEY) {
    throw new Error("ALCHEMY_KEY is not set");
}

export const NETWORKS = {
    mainnet: {
        name: "Ethereum",
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://eth.blockscout.com",
    },
    sepolia: {
        name: "Sepolia",
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://eth-sepolia.blockscout.com",
    },
    optimism: {
        name: "OP Mainnet",
        url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://optimism.blockscout.com",
    },
    optimismSepolia: {
        name: "OP Sepolia",
        url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://optimism-sepolia.blockscout.com",
    },
    base: {
        name: "Base",
        url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://base.blockscout.com",
    },
    baseSepolia: {
        name: "Base Sepolia",
        url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://base-sepolia.blockscout.com",
    },
};
