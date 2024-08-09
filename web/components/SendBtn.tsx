"use client";
import { useState } from "react";
import { useSendTransaction, useAccount } from "wagmi";
import { parseEther } from "viem";

export default function SendBtn({ params }: { params: { slug: string } }) {
    const { isDisconnected } = useAccount();
    const [message, setMessage] = useState("");

    async function submit() {
        try {
            setMessage("Loading...");
            const response = await fetch(
                `/api/send?sendautolink=${params.slug}`,
                {
                    method: "GET", // Specify the request method
                }
            );
            const json = await response.json();
            const { to_address: to, amount: value } = JSON.parse(json);
            const tx = await sendTransactionAsync({
                to,
                value: parseEther(String(value)),
            });
            const body = {
                sendautolink: `${params.slug}`,
                transactionHash: tx,
            };
            {
                const response = await fetch(`/api/send`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json", // Set the Content-Type header
                    },
                    body: JSON.stringify(body), // Convert the data to a JSON string
                });
                if (response.ok) {
                    setMessage("✅\nYou may now close the window");
                } else {
                    const json = await response.json();
                    setMessage(`❌\nAn error occurred ${json.error}`);
                }
            }
        } catch (error) {
            setMessage(`❌\nAn error occurred ${error}`);
        }
    }

    const {
        data: hash,
        isPending,
        sendTransactionAsync,
    } = useSendTransaction();

    return (
        <>
            {!hash && <w3m-button />}

            {!isDisconnected && !hash && (
                <button
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
                    disabled={isPending}
                    onClick={submit}
                >
                    {isPending ? "Confirming..." : "Send"}
                </button>
            )}
            {hash && (
                <>
                    <h2 className="text-white">{message}</h2>
                </>
            )}
        </>
    );
}
