Signatures: Verifying Messages in Solidity
https://blog.ricmoo.com/verifying-messages-in-solidity-50a94f82b2ca
https://programtheblockchain.com/posts/2018/02/17/signing-and-verifying-messages-in-ethereum/

To fix CORS issue:
https://stackoverflow.com/questions/67181658/create-react-app-web-server-respond-with-cors-headers
https://www.npmjs.com/package/@craco/craco
https://github.com/ipfs/js-ipfs/blob/master/docs/CORS.md

node_modules/react-scripts/config/webpackDevServer.config.js
```json
headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
```

API returns 403 when Origin header is set without CORS setup:
https://github.com/ipfs/go-ipfs/issues/6204

Error: No codec found for "undefined"
https://bytemeta.vip/repo/ipfs/js-ipfs/issues/3854

Accessing React State in Event Listeners with useState and useRef hooks
https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559

React Hooks: useEffect() is called twice even if an empty array is used as an argument
https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar

Webpack 5, Polyfill problem solution:
https://stackoverflow.com/questions/73042033/you-attempted-to-import-node-modules-console-browserify-index-js-which-falls