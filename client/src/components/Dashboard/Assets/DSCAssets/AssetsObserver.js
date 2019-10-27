import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";
import {
  fetchUserBalances,
  fetchSmartContractAssets,
  mergeTokenAndBalances,
  fetchUserBalance
} from "../../../../blockchain/SmartContractCalls";
import { drizzleReactHooks } from "../../../../drizzle";

const AssetsObserver = ({ DSCStore, Web3Store }) => {
  const { useCacheCall } = drizzleReactHooks.useDrizzle();
  const supportedTokens = useCacheCall("DeFiCustodyRegistry", "getTokens");
  const smartContractTokens = useCacheCall(
    "DeFiCustodyRegistry",
    "getSenderTokens"
  );
  useEffect(() => {
    const fetchSmartContractData = async () => {
      console.log("Fetching data.");
      const balances = await fetchUserBalance(
        DSCStore,
        Web3Store.defaultAccount,
        Web3Store.web3.utils.toBN
      );
      const [smartContractAssets, addresses] = await fetchSmartContractAssets(
        Web3Store,
        DSCStore,
        smartContractTokens
      );
      const mergedTokens = mergeTokenAndBalances(
        supportedTokens,
        balances,
        smartContractAssets
      );
      DSCStore.setAddresses(addresses);
      DSCStore.setTokens(mergedTokens);
      DSCStore.setTokensFetched(true);
      console.log("Data fetched.");
    };
    supportedTokens && smartContractTokens && fetchSmartContractData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportedTokens, smartContractTokens]);
  return null;
};

export default compose(
  inject("DSCStore", "Web3Store"),
  observer
)(AssetsObserver);
