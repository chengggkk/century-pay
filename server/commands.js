import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js'; // Import function for installing commands

// Function to create command choices (if needed)
function createCommandChoices() {
  return [
    { name: 'Rock', value: 'rock' },
    { name: 'Paper', value: 'paper' },
    { name: 'Scissors', value: 'scissors' },
  ];
}

// Define commands
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1, // CHAT_INPUT
};

const CONNECT_COMMAND = {
  name: 'connect',
  description: 'Connect to a wallet',
  type: 1,
}

const SEND_COMMAND = {
  name: 'send',
  description: 'Pay a specified amount',
  type: 1, // CHAT_INPUT
  options: [
    {
      type: 3, // STRING
      name: 'amount',
      description: 'Amount to pay',
      required: true,
    },
    {
      type: 3, // STRING
      name: 'to_address',
      description: 'Address to pay to',
      required: true,
    },
  ],
};

const CHECK_COMMAND = {
  name: 'check',
  description: 'Check the balance of a wallet',
  type: 1,
};

const FAUCET_COMMAND = {
  name: 'faucet',
  description: 'Get some test tokens',
  type: 1,
};

const SENDER_COMMAND = {
  name: 'sender',
  description: 'Get the receipt of a transaction',
  type: 1,
};

const RECEIVER_COMMAND = {
  name: 'receiver',
  description: 'Get the receipt of a transaction',
  type: 1,
};

const profileCommand = {
  name: 'profile',
  description: 'View your profile',
  type: 1,
};


// Update command list
const ALL_COMMANDS = [TEST_COMMAND, CONNECT_COMMAND, SEND_COMMAND, CHECK_COMMAND, FAUCET_COMMAND, SENDER_COMMAND, RECEIVER_COMMAND, profileCommand];

// Install commands
InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
