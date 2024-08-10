import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { cookieToInitialState } from "wagmi";

import { config } from "../config/index";
import Web3ModalProvider from "../context";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "Century Pay",
    description: "A discord bot that makes onchain payments easy",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const initialState = cookieToInitialState(config, headers().get("cookie"));
    return (
        <html lang="en">
            <body className={inter.className}>
                <Web3ModalProvider initialState={initialState}>
                    {children}
                </Web3ModalProvider>
            </body>
        </html>
    );
}
