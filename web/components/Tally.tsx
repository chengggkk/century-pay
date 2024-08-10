"use client";

import React, { useState } from "react";
import {
    useAccount,
    useLogout,
    useSendUserOperation,
    useSmartAccountClient,
    useUser,
} from "@alchemy/aa-alchemy/react";
import {
    accountType,
    gasManagerConfig,
    accountClientOptions as opts,
} from "../config";
import { Button } from "./ui/button";
import { encodeFunctionData, Hex } from "viem";
import { OpStatus } from "./op-status";

export const Tally = () => {
    const user = useUser();
    const { address } = useAccount({ type: accountType });
    const { logout } = useLogout();
    const [sending, setSending] = useState(false);

    // [!region sending-user-op]
    // use config values to initialize our smart account client
    const { client } = useSmartAccountClient({
        type: accountType,
        gasManagerConfig,
        opts,
    });

    // provide the useSendUserOperation with a client to send a UO
    // this hook provides us with a status, error, and a result
    const {
        sendUserOperation,
        sendUserOperationResult,
        isSendingUserOperation,
        error: isSendUserOperationError,
    } = useSendUserOperation({ client, waitForTxn: true });

    function formatAddress(address: any) {
        if (!address || address.length < 10) {
            return address; // Return the full address if it's too short
        }
        const firstPart = address.slice(0, 4);
        const lastPart = address.slice(-6);
        return `${firstPart}...${lastPart}`;
    }

    const send = () => {
        setSending(true);
        // collect all the form values from the user input
        const target = "0xF4205f466De67CA37d820504eb3c81bb89081214" as Hex;
        const AlchemyTokenAbi = [
            {
                inputs: [
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256",
                    },
                ],
                name: "tally",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
            },
        ];
        // TODO: fix this
        const id = BigInt(0);
        const data = encodeFunctionData({
            abi: AlchemyTokenAbi,
            functionName: "tally",
            args: [id],
        });

        // send the user operation
        sendUserOperation({
            uo: { target, data, value: BigInt(0) },
        });
    };
    // [!endregion sending-user-op]

    return (
        <>
            <OpStatus
                sendUserOperationResult={sendUserOperationResult}
                isSendingUserOperation={isSendingUserOperation}
                isSendUserOperationError={isSendUserOperationError}
            />
            {!sending && (
                <div className="flex flex-col items-start gap-4 p-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Address:</span>
                        <div className="text-gray-300 border border-gray-300 rounded-full p-2 px-4">
                            {formatAddress(address)}
                        </div>
                    </div>

                    <button
                        className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
                        onClick={send}
                    >
                        Tally
                    </button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => logout()}
                        disabled={isSendingUserOperation}
                    >
                        Logout
                    </Button>
                </div>
            )}
        </>
    );
};
