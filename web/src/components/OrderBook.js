// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Card, CardGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import OfferTable from './OfferTable';

function OrderBook({t1Address, t2Address, provider, address}) {
    return (
        <CardGroup>
            <Card>
                <Card.Header>Bid</Card.Header>
                <Card.Body>
                    <OfferTable t1Address={t1Address} t2Address={t2Address} provider={provider} address={address} />
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>Ask</Card.Header>
                <Card.Body>
                    <OfferTable t1Address={t2Address} t2Address={t1Address} provider={provider} address={address} />
                </Card.Body>
            </Card>
        </CardGroup>);
}

export default OrderBook;