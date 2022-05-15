// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import Offer from './Offer';
import getOfferTableTopic from '../utils/getOfferTableTopic';
import MakeOffer from './MakeOffer';
import { CID } from 'multiformats/cid';

function OrderBook({t1Address, t2Address, provider}) {
    const [offerTopic, setOfferTopic] = React.useState("");
    const [rootCid, setRootCid] = React.useState("");
    const [offerList, setOfferList] = React.useState([]);

    const dagToOfferList = async (dagCid) => {
        if ("" === dagCid) return new Promise((resolve, _) => { return resolve([])}); // Resolves to []
        else {
console.log("Waiting for tail: ", dagCid);
            const { value: dag } = await window.ipfs.dag.get(CID.parse(dagCid));
console.log("Got dag: ", dag);
            return [dag.Offer.toString(), ... await dagToOfferList(dag.Next.toString()) ];
        }
    }

    const updateHandler = async cidMsg => {
        const cid = String.fromCharCode(...cidMsg.data);
console.log("New root CID: ", cid);
        if (cid != rootCid) {
            const l = await dagToOfferList(cid);
console.log("Offer list: ", l);
            setOfferList(l);
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
                {offerList.map((offer) => <tr key={offer}><Offer offerCid={offer} provider={provider} /></tr>)}
            </tbody>
        </Table>
    </>);
}

export default OrderBook;