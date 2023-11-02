//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "./PhatRollupAnchor.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract is PhatRollupAnchor {
    // State Variables
    address public immutable owner;
    address public greeting = 0xdE1683287529B9B4C3132af8AaD210644B259CfD;
    bool public premium = false;
    uint256 public totalCounter = 0;
    uint256 public airstackRiskScore;
    mapping(address => uint8[]) public userAirstackQueryConfigMultipliers;
    mapping(address => uint256) public userGreetingCounter;

    uint256 constant TYPE_RESPONSE = 0;
    uint256 constant TYPE_ERROR = 2;

    mapping(uint256 => address) requests;
    uint256 nextRequest = 1;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event GreetingChange(address indexed greetingSetter, address newGreeting, bool premium, uint256 value);
    event AirstackQueryConfigMultipliersChange(
        address indexed configSetter, uint8[] configSettings, bool premium, uint256 value
    );
    event ResponseReceived(uint256 reqId, address requester, address target, uint256 _airstackRiskScore);
    event ErrorReceived(uint256 reqId, address requester, address target, uint256 error);
    event AirstackRiskScoreReceived(uint256 reqid, address requester, address target, uint256 _airstackRiskScore);

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _owner) {
        owner = _owner;
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, _owner);
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
     *
     * @param _newGreeting (string memory) - new greeting to save on the contract
     */
    function setGreeting(address _newGreeting) public payable {
        // Print data to the anvil chain console. Remove when deploying to a live network.

        console.logString("Setting new greeting");

        address sender = msg.sender;
        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        uint256 id = nextRequest;
        uint8[] memory multipliers = userAirstackQueryConfigMultipliers[sender];
        requests[id] = _newGreeting;
        _pushMessage(abi.encode(id, _newGreeting, sender, multipliers));
        nextRequest += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, 0);
    }

    /*
        This function sets the sender's Airstack Query Multipliers used to calculate the
        risk score in the off-chain Phat Contract.
    */
    function setAirstackQueryConfigMultipliers(uint8[] calldata _airstackQueryMultipliers) public payable {
        console.logString("Setting new airstack query multipliers");

        userAirstackQueryConfigMultipliers[msg.sender] = _airstackQueryMultipliers;

        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }
        emit AirstackQueryConfigMultipliersChange(msg.sender, _airstackQueryMultipliers, msg.value > 0, 0);
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}

    /**
     * Function gets API info off-chain to set counter to the retrieved number
     */
    function _onMessageReceived(bytes calldata action) internal override {
        // Optional to check length of action
        // require(action.length == 32 * 3, "cannot parse action");
        (uint256 respType, uint256 id, address requester, uint256 _airstackRiskScore) =
            abi.decode(action, (uint256, uint256, address, uint256));
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requester, requests[id], _airstackRiskScore);
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requester, requests[id], 0);
            delete requests[id];
        }
        emit AirstackRiskScoreReceived(id, requester, requests[id], _airstackRiskScore);
        airstackRiskScore = _airstackRiskScore;
    }
}
