// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import OrderBook from './OrderBook';

function Body({provider}) {
    const [t1Address, setT1Address] = React.useState("");
    const [t2Address, setT2Address] = React.useState("");

    const onT1AddressChange = (e) => {
        setT1Address(e.currentTarget.value);
    }

    const onT2AddressChange = (e) => {
        setT2Address(e.currentTarget.value);
    }

    return (<>
        <Card>
            <Card.Header>Token Pair</Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Token1 address</Form.Label>
                        <Form.Control onChange={onT1AddressChange} />
                        <Form.Text className="text-muted">
                        Enter the address of the token contract.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Token2 address</Form.Label>
                        <Form.Control  onChange={onT2AddressChange} />
                        <Form.Text className="text-muted">
                        Enter the address of the token contract.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
        <OrderBook t1Address={t1Address} t2Address={t2Address} provider={provider} />
        </>);
}

export default Body;