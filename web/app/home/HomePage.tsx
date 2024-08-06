'use client';
import { useAccount } from 'wagmi';
import Footer from '@/components/layout/footer/Footer';
import Header from '@/components/layout/header/Header';
import { WalletOptions } from '@/components/layout/header/WalletOptions';
import { Account } from '@/components/layout/header/Account';

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}
/**
 * Use the page component to wrap the components
 * that you want to render on the page.
 */
export default function HomePage() {
  const account = useAccount();

  return (
    <>
      <Header />
      <main className="container mx-auto flex flex-col px-8 py-16">
        <div>
          <h2 className="text-xl">Developer information</h2>
          <br />
          <h3 className="text-lg">Account</h3>
          <ConnectWallet />
          <ul>
            <li>
              <b>status</b>: {account.status}
            </li>
            <li>
              <b>addresses</b>: {JSON.stringify(account.addresses)}
            </li>
            <li>
              <b>chainId</b>: {account.chainId}
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
