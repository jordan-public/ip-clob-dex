// SPDX-License-Identifier: BUSL-1.1
import { CID } from 'multiformats/cid';

export default async function dagToOfferList(dagCid) {
    if ("empty" === dagCid) return new Promise((resolve, _) => { return resolve([])}); // Resolves to [] 
    else {
        const { value: dag } = await window.ipfs.dag.get(CID.parse(dagCid));
        return [{ CID: dag.Offer.toString(), ...(await window.ipfs.dag.get(CID.parse(dag.Offer.toString()))).value}, ...await dagToOfferList(dag.Next.toString()) ];
    }
}