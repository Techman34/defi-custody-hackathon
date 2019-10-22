pragma solidity >=0.5.0 <0.6.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract RecoveryLogic is Ownable {
    uint256 public lastAction;
    uint256 public recoveryDeadline;
    address[] public recoveryWallets;

    // recoveryWallet => asset address => percentage | 1 ETH = 100%
    mapping(address => mapping(address => uint256)) public recoverySheet;

    modifier updateAction() {
        lastAction = now;
        _;
    }

    modifier ifRecoverable() {
        require(isRecoverable(), "Contract is not recoveralbe");
        _;
    }

    /**
     * @dev Allows to recoverySheet state.
     * @param asset The address of token that will be used as Asset.
     * @param wallet The array of addresses to whom the asset will be sent.
     * @param values The array of percentages that corresponds to each wallets share. 1 ether = 100%.
     * @param deadline The number of seconds from the current moment (lastAction) the Asset will be sent to wallets.
     */
    function setRecoverySheet(
        address asset,
        address[] memory wallets,
        uint256[] memory values,
        uint256 deadline
    ) public onlyOwner updateAction {
        require(asset != address(0), "Asset cannot be zero address");
        require(deadline > 0, "Deadline must be bigger than zero");
        require(wallets.length == values.length && wallets.length > 0, "Length incorrect. Data corrupted");
        uint valuesTotalAmount = 0;
        for (uint256 i = 0; i < wallets.length; i++) {
            require(wallets[i] != address(0), "Recovery wallet cannot be zero address");
            require(values[i] <= 1 ether, "Percentage must be smaller then 1 ether(100%)");
            recoverySheet[wallets[i]][asset] = values[i];
            valuesTotalAmount += values[i];
        }
        require(valuesTotalAmount == 1 ether, "Sum of all the percentages is not 1 ether(100%)");
        recoveryDeadline = deadline;
        recoveryWallets = wallets;
    }

    function isRecoverable() public view returns (bool) {
        return (lastAction + recoveryDeadline) <= now;
    }

    function recover() public ifRecoverable returns (bool) {
        // implement recovery logic
        return true;
    }

    function getRecoveryWallets() public view returns (address[] memory) {
        return recoveryWallets;
    }
}
