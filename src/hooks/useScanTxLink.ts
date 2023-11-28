import { getNetworkScanInfo } from "src/utils/networkScanInfo";

export default function useScanTxLink(chainID: number | string) {
  return getNetworkScanInfo(chainID)?.scan + "/tx/";
}
