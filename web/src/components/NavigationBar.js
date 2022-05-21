// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Navbar } from 'react-bootstrap';
import Account from './Account';

function NavigationBar({provider, setProvider, setAddress}) {
    return (
        <Navbar className="bg-light justify-content-between">
            <Navbar.Brand>IPDEX</Navbar.Brand>
            <Navbar.Text> <Account provider={provider} setProvider={setProvider} setAddress={setAddress}/> </Navbar.Text>
        </Navbar>
    );
}

export default NavigationBar;