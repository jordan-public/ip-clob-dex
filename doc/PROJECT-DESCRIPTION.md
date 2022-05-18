Project Name: IPDEX

Short Description:
Inter-Planetary Decentralized EXchange - gas-free Central Limit Order Book using IPFS technologies

Long Description:
IPDEX is a truly Decentralized Central Limit Order Book exchange. Financial instruments of many kinds can be traded on it.
Automated Market Makers (AMM) are popular because of their availability, but different financial instruments require different AMM formulas which come with inefficiencies. Maintaining on-chain Order Books is a way to assure they are decentralized, but the cost is prohibitive, especially for EVM based blockchains. The only known established on-chain Central Limit Order Book (CLOB) is Serum on the Solaris blockchain. For EVM blockchains, hybrid exchanges such as dYdX maintain the Order Books off-chain while executing the transactions on-chain.
We have created a truly decentralized CLOB using IPFS technologies with gas-free Order Book maintenance and on-chain transaction execution.

How It's Made:
IPDEX uses the IPFS Decentralized Directed Acyclic Graph (DAG) in order to maintain a truly decentralized Central Limit Order Book. 
Each Order Book entry is a signed authorization to call a Smart Contract function on behalf of the signer, upon sufficient payment and other conditions.
These authorized calls generally trade one asset for another.
In order keep participants current with the latest CLOB state, we use the IPFS Decentralized PubSub service, as well as EVM events to notify of partial executions. Notably, the content addressability of the IPFS DAG allows inexpensive re-publishing of CLOB parts, as the entire sub-DAG is uniquely identified by the top node CID, avoiding the need of frequent deep graph traverse.
The front-end is written in React and uses the IPFS APIs as well as Ethers.js to check conditions and execute on-chain transactions.
We have implemented only EVM execution, although the same technology can be used for many other blockchains.

What progress did you make since the last check-in?
I implemented most of the core functionality: 
1. decentralized IPFS Central Limit Order Book.
2. smart contracts for Order Book entries and execution.
3. smart contracts for Flash Swap between order book entries.
4. pubsub notifications of Order Book updates
