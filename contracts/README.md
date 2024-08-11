# Example Voting Smart Contract

The example voting smart contract showcases the potential of Century Pay. It allows users to use an smart contract account to interact with the voting without paying gas fee (it will be sponsored by paymaster).

## Deployments

-   OP Mainnet: [0xf4205f466de67ca37d820504eb3c81bb89081214](https://optimism.blockscout.com/address/0xf4205f466de67ca37d820504eb3c81bb89081214)
-   OP Sepolia: [0xF4205f466De67CA37d820504eb3c81bb89081214](https://optimism-sepolia.blockscout.com/address/0xF4205f466De67CA37d820504eb3c81bb89081214)
-   Base Sepolia: [0x8f323fb65d88e327e67a2c4076401126d2a2fbeb](https://base-sepolia.blockscout.com/address/0x8f323fb65d88e327e67a2c4076401126d2a2fbeb)
-   Metal L2 Testnet: [0x37b31ca71bb33b149f56b6674486e5ed4365e9af](https://testnet.explorer.metall2.com/address/0x37b31ca71bb33b149f56b6674486e5ed4365e9af)
-   Mode Sepolia: [0xf4205f466de67ca37d820504eb3c81bb89081214](https://sepolia.explorer.mode.network/address/0xF4205f466De67CA37d820504eb3c81bb89081214)

## Installation

```shell
npm install
```

## Test

```shell
npx hardhat test
```

## Local node

```shell
npx hardhat node
```

## Deploy

```shell
npx hardhat ignition deploy ./ignition/modules/VoteExample.ts
```
