// pages/index.js
import Head from 'next/head';
import ConnectBtn from '../components/ConnectBtn';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Center Button</title>
        <meta name="description" content="A centered button with Next.js and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <ConnectBtn/>
      </main>
    </div>
  );
}
