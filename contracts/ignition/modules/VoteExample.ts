import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VoteExampleModule = buildModule("VoteExampleModule", (m) => {
  const voteExample = m.contract("VoteExample", []);

  return { voteExample };
});

export default VoteExampleModule;
