// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';
import CID from 'cids';

function Offer({offerCid, provider}) {
    const [offer, setOffer] = React.useState(null);
    
    React.useEffect(() => {
        (async () => {
console.log("Offer CID: ", offerCid);
console.log(new CID(offerCid));
            const offer = await window.ipfs.dag.get(new CID(offerCid));
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