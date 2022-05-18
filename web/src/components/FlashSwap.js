// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button, Form, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { BigNumber, ethers } from 'ethers';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';
import afFlashMatch from '../@artifacts/contracts/FlashMatch.sol/FlashMatch.json';
import dpFlashMatch from '../@deployed/FlashMatch31337.json';
import { CID } from 'multiformats/cid';
import uint256ToDecimal from '../utils/uint256ToDecimal';

function FlashSwap({provider}) {
    const [offer1Id, setOffer1Id] = React.useState("");
    const [offer2Id, setOffer2Id] = React.useState("");

    const onOffer1Change = async (e) => {
        setOffer1Id(e.currentTarget.value);
    }

    const onOffer2Change = async (e) => {
        setOffer2Id(e.currentTarget.value);
    }

    const onExecute = async () => {
        const offer1 = (await window.ipfs.dag.get(CID.parse(offer1Id))).value;
console.log("Offer1: ", offer1);
        const offer2 = (await window.ipfs.dag.get(CID.parse(offer2Id))).value;
console.log("Offer2: ", offer2);

        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        // Record balance of base token (offer1.Asset0)
        const baseToken = new ethers.Contract(offer1.Asset0, afIERC20.abi, signer);
        const startBaseBalance = await baseToken.balanceOf(signerAddress);

        // Authorize Swap to spend base token
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
        const allowance = await baseToken.allowance(signerAddress, ftSwap.address);
        if (allowance.lt(BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'))) {
            try {
                const tx = await baseToken.approve(ftSwap.address, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

                const r = await tx.wait();
                window.alert('Completed. Block hash: ' + r.blockHash);        
            } catch(e) {
                console.log("Error: ", e);
                window.alert(e.message + "\n" + e.data.message);
            }
        }

        // Flash Swap
        const ftFlashMatch = new ethers.Contract(dpFlashMatch.address, afFlashMatch.abi, signer);
        try {
            const splitSignature1 = ethers.utils.splitSignature(offer1.Signature);
            const splitSignature2 = ethers.utils.splitSignature(offer2.Signature);
            const tx = await ftFlashMatch.flashMatch(
                {
                    part: 0,
                    offerId: offer1.Id,
                    token0: offer1.Asset0,
                    token1: offer1.Asset1, 
                    amount0: offer1.Amount0,
                    amount1: offer1.Amount1,
                    expiration: offer1.Expiration,
                    v: splitSignature1.v,
                    r: splitSignature1.r,
                    s: splitSignature1.s
                },
                {
                    part: 0,
                    offerId: offer2.Id,
                    token0: offer2.Asset0,
                    token1: offer2.Asset1, 
                    amount0: offer2.Amount0,
                    amount1: offer2.Amount1,
                    expiration: offer2.Expiration,
                    v: splitSignature2.v,
                    r: splitSignature2.r,
                    s: splitSignature2.s
                });
            const r = await tx.wait();
            const endBaseBalance = await baseToken.balanceOf(signerAddress);
            const baseTokenDecimals = await baseToken.decimals();
            const profitDecimal = uint256ToDecimal(endBaseBalance, baseTokenDecimals) - uint256ToDecimal(startBaseBalance, baseTokenDecimals);
            console.log("Profit: ", profitDecimal);
            window.alert('Completed. Block hash: ' + r.blockHash + '\nProfit: ' + profitDecimal);        
        } catch(e) {
            console.log("Error: ", e);
            window.alert(e.message + "\n" + e.data.message);
        }
        
    }

    return (
        <Accordion>
            <Accordion.Item eventKey="0">
            <Accordion.Header>FlashSwap</Accordion.Header>
            <Accordion.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Offer1 CID</Form.Label>
                        <Form.Control onChange={onOffer1Change} />
                        <Form.Text className="text-muted">
                        Enter the first order book entry.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Offer2 CID</Form.Label>
                        <Form.Control  onChange={onOffer2Change} />
                        <Form.Text className="text-muted">
                        Enter the amount of the second Token.
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