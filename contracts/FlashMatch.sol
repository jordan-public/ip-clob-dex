// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFlashCallee.sol";
import "./IFTSwap.sol";

contract FlashMatch is IFlashCallee {
    IFTSwap public ftSwap;

    constructor(address _swap) {
        ftSwap = IFTSwap(_swap);
    }

    function safeTransfer(address token, address to, uint256 value) private {
        // bytes4(keccak256(bytes('transfer(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xA9059CBB, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "IPDEX-FS: Transfer failed");
    }

    function flashCall(bytes calldata flashData) external {
        assert(msg.sender == address(ftSwap)); // Must call the given FTSwap
        (swapRequest memory req) = abi.decode(flashData, (swapRequest));
        IERC20(req.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
        ftSwap.swap(req, new bytes(0));
    }

    // As usual in IPDEX, msg.sender must req1.token0.approve(swap, sufficient_amount) prior to calling this
    // req1 is a swap between Maker 1 and this contract
    // req2 is a swap between Maker 2 and this contract
    //
    // To save gas, pre-populate req1.part and req2.part with the 1**18 - partNullifier(reqX maker, reqX.offerId).
    // This can be done because refX.part is not used to pass value to this call.
    function flashMatch(swapRequest memory req1, swapRequest memory req2) external returns (uint256 profit) {
        uint256 availablePart1 = req1.part; 
        // Above line to save gas (instead of):
        // availablePart1 = 10**18 - ftSwap.partNullified(
        //     ftSwap.checkSig(req1.offerId, req1.token0, req1.token1, req1.amount0, req1.amount1, req1.expiration, req1.v, req1.r, req1.s),
        //     req1.offerId); // Does not underflow 
        uint256 availablePart2 = req2.part;
        // Above line to save gas (instead of):
        // availablePart2 = 10**18 - ftSwap.partNullified(
        //     ftSwap.checkSig(req2.offerId, req2.token0, req2.token1, req2.amount0, req2.amount1, req2.expiration, req2.v, req2.r, req2.s),
        //     req2.offerId); // Does not underflow 

        // Calculate the largest appropriate part.
        if ((req1.amount1 * availablePart1) >= req2.amount0 * availablePart2 * (10**18 - ftSwap.takerFee()) / 10**18) { // Sufficient amount to borrow ==> scale req1
            req2.part = availablePart2; // 1 (all)
            req1.part = ((10**18 * req2.amount0 / req1.amount1) * availablePart2 / availablePart1) * (10**18 - ftSwap.takerFee()) / 10**18; // Round down
console.log("variant 1 parts");
console.log(req1.part);
console.log(req2.part);
        } else { // req1.amount1 < req2.amount0 - fee ==> borrow everything scale req2
            req1.part = availablePart1; // 1 (all)
            req2.part = ((10**18 * req1.amount1 / req2.amount0) * availablePart1 / availablePart2) * 10**18  / (10**18 - ftSwap.takerFee());
console.log("variant 2 parts");
console.log(req1.part);
console.log(req2.part);
            if (((req1.amount1 * availablePart1 * 10**18 / (10**18 - ftSwap.takerFee())) * 10**18) % req2.amount0 * availablePart2 > 0) req2.part += 1; // Round up
            // Not possible: require(req2.part <= 10**18, "IPDEX-FS: Rounding problem 2");
        }
        (bytes memory flashData) = abi.encode(req2);
        IERC20(req1.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
        ftSwap.swap(req1, flashData);
        require(req2.amount1 * req2.part <= req1.amount0 * req1.part * (10**18 - ftSwap.takerFee()) / 10**18, "IPDEX-FS: Unprofitable 1");
        profit = (req1.amount0 * req1.part * (10**18 - ftSwap.takerFee()) / 10**18 - req2.amount1 * req2.part) / 10**18; // Does not overflow
        // Rounding dust - no need to spend gas: IERC20(req1.token1).transfer(msg.sender, IERC20(req1.token1).balanceOf(address(this)));
console.log("profit");
console.log(profit);
console.log(IERC20(req1.token0).balanceOf(address(this)));
console.log(IERC20(req1.token1).balanceOf(address(this)));
        safeTransfer(req1.token0,  msg.sender, profit);
    }
}
