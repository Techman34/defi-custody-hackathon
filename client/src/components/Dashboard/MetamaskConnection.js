import React, { useEffect, useState, useCallback } from "react";
import { compose } from "recompose";
import { inject, observer } from "mobx-react";
import { MetaMaskButton } from "rimble-ui";
import { EthAddress, MetamaskContainer } from "../../styled";
import Web3 from "web3";
import { toast } from "react-toastify";
import Spinner from "../utils/Spinner";

const USER_DENIED_ACCESS = "User denied account authorization";

const MetamaskConnection = ({ Web3Store, DSCStore, BlockchainStatusStore }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState();
  const setInitContractsStore = useCallback(
    async (web3, accounts) => {
      await Web3Store.setWeb3(web3, accounts);
      setDefaultAddress(accounts[0]);
      DSCStore.connected();
    },
    [DSCStore, Web3Store]
  );

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { ethereum } = window;
        const web3 = new Web3(ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          await setInitContractsStore(web3, accounts);
        }
        setIsMetamaskInstalled(true);
      } catch (e) {
        if (e.message === "Provider not set or invalid") {
          toast.error("Ooops. Looks like you don't have metamask extension...");
        }
      }
      BlockchainStatusStore.metamaskLoading &&
        BlockchainStatusStore.setMetamaskLoading(false);
      setIsLoading(false);
    };
    fetchAccount();
  }, [BlockchainStatusStore, setInitContractsStore]);
  const connect = async () => {
    setIsLoading(true);
    if (window.ethereum) {
      const { ethereum } = window;
      const web3 = new Web3(ethereum);
      try {
        const accounts = await ethereum.enable();
        await setInitContractsStore(web3, accounts);
        toast.success("Success! Metamask connected");
      } catch (error) {
        if (error.message.includes(USER_DENIED_ACCESS)) {
          toast.warn("Please allow to us work with you!");
        } else {
          toast.error("Ooops. Something went wrong");
          console.log(error);
        }
      }
    } else {
      toast.warn("Please, Install metamask extension!");
    }
    setIsLoading(false);
  };
  return (
    <MetamaskContainer>
      {defaultAddress ? (
        <EthAddress address={defaultAddress} textLabels />
      ) : isLoading ? (
        <Spinner />
      ) : isMetamaskInstalled ? (
        <MetaMaskButton.Outline onClick={connect} disabled={isLoading}>
          Connect with MetaMask
        </MetaMaskButton.Outline>
      ) : (
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MetaMaskButton.Outline>
            Please install metamask
          </MetaMaskButton.Outline>
        </a>
      )}
    </MetamaskContainer>
  );
};

export default compose(
  inject("Web3Store", "DSCStore", "BlockchainStatusStore"),
  observer
)(MetamaskConnection);
