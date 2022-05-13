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
            await window.ipfs.pubsub.subscribe(t, updateHandler);
        }) ();
    }, [t1Address, t2Address, provider]);
    
    return (<>
        <Table striped bordered hover>
            <thead>
                <tr>
                    <td>Amount1</td><td>Amount2</td><td>Expiration</td>
                </tr>
            </thead>
            <tbody>
                <tr><Offer offerCid={rootCid} provider={provider} /></tr>
            </tbody>
        </Table>
        <MakeOffer t1Address={t1Address} t2Address={t2Address} offerTopic={offerTopic} provider={provider}/>
    </>);
}

export default OrderBook;