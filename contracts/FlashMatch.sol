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

    function flashCall(bytes calldata flashData) external {
        assert(msg.sender == address(ftSwap)); // Must call the given FTSwap
        (swapRequest memory req) = abi.decode(flashData, (swapRequest));
        IERC20(req.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
        ftSwap.swap(req);
    }

    // As usual in IPDEX, msg.sender must req1.token0.approve(swap, sufficient_amount) prior to calling this
    // req1 is a swap between Maker 1 and this contract
    // req2 is a swap between Maker 2 and this contract
    function flashMatch(swapRequest memory req1, swapRequest memory req2) external returns (uint256 profit) {
        // Ignore both req1.part and req2.part - instead, calculate the largest appropriate part.
        require(req1.token1 == req2.token0 && req1.token0 == req2.token1, "IPDEX-FS: Request mismatch");
        if (req1.amount1 >= req2.amount0) { // Sufficient amount to borrow - scale req1
            req2.part = 10**18; // 1 (all)
            req1.part = req2.amount0 * 10**18 / req1.amount1;
            if (req2.amount0 * 10**18 % req1.amount1 > 0) req1.part += 1; // Round up
            require(req1.part <= 10**18, "IPDEX-FS: Rounding problem 1");
            (bytes memory flashData) = abi.encode(req2);
console.log(IERC20(req1.token0).balanceOf(address(this)));
console.log(IERC20(req1.token1).balanceOf(address(this)));
            IERC20(req1.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
            ftSwap.swap(req1, flashData);
            require(req2.amount1 >= req1.amount0 * req1.part / 10**18, "IPDEX-FS: Unprofitable 1");
            profit = req2.amount1 - req1.amount0 * req1.part / 10**18; // Does not overflow
console.log(profit);
console.log(IERC20(req1.token0).balanceOf(address(this)));
console.log(IERC20(req1.token1).balanceOf(address(this)));
            IERC20(req1.token0).transfer(msg.sender, profit);
            // Rounding dust - no need to spend gas: IERC20(req1.token1).transfer(msg.sender, IERC20(req1.token1).balanceOf(address(this)));
        } else { // req1.amount1 < req2.amount0 - borrow everything scale req2
            req1.part = 10**18; // 1 (all)
            req2.part = req1.amount1 * 10**18 / req2.amount0;
            if (req1.amount1 * 10**18 % req2.amount0 > 0) req2.part += 1; // Round up
            require(req2.part <= 10**18, "IPDEX-FS: Rounding problem 2");
            IERC20(req1.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
            bytes memory flashData = abi.encode(req2);
            ftSwap.swap(req1, flashData);
            require(req2.amount1 * req2.part / 10**18 >= req1.amount0, "IPDEX-FS: Unprofitable 2");
            profit = req2.amount1 * req2.part / 10**18 - req1.amount0; // Does not overflow
            IERC20(req1.token0).transfer(msg.sender, profit);
            // Rounding dust - no need to spend gas: IERC20(req1.token1).transfer(msg.sender, IERC20(req1.token1).balanceOf(address(this)));
        }
    }
}
