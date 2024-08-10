import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("VoteExample", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVoteExampleFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const voteExample = await hre.viem.deployContract("VoteExample", []);

    const publicClient = await hre.viem.getPublicClient();

    return {
      voteExample,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should deploy vote example", async function () {
      await loadFixture(deployVoteExampleFixture);
    });

  });

  describe("Create vote", function () {
    it("Should create vote", async function () {
      const { voteExample, publicClient } = await loadFixture(deployVoteExampleFixture);

      for (let i = 0; i < 3; i++) {
        const numOptions = 3
        const hash = await voteExample.write.createVote([BigInt(numOptions)]);
        await publicClient.waitForTransactionReceipt({ hash });

        const voteId = await voteExample.read.voteId();
        expect(voteId).to.equal(BigInt(i + 1));
      }
    });
  });

  describe("Vote", function () {
    it("Should vote", async function () {
      const { voteExample, publicClient } = await loadFixture(deployVoteExampleFixture);

      const numOptions = 3
      const createHash = await voteExample.write.createVote([BigInt(numOptions)]);
      await publicClient.waitForTransactionReceipt({ hash: createHash });

      const id = 0;
      const option = 1;
      const hash = await voteExample.write.vote([BigInt(id), BigInt(option)]);
      await publicClient.waitForTransactionReceipt({ hash });
    });
  });

  describe("Tally", function () {
    it("Should tally", async function () {
      const { voteExample, publicClient } = await loadFixture(deployVoteExampleFixture);

      const numOptions = 3
      const createHash = await voteExample.write.createVote([BigInt(numOptions)]);
      await publicClient.waitForTransactionReceipt({ hash: createHash });

      const id = 0;
      const option = 1;
      const hash = await voteExample.write.vote([BigInt(id), BigInt(option)]);
      await publicClient.waitForTransactionReceipt({ hash });

      const tallyHash = await voteExample.write.tally([BigInt(id)]);
      await publicClient.waitForTransactionReceipt({ hash: tallyHash });

      const tallyEvents = await voteExample.getEvents.Result();
      expect(tallyEvents).to.have.lengthOf(1);
      console.log(tallyEvents[0].args);
    });
  });


});
