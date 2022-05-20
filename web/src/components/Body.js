// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Form, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';
import OrderBook from './OrderBook';
import FlashSwap from './FlashSwap';
import FlashSwapAMM from './FlashSwapAMM';
import afIERC20 from '../@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';

function Body({provider}) {
    const [t1Address, setT1Address] = React.useState("");
    const [t2Address, setT2Address] = React.useState("");
    const [t1Symbol, setT1Symbol] = React.useState("");
    const [t2Symbol, setT2Symbol] = React.useState("");

    const onT1AddressChange = async (e) => {
        setT1Address(e.currentTarget.value);
        const signer = provider.getSigner();
        const token1 = new ethers.Contract(e.currentTarget.value, afIERC20.abi, signer);
        setT1Symbol(await token1.symbol());
    }

    const onT2AddressChange = async (e) => {
        setT2Address(e.currentTarget.value);
        const signer = provider.getSigner();
        const token2 = new ethers.Contract(e.currentTarget.value, afIERC20.abi, signer);
        setT2Symbol(await token2.symbol());
    }

    return (<>
        <Accordion defaultActiveKey={ (t1Address === "" || t2Address === "") && "0"}>
            <Accordion.Item eventKey="0">
            <Accordion.Header>{t2Symbol} / {t1Symbol}</Accordion.Header>
            <Accordion.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formT1">
                        <Form.Label>Token1 ({t1Symbol}) address</Form.Label>
                        <Form.Control onChange={onT1AddressChange} />
                        <Form.Text className="text-muted">
                        Enter the address of the token contract.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formT2">
                        <Form.Label>Token2 ({t2Symbol}) address</Form.Label>
                        <Form.Control  onChange={onT2AddressChange} />
                        <Form.Text className="text-muted">
                        Enter the address of the token contract.
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Accordion.Body>
            </Accordion.Item>
        </Accordion>
        <OrderBook t1Address={t1Address} t2Address={t2Address} provider={provider} />
        <FlashSwap provider={provider} />
        <FlashSwapAMM provider={provider} />
    </>);
}

export default Body;