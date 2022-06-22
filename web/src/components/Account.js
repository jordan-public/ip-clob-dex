// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button } from 'react-bootstrap';
import { ethers } from "ethers";
import Web3Modal from "web3modal";

function Account({provider, setProvider, address, setAddress}) {
    const [network, setNetwork] = React.useState(null);
    const [web3Modal, setWeb3Modal] = React.useState(null);

    React.useEffect(() => {
        if (!window.ethereum) return;
        window.ethereum.on("connect", info => console.log("Connected: ", info) );
        window.ethereum.on('accountsChanged', accounts => { 
            if (accounts && accounts.length > 0)
                setAddress(accounts[0].toLowerCase())
            else
                setAddress(null);
        });
        window.ethereum.on('chainChanged', chainId => window.location.reload() );
        window.ethereum.on('disconnect', async (error: { code: number; message: string }) => {
            console.log("Disconnected: ", error);
            setNetwork(null);
            setAddress(null);
            setProvider(null);
            if (web3Modal) await web3Modal.clearCachedProvider();
        });
        // return () => {
        //     // Add references to original functions, not re-writes
        //     window.ethereum.removeListener("connect", info => console.log(info) );
        //     window.ethereum.removeListener('accountsChanged', accounts => setAddress(accounts[0].toLowerCase()) );
        //     window.ethereum.removeListener('chainChanged', chainId => window.location.reload() );
        //     window.ethereum.removeListener('disconnect', (error: { code: number; message: string }) => console.log(error) );
        //     }
    }, []);

    const onConnect = async () => {
        const providerOptions = {
            /* See Provider Options Section */
        };

        try {
            const WalletConnectProvider = (
              await import('@walletconnect/ethereum-provider')
            ).default;
            const walletConnectEthereum = {
              package: WalletConnectProvider,
              options: {
                bridge: process.env.ROPSTEN_BRIDGE,
                //bridge: 'http://127.0.0.1:8545/',
                infuraId: process.env.ROPSTEN_INFURA_ID,
                rpc: {},
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