// SPDX-License-Identifier: BUSL-1.1
import { ethers } from 'ethers';
import afFTSwap from '../@artifacts/contracts/FTSwap.sol/FTSwap.json';
import dpFTSwap from '../@deployed/FTSwap.json';

export default async function getOfferTableTopic(t1Address, t2Address, provider) {
    // if (!provider) { window.alert('No provider'); return ""; }
    if (t1Address.length !== 42) return "";
    if (t2Address.length !== 42) return "";
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    const ftSwap = new ethers.Contract(dpFTSwap[chainId].address, afFTSwap.abi, signer);
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ftSwap.address.toString()+chainId.toString()+t1Address+t2Address)).toString();
}