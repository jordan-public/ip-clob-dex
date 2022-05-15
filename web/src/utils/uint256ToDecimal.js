// SPDX-License-Identifier: BUSL-1.1
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

export default function uint256ToDecimal(u, decimals) {
    if (decimals === null) return "";
    let bd = new BigNumber(u);
    bd = bd.dividedBy(new BigNumber(10).exponentiatedBy(new BigNumber(decimals)));
    return bd.toString();
}