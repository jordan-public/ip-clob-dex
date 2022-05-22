require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-tracer");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// This is a Hardhat task to force mining blocks.
task("mine", "Mines blocks")
  .addParam("blocks", "Number of vlocks to mine")
  .setAction(async (taskArgs, hre) => {
  console.log("Start block: ", await ethers.provider.send("eth_blockNumber"));
  console.log(taskArgs.blocks);
  const b = parseInt(taskArgs.blocks);
  for (let i=0; i<b; i++) await ethers.provider.send("evm_mine"); // mines 5 blocks
  console.log("End block: ", await ethers.provider.send("eth_blockNumber"));
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      }
    }
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    mumbai: {
      url: process.env.MUMBAI_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    emerald_testnet: {
      url: "https://testnet.emerald.oasis.dev",
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
