// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FTSwap {
    mapping (bytes32 => uint256) public nullifiers; // Amount of partial execution (0 (not recorded) - 10**18 (fully executed or canceled))

    function partNullified(address maker, uint256 offerId) public view returns (uint256) {
        return nullifiers[keccak256(abi.encodePacked(maker, offerId))];
    }

    function nullify(address maker, uint256 offerId, uint256 part) private {
        require(nullifiers[keccak256(abi.encodePacked(maker, offerId))] <= part, "IPDEX: Order resurrection forbidden");
        require(part <= 10**18, "IPDEX: Order over-nullification forbidden");
        nullifiers[keccak256(abi.encodePacked(maker, offerId))] = part;
    }

    function safeTransferFrom(address token, address from, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "IPDEX: Transfer failed");
    }

    function offerHash(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), offerId, token0, token1, amount0, amount1, expiration));
    }

    function checkSig(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) public view returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, offerHash(offerId, token0, token1, amount0, amount1, expiration)));
        return ecrecover(prefixedHashMessage, v, r, s);
    }

    function checkValidOffer(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) external view returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, offerHash(offerId, token0, token1, amount0, amount1, expiration)));
        address maker = ecrecover(prefixedHashMessage, v, r, s); // Could be 0-address
        return expiration >= block.timestamp && partNullified(maker, offerId) < 10**18 && IERC20(token0).allowance(maker, address(this)) >= amount0;
    }

    function swap(uint256 part, uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) external returns (uint256) {
        require(expiration >= block.timestamp, "IPDEX: Expired");
        address maker = checkSig(offerId, token0, token1, amount0, amount1, expiration, v, r, s);
        require(part <= 10**18, "IPDEX: Invalid part"); // Also prevents overflow
        if (partNullified(maker, offerId) + part > 10**18) part -= partNullified(maker, offerId) + part - 10**18; // Optimistically execute as much as possible
        { // Prevent stack overflow
        uint n = partNullified(maker, offerId) + part;
        nullify(maker, offerId, n);
        }
        { // Prevent stack overflow
        uint a = amount0 * part / 10**18;
        safeTransferFrom(token0, maker, msg.sender, a);
        }
        { // Prevent stack overflow
        uint a = amount1 * part / 10**18;
        safeTransferFrom(token1, msg.sender, maker, a);
        }
        return part; // Part that executed
    }

    function cancelOffer(uint256 offerId) external {
        nullify(msg.sender, offerId, 10**18);
    }
}