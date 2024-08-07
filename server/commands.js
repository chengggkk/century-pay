import 'dotenv/config';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Assuming getRPSChoices is defined elsewhere
// import { getRPSChoices } from './game.js';

function createCommandChoices() {
  // Replace this with your actual choices
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
  type: 1,
};

const CREATE_WALLET_COMMAND = {
  name: 'create_wallet',
  description: 'Create a new wallet',
  type: 1,
};

const IMAGE_COMMAND = {
  name: 'image',
  description: 'Send image',
  type: 1,
};

const LOGIN_COMMAND = {
  name: 'login',
  description: 'Login with a private key',
  options: [
    {
      type: 3, // STRING
      name: 'private_key',
      description: 'Your private key',
      required: true,
    },
  ],
  type: 1,
};

const PAY_COMMAND = {
  name: 'pay',
  description: 'Pay a specified amount',
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
  type: 1,
};

// Update command list
const ALL_COMMANDS = [TEST_COMMAND, CREATE_WALLET_COMMAND, LOGIN_COMMAND, PAY_COMMAND, IMAGE_COMMAND];

// Install commands
InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
