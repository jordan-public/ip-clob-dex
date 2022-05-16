// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Button, Form, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';

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
        const signer = provider.getSigner();
        const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
        console.log("Test result: ", await ftSwap.test({a: 2, b: 16}));
    }

    return (
        <Accordion>
            <Accordion.Item eventKey="0">
            <Accordion.Header>FlashSwap</Accordion.Header>
            <Accordion.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Offer1 Id</Form.Label>
                        <Form.Control onChange={onOffer1Change} />
                        <Form.Text className="text-muted">
                        Enter the first order book entry.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Offer2 Id</Form.Label>
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