[This project](https://showcase.ethglobal.com/hackmoney2022/ipdex-interplanetary-decentralized-exchange-498o0) won the following prizes at the [EthGlobal HackMoney 2022](https://showcase.ethglobal.com/hackmoney2022/ipdex-interplanetary-decentralized-exchange-498o0) hackathon:
- [First Place from IPFS/Filecoin](https://showcase.ethglobal.com/hackmoney2022/ipdex-interplanetary-decentralized-exchange-498o0)
- [First Place / Most Innovative from Uniswap Grants Program](https://showcase.ethglobal.com/hackmoney2022/ipdex-interplanetary-decentralized-exchange-498o0)
# ![IPDEX](doc/IPDEXLogoSmall.png) IPDEX - Inter-Planetary Decentralized EXchange
Inter-Planetary Decentralized EXchange - gas-free Central Limit Order Book using IPFS technologies

## Demo

See [this link](/demo/README.md).

## Description
IPDEX is a Decentralized Central Limit Order Book exchange. Financial instruments of many kinds can be traded on it.

Automated Market Makers (AMM) are popular because of their availability, but different financial instruments require different AMM formulas which come with inefficiencies.

Maintaining on-chain Order Books is a way to assure they are decentralized, but the cost is prohibitive, especially for EVM based blockchains. The only known established on-chain Central Limit Order Book (CLOB) is Serum on the Solaris blockchain. For EVM blockchains, hybrid exchanges such as dYdX maintain the Order Books off-chain while executing the transactions on-chain.

We have created a truly decentralized CLOB using IPFS technologies with gas-free Order Book maintenance and on-chain transaction execution.

## How It's Made

### Decentralized CLOB Storage
IPDEX uses the IPFS Decentralized Directed Acyclic Graph (DAG) in order to maintain a truly decentralized Central Limit Order Book. The content addressability of the IPFS DAG nodes allow for extremely efficient caching of the order books. Namely, if we have the CID of a node previously seen, and we know that we have traversed and cached the entire subDAG starting from that node, we know for sure that we don not have to revisit that subDAG again, the content addressability guarantees that subDAG is immutable. Similarly, if we visit an already cached node CID while traversing a DAG, we do not need to traverse that subDAG again. 

### Decentralized CLOB Updates
In order keep participants current with the latest CLOB state, we use the IPFS Decentralized PubSub service. The topic is deterministically computed from the Smart Contract address, the chain Id of the network and the addresses of the two tokens traded. This allows anyone to subscribe to the updates without asking for permission.

### Off-chain Authorizations
Each Order Book entry is a signed authorization to call a Smart Contract function on behalf of the signer, upon sufficient payment and other conditions.
These authorized calls generally trade one asset for another. However, in the future, conditional execution can be added, based on onditions supplied by oracles or Zero Knowledge Proofs.

### On-chain Settlement
Once the valid, unexpired, not already fully executed Order Book entry is submitted to the contract for execution, the signature of the Maker is verified, as well as the Maker and Taker token transfer allowances. If everything passes the transfer of tokens in the appropriate directions and amounts is executed, thus settling the transaction. The executed part of the transaction is recorded in the appropriate "nullifier" to make sure it cannot be replayed more than once.

### Flash Swaps
The on-chain settlement swap implemented in the contract FTSwap optimistically pays the Taker before calling a the flashCall function of the calling contract and then pulling funds from the Maker, all done atomically. 
#### Order Matching
The FlashMatch contract (callable from the web interface) can match two off-chain Order Book entries, calculate the maximal size of partial executions, and match the given pair of Order Book entries. This transaction succeeds if it is profitable and pays the profit to the caller. If it cannot be profitable, it reverts. Anyone can oportunistically match orders and make profit, this contributing to the decentralization of the Order Matching process. There is no disincentive, to automate this process.

#### AMM Limit Orders
The contract FlashSwapAMM (callable from the web interface) takes an Order Book entry and tries to execute it against a specific Automated Market Maker (AMM; specifically Uniswap V2 in this example). If profitable, it succeeds and pays the profit tho the caller. Otherwise it reverts. This effectively creates Limit Orders executable against the AMM. Anyone can oportunistically execute such limit orders, thus contributing to the decentalization of Limit Order execution on AMMs. There is no disincentive, to automate this process.

### Implementation
The front-end is written in React and uses the IPFS APIs as well as Ethers.js to check conditions and execute on-chain transactions.
We have implemented only EVM execution, although the same technology can be used for many other blockchains.

## Fees
Every on-chain settlement transaction collects fees from the Maker and the Taker (separate rates - see FTSwap.makerFee() and FTSwap.takerFee()). The fee rates are stored in the FTSwap contract and they can be changed by the Owner. The fees are paid to the Owner. Eventually, the ownership of IPDEX can be tokenized, and such governance tokens can be used for voting on changes of these fee rates.
## Project initialization

After cloning this repository, run the following in the root folder:
```shell
./setup.sh
npm install
cd web
npm install
```
## IPFS Configuration

In order to enable the IPFS publish-subscribe service, the following section should be in the "config" file of the IPFS service:

```json
  "Pubsub": {
    "DisableSigning": false,
    "Enabled": true,
    "Router": ""
  },
```

For testing from web site served by the React tets web server from localhost:3000 add:
```json
	"API": {
		"HTTPHeaders": {
			"Access-Control-Allow-Origin": [
				"https://webui.ipfs.io",
				"http://webui.ipfs.io.ipns.localhost:8080",
				"http://127.0.0.1:5001",
				"http://localhost:3000"
			]
		}
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
