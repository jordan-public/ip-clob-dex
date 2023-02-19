// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button } from 'react-bootstrap';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider';

function Account({provider, setProvider, address, setAddress}) {
    const [network, setNetwork] = React.useState(null);
    const [web3Modal, setWeb3Modal] = React.useState(null);

    React.useEffect(() => {
        if (!window.ethereum) return;
        const onConnect = info => console.log("Connected: ", info);
        window.ethereum.on("connect",  onConnect);
        const onAaccountsChanged = accounts => { 
            if (accounts && accounts.length > 0)
                setAddress(accounts[0].toLowerCase())
            else
                setAddress(null);
        };
        window.ethereum.on('accountsChanged', onAaccountsChanged);
        const onChainChanged = chainId => window.location.reload();
        window.ethereum.on('chainChanged', onChainChanged);
        const onDisconnect = async (error: { code: number; message: string }) => {
            console.log("Disconnected: ", error);
            setNetwork(null);
            setAddress(null);
            setProvider(null);
            if (web3Modal) await web3Modal.clearCachedProvider();
        };
        window.ethereum.on('disconnect', onDisconnect);
        return () => {
            window.ethereum.removeListener("connect", onConnect);
            window.ethereum.removeListener('accountsChanged', onAaccountsChanged );
            window.ethereum.removeListener('chainChanged', onChainChanged );
            window.ethereum.removeListener('disconnect', onDisconnect);
        }
    }, []);

    const onConnect = async () => {
        const providerOptions = {
            /* See Provider Options Section */
        };

        try {
            const walletConnectEthereum = {
              package: WalletConnectProvider,
              options: {
                rpc: {
                    5: "http://127.0.0.1:8545/",
                    137: "https://rpc-mainnet.matic.network",
                    31337: "http://127.0.0.1:8545",
                    80001: "https://matic-mumbai.chainstacklabs.com",
                },
              },
            };
            providerOptions.walletconnect = walletConnectEthereum;
        } catch (e) {
            console.log('Failed to load config for web3 connector WalletConnect: ', e);
        }
        
        let w3M = web3Modal;
        if (!w3M) {
            w3M = new Web3Modal({
                // network: "localhost", // optional
                cacheProvider: false, // optional
                providerOptions // required
            });
            setWeb3Modal(w3M);
        }

        try {
            const instance = await w3M.connect();
            
            const p = new ethers.providers.Web3Provider(instance);
            setProvider(p);
            const signer = p.getSigner();
            setAddress((await signer.getAddress()).toLowerCase());
            setNetwork(await p.getNetwork());
        } catch (_) { } // When user closes modal
    }

    const onDisconnect = async () => {
        await web3Modal.clearCachedProvider();
        setNetwork(null);
        setAddress(null);
        setProvider(null);
   }

    if (address) return (<>
            Account: {address} Network: {network && network.name} ({network && network.chainId})
            <Button variant="danger" onClick={onDisconnect}>Disconnect</Button>
        </>);
    else return(<Button onClick={onConnect}>Connect</Button>);
}

export default Account;