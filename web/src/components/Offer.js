// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button, Form, InputGroup, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import afERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap.json';
import uint256ToDecimal from '../utils/uint256ToDecimal';
import removeFromDag from '../utils/removeFromDag';
import dagToOfferList from '../utils/dagToOfferList';

function Offer({offer, offerTopic, rootCid, provider, address}) {
    const [owner, setOwner] = React.useState(null);
    const [signerAddress, setSignerAddress] = React.useState(null);
    const [t1Decimals, setT1Decimals] = React.useState(null);
    const [t2Decimals, setT2Decimals] = React.useState(null);
    const [t1Symbol, setT1Symbol] = React.useState("");
    const [t2Symbol, setT2Symbol] = React.useState("");
    const [partAvailable, setPartAvailable] = React.useState("0");
    const [part, setPart] = React.useState(100);
    
    React.useEffect(() => {
        (async () => {
            const signer = provider.getSigner();
            setSignerAddress(await signer.getAddress());
            const { chainId } = await provider.getNetwork();
            const ftSwap = new ethers.Contract(dpFTSwap[chainId].address, afFTSwap.abi, signer);
            const splitSignature = ethers.utils.splitSignature(offer.Signature);
            const ow = await ftSwap.checkSig(offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);
            setOwner(ow);

            const pn = await ftSwap.partNullified(ow, offer.Id);
            const pa = BigNumber.from(10).pow(BigNumber.from(18)).sub(pn).toString();
            setPart(parseInt(uint256ToDecimal(pa, 18) * 100.0));
            setPartAvailable(pa);

            const token1 = new ethers.Contract(offer.Asset0, afERC20.abi, signer);
            setT1Decimals(await token1.decimals());
            setT1Symbol(await token1.symbol());
            const token2 = new ethers.Contract(offer.Asset1, afERC20.abi, signer);
            setT2Decimals(await token2.decimals());  
            setT2Symbol(await token2.symbol());
        }) ();
    }, [offer, provider, address]);
    
    React.useEffect(() => {
        (async () => {
            const paPerc = parseInt(uint256ToDecimal(partAvailable, 18) * 100.0);
            if (paPerc < part) setPart(paPerc);
        }) ();
    }, [partAvailable]);
    
    React.useEffect(() => {
console.log("Init effect");
        let listener;
        let ftSwap;
        (async () => {
            const signer = provider.getSigner();
            const { chainId } = await provider.getNetwork();
            ftSwap = new ethers.Contract(dpFTSwap[chainId].address, afFTSwap.abi, signer);
            const splitSignature = ethers.utils.splitSignature(offer.Signature);
            const ow = await ftSwap.checkSig(offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);
            listener = async (offerId) => {
                if (offerId.toHexString() === offer.Id) {
                    const p = await ftSwap.partNullified(ow, offer.Id);
                    setPartAvailable(BigNumber.from(10).pow(BigNumber.from(18)).sub(p).toString());
                    if (p.eq(BigNumber.from(10).pow(BigNumber.from(18)))) {
                        const r = await removeFromDag(rootCid, offer.CID.toString());
console.log("Removing : ", offer.CID.toString(), "from: ", await dagToOfferList(rootCid), "results in: ", await dagToOfferList(r));
console.log("Applying new root: ", r, "old: ", rootCid);
console.log("from offer: ", offer.Id, "=", offerId.toHexString(), "on topic: ", offerTopic);
                        await window.ipfs.pubsub.publish(offerTopic, r);

                    }
                } else console.log("Unqualfied event: ", offerId.toHexString(), "in offer.Id= ", offer.Id);
            };           
console.log("Subscribing ", offer.Id, "to Change(offerId) event.");
            ftSwap.on("Change", listener);
console.log("Listener count (Change): ", ftSwap.listenerCount("Change"), "total: ", ftSwap.listenerCount());
        }) ();
        return () => {
console.log("Cleanup effect");
console.log("Unsubscribing ", offer.Id, "from Change(offerId) event.");
            ftSwap.off("Change", listener);
console.log("Listener count (Change): ", ftSwap.listenerCount("Change"), "total: ", ftSwap.listenerCount());
        }
    }, [rootCid]);
    
    const onTakeOffer = async () => {
        const signer = provider.getSigner();
        const { chainId } = await provider.getNetwork();
        const ftSwap = new ethers.Contract(dpFTSwap[chainId].address, afFTSwap.abi, signer);

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
                window.alert(e.message + "\n" + (e.data?e.data.message:""));
                return;
            }
        }

        // Execute swap
        const splitSignature = ethers.utils.splitSignature(offer.Signature);
        try {
            const tx = await ftSwap.swapSimple(BigNumber.from(part).mul(BigNumber.from(10).pow(BigNumber.from(16))), offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);
            const r = await tx.wait();
            window.alert('Completed. Block hash: ' + r.blockHash);        
        } catch(e) {
            console.log("Error: ", e);
            window.alert(e.message + "\n" + (e.data?e.data.message:""));
            return;
        }

        const p = await ftSwap.partNullified(owner, offer.Id);
        const pa = BigNumber.from(10).pow(BigNumber.from(18)).sub(p);
        setPartAvailable(pa.toString());

        setPart(parseInt(pa.div(BigNumber.from(10).pow(BigNumber.from(16))).toString()));            
    }

    const onCancelOffer = async () => {
        const signer = provider.getSigner();
        const { chainId } = await provider.getNetwork();
        const ftSwap = new ethers.Contract(dpFTSwap[chainId].address, afFTSwap.abi, signer);
        try {
            const tx = await ftSwap.cancelOffer(offer.Id);

            const r = await tx.wait();
            window.alert('Completed. Block hash: ' + r.blockHash);        
        } catch(e) {
            console.log("Error: ", e);
            window.alert(e.message + "\n" + (e.data?e.data.message:""));
            return;
        }

        const p = await ftSwap.partNullified(owner, offer.Id);
        const pa = BigNumber.from(10).pow(BigNumber.from(18)).sub(p);
        setPartAvailable(pa.toString());

        setPart(parseInt(pa.div(BigNumber.from(10).pow(BigNumber.from(16))).toString()));            
    }

    const onChangePart = (e) => {
        if (uint256ToDecimal(partAvailable, 18) * 100.0 < e.target.value) setPart(parseInt(uint256ToDecimal(partAvailable, 18) * 100.0));
        else setPart(e.target.value);
    }

    return (<td>
        <Accordion>
            <Accordion.Item eventKey="0">
            <Accordion.Header>
                { uint256ToDecimal(offer.Amount1, t2Decimals) * uint256ToDecimal(partAvailable, 18) } @
                {offer.Amount0 / offer.Amount1} (Inverse: {uint256ToDecimal(offer.Amount0, t1Decimals) * uint256ToDecimal(partAvailable, 18)} @ { offer.Amount1 / offer.Amount0})
            </Accordion.Header>
            <Accordion.Body>
                CID: { offer.CID } <br/>
                Id: { offer.Id } <br/>
                { owner !== signerAddress && "I can get:"} { owner === signerAddress && "I pay:" } &nbsp;
                    { uint256ToDecimal(offer.Amount0, t1Decimals) } of {t1Symbol} &nbsp;
                for: &nbsp;
                    { uint256ToDecimal(offer.Amount1, t2Decimals) } of {t2Symbol}<br/>
                Price: { offer.Amount0 / offer.Amount1} {t2Symbol}/{t1Symbol} &nbsp;
                = { offer.Amount1 / offer.Amount0}  {t1Symbol}/{t2Symbol}<br/>
                Expires: { new Date(parseInt(offer.Expiration) * 1000).toString()} <br/>
                { "Remaining " + uint256ToDecimal(partAvailable, 16) + "% available." } <br/>
                { owner !== signerAddress &&
                    <InputGroup>
                        <Button variant="primary" onClick={onTakeOffer} >
                            Take
                        </Button>
                        <InputGroup.Text>{part}</InputGroup.Text>
                        <InputGroup.Text>%</InputGroup.Text>
                        <Form.Range onChange={onChangePart} value={part} />
                    </InputGroup>
                }
                { owner === signerAddress && 
                    <Button variant="primary" onClick={onCancelOffer} >
                        Cancel
                    </Button>
                }
            </Accordion.Body>
            </Accordion.Item>
        </Accordion>
        </td>);
}

export default Offer;