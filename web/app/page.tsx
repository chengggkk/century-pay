"use client";
// pages/index.js
import Head from "next/head";

export default function Home() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <Head>
                <title>Center Button</title>
                <meta
                    name="description"
                    content="A centered button with Next.js and Tailwind CSS"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-white"> Century Pay</h1>
            </main>
        </div>
    );
}
