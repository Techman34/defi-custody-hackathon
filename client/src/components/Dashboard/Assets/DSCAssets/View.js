import React from "react";
import { CenteredTD, Table } from "../../../../styled";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import TransferButtons from "../TransferButtons";

const View = ({ DSCStore, wallet }) => {
  return (
    <Table title={wallet} fullWidth={true}>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Wallet Balance</th>
          <th />
          <th>Defi Custody Balance</th>
        </tr>
      </thead>
      <tbody>
        {DSCStore.tokens.map((token, i) => (
          <tr key={token.address + i}>
            <CenteredTD>{token.name}</CenteredTD>
            <CenteredTD>{token.decimalBalance + " " + token.symbol}</CenteredTD>
            <td>
              <TransferButtons token={token} />
            </td>
            <CenteredTD>{token.amount + " " + token.symbol}</CenteredTD>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default compose(
  inject("DSCStore"),
  observer
)(View);
