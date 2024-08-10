"use client";

import { useAuthenticate, useSignerStatus } from "@alchemy/aa-alchemy/react";

export const LogInCard = () => {
    // [!region authenticating]
    const { authenticate } = useAuthenticate();
    async function signup() {
        authenticate({
            type: "passkey",
            createNew: true,
            username: "Century Pay",
        });
    }

    async function login() {
        authenticate({
            type: "passkey",
            createNew: false,
        });
    }

    const { status } = useSignerStatus();
    const isAuthenticating = status === "AUTHENTICATING";
    // [!endregion authenticating]

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <button
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
                disabled={isAuthenticating}
                onClick={signup}
            >
                {isAuthenticating ? "Confirming..." : "Sign Up"}
            </button>
            <button
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
                disabled={isAuthenticating}
                onClick={login}
            >
                {isAuthenticating ? "Confirming..." : "Log In"}
            </button>
        </div>
    );
};
