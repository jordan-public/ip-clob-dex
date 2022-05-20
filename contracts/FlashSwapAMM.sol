// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFlashCallee.sol";
import "./IFTSwap.sol";
import "./uniswap/v2-core/interfaces/IUniswapV2Pair.sol";
import "./uniswap/v2-core/interfaces/IUniswapV2Factory.sol";
import "./uniswap/v2-periphery/interfaces/IUniswapV2Router01.sol";

contract FlashSwapAMM is IFlashCallee {
    IFTSwap public ftSwap;
    address constant uniswapV2Factory = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address constant uniswapV2Router01 = 0xf164fC0Ec4E93095b804a4795bBe1e041497b92a;


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
        IUniswapV2Pair uniswapPair = IUniswapV2Pair(IUniswapV2Factory(uniswapV2Factory).getPair(req.token0, req.token1));
        (address token0, address token1) = (req.token0 < req.token1 ? (req.token0, req.token1) : (req.token1, req.token0));
        uint256 amount0Out;
        uint256 amount1Out;
        (uint112 reserve0, uint112 reserve1, ) = uniswapPair.getReserves();
        if (IERC20(token0).balanceOf(address(this)) > 0) {
            amount0Out = 0;
            safeTransfer(token0, address(uniswapPair), IERC20(token0).balanceOf(address(this))); // Optimistically
        } else {
            amount0Out = IUniswapV2Router01(uniswapV2Router01).getAmountOut(IERC20(token1).balanceOf(address(this)), reserve1, reserve0);
        }
        if (IERC20(req.token1).balanceOf(address(this)) > 0) {
            amount1Out = 0;
            safeTransfer(token1, address(uniswapPair), IERC20(token1).balanceOf(address(this))); // Optimistically
        } else {
            amount1Out = IUniswapV2Router01(uniswapV2Router01).getAmountOut(IERC20(token0).balanceOf(address(this)), reserve0, reserve1);
        }
        uniswapPair.swap(amount0Out, amount1Out, address(this), new bytes(0));
    }

    // As usual in IPDEX, msg.sender must req.token0.approve(swap, sufficient_amount) prior to calling this
    // req is a swap between Maker and this contract
    function flashSwap(swapRequest memory req) external {
        req.part = 10**18 - ftSwap.partNullified(
            ftSwap.checkSig(req.offerId, req.token0, req.token1, req.amount0, req.amount1, req.expiration, req.v, req.r, req.s),
            req.offerId); // Does not underflow
        uint256 token0InitBalance = IERC20(req.token0).balanceOf(address(this));
        uint256 token1InitBalance = IERC20(req.token1).balanceOf(address(this));
        // Not possible: require(req2.part <= 10**18, "IPDEX-FS: Rounding problem 2");
        IERC20(req.token1).approve(address(ftSwap), type(uint256).max); // Refine this!
        (bytes memory flashData) = abi.encode(req);
        ftSwap.swap(req, flashData);
        require(IERC20(req.token0).balanceOf(address(this)) >= token0InitBalance && IERC20(req.token1).balanceOf(address(this)) >= token1InitBalance, "IPDEX-FA: Unprofitable");
        if (IERC20(req.token0).balanceOf(address(this))>0) safeTransfer(req.token0,  msg.sender, IERC20(req.token0).balanceOf(address(this)));
        if (IERC20(req.token1).balanceOf(address(this))>0) safeTransfer(req.token1,  msg.sender, IERC20(req.token1).balanceOf(address(this)));
    }
}
