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

    function safeTransferFrom(address token, address from, address to, uint256 value) private {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "IPDEX: Transfer failed");
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
            req1.part = req2.amount0 * 10**18 / req1.amount1; // Round down
            (bytes memory flashData) = abi.encode(req2);
            IERC20(req1.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
            ftSwap.swap(req1, flashData);
            require(req2.amount1 <= req1.amount0 * req1.part / 10**18, "IPDEX-FS: Unprofitable 1");
            profit = req1.amount0 * req1.part / 10**18 - req2.amount1; // Does not overflow
            // Rounding dust - no need to spend gas: IERC20(req1.token1).transfer(msg.sender, IERC20(req1.token1).balanceOf(address(this)));
        } else { // req1.amount1 < req2.amount0 - borrow everything scale req2
            req1.part = 10**18; // 1 (all)
            req2.part = req1.amount1 * 10**18 / req2.amount0;
            if (req1.amount1 * 10**18 % req2.amount0 > 0) req2.part += 1; // Round up
            // Not possible: require(req2.part <= 10**18, "IPDEX-FS: Rounding problem 2");
            IERC20(req1.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
            bytes memory flashData = abi.encode(req2);
            ftSwap.swap(req1, flashData);
            require(req2.amount1 * req2.part / 10**18 <= req1.amount0, "IPDEX-FS: Unprofitable 2");
            profit = req1.amount0 - req2.amount1 * req2.part / 10**18; // Does not overflow
            // Rounding dust - no need to spend gas: IERC20(req1.token1).transfer(msg.sender, IERC20(req1.token1).balanceOf(address(this)));
        }
        safeTransferFrom(req1.token0, address(this), msg.sender, profit);
    }
}
