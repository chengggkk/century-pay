// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract VoteExample {
    struct Vote {
        uint256[] options;
        bool exists;
    }

    uint256 public voteId = 0;
    mapping(uint256 => Vote) public voteMapping;
    event Result(uint indexed id, uint256[] votes);

    // Create a new vote with a specified number of options
    function createVote(uint256 optionsNum) public {
        require(optionsNum > 0, "Number of options must be greater than zero");

        Vote storage newVote = voteMapping[voteId];
        newVote.exists = true;
        newVote.options = new uint256[](optionsNum); // Initialize the array with the given number of options

        voteId++;
    }

    // Cast a vote on a specific option in a vote
    function vote(uint256 id, uint256 option) public {
        require(voteMapping[id].exists, "Vote does not exist");
        require(option < voteMapping[id].options.length, "Invalid option");

        voteMapping[id].options[option]++;
    }

    // Tally the votes and emit the result
    function tally(uint256 id) public {
        require(voteMapping[id].exists, "Vote does not exist");

        emit Result(id, voteMapping[id].options);
    }
}
