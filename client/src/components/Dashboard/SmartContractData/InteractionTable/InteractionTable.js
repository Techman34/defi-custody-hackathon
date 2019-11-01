import React from "react";
import {
  CenteredDiv,
  CenteredTD,
  CenteredTH,
  PercentageInput,
  Table
} from "../../../../styled";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import Address from "./Address";
import NewAddress from "./NewAddress";
import { generateDicimaledBalance } from "../../../../utils/ethereum";
import UpdateButton from "./UpdateButton";

const InteractionTable = ({ DSCStore, Web3Store }) => {
  const { tokens, addresses } = DSCStore;
  const changePercentage = (tokenIndex, address) => ({ target: { value } }) => {
    DSCStore.changePercentage(tokenIndex, address, value);
  };
  return (
    <Table title="Smart contract data">
      <thead>
        <tr>
          <CenteredTH>Token name</CenteredTH>
          <CenteredTH>Amount</CenteredTH>
          {addresses.map((address, i) => (
            <Address key={i} currentAddress={address} index={i} />
          ))}
          <th>
            <NewAddress />
          </th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token, tokenIndex) => (
          <tr key={token.address + tokenIndex}>
            <CenteredTD>{token.name}</CenteredTD>
            <CenteredTD>
              {(token.amount
                ? generateDicimaledBalance(
                    token.amount,
                    token.decimals,
                    Web3Store.web3.utils.toBN
                  )
                : 0) +
                " " +
                token.symbol}
            </CenteredTD>
            {addresses.map((address, i) => {
              const percent = token.percentage ? token.percentage[address] : "";
              return (
                <CenteredTD key={i}>
                  <CenteredDiv>
                    <PercentageInput
                      disabled={token.amount === 0}
                      symbol="%"
                      value={percent || ""}
                      type="number"
                      onChange={changePercentage(tokenIndex, address)}
                    />
                  </CenteredDiv>
                </CenteredTD>
              );
            })}
            <CenteredTD>
              <CenteredDiv>
                <UpdateButton tokenIndex={tokenIndex} />
              </CenteredDiv>
            </CenteredTD>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default compose(
  inject("DSCStore", "Web3Store"),
  observer
)(InteractionTable);
