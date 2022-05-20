// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFlashCallee.sol";

struct swapRequest {
    uint256 part;
    uint256 offerId;
    address token0;
    address token1;
    uint256 amount0;
    uint256 amount1;
    uint256 expiration;
    uint8 v;
    bytes32 r;
    bytes32 s;
}

// IPDEX (Inter Planetary DEcentralized Exchange) Fungible Token Swap
interface IFTSwap {
    function owner() external view returns(address);
    
    function makerFee() external view returns(uint256);
    
    function takerFee() external view returns(uint256);
    
    function nullifiers(bytes32 hash) external view returns(uint256);
    
    function partNullified(address maker, uint256 offerId) external view returns (uint256);

    function offerHash(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration) external view returns (bytes32);

    function checkSig(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) external view returns (address);

    function checkValidOffer(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) external view returns (bool);

    // Named "swapSimple" instead of overloading "swap" as ethers.js cannot find it due to a probable bug
    function swapSimple(uint256 part, uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) external returns (uint256);

    function swap(swapRequest calldata req, bytes calldata flashData) external returns (uint256 partExecuted);

    function cancelOffer(uint256 offerId) external;
}