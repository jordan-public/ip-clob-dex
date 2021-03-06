// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFlashCallee.sol";
import "./IFTSwap.sol";

// IPDEX (Inter Planetary DEcentralized Exchange) Fungible Token Swap
contract FTSwap is IFTSwap {
    address public owner;
    uint256 public makerFee = 10**14; // 0.01% initially
    uint256 public takerFee = 10**15; // 0.1% initially
    mapping (bytes32 => uint256) public nullifiers; // Amount of partial execution (0 (not recorded) - 10**18 (fully executed or canceled))

    event Change(uint256 indexed offerId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "IPDEX: Unauthorized");
        _;
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner; 
    }

    function setMakerFee(uint256 newMakerFee) external onlyOwner {
        require(newMakerFee<10**16, "IPDEX: Abusive maker fee"); // 1%
        makerFee = newMakerFee; 
    }

    function setTakerFee(uint256 newTakerFee) external onlyOwner {
        require(newTakerFee<10**16, "IPDEX: Abusive taker fee"); // 1%
        takerFee = newTakerFee; 
    }

    function partNullified(address maker, uint256 offerId) public view returns (uint256) {
        return nullifiers[keccak256(abi.encodePacked(maker, offerId))];
    }

    function nullify(address maker, uint256 offerId, uint256 part) private {
        require(nullifiers[keccak256(abi.encodePacked(maker, offerId))] <= part, "IPDEX: Order resurrection forbidden");
        require(part <= 10**18, "IPDEX: Order over-nullification forbidden");
        nullifiers[keccak256(abi.encodePacked(maker, offerId))] = part;
    }

    function safeTransferFrom(address token, address from, address to, uint256 value) private {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "IPDEX: Transfer failed");
    }

    function offerHash(uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), offerId, token0, token1, amount0, amount1, expiration, block.chainid));
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

    // Named "swapSimple" instead of overloading "swap" as ethers.js cannot find it due to a probable bug
    function swapSimple(uint256 part, uint256 offerId, address token0, address token1, uint256 amount0, uint256 amount1, uint256 expiration, uint8 v, bytes32 r, bytes32 s) external returns (uint256) {
        require(amount0 < type(uint256).max / 10**18 && amount1 < type(uint256).max / 10**18, "IPDEX: Overflow");
        require(expiration >= block.timestamp, "IPDEX: Expired");
        address maker = checkSig(offerId, token0, token1, amount0, amount1, expiration, v, r, s);
        require(part <= 10**18, "IPDEX: Invalid part"); // Also prevents overflow
        if (partNullified(maker, offerId) + part > 10**18) part = 10**18 - partNullified(maker, offerId);
        { // Prevent stack overflow
        uint n = partNullified(maker, offerId) + part;
        nullify(maker, offerId, n);
        }
        { // Prevent stack overflow
        uint a = amount0 * part / 10**18;
        safeTransferFrom(token0, maker, msg.sender, a);
        a = a * makerFee  / 10**18;
        safeTransferFrom(token0, maker, address(owner), a);
        }
        { // Prevent stack overflow
        uint a = amount1 * part / 10**18;
        safeTransferFrom(token1, msg.sender, maker, a);
        a = a * takerFee  / 10**18;
        safeTransferFrom(token1, msg.sender, address(owner), a);
        }
        emit Change(offerId);
        return part; // Part that executed
    }

    function swap(swapRequest calldata req, bytes memory flashData) public returns (uint256 partExecuted) {
        require(req.amount0 < type(uint256).max / 10**18 && req.amount1 < type(uint256).max / 10**18, "IPDEX: Overflow");
        require(req.expiration >= block.timestamp, "IPDEX: Expired");
        address maker = checkSig(req.offerId, req.token0, req.token1, req.amount0, req.amount1, req.expiration, req.v, req.r, req.s);
        require(req.part <= 10**18, "IPDEX: Invalid part"); // Also prevents overflow
        if (partNullified(maker, req.offerId) + req.part > 10**18) partExecuted =  10**18 - partNullified(maker, req.offerId);
        else partExecuted = req.part;
        nullify(maker, req.offerId, partNullified(maker, req.offerId) + partExecuted);
        safeTransferFrom(req.token0, maker, msg.sender, req.amount0 * partExecuted / 10**18); // Optimistically
        safeTransferFrom(req.token0, maker, address(owner), (req.amount0 * partExecuted / 10**18) * makerFee / 10**18);
        if (flashData.length > 0) IFlashCallee(msg.sender).flashCall(flashData);
        safeTransferFrom(req.token1, msg.sender, maker, req.amount1 * partExecuted / 10**18);
        safeTransferFrom(req.token1, msg.sender, address(owner), (req.amount1 * partExecuted / 10**18) * takerFee / 10**18);
        emit Change(req.offerId);
    }

    function cancelOffer(uint256 offerId) external {
        nullify(msg.sender, offerId, 10**18);
        emit Change(offerId);
    }
}
