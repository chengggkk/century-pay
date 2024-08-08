"use client";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useEffect } from "react";
import { useSendTransaction, useAccount } from "wagmi";
import { parseEther } from "viem";

export default function ConnectBtn() {
    const { open, close } = useWeb3Modal();
    const { address, isConnecting, isDisconnected } = useAccount();
    const { open: isOpened, selectedNetworkId } = useWeb3ModalState();

    async function submit() {
        const to = `0x6281f95BD27c9d3FF9b72A4bd670554550c7de8f`;
        const value = "0.001";
        sendTransaction({ to, value: parseEther(value) });
    }
    const { data: hash, isPending, sendTransaction } = useSendTransaction();

    return (
        <>
            {!hash && <w3m-button />}

            {!isDisconnected && !hash && (
                <button
                    className="m-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
                    disabled={isPending}
                    onClick={submit}
                >
                    {isPending ? "Confirming..." : "Send"}
                </button>
            )}
            {hash && (
                <>
                    <h2 className="text-white">✅</h2>
                    <h2 className="text-white">You may now close the window</h2>
                </>
            )}
        </>
    );
}
