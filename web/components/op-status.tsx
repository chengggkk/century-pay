import { LoadingSpinner } from "./ui/loading-spinner";
import { SendUserOperationResult } from "@alchemy/aa-core";
import { chain } from "../config";

export const OpStatus = ({
    sendUserOperationResult,
    isSendingUserOperation,
    isSendUserOperationError,
}: {
    sendUserOperationResult: SendUserOperationResult | undefined;
    isSendingUserOperation: boolean;
    isSendUserOperationError: Error | null;
}) => {
    if (isSendUserOperationError) {
        return <div className="text-center">An error occurred. Try again!</div>;
    }

    if (isSendingUserOperation) {
        return <LoadingSpinner />;
    }

    if (sendUserOperationResult) {
        return (
            <div className="flex flex-col items-center">
                <div
                    rel="noopener noreferrer"
                    className="text-center text-white block"
                >
                    ✅ You may now close the window
                </div>
                <a
                    href={`${chain.blockExplorers?.default.url}/tx/${sendUserOperationResult.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center hover:underline text-gray-300"
                >
                    View transaction details on Blockscout
                </a>
            </div>
        );
    }

    return <div className="invisible">placeholder</div>;
};
