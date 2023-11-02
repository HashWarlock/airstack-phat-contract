// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/YourContract.sol";

contract YourContractTest is Test {
    YourContract public yourContract;

    function setUp() public {
        yourContract = new YourContract(vm.addr(1));
    }

    function testMessageOnDeployment() public view {
        require(yourContract.greeting() == 0xdE1683287529B9B4C3132af8AaD210644B259CfD);
    }

    function testSetNewMessage() public {
        yourContract.setGreeting(0x624Fef3390A244a834f19b3dBfddC28939530c17);
        require(yourContract.greeting() == 0x624Fef3390A244a834f19b3dBfddC28939530c17);
    }
}
