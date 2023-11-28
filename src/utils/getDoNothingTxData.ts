import doNothingAbi from "src/abis/doNothing";
import { DISCOUNT_CONTRACT_OP } from "src/constants";
import { web3 } from "src/services/evm";

export default function getDoNothingTxData() {
  const doNothing = new web3.eth.Contract(doNothingAbi, DISCOUNT_CONTRACT_OP);

  return doNothing.methods.doNothing().encodeABI();
}
