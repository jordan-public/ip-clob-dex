// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';
import { CID } from 'multiformats/cid';

function Offer({offerCid, provider}) {
    const [offer, setOffer] = React.useState(null);
    
    React.useEffect(() => {
        (async () => {
console.log("Offer CID: ", offerCid);
if (offerCid === null || offerCid === "") {
    console.log("Null offerCid - this will not happen when offer in a list");
    return;
}
console.log(CID.parse(offerCid));
            const offer = await window.ipfs.dag.get(CID.parse(offerCid));
console.log("Offer from IPFS: ", offer.value);
            setOffer(offer.value);
        }) ();
    }, [offerCid, provider]);
    
    return (<>
        <td>{offer && offer.Amount0}</td>
        <td>{offer && offer.Amount0}</td>
        <td>{offer && new Date(parseInt(offer.Expiration) * 1000).toString()}</td>
    </>);
}

export default Offer;