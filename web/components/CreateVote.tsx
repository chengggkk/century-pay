"use client";

import React, { FormEvent } from "react";
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

export const CreateVote = () => {
    const user = useUser();
    const { address } = useAccount({ type: accountType });
    const { logout } = useLogout();

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
        if (address.length < 10) {
            return address; // Return the full address if it's too short
        }
        const firstPart = address.slice(0, 4);
        const lastPart = address.slice(-6);
        return `${firstPart}...${lastPart}`;
    }

    const send = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const formData = new FormData(evt.currentTarget);
        const optionsNumInput = formData.get("optionsNumSelect") as string;
        // collect all the form values from the user input
        const target = "0xF4205f466De67CA37d820504eb3c81bb89081214" as Hex;
        const AlchemyTokenAbi = [
            {
                inputs: [
                    {
                        internalType: "uint256",
                        name: "optionsNum",
                        type: "uint256",
                    },
                ],
                name: "createVote",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
            },
        ];
        const optionsNum = BigInt(optionsNumInput);
        const data = encodeFunctionData({
            abi: AlchemyTokenAbi,
            functionName: "createVote",
            args: [optionsNum],
        });

        // send the user operation
        sendUserOperation({
            uo: { target, data, value: BigInt(0) },
        });
    };
    // [!endregion sending-user-op]

    return (
        <>
            <form className="flex flex-col gap-4 p-4" onSubmit={send}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="font-bold">Address:</div>
                        <div className="text-gray-300 border border-gray-300 rounded-full p-2 px-4">
                            {formatAddress(address)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="optionsNumSelect"
                            className="font-semibold"
                        >
                            Number of vote options:
                        </label>
                        <select
                            id="optionsNumSelect"
                            name="optionsNumSelect"
                            className="text-black border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            defaultValue="3"
                        >
                            {Array.from({ length: 9 }, (_, i) => i + 2).map(
                                (num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Button type="submit" disabled={isSendingUserOperation}>
                        Create vote
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => logout()}
                        disabled={isSendingUserOperation}
                    >
                        Logout
                    </Button>
                </div>
                <OpStatus
                    sendUserOperationResult={sendUserOperationResult}
                    isSendingUserOperation={isSendingUserOperation}
                    isSendUserOperationError={isSendUserOperationError}
                />
            </form>
        </>
    );
};
