// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import Offer from './Offer';
import getOfferTableTopic from '../utils/getOfferTableTopic';
import MakeOffer from './MakeOffer';

function OrderBook({t1Address, t2Address, provider}) {
    const [offerTopic, setOfferTopic] = React.useState("");
    const [rootCid, setRootCid] = React.useState("");

    const updateHandler = cidMsg => {
        const cid = String.fromCharCode(...cidMsg.data);
        console.log("New root CID: ", cid);
        setRootCid(cid);
        //window.ipfs.dag.get();
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
        <MakeOffer t1Address={t1Address} t2Address={t2Address} offerTopic={offerTopic} provider={provider}/>
        <br/>
        <Table striped bordered hover>
            <tbody>
                <tr><Offer offerCid={rootCid} provider={provider} /></tr>
            </tbody>
        </Table>
    </>);
}

export default OrderBook;