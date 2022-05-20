// SPDX-License-Identifier: BUSL-1.1

import './App.css';
import React from 'react';
import { Card } from 'react-bootstrap';
import NavigationBar from './components/NavigationBar';
import Body from './components/Body';
import * as IPFS from 'ipfs-http-client';
//import Web3 from 'web3';
//import { ethers } from 'ethers';

function App() {
  const [provider, setProvider] = React.useState(null);

  React.useEffect(() => {
    async function getIPFS() {
console.log("window.ipfs", window.ipfs);
      if (typeof window.ipfs === "undefined") {
        //window.ipfs = await IPFS.create();
        window.ipfs = await IPFS.create("http://localhost:5001");
        console.log("Using local IPFS node.", window.ipfs);
      } else {
        console.log("Using pre-injected IPFS node.", window.ipfs);
      }
    };
    getIPFS();
  }, []);

  return (<Card><Card.Body>
    <NavigationBar provider={provider} setProvider={setProvider} />
    <br />
    { window.web3 && typeof window.ipfs !== "undefined" && <Body provider={provider}/> }
    </Card.Body></Card>);
}

export default App;