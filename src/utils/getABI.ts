import axios from "axios";
import { getNetworkScanInfo } from "./networkScanInfo";

async function getABI(chainId: number, contractAddress?: string | null) {
  const networkInfo = getNetworkScanInfo(chainId);
  if (!networkInfo) throw new Error(`Not support ${chainId}`);

  const response = await axios.get(networkInfo.api, {
    params: {
      address: contractAddress,
    },
  });

  console.log(`💥 response: ${JSON.stringify(response, null, "  ")}`);

  if (response.data.message === "OK") {
    return JSON.parse(response.data.result);
  } else {
    return null;
  }
}

export default getABI;
