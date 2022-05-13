// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Button, Card, CardGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';
import OfferTable from './OfferTable';

function OrderBook({t1Address, t2Address, provider}) {
    return (
        <CardGroup>
            <Card>
                <Card.Header>Bid</Card.Header>
                <Card.Body>
                    <OfferTable t1Address={t1Address} t2Address={t2Address} provider={provider} />
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>Ask</Card.Header>
                <Card.Body>
                    <OfferTable t1Address={t2Address} t2Address={t1Address} provider={provider} />
                </Card.Body>
            </Card>
        </CardGroup>);
}

export default OrderBook;