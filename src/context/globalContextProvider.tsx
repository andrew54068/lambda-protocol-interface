import { useState } from "react";
import { bloctoSDK } from "../services/evm";
import { GlobalContext } from "./global";

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(bloctoSDK.ethereum.chainId);
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <GlobalContext.Provider
      value={{
        account,
        setAccount,
        chainId,
        setChainId,
        userId,
        setUserId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
