import { action, observable } from "mobx";

class DSCStore {
  BN;
  @observable addresses = [undefined];
  @observable tokens = [
    {
      address: "-",
      name: "-",
      symbol: "",
      balance: 0,
      amount: 0,
      earnings: 0,
      percentage: {}
    },
    {
      address: "-",
      name: "-",
      symbol: "",
      balance: 0,
      amount: 0,
      earnings: 0,
      percentage: {}
    },
    {
      address: "-",
      name: "-",
      symbol: "",
      balance: 0,
      amount: 0,
      earnings: 0,
      percentage: {}
    }
  ];
  @observable isInteractionAllowed = false;
  @observable isFetched = false;
  @observable drizzle;
  @observable drizzleConnected = false;
  @observable newDeadline = 0;
  @observable walletAddress;

  @action
  changePercentage = (tokenIndex, address, value) => {
    if (this.tokens[tokenIndex].amount === 0) return;
    value = parseInt(value);
    if (value > 100) {
      value = 100;
    }
    if (value < 0) {
      value = 0;
    }
    let sum = 0;
    this.addresses.forEach(addr => {
      if (addr !== address && this.tokens[tokenIndex].percentage[addr])
        sum += parseInt(this.tokens[tokenIndex].percentage[addr]);
    });
    if (value + sum > 100) {
      value = 100 - sum;
    }
    console.log(tokenIndex, address, value, this.tokens[tokenIndex].percentage);
    this.tokens[tokenIndex].percentage[address] = value;
  };

  @action
  setTokens = tokens => {
    this.tokens = tokens.map((token, i) => ({ ...token, index: i }));
    this.isInteractionAllowed = true;
  };

  @action
  setAddresses = addresses => {
    if (addresses.length > 0) {
      this.addresses = addresses;
    }
  };

  @action
  setTokensFetched = state => (this.isFetched = state);

  @action
  setIsInteractionAllowed = state => (this.isInteractionAllowed = state);

  @action
  transferTokens = (token, amount) => {
    amount *= 10 ** this.tokens[token.index].decimals;
    amount = Math.trunc(amount);
    amount = new this.BN(amount);
    const newBalance = new this.BN(
      this.tokens[token.index].balance.toString()
    ).sub(amount);
    const newAmount = new this.BN(
      this.tokens[token.index].amount.toString()
    ).add(amount);
    this.tokens[token.index].balance = newBalance.toString();
    this.tokens[token.index].amount = newAmount.toString();
    this.isInteractionAllowed = true;
  };

  @action
  setStore = drizzle => {
    this.drizzle = drizzle;
  };

  @action
  connected = () => {
    this.drizzleConnected = true;
  };

  @action
  setDeadline = deadline => {
    this.newDeadline = deadline;
  };

  @action
  setWalletAddress = address => {
    this.walletAddress = address;
  };

  @action
  updatePercentage = tokenIndex => {
    console.log(this.tokens[tokenIndex], "token percentage updated");
  };

  @action
  setRecoverySheet = async (tokenIndex = 0, toWei) => {
    const percentages = this.addresses.map(address =>
      toWei(
        this.tokens[tokenIndex].percentage[address].toString() + "0",
        "milli"
      )
    );
    console.log(
      "Setting recovery sheet",
      this.tokens[0].address,
      [...this.addresses],
      percentages,
      parseInt(this.newDeadline)
    );
    const result = await this.drizzle.contracts.DeFiCustodyRegistry.methods
      .setRecoverySheet(
        this.tokens[0].address,
        [...this.addresses],
        percentages,
        parseInt(this.newDeadline)
      )
      .send();
    console.log(result);
  };
  setBN = BN => {
    this.BN = BN;
  };
  percentageSum = tokenIndex => {
    let sum = 0;
    this.addresses.forEach(addr => {
      if (this.tokens[tokenIndex].percentage[addr])
        sum += this.tokens[tokenIndex].percentage[addr];
    });
    return sum;
  };
}

const store = new DSCStore();
export default store;
