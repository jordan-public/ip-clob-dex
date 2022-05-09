// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FTSwap {
    mapping (bytes32 => bool) public nullifiers; 

    function isNullified(address maker, uint256 offerId) public view returns (bool) {
        return nullifiers[keccak256(abi.encodePacked(maker, offerId))];
    }

    function nullify(address maker, uint256 offerId) private {
        nullifiers[keccak256(abi.encodePacked(maker, offerId))] = true;
    }

    function safeTransferFrom(address token, address from, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "IPDEX: Transfer failed");
    }

    function offerHash(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), offerId, token0, token1, amount0, amount1));
    }

    function checkSig(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint8 v, bytes32 r, bytes32 s) public view returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, offerHash(offerId, token0, token1, amount0, amount1)));
        return ecrecover(prefixedHashMessage, v, r, s);
    }

    function checkValidOffer(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint8 v, bytes32 r, bytes32 s) public view returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, offerHash(offerId, token0, token1, amount0, amount1)));
        address maker = ecrecover(prefixedHashMessage, v, r, s); // Could be 0-address
        return !isNullified(maker, offerId) && IERC20(token0).allowance(maker, address(this)) >= amount0;
    }

    function swap(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint8 v, bytes32 r, bytes32 s) external {
        address maker = checkSig(offerId, token0, token1, amount0, amount1, v, r, s);
        require(!isNullified(maker, offerId), "IPDEX: Nullified offer");
        nullify(maker, offerId);
        safeTransferFrom(token0, maker, msg.sender, amount0);
        safeTransferFrom(token1, msg.sender, maker, amount1);
    }

    function cancelOffer(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint8 v, bytes32 r, bytes32 s) external {
        address maker = checkSig(offerId, token0, token1, amount0, amount1, v, r, s);
        require(msg.sender == maker, "IPDEX: Unauthorized");
        nullify(maker, offerId);
    }
}