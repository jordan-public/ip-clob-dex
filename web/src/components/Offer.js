// SPDX-License-Identifier: BUSL-1.1
import React from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; 
import { ethers } from 'ethers';

function Offer({t1Address, t2Address, provider}) {
    React.useEffect(() => {
        
    }, [t1Address, t2Address, provider]);
    
    return (<Table striped bordered hover>
        <thead><tr>
            <td>Amount1</td>
            <td>Amount2</td>
        </tr></thead>
    </Table>);
}

export default Offer;