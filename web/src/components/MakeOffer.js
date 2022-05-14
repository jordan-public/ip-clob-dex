// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';
import random256hex from '../utils/random256hex';

function MakeOffer({t1Address, t2Address, offerTopic, provider}) {
    const [t1Amount, setT1Amount] = React.useState("");
    const [t2Amount, setT2Amount] = React.useState("");
    const [expiration, setExpiration] = React.useState(60);

    const onT1AmountChange = (e) => {
        setT1Amount(e.currentTarget.value);
    }

    const onT2AmountChange = (e) => {
        setT2Amount(e.currentTarget.value);
    }

    const onExpirationChange = (e) => {
        setExpiration(parseInt(e.currentTarget.value));
    }

    const onMakeOffer = async () => {
        if (!provider) { window.alert('No provider'); return; }
        const signer = provider.getSigner();
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
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
                window.alert(e.message);
            }
        }

        const expirationTime = Math.floor(expiration*60 + (new Date().getTime() / 1000));
console.log("Expiration: ", new Date(expirationTime * 1000).toString());
        const offerHash = await ftSwap.offerHash(offerId, t1Address, t2Address, t1Amount, t2Amount, expirationTime);
        const signature = await signer.signMessage(ethers.utils.arrayify(offerHash));
        const splitSignature = ethers.utils.splitSignature(signature);
console.log("signed by: ", await ftSwap.checkSig(offerId, t1Address, t2Address, t1Amount, t2Amount, expirationTime, splitSignature.v, splitSignature.r, splitSignature.s));
console.log("verified: ", await ftSwap.checkValidOffer(offerId, t1Address, t2Address, t1Amount, t2Amount, expirationTime, splitSignature.v, splitSignature.r, splitSignature.s));

        const offer = { Id: offerId, Signature: signature, Asset0: t1Address, Asset1: t2Address, Amount0: t1Amount, Amount1: t2Amount, Expiration: expirationTime };
console.log("Offer: ", offer);
        // Create DAG
        const offerCid = await window.ipfs.dag.put(offer);
console.log("Offer CID: ", offerCid, offerCid.toString());
        // Pin DAG
// !!!ToDo
        // Receive last root (move this to worker thread)
        const lastRootCID = "TBD"; 
        // Combine
        const newRootCid = await window.ipfs.dag.put({ Offer: offerCid, Next: lastRootCID});
console.log("Updated CID", newRootCid, newRootCid.toString());
        // Pin new root
// !!!ToDo
        // Broadcast new root
        await window.ipfs.pubsub.publish(offerTopic, offerCid.toString());
    }

    return (
        <Card>
            <Card.Header>Make</Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Token1 amount</Form.Label>
                        <Form.Control onChange={onT1AmountChange} />
                        <Form.Text className="text-muted">
                        Enter the amount of the first token.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Token2 amount</Form.Label>
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
            </Card.Body>
        </Card>);
}

export default MakeOffer;