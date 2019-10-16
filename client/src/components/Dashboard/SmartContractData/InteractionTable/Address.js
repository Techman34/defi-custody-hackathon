import React, { useState } from "react";
import {
  AddressHeader,
  FlexCenteredItem,
  CenteredTH,
  SmallInput,
  CenteredDiv
} from "../../../../styled";
import { Button, Icon, Tooltip } from "rimble-ui";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import { toShortAddress } from "../../../../utils/ethereum";

const Address = ({ currentAddress, index, DSCStore, Web3Store }) => {
  const { addresses, setAddresses } = DSCStore;
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [error, setError] = useState();
  const [address, setNewAddress] = useState(currentAddress || "");
  console.log(currentAddress, address);

  const onChangeNewAddress = ({ target: { value } }) => {
    setNewAddress(value);
    if (error && Web3Store.web3.utils.isAddress(value)) {
      setError();
    }
  };
  const updateAddress = () => {
    if (Web3Store.web3.utils.isAddress(address)) {
      addresses[index] = address;
      setAddresses([...addresses]);
      setIsAddingAddress(false);
    } else {
      setError("Wrong eth address format!");
    }
  };
  const toggleAdding = () => {
    if (!DSCStore.isInteractionAllowed) return;
    setIsAddingAddress(!isAddingAddress);
    setError();
  };
  return (
    <CenteredTH>
      {isAddingAddress ? (
        <CenteredDiv>
          {error && (
            <Tooltip message={error}>
              <Icon color="tomato" name="Error" />
            </Tooltip>
          )}
          {console.log(!!error)}
          <SmallInput
            error={!!error}
            type="text"
            onChange={onChangeNewAddress}
            value={address}
            placeholder="0x00...?"
          />
          <Button.Outline size="small" mx={3} onClick={toggleAdding}>
            Cancel
          </Button.Outline>
          <Button
            size="small"
            onClick={updateAddress}
            disabled={!DSCStore.isInteractionAllowed}
          >
            Update
          </Button>
        </CenteredDiv>
      ) : (
        <div onClick={toggleAdding}>
          <AddressHeader
            type="text"
            disabled={!currentAddress}
            defaultValue={toShortAddress(currentAddress)}
            placeholder="0x00...?"
          />
        </div>
      )}
    </CenteredTH>
  );
};

export default compose(
  inject("DSCStore", "Web3Store"),
  observer
)(Address);
