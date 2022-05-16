walletconnect + coinbase wallet
re-think rebroadcasting
events for refresh of order book: swap and token contracts (for authorize)
flash swaps
implement fees
refactor: rename FTSwap IPSwap
pinning
command line scripts (js)
Uniswap flash swap
Aave flash swap

White paper, video:
- AMM vs. OrderBook (pricing options and struct products illustrations)

- Where does the CLOB live? IPFS (DAG + pubsub)
- Who signs Market Maker entries: (MetaMask, Coinbase, WalletConnect) wallet
- Actual executon is on-chain (the only cost)
- Who matches orders: Flash Swap

- What are the Offer entries: paid signed rights to call a contract function.
- Out of order execution nonce -> nullifiers, also for partial execution
- Partial execution notifications: contract events

- Demo Make
- Demo Take
- Demo Flash Swap + opportunity notification