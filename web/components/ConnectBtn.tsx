"use client";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useEffect } from "react";
import {
    useSendTransaction,
    useAccount,
    useSignMessage,
    createConfig,
} from "wagmi";
import { parseEther } from "viem";
import { verifyMessage, http } from "@wagmi/core";
import {
    base,
    baseSepolia,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "wagmi/chains";

const chains = [
    mainnet,
    sepolia,
    base,
    baseSepolia,
    optimism,
    optimismSepolia,
] as const;
const signConfig = createConfig({
    chains: chains,
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [base.id]: http(),
        [baseSepolia.id]: http(),
        [optimism.id]: http(),
        [optimismSepolia.id]: http(),
    },
});

export default function ConnectBtn({ params }: { params: { slug: string } }) {
    const { open, close } = useWeb3Modal();
    const { address, isConnecting, isDisconnected } = useAccount();
    const { open: isOpened, selectedNetworkId } = useWeb3ModalState();
    const { signMessage, signMessageAsync, data: signature } = useSignMessage();

    async function sign() {
        const message = `session ID: ${params.slug}`;
        const data = await signMessageAsync({ message });
        console.log(data);

        const result = await verifyMessage(signConfig as any, {
            address: address as `0x${string}`,
            message: message,
            signature: data,
        });
        console.log(result);
    }

    return (
        <>
            {!signature && <w3m-button />}
            {!isDisconnected && !signature && (
                <button
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
                    onClick={sign}
                >
                    Sign message
                </button>
            )}
            {signature && (
                <>
                    <h2 className="text-white">✅</h2>
                    <h2 className="text-white">You may now close the window</h2>
                </>
            )}
        </>
    );
}
