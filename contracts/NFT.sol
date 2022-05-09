// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint256 public lastId = 0;

    constructor(string memory name, string memory symbol, string memory url) ERC721(name, symbol) {
        mint(msg.sender, url);
    }

    function mint(address to, string memory url) public returns (uint256) {
        _mint(to, lastId);
        _setTokenURI(lastId, url);
        return lastId++;
    }
}
