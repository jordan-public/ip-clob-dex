// SPDX-License-Identifier: BUSL-1.1

import './App.css';
import React from 'react';
import { Card } from 'react-bootstrap';
import NavigationBar from './components/NavigationBar';
import Body from './components/Body';
//import Web3 from 'web3';
//import { ethers } from 'ethers';

function App() {
  const [provider, setProvider] = React.useState(null);
  if (!window.web3) return (<> <NavigationBar provider={provider} setProvider={setProvider} /> <br/> "Loading..." </>);
  return (<Card><Card.Body>
    <NavigationBar provider={provider} setProvider={setProvider} />
    <br />
    <Body provider={provider}/>
    </Card.Body></Card>);
}

export default App;