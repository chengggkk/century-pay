import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';
import { authConnector } from '@web3modal/wagmi'


export function createWagmiConfig(rpcUrl: string) {

  const projectId = "5a1867c947abfa58cd91a9befc9dd02a"

  // Temporary hack, until we configure a FE page in OnchainKit to copy just the API key
  const baseUrl = rpcUrl.replace(/\/v1\/(.+?)\//, '/v1/base/');
  const baseSepoliaUrl = rpcUrl.replace(/\/v1\/(.+?)\//, '/v1/base-sepolia/');

  return createConfig({
    chains: [baseSepolia],
    connectors: [
      metaMask(),
      walletConnect({ projectId: "5a1867c947abfa58cd91a9befc9dd02a" }),
      coinbaseWallet({
        appName: 'buildonchainapps',
        preference: 'smartWalletOnly',
      }),
      authConnector({
        chains: [baseSepolia],
        options: { projectId },
        email: true, // default to true
        socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
        showWallets: true, // default to true
        walletFeatures: true // default to true
      })
    ],
    ssr: true,
    transports: {
      [baseSepolia.id]: http(baseSepoliaUrl),
      [base.id]: http(baseUrl),
    },
  });
}
