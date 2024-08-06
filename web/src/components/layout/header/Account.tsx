import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button
        className="rounded-full bg-indigo-600 px-4 py-2 text-white"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
