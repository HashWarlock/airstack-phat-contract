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
    // Types
    struct AirstackQueryMultipliers {
        uint8 isFollowingTargetMultiplier;
        uint8 txCountWithTargetMultiplier;
        uint8 hasPrimaryEnsDomainMultiplier;
        uint8 hasLensAndFarcasterAccountMultiplier;
        uint8 poapsOwnedIrlMultiplier;
    }
    // State Variables
    address public immutable owner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    string public airstackRiskScore;
    mapping(address => AirstackQueryMultipliers) public userAirstackQueryConfigMultipliers;
    mapping(address => uint256) public userGreetingCounter;

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;

    mapping(uint => string) requests;
    uint nextRequest = 1;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event GreetingChange(
        address indexed greetingSetter,
        string newGreeting,
        bool premium,
        uint256 value
    );
    event AirstackQueryConfigMultipliersChange(
        address indexed configSetter,
        AirstackQueryMultipliers configSettings,
        bool premium,
        uint256 value
    );
    event ResponseReceived(uint reqId, string target, uint256 _airstackRiskScore);
    event ErrorReceived(uint reqId, string target, uint256 error);
    event AirstackRiskScoreReceived(uint reqid, string target, uint256 _airstackRiskScore);

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
    function setGreeting(string memory _newGreeting) public payable {
        // Print data to the anvil chain console. Remove when deploying to a live network.

        console.logString("Setting new greeting");
        console.logString(_newGreeting);

        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        uint id = nextRequest;
        requests[id] = _newGreeting;
        _pushMessage(abi.encode(id, "ipeciura.eth", msg.sender, userAirstackQueryConfigMultipliers[msg.sender]));
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

    function setAirstackQueryConfigMultipliers(AirstackQueryMultipliers calldata _airstackQueryMultipliers) public payable {
        console.logString("Setting new airstack query multipliers");
        console.logString(_airstackQueryMultipliers);

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
        (bool success, ) = owner.call{value: address(this).balance}("");
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
        (uint respType, uint id, uint256 _airstackRiskScore) = abi.decode(
            action,
            (uint, uint, uint256)
        );
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requests[id], _airstackRiskScore);
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requests[id], 0);
            delete requests[id];
        }
        emit AirstackRiskScoreReceived(id, requests[id], _airstackRiskScore);
        airstackRiskScore = _airstackRiskScore;
        greeting = _airstackRiskScore;
    }
}
