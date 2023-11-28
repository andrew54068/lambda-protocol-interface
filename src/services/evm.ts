import BloctoSDK, { EthereumProviderInterface } from "@blocto/sdk";
import { useContext, useEffect } from "react";
import Web3 from "web3";
// import { USER_ID_SESSION_KEY } from "src/constants";
import { GlobalContext } from "../context/global";
import { logConnectWalletSuccess } from "src/services/Amplitude";
// import { setUserId as setAmplitudeUserId } from "./Amplitude/setting";

export interface ExtendedEthereumProviderInterface extends EthereumProviderInterface {
  enable: () => Promise<any>;
  chainId: string;
}

export interface ExtendedEvmBloctoSDK extends BloctoSDK {
  ethereum: ExtendedEthereumProviderInterface;
}
// const isMainnet = import.meta.env.VITE_APP_NETWORK === "mainnet";

export const supportedChains = [
  // {
  //   name: "Ethereum Mainnet",
  //   chainId: "0x1",
  //   rpcUrls: ["https://mainnet.infura.io/v3/ef5a5728e2354955b562d2ffa4ae5305"],
  //   environment: "mainnet",
  // },
  // {
  //   name: "Ethereum Goerli",
  //   chainId: "0x5",
  //   rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
  //   faucet: "https://goerlifaucet.com/",
  //   environment: "testnet",
  // },
  {
    name: "Arbitrum Mainnet",
    chainId: "0xa4b1",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    environment: "mainnet",
  },
  // {
  //   name: "Arbitrum Testnet",
  //   chainId: "0x66eed",
  //   rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
  //   faucet: "https://faucet.triangleplatform.com/arbitrum/goerli",
  //   environment: "testnet",
  // },
  // {
  //   name: "BSC",
  //   chainId: "0x38",
  //   rpcUrls: ["https://bsc-dataseed.binance.org/"],
  //   environment: "mainnet",
  // },
  // {
  //   name: "BSC Testnet",
  //   chainId: "0x61",
  //   rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
  //   faucet: "https://testnet.binance.org/faucet-smart",
  //   environment: "testnet",
  // },
  // {
  //   name: "Avalanche Mainnet",
  //   chainId: "0xa86a",
  //   rpcUrls: ["https://rpc.ankr.com/avalanche"],
  //   environment: "mainnet",
  // },
  // {
  //   name: "Avalanche Testnet",
  //   chainId: "0xa869",
  //   rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  //   faucet: "https://faucet.avax-test.network/",
  //   environment: "testnet",
  // },
  // {
  //   name: "Polygon Mainnet",
  //   chainId: "0x89",
  //   rpcUrls: ["https://polygon-rpc.com"],
  //   environment: "mainnet",
  // },
  // {
  //   name: "Polygon Testnet",
  //   chainId: "0x13881",
  //   rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
  //   faucet: "https://faucet.polygon.technology/",
  //   environment: "testnet",
  // },
  // {
  //   name: "Optimism Mainnet",
  //   chainId: "0x000a",
  //   rpcUrls: ["https://mainnet.optimism.io"],
  //   environment: "mainnet",
  // },
  // {
  //   name: "Optimism Testnet",
  //   chainId: "0x01a4",
  //   rpcUrls: ["https://goerli.optimism.io"],
  //   faucet: "https://faucet.paradigm.xyz/",
  //   environment: "testnet",
  // },
];

const sdkConfig = {
  ethereum: {
    // (required) chainId to be used
    chainId: "10", // Arb Goerli: 421613
    // (required for Ethereum) JSON RPC endpoint
    rpc: import.meta.env.VITE_APP_RPC || "https://mainnet.optimism.io",
  },
};

const bloctoSDK = new BloctoSDK({
  ...sdkConfig,
  appId: import.meta.env.VITE_APP_DAPP_ID,
}) as ExtendedEvmBloctoSDK;

bloctoSDK.ethereum.loadSwitchableNetwork(supportedChains);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const web3 = new Web3(bloctoSDK.ethereum);
export { web3, bloctoSDK };

export const useEthereum = (): {
  account: string | null;
  chainId: string | null;
  // userId: string | null;
  ethereum: ExtendedEthereumProviderInterface;
  connect: () => Promise<any>;
  disconnect: () => Promise<any>;
} => {
  const { setAccount, account, setChainId, chainId } = useContext(GlobalContext);
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0]);
      bloctoSDK.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa4b1" }],
      });
    };
    const handleChainChanged = (chainId: string) => {
      setChainId(chainId);
    };
    const handleDisconnect = () => {
      setAccount(null);
    };
    bloctoSDK.ethereum.on("accountsChanged", handleAccountsChanged);
    bloctoSDK.ethereum.on("chainChanged", handleChainChanged);
    bloctoSDK.ethereum.on("disconnect", handleDisconnect);
    return () => {
      bloctoSDK.ethereum.off("accountsChanged", handleAccountsChanged);
      bloctoSDK.ethereum.off("chainChanged", handleChainChanged);
      bloctoSDK.ethereum.off("disconnect", handleDisconnect);
    };
  }, [setAccount, setChainId]);

  useEffect(() => {
    // const userIdSession = window.sessionStorage.getItem(USER_ID_SESSION_KEY);
    // if (userIdSession) {
    //   setAmplitudeUserId(userIdSession);
    // }
    // get userId from wallet iframe
    // this is a hacky way but we need userId for event tracking.
    const handleResponse = (event: MessageEvent) => {
      if (event.data.type !== "ETH:FRAME:RESPONSE") return;

      // const { userId } = event.data;
      // window.sessionStorage.setItem(USER_ID_SESSION_KEY, userId);
      // setAmplitudeUserId(userId);
    };
    window.addEventListener("message", handleResponse);
    return () => {
      window.removeEventListener("message", handleResponse);
    };
  }, []);

  return {
    account,
    chainId,
    ethereum: bloctoSDK.ethereum,
    connect: async () => {
      const accounts = await bloctoSDK.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      if (accounts.length > 0) {
        logConnectWalletSuccess();
      }

      return accounts;
    },
    disconnect: () => bloctoSDK.ethereum.request({ method: "wallet_disconnect" }),
  };
};
