// SPDX-License-Identifier: BUSL-1.1
import { CID } from 'multiformats/cid';

export default async function removeFromDag(dagCid, offerCid) {
    const { value: dag } = await window.ipfs.dag.get(CID.parse(dagCid));
    if (dag === "empty") return new Promise((resolve, _) => { return resolve("empty")}); // Resolves to ""
    else if (dag.Offer.toString() === offerCid) return new Promise((resolve, _) => { return resolve(dag.Next.toString())}); // Resolves to dag.Next
    else return (await window.ipfs.dag.put({ Offer: dag.Offer, Next: await removeFromDag(dag.Next.toString(), offerCid) })).toString();
}