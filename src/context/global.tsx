import { createContext } from "react";

export const GlobalContext = createContext<{
  account: string | null;
  setAccount: (account: string | null) => void;
  chainId: string | null;
  setChainId: (chainId: string | null) => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
}>({
  account: null,
  setAccount: () => undefined,
  chainId: null,
  setChainId: () => undefined,
  userId: null,
  setUserId: () => undefined,
});
