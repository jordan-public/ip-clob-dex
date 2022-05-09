// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';
import FTSwap from './FTSwap';

function Body({provider}) {
    const [t1Address, setT1Address] = React.useState("");
    const [t2Address, setT2Address] = React.useState("");
    const [swapPair, setSwapPair] = React.useState(null);

    const onT1AddressChange = (e) => {
        setT1Address(e.currentTarget.value);
    }

    const onT2AddressChange = (e) => {
        setT2Address(e.currentTarget.value);
    }

    const onLoadPair = async () => {
        if (!provider) { window.alert('No provider'); return; }
        // const signer = provider.getSigner();
        // const pf = new ethers.Contract(dpswapPairFactory.address, afswapPairFactory.abi, signer);
        // const pairAddress = await pf.getPair(t1Address, t2Address);
        // setSwapPair(new ethers.Contract(pairAddress, afswapPair.abi, signer));
    }

    return (<>
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

            <Button variant="primary" onClick={onLoadPair} >
                Load
            </Button>
        </Form>
        {swapPair && <FTSwap contract={swapPair} provider={provider} />}
        </>);
}

export default Body;