Project Name: IPDEX

Short Description:
Inter-Planetary Decentralized EXchange - gas-free Central Limit Order Book using IPFS technologies

Long Description:
IPDEX is a Decentralized Central Limit Order Book exchange. Fungible and non-fungible financial instruments of many kinds can be traded on it.
Automated Market Makers (AMM) are popular because of their availability, but different financial instruments require different AMM formulas which come with inefficiencies. Maintaining on-chain Order Books is a way to assure they are decentralized, but the cost is prohibitive, especially for EVM based blockchains. The only known established on-chain Central Limit Order Book (CLOB) is Serum on the Solaris blockchain. For EVM blockchains, hybrid exchanges such as dYdX maintain the Order Books off-chain while executing the transactions on-chain.
We have created a truly decentralized CLOB using IPFS technologies with gas-free Order Book maintenance and on-chain transaction execution.

How It's Made:
IPDEX uses the IPFS Decentralized Directed Acyclic Graph (DAG) in order to maintain a truly decentralized Central Limit Order Book. 
Each Order Book entry is a signed authorization to call a Smart Contract function on behalf of the signer, upon sufficient payment and other conditions.
These authorized calls generally trade one asset for another.
In order keep participants current with the latest CLOB state, we use the IPFS Decentralized PubSub service.
The front-end is written in React and uses the IPFS APIs as well as Ethers.js to check conditions and execute on-chain transactions.
We have implemented only EVM execution, although the same technology can be used for many other blockchains.