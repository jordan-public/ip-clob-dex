// SPDX-License-Identifier: BUSL-1.1
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

export default function decimalToUint256(d, decimals) {
    if (decimals === null) return "";
    let bd = new BigNumber(d);
    bd = bd.multipliedBy(new BigNumber(10).exponentiatedBy(new BigNumber(decimals)));
    bd = bd.integerValue();
    return bd.toString();
}