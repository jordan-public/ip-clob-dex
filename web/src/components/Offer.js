// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import { CID } from 'multiformats/cid';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';

function Offer({offerCid, provider}) {
    const [offer, setOffer] = React.useState(null);
    const [owner, setOwner] = React.useState(null);
    const [signerAddress, setSignerAddress] = React.useState(null);
    
    React.useEffect(() => {
        (async () => {
console.log("Offer CID: ", offerCid);
if (offerCid === null || offerCid === "") {
    console.log("Null offerCid - this will not happen when offer in a list");
    return;
}
console.log(CID.parse(offerCid));
            const { value: o } = await window.ipfs.dag.get(CID.parse(offerCid));
console.log("Offer from IPFS: ", o);
            setOffer(o);

            const signer = provider.getSigner();
            setSignerAddress(await signer.getAddress());
            const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
            const splitSignature = ethers.utils.splitSignature(o.Signature);
            const ow = await ftSwap.checkSig(o.Id, o.Asset0, o.Asset1, o.Amount0, o.Amount1, o.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);
            setOwner(ow);
        }) ();
    }, [offerCid, provider]);
    
    const onTakeOffer = async () => {
        const signer = provider.getSigner();
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);

        // Approve spending of Asset1
        const token2 = new ethers.Contract(offer.Asset1, afIERC20.abi, signer);
        const allowance = await token2.allowance(await signer.getAddress(), ftSwap.address);
        if (allowance.lt(BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'))) {
            try {
                const tx = await token2.approve(ftSwap.address, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

                const r = await tx.wait();
                window.alert('Completed. Block hash: ' + r.blockHash);        
            } catch(e) {
                console.log("Error: ", e);
                window.alert(e.message);
            }
        }

        // Execute swap
        const splitSignature = ethers.utils.splitSignature(offer.Signature);
        try {
            const tx = await ftSwap.swap(offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);

            const r = await tx.wait();
            window.alert('Completed. Block hash: ' + r.blockHash);        
        } catch(e) {
            console.log("Error: ", e);
            window.alert(e.message + "\n" + e.data.message);
        }
    }

    const onCancelOffer = async () => {
        const signer = provider.getSigner();
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
        try {
            const tx = await ftSwap.cancelOffer(offer.Id);

            const r = await tx.wait();
            window.alert('Completed. Block hash: ' + r.blockHash);        
        } catch(e) {
            console.log("Error: ", e);
            window.alert(e.message);
        }
    }

    return (<td>
        Id: { offer && offer.Id } <br/>
        Amount: {offer && offer.Amount0} <br/>
        for: {offer && offer.Amount1} <br/>
        Price: {offer && offer.Amount1 / offer.Amount0} <br/>
        Price: 1 / {offer && offer.Amount0 / offer.Amount1} <br/>
        Expires: {offer && new Date(parseInt(offer.Expiration) * 1000).toLocaleDateString()} <br/>
        { owner !== signerAddress && <Button variant="primary" onClick={onTakeOffer} >
            Take
        </Button> }
        { owner === signerAddress && <Button variant="primary" onClick={onCancelOffer} >
            Cancel
        </Button> }
    </td>);
}

export default Offer;