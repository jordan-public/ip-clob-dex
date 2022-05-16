// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

interface IFlashCallee {
    function flashCall(bytes calldata data) external;
}
