// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import Offer from './Offer';
import getOfferTableTopic from '../utils/getOfferTableTopic';
import MakeOffer from './MakeOffer';
import { CID } from 'multiformats/cid';
import { ethers } from 'ethers';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';

function OrderBook({t1Address, t2Address, provider}) {
    const [offerTopic, setOfferTopic] = React.useState("");
    const [rootCid, setRootCid] = React.useState("");
    const [offerList, setOfferList] = React.useState([]);

    const dagToOfferList = async (dagCid) => {
        if ("" === dagCid) return new Promise((resolve, _) => { return resolve([])}); // Resolves to []
        else {
            const { value: dag } = await window.ipfs.dag.get(CID.parse(dagCid));
            return [{ CID: dag.Offer.toString(), ...(await window.ipfs.dag.get(CID.parse(dag.Offer.toString()))).value}, ...await dagToOfferList(dag.Next.toString()) ];
        }
    }

    const isValidOffer = async (offer) => {
        const signer = provider.getSigner();
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
        const splitSignature = ethers.utils.splitSignature(offer.Signature);
        return ftSwap.checkValidOffer(offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);     
    }

    const updateHandler = async cidMsg => {
        const cid = String.fromCharCode(...cidMsg.data);
console.log("New root CID: ", cid);
        if (cid === "rebroadcast") {
            if (rootCid !== "") await window.ipfs.pubsub.publish(offerTopic, rootCid);
        } else if (cid !== rootCid) {
            const l = await dagToOfferList(cid);
            const fl = l.filter(isValidOffer);
            const sl = fl.sort((o1, o2) => { return o1.Amount1 / o1.Amount0 - o2.Amount1 / o2.Amount0 });
            setOfferList(sl);
            setRootCid(cid);
        }
    }

    React.useEffect(() => {
        (async () => {
            const t = getOfferTableTopic(t1Address, t2Address, provider)
            if (t !== "") console.log("Offer topic(", t1Address, t2Address, "): ", t);
            if (t !== offerTopic && offerTopic !== "") await window.ipfs.pubsub.unsubscribe(offerTopic);
            setOfferTopic(t);
            if (t !== "") {
console.log("Subscribing to topic: ", t);
                try { // May already be subscribed
                    await window.ipfs.pubsub.subscribe(t, updateHandler);
                    await window.ipfs.pubsub.publish(t, "rebroadcast");
                } catch(_) { 
                    console.log("Error: Already subscribed to topic: ", t);
                }
            }
        }) ();
    }, [t1Address, t2Address, provider]);
    
    return (<>
        <MakeOffer t1Address={t1Address} t2Address={t2Address} offerTopic={offerTopic} rootCid={rootCid} provider={provider}/>
        <br/>
        <Table striped bordered hover>
            <tbody>
                {offerList.map((offer) => <tr key={offer.Id}><Offer offer={offer} provider={provider} /></tr>)}
            </tbody>
        </Table>
    </>);
}

export default OrderBook;