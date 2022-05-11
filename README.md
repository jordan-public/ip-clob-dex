
# IPDEX - Inter-Planetary Decentralized EXchange
Inter-Planetary Decentralized EXchange - gas-free Central Limit Order Book using IPFS technologies

## Description
IPDEX is a Decentralized Central Limit Order Book exchange. Fungible and non-fungible financial instruments of many kinds can be traded on it.
Automated Market Makers (AMM) are popular because of their availability, but different financial instruments require different AMM formulas which come with inefficiencies. Maintaining on-chain Order Books is a way to assure they are decentralized, but the cost is prohibitive, especially for EVM based blockchains. The only known established on-chain Central Limit Order Book (CLOB) is Serum on the Solaris blockchain. For EVM blockchains, hybrid exchanges such as dYdX maintain the Order Books off-chain while executing the transactions on-chain.
We have created a truly decentralized CLOB using IPFS technologies with gas-free Order Book maintenance and on-chain transaction execution.

## How It's Made
IPDEX uses the IPFS Decentralized Directed Acyclic Graph (DAG) in order to maintain a truly decentralized Central Limit Order Book. 
Each Order Book entry is a signed authorization to call a Smart Contract function on behalf of the signer, upon sufficient payment and other conditions.
These authorized calls generally trade one asset for another.
In order keep participants current with the latest CLOB state, we use the IPFS Decentralized PubSub service.
The front-end is written in React and uses the IPFS APIs as well as Ethers.js to check conditions and execute on-chain transactions.
We have implemented only EVM execution, although the same technology can be used for many other blockchains.

## IPFS Configuration

In order to enable the IPFS publish-subscribe service, the following section should be in the "config" file of the IPFS service:
```json
  "Pubsub": {
    "DisableSigning": false,
    "Enabled": true,
    "Router": ""
  },
```
## Hardhat Project details

Tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

## Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
