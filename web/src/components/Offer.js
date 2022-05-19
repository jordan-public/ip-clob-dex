// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button, Form, InputGroup, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import afERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';
import uint256ToDecimal from '../utils/uint256ToDecimal';

function Offer({offer, provider}) {
    const [owner, setOwner] = React.useState(null);
    const [signerAddress, setSignerAddress] = React.useState(null);
    const [t1Decimals, setT1Decimals] = React.useState(null);
    const [t2Decimals, setT2Decimals] = React.useState(null);
    const [t1Symbol, setT1Symbol] = React.useState("");
    const [t2Symbol, setT2Symbol] = React.useState("");
    const [partAvaliable, setPartAvaliable] = React.useState("0");
    const [part, setPart] = React.useState(100);
    
    React.useEffect(() => {
        (async () => {
            const signer = provider.getSigner();
            setSignerAddress(await signer.getAddress());
            const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
            const splitSignature = ethers.utils.splitSignature(offer.Signature);
            const ow = await ftSwap.checkSig(offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);
            setOwner(ow);

            const p = await ftSwap.partNullified(ow, offer.Id);
            const pa = BigNumber.from(10).pow(BigNumber.from(18)).sub(p).toString();
            setPartAvaliable(pa);
            setPart(parseInt(uint256ToDecimal(pa, 18) * 100.0));

            const token1 = new ethers.Contract(offer.Asset0, afERC20.abi, signer);
            setT1Decimals(await token1.decimals());
            setT1Symbol(await token1.symbol());
            const token2 = new ethers.Contract(offer.Asset1, afERC20.abi, signer);
            setT2Decimals(await token2.decimals());  
            setT2Symbol(await token2.symbol());

            ftSwap.on("Change", async (offerId) => {
                if (offerId === offer.Id) {
console.log("Change event detected: ", offerId, "Offer: ", offer);
                    const p = await ftSwap.partNullified(ow, offer.Id);
                    setPartAvaliable(BigNumber.from(10).pow(BigNumber.from(18)).sub(p).toString());            
                }
            });
console.log("Subscribed to event Change", "Offer: ", offer);
        }) ();
    }, [offer, provider]);
    
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
        setPartAvaliable(pa.toString());

        setPart(parseInt(pa.div(BigNumber.from(10).pow(BigNumber.from(16))).toString()));            
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
            window.alert(e.message + "\n" + (e.data?e.data.message:""));
            return;
        }

        const p = await ftSwap.partNullified(owner, offer.Id);
        const pa = BigNumber.from(10).pow(BigNumber.from(18)).sub(p);
        setPartAvaliable(pa.toString());

        setPart(parseInt(pa.div(BigNumber.from(10).pow(BigNumber.from(16))).toString()));            
    }

    const onChangePart = (e) => {
        if (uint256ToDecimal(partAvaliable, 18) * 100.0 < e.target.value) setPart(parseInt(uint256ToDecimal(partAvaliable, 18) * 100.0));
        else setPart(e.target.value);
    }

    return (<td>
        <Accordion>
            <Accordion.Item eventKey="0">
            <Accordion.Header>
                { uint256ToDecimal(offer.Amount1, t2Decimals) * uint256ToDecimal(partAvaliable, 18) } @
                {offer.Amount0 / offer.Amount1} (Inverse: {uint256ToDecimal(offer.Amount0, t1Decimals) * uint256ToDecimal(partAvaliable, 18)} @ { offer.Amount1 / offer.Amount0})
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
                { "Remaining " + uint256ToDecimal(partAvaliable, 16) + "% available." } <br/>
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