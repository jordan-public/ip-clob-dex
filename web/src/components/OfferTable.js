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
            const { value: dag } = await window.ipfs.dag.get(CID.parse(dagCid));
            return [(await window.ipfs.dag.get(CID.parse(dag.Offer.toString()))).value, ...await dagToOfferList(dag.Next.toString()) ];
        }
    }

    const updateHandler = async cidMsg => {
        const cid = String.fromCharCode(...cidMsg.data);
console.log("New root CID: ", cid);
        if (cid === "rebroadcast") {
            if (rootCid !== "") await window.ipfs.pubsub.publish(offerTopic, rootCid);
        } else if (cid !== rootCid) {
            const l = await dagToOfferList(cid);
            const sl = l.sort((o1, o2) => { return o1.Amount1 / o1.Amount0 - o2.Amount1 / o2.Amount0 });
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