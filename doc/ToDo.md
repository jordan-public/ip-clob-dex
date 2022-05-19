walletconnect + coinbase wallet
events for refresh of order book: swap and token contracts (for authorize)
implement fees

re-think rebroadcasting

pinning
command line scripts (js)
Uniswap flash swap
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


To fix:
- No events on Flash Swaps
- Displaying completed (canceled orders) - remove (filter out)
To fix - low priority:
- Events delivered twice
