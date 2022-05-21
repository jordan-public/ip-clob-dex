// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button } from 'react-bootstrap';
import { ethers } from "ethers";
import Web3Modal from "web3modal";

function Account({provider, setProvider, setAddress}) {
    const [account, setAccount] = React.useState("");
    const [network, setNetwork] = React.useState(null);

    React.useEffect(() => {
        if (!window.ethereum) return;
        window.ethereum.on("connect", (info) => { console.log(info); });
        window.ethereum.on('accountsChanged', (accounts) => { setAccount(accounts[0]); setAddress(accounts[0]); });
        window.ethereum.on('chainChanged', (chainId) => { window.location.reload(); });
        window.ethereum.on('disconnect', (error) => { window.location.reload(); });
    }, []);

    const onConnect = async () => {
        const providerOptions = {
            /* See Provider Options Section */
        };

        const web3Modal = new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions // required
        });
        const instance = await web3Modal.connect();
        
        const p = new ethers.providers.Web3Provider(instance);
        setProvider(p);
        const signer = p.getSigner();
        setAccount(await signer.getAddress());
        setNetwork(await p.getNetwork());
    }

    if (account !== "") return (<>Account: {account} Network: {network && network.name} ({network && network.chainId})</>);
    else return(<Button onClick={onConnect}>Connect</Button>);
}

export default Account;