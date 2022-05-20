// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button, Form, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import afERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';
import afFlashSwapAMM from '../@artifacts/contracts/FlashSwapAMM.sol/FlashSwapAMM.json';
import dpFlashSwapAMM from '../@deployed/FlashSwapAMM31337.json';
import { CID } from 'multiformats/cid';
import uint256ToDecimal from '../utils/uint256ToDecimal';

function FlashSwap({provider}) {
    const [offerId, setOfferId] = React.useState("");

    const onOfferChange = async (e) => {
        setOfferId(e.currentTarget.value);
    }

    const onExecute = async () => {
        const offer = (await window.ipfs.dag.get(CID.parse(offerId))).value;

        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        // Record balance of base token (offer1.Asset0)
        const baseToken = new ethers.Contract(offer.Asset0, afERC20.abi, signer);
        const startBaseBalance = await baseToken.balanceOf(signerAddress);

        // Check available unexecuted part for each offer and populate offerX.part with it
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
        const splitSignature = ethers.utils.splitSignature(offer.Signature);
        const owner = await ftSwap.checkSig(offer.Id, offer.Asset0, offer.Asset1, offer.Amount0, offer.Amount1, offer.Expiration, splitSignature.v, splitSignature.r, splitSignature.s);
        const pn = await ftSwap.partNullified(owner, offer.Id);
        const available = BigNumber.from(10).pow(BigNumber.from(18)).sub(pn);
        
        if (available.eq(BigNumber.from(0))) {
            window.alert("No liquidity availabe.");
            return;
        }

        // Flash Swap
        const ftFlashMatch = new ethers.Contract(dpFlashSwapAMM.address, afFlashSwapAMM.abi, signer);
        try {
            const splitSignature = ethers.utils.splitSignature(offer.Signature);
            const tx = await ftFlashMatch.flashSwap(
                {
                    part: available,
                    offerId: offer.Id,
                    token0: offer.Asset0,
                    token1: offer.Asset1, 
                    amount0: offer.Amount0,
                    amount1: offer.Amount1,
                    expiration: offer.Expiration,
                    v: splitSignature.v,
                    r: splitSignature.r,
                    s: splitSignature.s
                });
            const r = await tx.wait();
            const endBaseBalance = await baseToken.balanceOf(signerAddress);
            const baseTokenDecimals = await baseToken.decimals();
            const baseTokenSymbol = await baseToken.symbol();
            const profitDecimal = uint256ToDecimal(endBaseBalance - startBaseBalance, baseTokenDecimals);
            console.log("Profit: ", profitDecimal, baseTokenSymbol);
            window.alert('Completed. Block hash: ' + r.blockHash + '\nProfit: ' + profitDecimal + baseTokenSymbol);        
        } catch(e) {
            console.log("Error: ", e);
            window.alert(e.message + "\n" + (e.data?e.data.message:""));
        }
        
    }

    return (
        <Accordion>
            <Accordion.Item eventKey="0">
            <Accordion.Header>FlashSwap to AMM (Uniswap)</Accordion.Header>
            <Accordion.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Offer CID</Form.Label>
                        <Form.Control onChange={onOfferChange} />
                        <Form.Text className="text-muted">
                        Enter the order book entry.
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" onClick={onExecute} >
                        Execute
                    </Button>
                </Form>
            </Accordion.Body>
            </Accordion.Item>
        </Accordion>);
}

export default FlashSwap;