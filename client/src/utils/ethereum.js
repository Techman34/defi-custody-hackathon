export const generateDicimaledBalance = (balance, decimals, toBN) => {
  const divisor = toBN("10").pow(toBN(decimals));
  const beforeDecimal = toBN(balance)
    .div(divisor)
    .toString();
  let afterDecimal = toBN(balance)
    .mod(divisor)
    .toString();
  if (afterDecimal.length < 2) {
    afterDecimal += "0";
  } else {
    while (
      afterDecimal.charAt(afterDecimal.length - 1) === "0" &&
      afterDecimal.length > 2
    ) {
      afterDecimal = afterDecimal.substring(0, afterDecimal.length - 1);
    }
  }
  return beforeDecimal + "." + afterDecimal;
};

export const toShortAddress = address =>
  address
    ? address.substring(0, 6) + "..." + address.substring(address.length - 4)
    : "";

export const isZeroAddress = address =>
  address === "0x0000000000000000000000000000000000000000";
