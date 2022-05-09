// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';

function MakeOffer({t1Address, t2Address, provider}) {
    const [t1Amount, setT1Amount] = React.useState("");
    const [t2Amount, setT2Amount] = React.useState("");

    const onT1AmountChange = (e) => {
        setT1Amount(e.currentTarget.value);
    }

    const onT2AmountChange = (e) => {
        setT2Amount(e.currentTarget.value);
    }

    const onMakeOffer = async () => {
        if (!provider) { window.alert('No provider'); return; }
        // const signer = provider.getSigner();
        // const pf = new ethers.Contract(dpswapPairFactory.address, afswapPairFactory.abi, signer);
        // const pairAddress = await pf.getPair(t1Address, t2Address);
        // setSwapPair(new ethers.Contract(pairAddress, afswapPair.abi, signer));
    }

    return (
        <Card>
            <Card.Header>Make Offer</Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Token1 amount</Form.Label>
                        <Form.Control onChange={onT1AmountChange} />
                        <Form.Text className="text-muted">
                        Enter the amount of the first token.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Token2 amount</Form.Label>
                        <Form.Control  onChange={onT2AmountChange} />
                        <Form.Text className="text-muted">
                        Enter the amount of the second Token.
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" onClick={onMakeOffer} >
                        Make Offer
                    </Button>
                </Form>
            </Card.Body>
        </Card>);
}

export default MakeOffer;