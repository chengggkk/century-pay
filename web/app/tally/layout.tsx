import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "./providers";
import { cookieToInitialState } from "@alchemy/aa-alchemy/config";
import { headers } from "next/headers";
import { config } from "../../config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Century Pay",
  description: "A discord bot that makes onchain payments easy",
};

// [!region root-layout]
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // hydrate the initial state on the client
    const initialState = cookieToInitialState(
        config,
        headers().get("cookie") ?? undefined
    );

    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers initialState={initialState}>{children}</Providers>
            </body>
        </html>
    );
}
// [!endregion root-layout]
