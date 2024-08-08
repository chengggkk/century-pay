"use client";
import Head from "next/head";
import ConnectBtn from "../../components/ConnectBtn";
import { useEffect } from "react";

export default function Page({ params }: { params: { slug: string } }) {
    useEffect(() => {
        console.log(params.slug);
    }, []);

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
                <ConnectBtn params={params} />
            </main>
        </div>
    );
}
