Signatures: Verifying Messages in Solidity
https://blog.ricmoo.com/verifying-messages-in-solidity-50a94f82b2ca

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