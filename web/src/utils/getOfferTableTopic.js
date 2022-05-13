// SPDX-License-Identifier: BUSL-1.1
import { ethers } from 'ethers';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap31337.json';

export default function random256hex(t1Address, t2Address, provider) {
    // if (!provider) { window.alert('No provider'); return ""; }
    if (t1Address.length !== 42) return "";
    if (t2Address.length !== 42) return "";
    const signer = provider.getSigner();
    const ftSwap = new ethers.Contract(dpFTSwap.address, afFTSwap.abi, signer);
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ftSwap.address.toString()+t1Address+t2Address)).toString();
}