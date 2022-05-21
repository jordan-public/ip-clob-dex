// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Button, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import afERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap.json';
import random256hex from '../utils/random256hex';
import decimalToUint256 from '../utils/decimalToUint256';

function MakeOffer({t1Address, t2Address, offerTopic, rootCid, provider}) {
    const [t1Decimals, setT1Decimals] = React.useState(null);
    const [t2Decimals, setT2Decimals] = React.useState(null);
    const [t1Symbol, setT1Symbol] = React.useState("");
    const [t2Symbol, setT2Symbol] = React.useState("");
    const [t1Amount, setT1Amount] = React.useState("");
    const [t2Amount, setT2Amount] = React.useState("");
    const [expiration, setExpiration] = React.useState(60);

    React.useEffect(() => {
        (async () => {
            const signer = provider.getSigner();
            if (t1Address) {
                const token1 = new ethers.Contract(t1Address, afERC20.abi, signer);
                setT1Decimals(await token1.decimals());
                setT1Symbol(await token1.symbol());    
            }
            if (t2Address) {
                const token2 = new ethers.Contract(t2Address, afERC20.abi, signer);
                setT2Decimals(await token2.decimals());  
                setT2Symbol(await token2.symbol());
            }
        }) ();
    }, [t1Address, t2Address, offerTopic, provider]);

    const onT1AmountChange = (e) => {
        setT1Amount(decimalToUint256(parseFloat(e.currentTarget.value), t1Decimals));
    }

    const onT2AmountChange = (e) => {
        setT2Amount(decimalToUint256(parseFloat(e.currentTarget.value), t2Decimals));
    }

    const onExpirationChange = (e) => {
        setExpiration(parseInt(e.currentTarget.value));
    }

    const onMakeOffer = async () => {
        if (!provider) { window.alert('No provider'); return; }
        if (t1Address === "" || t2Address === "") { window.alert('Please select assets above'); return; }
        let offer = null;
        try {
            const signer = provider.getSigner();
            const { chainId } = await provider.getNetwork();
            const ftSwap = new ethers.Contract(dpFTSwap[chainId].address, afFTSwap.abi, signer);
            const offerId = random256hex();

            const token1 = new ethers.Contract(t1Address, afIERC20.abi, signer);
            const allowance = await token1.allowance(await signer.getAddress(), ftSwap.address);
            if (allowance.lt(BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'))) {
                try {
                    const tx = await token1.approve(ftSwap.address, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

                    const r = await tx.wait();
                    window.alert('Completed. Block hash: ' + r.blockHash);        
                } catch(e) {
                    console.log("Error: ", e);
                    window.alert(e.message + "\n" + (e.data?e.data.message:""));
                    return;
                }
            }

            const expirationTime = Math.floor(expiration*60 + (new Date().getTime() / 1000));
            const offerHash = await ftSwap.offerHash(offerId, t1Address, t2Address, t1Amount, t2Amount, expirationTime);
            const signature = await signer.signMessage(ethers.utils.arrayify(offerHash));
            const splitSignature = ethers.utils.splitSignature(signature);
console.log("signed by: ", await ftSwap.checkSig(offerId, t1Address, t2Address, t1Amount, t2Amount, expirationTime, splitSignature.v, splitSignature.r, splitSignature.s));
console.log("verified: ", await ftSwap.checkValidOffer(offerId, t1Address, t2Address, t1Amount, t2Amount, expirationTime, splitSignature.v, splitSignature.r, splitSignature.s));

            offer = { Id: offerId, Signature: signature, Asset0: t1Address, Asset1: t2Address, Amount0: t1Amount, Amount1: t2Amount, Expiration: expirationTime };
console.log("Offer: ", offer);
            // Create DAG
            const offerCid = await window.ipfs.dag.put(offer);
console.log("Offer CID: ", offerCid, offerCid.toString());
            // Pin DAG
// !!!ToDo
            // Combine
            const newRootCid = await window.ipfs.dag.put({ Offer: offerCid, Next: rootCid});
console.log("Updated root CID", newRootCid, newRootCid.toString());
            // Pin new root
// !!!ToDo
            // Broadcast new root
            await window.ipfs.pubsub.publish(offerTopic, newRootCid.toString());
        } catch (e) { 
            if (!offer) window.alert("Invalid input");
            else window.alert("No IPFS connection"); 
        }
    }

    return (
        <Accordion>
            <Accordion.Item eventKey="0">
            <Accordion.Header>Make</Accordion.Header>
            <Accordion.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>I offer to pay {t1Symbol} in the amount of:</Form.Label>
                        <Form.Control onChange={onT1AmountChange} />
                        <Form.Text className="text-muted">
                        Enter the amount of the first token.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>for the following amount of {t2Symbol}:</Form.Label>
                        <Form.Control  onChange={onT2AmountChange} />
                        <Form.Text className="text-muted">
                        Enter the amount of the second Token.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Expiration (minutes)</Form.Label>
                        <Form.Control  onChange={onExpirationChange} />
                        <Form.Text className="text-muted">
                        Enter the order expiration time in minutes.
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" onClick={onMakeOffer} >
                        Make Offer
                    </Button>
                </Form>
            </Accordion.Body>
            </Accordion.Item>
        </Accordion>);
}

export default MakeOffer;