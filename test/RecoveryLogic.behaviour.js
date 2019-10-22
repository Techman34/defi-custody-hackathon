const { BN } = web3.utils;
const { expectRevert } = require("openzeppelin-test-helpers");

const RecoveryLogicTest = async (accounts, dependencies) =>
  describe("RecoveryLogic", async () => {
    const admin = accounts[1];
    const owner = accounts[2];
    const assetAddress = accounts[3];
    const CHILD_WALLETS_AMOUNT = 4;
    const childWallets = accounts.slice(accounts.length - CHILD_WALLETS_AMOUNT);
    // fill percentage with 100 / CHILD_WALLETS_AMOUNT in ether
    const assetPercentage = Array(CHILD_WALLETS_AMOUNT).map(() =>
      web3.utils.toWei(100 / CHILD_WALLETS_AMOUNT + "0", "milli")
    );
    const gas = 6500000;
    const burnAddress = "0x0000000000000000000000000000000000000000";
    const deadline = new BN(100);
    let recoveryLogicInstance;

    before(async () => {
      recoveryLogicInstance = dependencies.recoveryLogicInstance;
    });

    it("should deploy RecoveryLogic", async () => {
      assert(
        web3.utils.isAddress(recoveryLogicInstance.options.address),
        "Contract wasn't deployed"
      );
    });

    it("should set recovery sheet", async () => {
      const deadlineBefore = await recoveryLogicInstance.methods
        .recoveryDeadline()
        .call();
      await recoveryLogicInstance.methods
        .setRecoverySheet(
          assetAddress,
          childWallets,
          assetPercentage,
          deadline.toNumber()
        )
        .send({ from: admin, gas });
      const firstChildPercentage = await recoveryLogicInstance.methods
        .recoverySheet(childWallets[0], assetAddress)
        .call();
      const deadlineAfter = await recoveryLogicInstance.methods
        .recoveryDeadline()
        .call({ from: owner });
      const recoveryWallets = await recoveryLogicInstance.methods
        .getRecoveryWallets()
        .call({ from: owner });
      assert.deepEqual(
        firstChildPercentage,
        assetPercentage[0],
        "Percentage hasn't been changed."
      );
      assert.deepEqual(
        deadlineAfter,
        new BN(deadlineBefore).add(deadline).toString(),
        "Deadline hasn't been changed."
      );
      assert.deepEqual(
        recoveryWallets,
        childWallets,
        "Recovery wallets haven't been changed."
      );
    });

    it("throw error if childWallets size does not match assetPercentage size", async () => {
      const wallets = accounts.slice(2);
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(
            assetAddress,
            wallets,
            assetPercentage,
            deadline.toNumber()
          )
          .send({ from: admin, gas }),
        "Length incorrect. Data corrupted"
      );
    });

    it("throw error if assetWallet and percentages are empty", async () => {
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(assetAddress, [], [], deadline.toNumber())
          .send({ from: admin, gas }),
        "Length incorrect. Data corrupted"
      );
    });

    it("throw error if assetAddress is the burn address", async () => {
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(
            burnAddress,
            childWallets,
            assetPercentage,
            deadline.toNumber()
          )
          .send({ from: admin, gas }),
        "Asset cannot be zero address"
      );
    });

    it("throw error if recovery wallet address is the burn address", async () => {
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(
            assetAddress,
            [burnAddress],
            [1],
            deadline.toNumber()
          )
          .send({ from: admin, gas }),
        "Recovery wallet cannot be zero address"
      );
    });

    it("throw error if percentage value is bigger 100", async () => {
      const oneHundredOnePercent = web3.utils.toWei("1010", "milli");
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(
            assetAddress,
            [childWallets[0]],
            [oneHundredOnePercent],
            deadline.toNumber()
          )
          .send({ from: admin, gas }),
        "Percentage must be smaller then 1 ether(100%)"
      );
    });

    it("throw error if percentage value if sum is not 10000", async () => {
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(
            assetAddress,
            childWallets.slice(0, 2),
            [5000, 2000],
            deadline.toNumber()
          )
          .send({ from: admin, gas }),
        "Sum of all the percentages is not 10000(100%)"
      );
    });

    it("throw error if deadline value is 0", async () => {
      await expectRevert(
        recoveryLogicInstance.methods
          .setRecoverySheet(assetAddress, [childWallets[0]], [100], 0)
          .send({ from: admin, gas }),
        "Deadline must be bigger than zero"
      );
    });
  });

module.exports = {
  RecoveryLogicTest
};
