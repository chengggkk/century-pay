import "dotenv/config";

if (!process.env.ALCHEMY_KEY) {
    throw new Error("ALCHEMY_KEY is not set");
}

export const NETWORKS = {
    mainnet: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://eth.blockscout.com",
    },
    sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://eth-sepolia.blockscout.com",
    },
    optimism: {
        url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://optimism.blockscout.com",
    },
    optimismSepolia: {
        url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://optimism-sepolia.blockscout.com",
    },
    base: {
        url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://base.blockscout.com",
    },
    baseSepolia: {
        url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
        blockscout: "https://base-sepolia.blockscout.com",
    },
};
