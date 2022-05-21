whitepaper

walletconnect + coinbase wallet

re-think rebroadcasting

pinning
command line scripts (js)
dYdX flash swap

White paper, video:
- AMM vs. OrderBook (pricing options and struct products illustrations)

- Where does the CLOB live? IPFS (DAG + pubsub)
- Who signs Market Maker entries: (MetaMask, Coinbase, WalletConnect) wallet
- Actual executon is on-chain (the only cost)
- Who matches orders: Flash Swap

- What are the Offer entries: paid signed rights to call a contract function.
  They can even be moving targets based on oracles, 
  or accept zk proofs to execute when verification passes, etc., 
  but for the hackathon I stay with fixed limit orders. 
- Out of order execution nonce -> nullifiers, also for partial execution
- Partial execution notifications: contract events

- Demo Make
- Demo Take
- Demo Flash Swap + opportunity notification

Howto: after re-deploy
- Clear old token addresses from wallet addresses (if there are new contracts deployed)
- Reset nonce on wallett addresses

To fix:
To fix - low priority:
- duplicate events for refresh of order book (one for each entry instead of 1 total)

