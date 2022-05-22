## Hackathon Public Link - IPDEX - InterPlanetary Decentralized EXchange [see this link](https://showcase.ethglobal.com/hackmoney2022/ipdex-interplanetary-decentralized-exchange-498o0)

(Formerly: ## [Hackathon Public Link - IPDEX - InterPlanetary Decentralized EXchange](https://showcase.ethglobal.com/hackmoney2022/ipdex-498o0))

## Downloadable Demo Video - see [this link](../doc/IPDEX.mp4)

## Deployed on these networks:
- Oasis Emerald
- Polygon Mumbai
- Ropsten
- HardHat (see below to redeploy for demo/testing)

To run the demo **please check out the "deployed" branch** of this repository. In it, the deployed artifacts are included, so it can be direcrly run. 

To run the demo against local Hardhat node, run the following. This is not needed for running against public testnet or production blockchain on which IPDEX is deployed:
```shell
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js
```

Then, to run it, in the root folder of the project run:
```shell
./setup.sh
cd web
npm install
npm start
```

It is recommended that you run a local **IPFS Desktop** node.

To build the front end for public deployment in the "web" folder run:
```shell
npm run build
```
