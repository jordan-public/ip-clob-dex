// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';

function FTSwap({t1Address, t2Address, provider}) {
    return (
        <Card>
            <Card.Header>Offers</Card.Header>
            <Card.Body>
                <table>

                </table>
            </Card.Body>
        </Card>);
}

export default FTSwap;